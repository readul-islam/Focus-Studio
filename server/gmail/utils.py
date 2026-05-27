from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from .models import GmailToken, Email, Client
from django.utils import timezone
import base64
import html
import mimetypes
from datetime import datetime, time
from email.message import EmailMessage
from email.utils import parseaddr, formataddr
import re
import logging

logger = logging.getLogger(__name__)

def get_fast_snippet(html_body):
    """Fast, non-BeautifulSoup way to extract a plain text snippet from HTML"""
    if not html_body:
        return ""
    
    # Pre-truncate to avoid processing massive HTML blobs (e.g. 5MB base64 images)
    # Most snippets are in the first few KB anyway
    content = html_body[:5000]
    
    # Strip script and style tags completely
    content = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', content, flags=re.DOTALL | re.IGNORECASE)
    # Replace common block tags with spaces to avoid merging words
    content = re.sub(r'<(p|div|br|tr|td|li|h[1-6])[^>]*>', ' ', content, flags=re.IGNORECASE)
    # Strip all remaining tags
    clean_text = re.sub(r'<[^>]+>', '', content)
    # Cleanup whitespace
    clean_text = ' '.join(clean_text.split())
    
    return clean_text[:100] + '...' if len(clean_text) > 100 else clean_text

# Partial fields string — Google only returns what we ask for, cutting payload by ~90%
_MSG_PART_FIELDS = (
    'mimeType,filename,headers,body(data,attachmentId,size),'
    'parts(mimeType,filename,headers,body(data,attachmentId,size),'
    'parts(mimeType,filename,headers,body(data,attachmentId,size),'
    'parts(mimeType,filename,headers,body(data,attachmentId,size))))'
)
_MSG_FIELDS = f'id,threadId,snippet,labelIds,payload(headers,body(data),parts({_MSG_PART_FIELDS}))'


def gmail_message_is_read(label_ids) -> bool:
    """Gmail marks unread messages with the UNREAD label."""
    return 'UNREAD' not in (label_ids or [])


def get_unread_thread_ids(studio, thread_ids: list) -> set:
    """Thread IDs that have at least one unread inbound message."""
    if not thread_ids:
        return set()
    return set(
        Email.objects.filter(
            studio=studio,
            thread_id__in=thread_ids,
            is_read=False,
            is_sent=False,
        ).values_list('thread_id', flat=True).distinct()
    )


def set_thread_read_state(user, thread_id: str, *, read: bool) -> dict:
    """
    Update read state for all emails in a thread (app DB + Gmail UNREAD label).
    """
    if not user.studio:
        return {'error': 'User has no studio'}

    emails = Email.objects.filter(studio=user.studio, thread_id=thread_id)
    if not emails.exists():
        return {'error': 'Thread not found'}

    emails.update(is_read=read)

    service = get_gmail_service(user)
    if not service:
        return {'success': True, 'gmail_synced': False}

    body = (
        {'removeLabelIds': ['UNREAD']}
        if read
        else {'addLabelIds': ['UNREAD']}
    )
    try:
        service.users().threads().modify(userId='me', id=thread_id, body=body).execute()
        return {'success': True, 'gmail_synced': True}
    except Exception as exc:
        logger.warning('Gmail thread read state sync failed for %s: %s', thread_id, exc)
        return {'success': True, 'gmail_synced': False, 'warning': str(exc)}

_EMAIL_RE = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')


def normalize_email_address(value: str | None) -> str:
    """Extract a bare email from 'Name <user@host>' or plain address."""
    if not value:
        return ''
    _, addr = parseaddr(value.strip())
    return (addr or value.strip()).strip().lower()


def _mailbox_owner_addresses(user) -> set[str]:
    """Addresses for the logged-in user's Gmail account (From = me)."""
    addrs: set[str] = set()
    if getattr(user, 'email', None):
        addrs.add(normalize_email_address(user.email))
    addrs.discard('')
    return addrs


def _user_email_addresses(user) -> set[str]:
    """Addresses to treat as 'self' when choosing reply recipients."""
    addrs = set(_mailbox_owner_addresses(user))
    studio = getattr(user, 'studio', None)
    if studio and getattr(studio, 'support_email', None):
        addrs.add(normalize_email_address(studio.support_email))
    return addrs


def message_is_sent_by_user(sender_full: str, user) -> bool:
    """True when the Gmail From address is the current user (not substring matching)."""
    sender_addr = normalize_email_address(sender_full)
    if not sender_addr:
        return False
    return sender_addr in _mailbox_owner_addresses(user)


def client_display_name(client) -> str:
    if not client:
        return ''
    company = getattr(client, 'company_name', None)
    if company and str(company).strip():
        return str(company).strip()
    parts = [
        getattr(client, 'name', None) or '',
        getattr(client, 'surname', None) or '',
    ]
    return ' '.join(p.strip() for p in parts if p and str(p).strip()).strip()


def email_sender_label(email, user) -> str:
    """Short sender name for inbox bubbles (CRM client / studio / You)."""
    if message_is_sent_by_user(email.sender, user):
        return 'You'
    name = client_display_name(getattr(email, 'client', None))
    if name:
        return name
    display, addr = parseaddr(email.sender or '')
    display = (display or '').strip().strip('"\'')
    if display and normalize_email_address(display) != normalize_email_address(addr or display):
        return display
    if display:
        return display
    return addr or 'Unknown'


def _external_addresses_from_field(field: str | None, user_addrs: set[str]) -> list[str]:
    """All non-user emails mentioned in a From/To/Cc header string."""
    if not field:
        return []
    seen: set[str] = set()
    ordered: list[str] = []
    for raw in _EMAIL_RE.findall(field):
        norm = normalize_email_address(raw)
        if norm and norm not in user_addrs and norm not in seen:
            seen.add(norm)
            ordered.append(norm)
    norm = normalize_email_address(field)
    if norm and norm not in user_addrs and norm not in seen:
        ordered.append(norm)
    return ordered


def resolve_thread_reply_to(user, thread_id: str, studio) -> str:
    """
    Determine the correct reply recipient for a thread.
    Never returns the user's own address (fixes replies emailed to yourself).
    """
    user_addrs = _user_email_addresses(user)
    emails = list(
        Email.objects.filter(thread_id=thread_id, studio=studio).order_by('-received_at')
    )
    if not emails:
        return ''

    # Prefer latest inbound sender (recompute from headers — DB is_sent can be stale)
    for em in emails:
        if message_is_sent_by_user(em.sender, user):
            continue
        addr = normalize_email_address(em.sender)
        if addr and addr not in user_addrs:
            return addr

    # Newest message whose From is someone other than the user
    for em in emails:
        addr = normalize_email_address(em.sender)
        if addr and addr not in user_addrs:
            return addr

    # Scan all participants (handles threads where every row was mis-flagged is_sent)
    for em in emails:
        for field in (em.sender, em.recipient):
            for addr in _external_addresses_from_field(field, user_addrs):
                return addr

    return ''


def resolve_reply_recipient(last_sender: str, last_recipient: str, last_is_sent: bool, user_email: str) -> str:
    """Pick who to address when replying to the latest message in a thread."""
    user_email = normalize_email_address(user_email)
    if last_is_sent:
        candidate = normalize_email_address(last_recipient)
    else:
        candidate = normalize_email_address(last_sender)
    if candidate and candidate != user_email:
        return candidate
    return ''


def _header_value(headers, name: str) -> str:
    name_lower = name.lower()
    for h in headers or []:
        if h.get('name', '').lower() == name_lower:
            return h.get('value', '')
    return ''


def _filename_from_part(part: dict) -> str:
    filename = (part.get('filename') or '').strip()
    if filename:
        return filename
    disp = _header_value(part.get('headers'), 'Content-Disposition')
    if disp:
        match = re.search(
            r"filename\*?=(?:UTF-8''|utf-8'')?[\"']?([^\"';\n]+)",
            disp,
            re.IGNORECASE,
        )
        if match:
            return match.group(1).strip()
    mime = part.get('mimeType', '')
    if mime.startswith('image/'):
        return f'image.{mime.split("/")[-1]}'
    return 'attachment'


def _extract_attachments_from_payload(payload) -> list[dict]:
    """Collect Gmail attachment metadata from a message payload tree."""
    found: list[dict] = []

    def walk(node):
        if not node:
            return
        body = node.get('body') or {}
        attachment_id = body.get('attachmentId')
        mime = node.get('mimeType', '') or ''
        if attachment_id and mime not in ('text/plain', 'text/html', 'multipart/alternative', 'multipart/mixed', 'multipart/related'):
            found.append({
                'attachment_id': attachment_id,
                'filename': _filename_from_part(node),
                'mime_type': mime,
                'size': body.get('size') or 0,
            })
        for child in node.get('parts') or []:
            walk(child)

    walk(payload or {})
    return found


def ensure_email_attachments(email, user, service=None) -> list:
    """Load attachment metadata from Gmail when missing (e.g. older synced emails)."""
    if email.attachments:
        return email.attachments
    if service is None:
        service = get_gmail_service(user)
    if not service:
        return []
    try:
        txt = service.users().messages().get(
            userId='me', id=email.message_id, format='full', fields=_MSG_FIELDS
        ).execute()
        atts = _extract_attachments_from_payload(txt.get('payload', {}))
        email.attachments = atts
        email.save(update_fields=['attachments'])
        return atts
    except Exception as exc:
        logger.warning('Failed to load attachments for message %s: %s', email.message_id, exc)
        return []


def _get_body_from_payload(payload):
    """Extract the best available body (HTML preferred) from a Gmail message payload."""
    html_body = ''
    plain_body = ''

    def walk(node):
        nonlocal html_body, plain_body
        if not node:
            return
        mime = node.get('mimeType', '') or ''
        data = node.get('body', {}).get('data')
        if data:
            try:
                decoded = base64.urlsafe_b64decode(data).decode('utf-8', errors='replace')
            except Exception:
                decoded = ''
            if mime == 'text/html' and decoded.strip():
                html_body = html_body or decoded
            elif mime == 'text/plain' and decoded.strip():
                plain_body = plain_body or decoded
        for child in node.get('parts') or []:
            walk(child)

    walk(payload or {})
    return html_body or plain_body


def _get_refreshed_credentials(token):
    """Return valid Credentials for a GmailToken, refreshing the access token if expired."""
    from google.auth.transport.requests import Request
    from django.utils import timezone
    from datetime import timedelta

    creds = Credentials(
        token=token.access_token,
        refresh_token=token.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GMAIL_CLIENT_ID,
        client_secret=settings.GMAIL_CLIENT_SECRET,
        scopes=settings.GMAIL_SCOPES.split(' ')
    )

    if token.is_expired():
        creds.refresh(Request())
        # Persist the new access token and expiry
        token.access_token = creds.token
        token.expires_at = creds.expiry or (timezone.now() + timedelta(seconds=3600))
        token.save(update_fields=['access_token', 'expires_at', 'updated_at'])

    return creds


def get_gmail_service(user):
    try:
        token = GmailToken.objects.get(user=user)
        creds = _get_refreshed_credentials(token)
        return build('gmail', 'v1', credentials=creds, cache_discovery=False)
    except GmailToken.DoesNotExist:
        return None
    except Exception as e:
        print(f"Error building Gmail service: {e}")
        return None

def get_calendar_service(user):
    try:
        token = GmailToken.objects.get(user=user)
        creds = _get_refreshed_credentials(token)
        return build('calendar', 'v3', credentials=creds, cache_discovery=False)
    except GmailToken.DoesNotExist:
        return None
    except Exception as e:
        print(f"Error building Calendar service: {e}")
        return None


def is_google_calendar_connected(user) -> bool:
    """True when the user has a Google token with working Calendar API access."""
    if not getattr(user, 'gmail', False):
        return False
    service = get_calendar_service(user)
    if not service:
        return False
    try:
        service.calendarList().list(maxResults=1).execute()
        return True
    except Exception:
        return False

def get_today_meetings(user):
    service = get_calendar_service(user)
    if not service:
        return []
    
    try:
        now = timezone.now().isoformat()
        tonight = datetime.combine(timezone.now().date(), time.max).isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId='primary', 
            timeMin=now,
            timeMax=tonight,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])
        
        meetings = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            
            meetings.append({
                'id': event['id'],
                'summary': event.get('summary', '(No Title)'),
                'start_time': start,
                'end_time': end,
                'location': event.get('location', ''),
                'link': event.get('htmlLink', '')
            })
        return meetings
    except Exception as e:
        print(f"Error fetching meetings: {e}")
        return []

def fetch_gmail_messages(user):
    service = get_gmail_service(user)
    if not service:
        return {"error": "Gmail not connected"}

    if not user.studio:
        return {"error": "User does not belong to a studio"}

    # Pre-load all clients into a dict for O(1) lookup — avoids one DB hit per message
    clients = {
        c.email.lower(): c
        for c in Client.objects.filter(studio=user.studio)
        if c.email
    }

    try:
        from email.utils import parsedate_to_datetime
        token = GmailToken.objects.get(user=user)
        message_ids = []
        new_history_id = None

        # ── Incremental sync (fast path) ──────────────────────────────────────
        if token.history_id:
            try:
                history_response = service.users().history().list(
                    userId='me',
                    startHistoryId=token.history_id,
                    historyTypes=['messageAdded'],
                ).execute()
                new_history_id = history_response.get('historyId')
                for entry in history_response.get('history', []):
                    for added in entry.get('messagesAdded', []):
                        message_ids.append(added['message']['id'])
            except Exception:
                # historyId expired (>7 days of inactivity) — fall back to full sync
                token.history_id = None

        # ── Full sync (first run or after historyId expiry) ───────────────────
        if not token.history_id:
            results = service.users().messages().list(
                userId='me', q='newer_than:15d'
            ).execute()
            message_ids = [m['id'] for m in results.get('messages', [])]
            # Store current historyId so next call uses incremental sync
            profile = service.users().getProfile(userId='me', fields='historyId').execute()
            new_history_id = profile.get('historyId')

        if not message_ids:
            if new_history_id:
                token.history_id = str(new_history_id)
                token.save(update_fields=['history_id'])
            return {"fetched": 0}

        # Skip messages already in the DB (single query instead of one per message)
        existing_ids = set(
            Email.objects.filter(message_id__in=message_ids)
            .values_list('message_id', flat=True)
        )
        new_ids = [mid for mid in message_ids if mid not in existing_ids]

        if not new_ids:
            if new_history_id:
                token.history_id = str(new_history_id)
                token.save(update_fields=['history_id'])
            return {"fetched": 0}

        # ── Batch fetch with partial fields ───────────────────────────────────
        # Google only returns the fields we request — cuts payload size ~90%
        fetched_msgs = {}

        def _handle(request_id, response, exception):
            if exception is None:
                fetched_msgs[request_id] = response

        BATCH_SIZE = 100
        for i in range(0, len(new_ids), BATCH_SIZE):
            batch = service.new_batch_http_request(callback=_handle)
            for mid in new_ids[i:i + BATCH_SIZE]:
                batch.add(
                    service.users().messages().get(
                        userId='me', id=mid, fields=_MSG_FIELDS
                    ),
                    request_id=mid,
                )
            batch.execute()

        # ── Build Email objects ───────────────────────────────────────────────
        emails_to_create = []

        for mid, txt in fetched_msgs.items():
            headers = txt.get('payload', {}).get('headers', [])

            def get_header(name, _h=headers):
                return next((h['value'] for h in _h if h['name'].lower() == name.lower()), '')

            sender_full = get_header('From') or 'Unknown'
            recipient_full = get_header('To') or 'Unknown'
            cc_full = get_header('Cc')
            subject = get_header('Subject') or '(No Subject)'
            smtp_message_id = get_header('Message-ID')

            # Find the matching client in O(1) using the pre-loaded dict
            all_addrs = _EMAIL_RE.findall(f"{sender_full} {recipient_full} {cc_full}")
            related_client = next(
                (clients[addr.lower()] for addr in all_addrs if addr.lower() in clients),
                None,
            )
            if not related_client:
                continue

            body = _get_body_from_payload(txt.get('payload', {}))

            received_at = timezone.now()
            date_header = get_header('Date')
            if date_header:
                try:
                    dt = parsedate_to_datetime(date_header)
                    received_at = dt if timezone.is_aware(dt) else timezone.make_aware(dt)
                except Exception:
                    pass

            # Use Google's pre-computed snippet — avoids HTML parsing entirely
            snippet = html.unescape(txt.get('snippet') or get_fast_snippet(body))

            is_sent = message_is_sent_by_user(sender_full, user)
            label_ids = txt.get('labelIds') or []
            is_read = True if is_sent else gmail_message_is_read(label_ids)
            attachments = _extract_attachments_from_payload(txt.get('payload', {}))

            emails_to_create.append(Email(
                studio=user.studio,
                client=related_client,
                sender=sender_full,
                recipient=recipient_full,
                subject=subject,
                body=body,
                snippet=snippet,
                attachments=attachments,
                received_at=received_at,
                message_id=mid,
                thread_id=txt.get('threadId', ''),
                smtp_message_id=smtp_message_id,
                is_sent=is_sent,
                is_read=is_read,
            ))

        # Single bulk INSERT instead of one INSERT per message
        if emails_to_create:
            Email.objects.bulk_create(emails_to_create, ignore_conflicts=True)

        if new_history_id:
            token.history_id = str(new_history_id)
            token.save(update_fields=['history_id'])

        return {"fetched": len(emails_to_create)}

    except Exception as e:
        return {"error": str(e)}

def _looks_like_html(body: str) -> bool:
    s = (body or '').strip()
    if not s:
        return False
    if re.search(r'<[a-z][\s\S]*?>', s, re.I):
        return True
    return bool(re.search(r'&(?:lt|gt|amp|#\d+);', s, re.I))


def _normalize_compose_html(html: str) -> str:
    """Sanitize rich-text editor HTML while keeping lists and inline formatting."""
    return _sanitize_outbound_html(html)


def _strip_html_to_text(html: str) -> str:
    text = re.sub(r'<br\s*/?>', '\n', html, flags=re.I)
    text = re.sub(r'</p>', '\n', text, flags=re.I)
    text = re.sub(r'<li[^>]*>', '- ', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    from html import unescape
    text = unescape(text)
    return re.sub(r'\n{3,}', '\n\n', text).strip()


def _sanitize_outbound_html(html: str) -> str:
    """Remove scripts and event handlers from compose HTML."""
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.I | re.S)
    cleaned = re.sub(r'<style[^>]*>.*?</style>', '', cleaned, flags=re.I | re.S)
    cleaned = re.sub(r'\s+on\w+="[^"]*"', '', cleaned, flags=re.I)
    cleaned = re.sub(r"\s+on\w+='[^']*'", '', cleaned, flags=re.I)
    return cleaned.strip()


def _prepare_email_body(body: str) -> tuple[str, str | None]:
    """Return (plain_text, html_body or None) for multipart Gmail messages."""
    raw = str(body or '').strip()
    if not raw:
        return '', None
    if _looks_like_html(raw):
        html = _normalize_compose_html(raw)
        plain = _strip_html_to_text(html)
        return plain or '(no content)', html
    return raw, None


def _mime_parts(filename: str, content_type: str | None = None) -> tuple[str, str]:
    if content_type and '/' in content_type:
        main, sub = content_type.split('/', 1)
        return main, sub
    guess, _ = mimetypes.guess_type(filename or '')
    if guess and '/' in guess:
        return guess.split('/', 1)
    return 'application', 'octet-stream'


def send_gmail_message(user, to_email, subject, body, thread_id=None, attachments=None):
    service = get_gmail_service(user)
    if not service:
        return {"error": "Gmail not connected"}

    to_clean = normalize_email_address(to_email)
    if not to_clean:
        return {"error": "Invalid recipient email address"}

    attachments = attachments or []
    body_raw = str(body or '').strip()
    plain_body, html_body = _prepare_email_body(body_raw)
    if not plain_body and not html_body and not attachments:
        return {"error": "Message body or attachment is required"}

    try:
        subject_line = (subject or '').strip() or '(No Subject)'

        from_header = user.email
        if getattr(user, 'name', None) and user.email:
            from_header = formataddr((user.name, user.email))

        message = EmailMessage()
        if html_body:
            message.set_content(plain_body or '(See attachment)', subtype='plain', charset='utf-8')
            message.add_alternative(html_body, subtype='html', charset='utf-8')
        else:
            message.set_content(plain_body or '(See attachment)')
        for att in attachments:
            filename = att.get('filename') or 'attachment'
            maintype, subtype = _mime_parts(filename, att.get('content_type'))
            message.add_attachment(
                att.get('data') or b'',
                maintype=maintype,
                subtype=subtype,
                filename=filename,
            )
        message['To'] = to_clean
        message['From'] = from_header
        message['Subject'] = subject_line

        create_message: dict = {}

        if thread_id:
            create_message['threadId'] = thread_id

            parent_email = (
                Email.objects.filter(thread_id=thread_id, studio=user.studio)
                .order_by('-received_at')
                .first()
            )
            if parent_email:
                parent_smtp_id = parent_email.smtp_message_id
                if not parent_smtp_id:
                    try:
                        parent_txt = service.users().messages().get(
                            userId='me', id=parent_email.message_id
                        ).execute()
                        parent_headers = parent_txt.get('payload', {}).get('headers', [])
                        parent_smtp_id = next(
                            (h['value'] for h in parent_headers if h['name'].lower() == 'message-id'),
                            None,
                        )
                        if parent_smtp_id:
                            parent_email.smtp_message_id = parent_smtp_id
                            parent_email.save(update_fields=['smtp_message_id'])
                    except Exception as exc:
                        logger.warning('Could not load parent Message-ID: %s', exc)

                if parent_smtp_id:
                    message['In-Reply-To'] = parent_smtp_id
                    message['References'] = parent_smtp_id

                reply_subject = (parent_email.subject or subject_line).strip() or '(No Subject)'
                if not reply_subject.lower().startswith('re:'):
                    reply_subject = f'Re: {reply_subject}'
                del message['Subject']
                message['Subject'] = reply_subject
                subject_line = reply_subject

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message['raw'] = encoded_message

        sent_message = service.users().messages().send(userId='me', body=create_message).execute()

        client = Client.objects.filter(studio=user.studio, email__iexact=to_clean).first()

        sent_smtp_id = None
        try:
            full_sent_message = service.users().messages().get(
                userId='me', id=sent_message['id']
            ).execute()
            sent_headers = full_sent_message.get('payload', {}).get('headers', [])
            sent_smtp_id = next(
                (h['value'] for h in sent_headers if h['name'].lower() == 'message-id'),
                None,
            )
        except Exception as exc:
            logger.warning('Could not load sent Message-ID: %s', exc)

        stored_body = html_body or plain_body or '(See attachment)'
        snippet_source = plain_body or _strip_html_to_text(stored_body) or ' '.join(
            a.get('filename', '') for a in attachments
        )
        snippet = ' '.join(snippet_source.split())[:100]
        if len(snippet) == 100:
            snippet += '...'

        sent_attachments = []
        try:
            full_sent = service.users().messages().get(
                userId='me', id=sent_message['id'], format='full', fields=_MSG_FIELDS
            ).execute()
            fetched_html = _get_body_from_payload(full_sent.get('payload', {}))
            if fetched_html and _looks_like_html(fetched_html):
                stored_body = fetched_html
            elif html_body:
                stored_body = html_body
            sent_attachments = _extract_attachments_from_payload(full_sent.get('payload', {}))
        except Exception as exc:
            logger.warning('Could not load sent attachment metadata: %s', exc)
            if attachments:
                sent_attachments = [
                    {
                        'attachment_id': '',
                        'filename': a.get('filename') or 'attachment',
                        'mime_type': a.get('content_type') or 'application/octet-stream',
                        'size': len(a.get('data') or b''),
                    }
                    for a in attachments
                ]

        Email.objects.update_or_create(
            message_id=sent_message['id'],
            defaults={
                'studio': user.studio,
                'client': client,
                'sender': from_header,
                'recipient': to_clean,
                'subject': message['Subject'],
                'body': stored_body,
                'snippet': snippet,
                'attachments': sent_attachments,
                'received_at': timezone.now(),
                'thread_id': sent_message.get('threadId') or thread_id or '',
                'smtp_message_id': sent_smtp_id,
                'is_sent': True,
                'is_read': True,
            },
        )

        return {
            "success": True,
            "message_id": sent_message['id'],
            "thread_id": sent_message.get('threadId') or thread_id or '',
        }

    except Exception as e:
        logger.exception('Gmail send failed')
        return {"error": str(e)}

def create_google_calendar_event(user, event_data):
    """
    Create an event on Google Calendar.
    event_data format:
    {
        'summary': 'Event Title',
        'location': 'Location',
        'description': 'Description',
        'start': {
            'dateTime': '2023-05-28T09:00:00Z',
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': '2023-05-28T17:00:00Z',
            'timeZone': 'UTC',
        },
        'attendees': [
            {'email': 'guest@example.com'},
        ],
    }
    """
    service = get_calendar_service(user)
    if not service:
        return {"error": "Google Calendar not connected"}
        
    try:
        event = service.events().insert(calendarId='primary', body=event_data).execute()
        return {"success": True, "event_id": event.get('id'), "link": event.get('htmlLink')}
    except Exception as e:
        return {"error": str(e)}
