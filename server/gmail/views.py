import logging
import secrets
from django.conf import settings

logger = logging.getLogger(__name__)
from django.core.cache import cache
from django.http import HttpResponseRedirect
from django.utils import timezone
from .models import Email, GmailToken
from .utils import (
    client_display_name,
    email_sender_label,
    ensure_email_attachments,
    fetch_gmail_messages,
    get_gmail_service,
    send_gmail_message,
    create_google_calendar_event,
    get_calendar_service,
    message_is_sent_by_user,
    normalize_email_address,
    resolve_thread_reply_to,
)
import requests
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.models import User
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gmail_connect(request):
    """Initiate Gmail OAuth flow"""
    client_id = settings.GMAIL_CLIENT_ID
    redirect_uri = settings.GMAIL_REDIRECT_URI
    scopes = settings.GMAIL_SCOPES

    nonce = secrets.token_urlsafe(32)
    state = f"{nonce}:{request.user.id}"
    cache.set(f"oauth_state:{nonce}", request.user.id, timeout=600)

    from urllib.parse import urlencode

    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': scopes,
        'access_type': 'offline',
        'prompt': 'consent',
        'state': state
    }

    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return Response({'auth_url': auth_url})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny]) # Callback comes from Google
def gmail_callback(request):
    """Handle Gmail OAuth callback"""
    error = request.GET.get("error")
    if error:
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/oauth/gmail/callback?status=error&reason={error}"
        )

    code = request.GET.get("code")
    state = request.GET.get("state", "")

    if not code:
        return Response({"error": "No code provided"}, status=400)

    # Verify CSRF state nonce
    try:
        nonce, user_id_str = state.split(":", 1)
    except ValueError:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/gmail/callback?status=error")

    stored_user_id = cache.get(f"oauth_state:{nonce}")
    if stored_user_id is None or str(stored_user_id) != user_id_str:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/gmail/callback?status=error")

    cache.delete(f"oauth_state:{nonce}")

    try:
        user_id = int(user_id_str)
        user = User.objects.get(id=user_id)
    except (ValueError, User.DoesNotExist):
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/gmail/callback?status=error")

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GMAIL_CLIENT_ID,
        "client_secret": settings.GMAIL_CLIENT_SECRET,
        "redirect_uri": settings.GMAIL_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    try:
        r = requests.post(token_url, data=data)
        r.raise_for_status()
        token_data = r.json()
        
        defaults = {
            "access_token": token_data.get("access_token"),
            "expires_at": timezone.now() + timedelta(seconds=token_data.get("expires_in")),
            "token_type": token_data.get("token_type", "Bearer"),
        }
        # Google only returns a refresh_token on first auth or prompt=consent;
        # never overwrite an existing one with None.
        if token_data.get("refresh_token"):
            defaults["refresh_token"] = token_data["refresh_token"]

        GmailToken.objects.update_or_create(user=user, defaults=defaults)
        
        user.gmail = True
        user.save()
        
        # Determine redirect based on environment (dev/prod)
        # For now, return a simple success message or redirect to frontend
        frontend_url = f"{settings.FRONTEND_URL}/oauth/gmail/callback?status=success"
        return HttpResponseRedirect(frontend_url)
        
    except Exception as e:
        return Response({"error": f"Failed to exchange token: {str(e)}"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_emails(request):
    """Trigger fetching of emails from Gmail"""
    user = request.user
    if not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)
        
    result = fetch_gmail_messages(user)
    
    if "error" in result:
        return Response(result, status=400)
        
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_email(request):
    """Send an email or reply via Gmail"""
    user = request.user
    if not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)
        
    to_email = request.data.get('to_email')
    subject = request.data.get('subject')
    body = request.data.get('body', '')
    thread_id = request.data.get('thread_id')  # Optional, for threading replies
    uploaded_files = request.FILES.getlist('attachments')

    from .utils import _looks_like_html, _strip_html_to_text

    body_raw = str(body or '').strip()
    body_plain = _strip_html_to_text(body_raw) if _looks_like_html(body_raw) else body_raw
    if not body_plain and not uploaded_files:
        return Response({'error': 'body or attachment is required'}, status=400)

    MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024
    attachment_payloads = []
    for uploaded in uploaded_files:
        data = uploaded.read()
        if len(data) > MAX_ATTACHMENT_BYTES:
            return Response(
                {'error': f'Attachment "{uploaded.name}" exceeds 25 MB limit'},
                status=400,
            )
        attachment_payloads.append({
            'filename': uploaded.name,
            'content_type': uploaded.content_type or 'application/octet-stream',
            'data': data,
        })

    # For thread replies, always compute recipient server-side (client can send wrong to_email)
    if thread_id and user.studio:
        computed_to = resolve_thread_reply_to(user, thread_id, user.studio)
        if computed_to:
            to_email = computed_to
        elif not normalize_email_address(to_email):
            return Response(
                {'error': 'Could not determine who to reply to in this thread.'},
                status=400,
            )

    if not normalize_email_address(to_email):
        return Response({'error': 'to_email is required'}, status=400)

    if not subject and not thread_id:
        return Response({'error': 'subject is required for new emails'}, status=400)

    result = send_gmail_message(
        user, to_email, subject, body_raw, thread_id, attachments=attachment_payloads
    )
    
    if "error" in result:
        return Response(result, status=400)
        
    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def polish_reply(request):
    """Improve inbox reply draft: grammar, clarity, and structure (OpenAI)."""
    from django.conf import settings as django_settings
    from .ai import polish_reply_draft
    from .models import Email
    from .utils import _looks_like_html, _strip_html_to_text

    user = request.user
    if not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)

    if not django_settings.OPENAI_API_KEY:
        return Response({'error': 'AI assistant is not configured'}, status=503)

    body = request.data.get('body', '')
    body_plain = _strip_html_to_text(body) if _looks_like_html(str(body)) else str(body or '').strip()
    if not body_plain:
        return Response({'error': 'Write a reply before using the AI assistant'}, status=400)

    subject = (request.data.get('subject') or '').strip()
    thread_id = (request.data.get('thread_id') or '').strip()

    thread_context = None
    if thread_id and user.studio:
        recent = list(
            Email.objects.filter(studio=user.studio, thread_id=thread_id)
            .order_by('-received_at')[:4]
        )
        recent.reverse()
        chunks = []
        for em in recent:
            em_body = em.body or ''
            if len(em_body) > 800:
                em_body = em_body[:800] + '…'
            chunks.append(f"From: {em.sender}\n{em_body}")
        if chunks:
            thread_context = '\n\n---\n\n'.join(chunks)

    try:
        polished_html = polish_reply_draft(
            str(body),
            subject=subject or None,
            thread_context=thread_context,
        )
    except ValueError as exc:
        return Response({'error': str(exc)}, status=400)
    except Exception as exc:
        logger.exception('polish_reply failed')
        return Response({'error': f'AI assistant failed: {exc}'}, status=500)

    return Response({'body': polished_html})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_thread(request, thread_id):
    """Retrieve all emails in a thread"""
    # NOTE: Using request.user as per standard auth. 
    # If dev mode with hardcoded user is needed, replace request.user with User.objects.get(id=1)
    user = request.user 
    
    if not hasattr(user, 'gmail') or not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)

    # Filter by studio to ensure isolation (assuming emails are studio-wide)
    # or just user for now if that's the new model. 
    # Current Utils create emails with studio=user.studio.
    if not user.studio:
         return Response({'error': 'User has no studio'}, status=400)
         
    from .models import Email


    emails = list(
        Email.objects.filter(studio=user.studio, thread_id=thread_id)
        .select_related('client')
        .order_by('received_at')
    )
    
    # Security check: Ensure user is a participant in this thread
    # if not emails.filter(recipient__icontains=user.email).exists():
    #     return Response({'error': 'You do not have permission to view this thread'}, status=403)

    gmail_service = get_gmail_service(user) if user.gmail else None
    data = []
    for email in emails:
        attachments = email.attachments or []
        if not attachments and gmail_service:
            attachments = ensure_email_attachments(email, user, gmail_service)
        data.append({
            "id": email.id,
            "sender": email.sender,
            "sender_label": email_sender_label(email, user),
            "recipient": email.recipient,
            "subject": email.subject,
            "body": email.body,
            "received_at": email.received_at,
            "is_sent": message_is_sent_by_user(email.sender, user),
            "thread_id": email.thread_id,
            "attachments": attachments,
            "has_attachment": bool(attachments),
        })
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_email_attachment(request, email_id, attachment_id):
    """Stream a Gmail attachment for an email the user can access."""
    import base64
    from django.http import HttpResponse

    user = request.user
    if not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)
    if not user.studio:
        return Response({'error': 'User has no studio'}, status=400)

    email = Email.objects.filter(id=email_id, studio=user.studio).first()
    if not email:
        return Response({'error': 'Email not found'}, status=404)

    attachments = email.attachments or []
    if not attachments:
        attachments = ensure_email_attachments(email, user)
    meta = next(
        (a for a in attachments if a.get('attachment_id') == attachment_id),
        None,
    )
    if not meta:
        return Response({'error': 'Attachment not found'}, status=404)

    service = get_gmail_service(user)
    if not service:
        return Response({'error': 'Gmail not connected'}, status=400)

    try:
        att = service.users().messages().attachments().get(
            userId='me',
            messageId=email.message_id,
            id=attachment_id,
        ).execute()
        raw = att.get('data', '')
        binary = base64.urlsafe_b64decode(raw.encode('utf-8'))
    except Exception as exc:
        return Response({'error': str(exc)}, status=400)

    mime_type = meta.get('mime_type') or 'application/octet-stream'
    filename = meta.get('filename') or 'attachment'
    disposition = 'inline' if mime_type.startswith('image/') else 'attachment'
    response = HttpResponse(binary, content_type=mime_type)
    response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
    response['Content-Length'] = len(binary)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_thread_summary(request, thread_id):
    """Return an AI-generated summary of an email thread, cached in the DB.
    The summary is regenerated only when new emails arrive in the thread."""
    user = request.user

    if not hasattr(user, 'gmail') or not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)

    if not user.studio:
        return Response({'error': 'User has no studio'}, status=400)

    from .models import Email, ThreadSummary
    import openai

    emails = Email.objects.filter(
        studio=user.studio, thread_id=thread_id
    ).order_by('received_at')

    if not emails.exists():
        return Response({'error': 'Thread not found'}, status=404)

    email_count = emails.count()
    latest_email = emails.last()

    # Return cached summary if nothing has changed
    cached = ThreadSummary.objects.filter(
        thread_id=thread_id, studio=user.studio
    ).first()

    if cached and cached.email_count == email_count and cached.last_email_id == latest_email.id:
        return Response({
            'thread_id': thread_id,
            'summary': cached.summary,
            'email_count': cached.email_count,
            'emails': [
                {
                    'id': email.id,
                    'message_id': email.message_id,
                    'suggested_tasks': email.suggested_tasks or [],
                }
                for email in emails
            ],
            'cached': True,
            'updated_at': cached.updated_at,
        })

    # Build conversation text for the AI with per-email indices
    emails_list = list(emails)
    lines = []
    for idx, email in enumerate(emails_list):
        direction = 'Sent' if email.is_sent else 'Received'
        lines.append(
            f"[Email {idx}] [{direction}] From: {email.sender} | To: {email.recipient} | "
            f"Date: {email.received_at.strftime('%Y-%m-%d %H:%M')}\n"
            f"Subject: {email.subject or '(no subject)'}\n"
            f"{email.body[:1000]}"  # cap per-email body to keep tokens reasonable
        )
    thread_text = "\n\n---\n\n".join(lines)

    import json, re
    from django.db.models import Q
    from users.models import User as StudioUser
    from projects.models import Project

    # Pre-fetch studio users and projects (with client emails) for lookup and AI context
    studio_users = list(StudioUser.objects.filter(studio=user.studio).only('id', 'email', 'name'))
    studio_projects = list(
        Project.objects.filter(studio=user.studio)
        .select_related('client')
        .only('id', 'project_name', 'client__email', 'client__name', 'client__surname', 'client__company_name')
    )

    # Build sender-email → project map via client emails
    email_to_project_map = {}
    for proj in studio_projects:
        if proj.client and proj.client.email:
            email_to_project_map[proj.client.email.lower()] = proj

    # Extract external (received) sender addresses from the thread
    def extract_email_address(raw):
        m = re.search(r'<([^>]+@[^>]+)>', raw or '')
        return m.group(1).lower() if m else (raw.strip().lower() if raw and '@' in raw else None)

    thread_sender_emails = [
        extract_email_address(e.sender)
        for e in emails_list
        if not e.is_sent
    ]
    thread_sender_emails = [e for e in thread_sender_emails if e]

    # Pre-resolve project from the first sender email that matches a client
    preresolved_project = next(
        (email_to_project_map[addr] for addr in thread_sender_emails if addr in email_to_project_map),
        None
    )

    # Build project list for the AI so it can name the right project
    project_lines = []
    for proj in studio_projects:
        if not proj.project_name:
            continue
        client_info = ''
        if proj.client:
            parts = []
            if proj.client.name or proj.client.surname:
                parts.append(f"{proj.client.name or ''} {proj.client.surname or ''}".strip())
            if proj.client.email:
                parts.append(proj.client.email)
            client_info = ' | '.join(parts)
        project_lines.append(f'- "{proj.project_name}"' + (f' (client: {client_info})' if client_info else ''))
    projects_context = "\n".join(project_lines) if project_lines else "No projects available."

    oai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    response = oai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an assistant for an interior design studio team. "
                    "Analyse the email thread and return a JSON object with two keys:\n"
                    "1. \"summary\": a concise, professional summary (3-5 sentences) covering "
                    "who the parties are, the main topic, key decisions or action items, "
                    "and the current status of the conversation.\n"
                    "2. \"per_email_tasks\": an array where each element corresponds to one email in the thread. "
                    "Each element must have:\n"
                    "  - \"email_index\": the integer index of the email (matching the [Email N] label)\n"
                    "  - \"tasks\": a list of actionable task objects triggered by that specific email. "
                    "Each task object must use these exact keys:\n"
                    "    - \"title\": short task name (string)\n"
                    "    - \"description\": brief detail or context from the email (string)\n"
                    "    - \"status\": always \"TD\" (string)\n"
                    "    - \"end_date\": ISO 8601 date string (YYYY-MM-DD) if a deadline is mentioned, otherwise null\n"
                    "    - \"priority\": one of \"H\" (high), \"M\" (medium), or \"L\" (low) based on urgency, otherwise \"M\"\n"
                    "    - \"assignees\": list of name(s) or email address(es) of people responsible if mentioned, otherwise an empty list\n"
                    "    - \"project\": the exact project name from the list below that best matches the email context "
                    "(use the sender's email address or client name to identify it), otherwise null\n"
                    "    - \"subtask\": list of subtask title strings if the task has clear sub-steps, otherwise an empty list\n"
                    "Only include emails that produce at least one genuinely actionable task. "
                    "Omit emails with no actionable tasks entirely. "
                    "Return only the raw JSON object, no markdown, no code fences.\n\n"
                    f"Available projects for this studio:\n{projects_context}"
                ),
            },
            {
                "role": "user",
                "content": f"Analyse this email thread:\n\n{thread_text}",
            },
        ],
        max_tokens=1200,
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)
    summary_text = result.get('summary', '')
    per_email_tasks_raw = result.get('per_email_tasks', [])

    def resolve_assignees(names_or_emails):
        ids = []
        for value in (names_or_emails or []):
            value = value.strip()
            if not value:
                continue
            matched = None
            if '@' in value:
                matched = next((u for u in studio_users if u.email.lower() == value.lower()), None)
            if not matched:
                matched = next((u for u in studio_users if u.name and u.name.lower() == value.lower()), None)
            if not matched:
                matched = next((u for u in studio_users if u.name and value.lower() in u.name.lower()), None)
            if matched:
                ids.append(matched.id)
        return ids

    def resolve_project(project_name):
        if project_name:
            name = project_name.strip().lower()
            matched = next((p for p in studio_projects if p.project_name and p.project_name.lower() == name), None)
            if not matched:
                matched = next((p for p in studio_projects if p.project_name and name in p.project_name.lower()), None)
            if matched:
                return matched.id
        # Fall back to the project resolved from the sender's client email
        return preresolved_project.id if preresolved_project else None

    # Build a map of email_index -> resolved tasks
    tasks_by_index = {}
    for entry in per_email_tasks_raw:
        idx = entry.get('email_index')
        if idx is None:
            continue
        resolved = []
        for task in entry.get('tasks', []):
            resolved.append({
                'title': task.get('title'),
                'description': task.get('description'),
                'status': task.get('status', 'TD'),
                'end_date': task.get('end_date'),
                'priority': task.get('priority', 'M'),
                'assignees': resolve_assignees(task.get('assignees', [])),
                'project': resolve_project(task.get('project')),
                'subtask': task.get('subtask', []),
                'created_task_id': None,
            })
        tasks_by_index[idx] = resolved

    # Save tasks onto each Email object
    emails_to_update = []
    for idx, email in enumerate(emails_list):
        email.suggested_tasks = tasks_by_index.get(idx, [])
        emails_to_update.append(email)
    Email.objects.bulk_update(emails_to_update, ['suggested_tasks'])

    # Upsert the thread summary
    ThreadSummary.objects.update_or_create(
        thread_id=thread_id,
        studio=user.studio,
        defaults={
            'summary': summary_text,
            'email_count': email_count,
            'last_email_id': latest_email.id,
        },
    )

    return Response({
        'thread_id': thread_id,
        'summary': summary_text,
        'email_count': email_count,
        'emails': [
            {
                'id': email.id,
                'message_id': email.message_id,
                'suggested_tasks': email.suggested_tasks or [],
            }
            for email in emails_list
        ],
        'cached': False,
        'updated_at': timezone.now(),
    })


@extend_schema(
    tags=['gmail'],
    summary="Mark a suggested task as created",
    description=(
        "Updates the suggested_tasks JSON on an Email to record the task ID that was created "
        "from a specific suggestion, identified by its index in the list."
    ),
    request={
        'type': 'object',
        'properties': {
            'email_id': {'type': 'integer'},
            'suggestion_index': {'type': 'integer', 'description': 'Index of the suggestion in the suggested_tasks list'},
            'task_id': {'type': 'integer', 'description': 'ID of the Task that was created'},
        },
        'required': ['email_id', 'suggestion_index', 'task_id'],
    },
    responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_suggestion_created(request):
    """
    Record that a suggested task has been turned into a real task.
    Sets created_task_id on the suggestion at the given index.
    """
    from .models import Email

    email_id = request.data.get('email_id')
    suggestion_index = request.data.get('suggestion_index')
    task_id = request.data.get('task_id')

    if email_id is None or suggestion_index is None or task_id is None:
        return Response(
            {'error': 'email_id, suggestion_index, and task_id are required'},
            status=400,
        )

    try:
        email = Email.objects.get(id=email_id, studio=request.user.studio)
    except Email.DoesNotExist:
        return Response({'error': 'Email not found'}, status=404)

    tasks = email.suggested_tasks
    if not tasks:
        return Response({'error': 'This email has no suggested tasks'}, status=400)

    try:
        tasks[suggestion_index]['created_task_id'] = task_id
    except IndexError:
        return Response(
            {'error': f'suggestion_index {suggestion_index} is out of range'},
            status=400,
        )

    email.suggested_tasks = tasks
    email.save(update_fields=['suggested_tasks'])

    return Response({'ok': True, 'suggestion_index': suggestion_index, 'created_task_id': task_id})


from .utils import get_fast_snippet

@extend_schema(
    tags=['gmail'],
    summary="List email threads",
    description=(
        "Returns paginated email threads for the authenticated user. "
        "Each result represents the latest email in a thread, ordered by most recently received."
    ),
    parameters=[
        OpenApiParameter('page', OpenApiTypes.INT, OpenApiParameter.QUERY, description='Page number (default: 1)'),
        OpenApiParameter('page_size', OpenApiTypes.INT, OpenApiParameter.QUERY, description='Results per page, max 100 (default: 50)'),
    ],
    responses={
        200: {
            'type': 'object',
            'properties': {
                'results': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'thread_id': {'type': 'string'},
                            'subject': {'type': 'string'},
                            'snippet': {'type': 'string'},
                            'sender': {'type': 'string'},
                            'received_at': {'type': 'string', 'format': 'date-time'},
                            'project': {'type': 'object', 'nullable': True, 'properties': {'id': {'type': 'integer'}, 'name': {'type': 'string'}}},
                            'projects': {'type': 'array', 'items': {'type': 'object', 'properties': {'id': {'type': 'integer'}, 'name': {'type': 'string'}}}},
                        },
                    },
                },
                'pagination': {
                    'type': 'object',
                    'properties': {
                        'page': {'type': 'integer'},
                        'page_size': {'type': 'integer'},
                        'total': {'type': 'integer'},
                        'total_pages': {'type': 'integer'},
                    },
                },
            },
        },
        400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_threads(request):
    """Retrieve all unique thread IDs for the user with optimization (Bulk Fetch)"""
    user = request.user 
    
    if not hasattr(user, 'gmail') or not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)

    if not user.studio:
         return Response({'error': 'User has no studio'}, status=400)
         
    from .models import Email, EmailThread
    from django.db.models import Max, OuterRef, Subquery, Q
    from projects.models import Project
    from crm.models import Client
    
    import time
    _t0 = time.perf_counter()

    # Pagination params
    page = max(1, int(request.query_params.get('page', 1)))
    page_size = min(100, max(1, int(request.query_params.get('page_size', 50))))
    offset = (page - 1) * page_size

    # Get all unique thread IDs where the user is a participant
    # Use contains (case-sensitive) instead of icontains — email addresses are lowercase
    # and icontains causes a full table scan (LIKE '%...%' with no index)
    base_qs = Email.objects.filter(
        studio=user.studio
    ).filter(
        Q(recipient__contains=user.email) | Q(sender__contains=user.email)
    )
    total_threads = base_qs.values('thread_id').distinct().count()
    thread_ids_with_dates = base_qs.values('thread_id').annotate(
        last_received=Max('received_at')
    ).order_by('-last_received')[offset:offset + page_size]

    thread_ids = [t['thread_id'] for t in thread_ids_with_dates]
    print(f"[TIMER] Step 1 - fetch thread_ids: {time.perf_counter() - _t0:.3f}s ({len(thread_ids)} threads)")
    _t1 = time.perf_counter()

    if not thread_ids:
        return Response([])

    # Subquery to get the ID of the latest email for each thread
    latest_emails_ids = Email.objects.filter(
        thread_id=OuterRef('thread_id'),
        studio=user.studio
    ).order_by('-received_at').values('id')[:1]

    # Bulk fetch latest emails with prefetched data
    latest_emails = Email.objects.filter(
        id__in=Subquery(latest_emails_ids),
        thread_id__in=thread_ids
    ).select_related('client', 'studio')
    latest_emails = list(latest_emails)  # force evaluation
    print(f"[TIMER] Step 2 - fetch latest emails: {time.perf_counter() - _t1:.3f}s ({len(latest_emails)} emails)")
    _t2 = time.perf_counter()

    # Prefetch EmailThread mappings for these threads
    email_threads = EmailThread.objects.filter(
        thread_id__in=thread_ids,
        studio=user.studio
    ).prefetch_related('projects')
    thread_map = {t.thread_id: t for t in email_threads}
    print(f"[TIMER] Step 3 - fetch email_threads: {time.perf_counter() - _t2:.3f}s ({len(thread_map)} threads)")
    _t3 = time.perf_counter()

    data = []
    from email.utils import parseaddr

    # We iterate over the sorted thread list to maintain the correct order
    email_map = {e.thread_id: e for e in latest_emails}

    # Pre-fetch client→project mapping to avoid N+1 queries in the loop
    client_ids = [e.client_id for e in latest_emails if e.client_id]
    client_project_map = {}
    if client_ids:
        for project in Project.objects.filter(client_id__in=client_ids):
            if project.client_id not in client_project_map:
                client_project_map[project.client_id] = project
    print(f"[TIMER] Step 4 - fetch client→project map: {time.perf_counter() - _t3:.3f}s")
    _t4 = time.perf_counter()

    _loop_snippet = _loop_project = _loop_sender = 0.0

    for t_id in thread_ids:
        email = email_map.get(t_id)
        if not email:
            continue

        # Use pre-calculated snippet
        _ts = time.perf_counter()
        current_snippet = email.snippet
        if not current_snippet and email.body:
            # High-performance fallback for old emails
            current_snippet = get_fast_snippet(email.body)
        _loop_snippet += time.perf_counter() - _ts

        # Project lookup
        _ts = time.perf_counter()
        projects_data = []
        project_data = None

        mapped_thread = thread_map.get(email.thread_id)
        # Use list() to leverage the prefetch_related cache instead of .exists() which bypasses it
        if mapped_thread:
            prefetched_projects = list(mapped_thread.projects.all())
            if prefetched_projects:
                projects_data = [{"id": p.id, "name": p.project_name} for p in prefetched_projects]
                project_data = projects_data[0]
        if not project_data:
            # Heuristic fallback: use the pre-fetched client→project map (no extra DB query)
            if email.client_id and email.client_id in client_project_map:
                project = client_project_map[email.client_id]
                project_data = {"id": project.id, "name": project.project_name}
        _loop_project += time.perf_counter() - _ts

        # Sender name mapping (CRM company / contact name for client threads)
        _ts = time.perf_counter()
        sender_display = email.sender
        email_addr_norm = normalize_email_address(parseaddr(email.sender)[1] or email.sender)
        user_addr_norm = normalize_email_address(user.email)

        if email_addr_norm and email_addr_norm == user_addr_norm:
            user_name = user.name if hasattr(user, 'name') and user.name else "Me"
            sender_display = f"{user_name} <{email_addr_norm}>"
        elif email.client:
            label = client_display_name(email.client) or email.client.name or email_addr_norm
            sender_display = f"{label} <{email_addr_norm}>" if email_addr_norm else label
        _loop_sender += time.perf_counter() - _ts

        data.append({
            "thread_id": email.thread_id,
            "subject": email.subject,
            "snippet": current_snippet,
            "sender": sender_display,
            "received_at": email.received_at,
            "has_attachment": bool(email.attachments),
            "project": project_data,
            "projects": projects_data
        })

    print(f"[TIMER] Step 5 - build response data loop: {time.perf_counter() - _t4:.3f}s ({len(data)} items)")
    print(f"[TIMER]   └─ snippet processing (cumulative): {_loop_snippet:.3f}s")
    print(f"[TIMER]   └─ project lookup (cumulative):     {_loop_project:.3f}s")
    print(f"[TIMER]   └─ sender mapping (cumulative):     {_loop_sender:.3f}s")
    print(f"[TIMER] TOTAL: {time.perf_counter() - _t0:.3f}s")

    return Response({
        "results": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total_threads,
            "total_pages": (total_threads + page_size - 1) // page_size,
        }
    })

@extend_schema(
    tags=['gmail'],
    summary="Search emails",
    description=(
        "Search email threads by subject, sender, recipient, snippet, or body. "
        "Returns one result per thread (the latest matching email), ordered by most recently received. "
        "Uses case-insensitive matching across all fields."
    ),
    parameters=[
        OpenApiParameter('q', OpenApiTypes.STR, OpenApiParameter.QUERY, required=True, description='Search query string'),
        OpenApiParameter('page', OpenApiTypes.INT, OpenApiParameter.QUERY, description='Page number (default: 1)'),
        OpenApiParameter('page_size', OpenApiTypes.INT, OpenApiParameter.QUERY, description='Results per page, max 100 (default: 20)'),
    ],
    responses={
        200: {
            'type': 'object',
            'properties': {
                'results': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'thread_id': {'type': 'string'},
                            'subject': {'type': 'string'},
                            'snippet': {'type': 'string'},
                            'sender': {'type': 'string'},
                            'received_at': {'type': 'string', 'format': 'date-time'},
                            'project': {'type': 'object', 'nullable': True, 'properties': {'id': {'type': 'integer'}, 'name': {'type': 'string'}}},
                            'projects': {'type': 'array', 'items': {'type': 'object', 'properties': {'id': {'type': 'integer'}, 'name': {'type': 'string'}}}},
                        },
                    },
                },
                'pagination': {
                    'type': 'object',
                    'properties': {
                        'page': {'type': 'integer'},
                        'page_size': {'type': 'integer'},
                        'total': {'type': 'integer'},
                        'total_pages': {'type': 'integer'},
                    },
                },
            },
        },
        400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_emails(request):
    """Search emails by subject, sender, recipient, or body snippet"""
    user = request.user

    if not hasattr(user, 'gmail') or not user.gmail:
        return Response({'error': 'User has no gmail connected'}, status=400)

    if not user.studio:
        return Response({'error': 'User has no studio'}, status=400)

    query = request.query_params.get('q', '').strip()
    if not query:
        return Response({'error': 'q parameter is required'}, status=400)

    page = max(1, int(request.query_params.get('page', 1)))
    page_size = min(100, max(1, int(request.query_params.get('page_size', 20))))
    offset = (page - 1) * page_size

    from .models import Email, EmailThread
    from django.db.models import Max, OuterRef, Subquery, Q
    from projects.models import Project
    from email.utils import parseaddr

    # Search across subject, sender, recipient, and snippet/body
    search_filter = (
        Q(subject__icontains=query) |
        Q(sender__icontains=query) |
        Q(recipient__icontains=query) |
        Q(snippet__icontains=query) |
        Q(body__icontains=query)
    )

    base_qs = Email.objects.filter(
        studio=user.studio
    ).filter(
        Q(recipient__contains=user.email) | Q(sender__contains=user.email)
    ).filter(search_filter)

    total = base_qs.count()

    # Get one result per thread (latest email in thread matching the search)
    matching_thread_ids = (
        base_qs.values('thread_id')
        .annotate(last_received=Max('received_at'))
        .order_by('-last_received')[offset:offset + page_size]
    )
    thread_ids = [t['thread_id'] for t in matching_thread_ids]

    if not thread_ids:
        return Response({"results": [], "pagination": {"page": page, "page_size": page_size, "total": 0, "total_pages": 0}})

    latest_email_ids = Email.objects.filter(
        thread_id=OuterRef('thread_id'),
        studio=user.studio
    ).filter(search_filter).order_by('-received_at').values('id')[:1]

    emails = Email.objects.filter(
        id__in=Subquery(latest_email_ids),
        thread_id__in=thread_ids
    ).select_related('client', 'studio')
    email_map = {e.thread_id: e for e in emails}

    thread_map = {
        t.thread_id: t
        for t in EmailThread.objects.filter(
            thread_id__in=thread_ids, studio=user.studio
        ).prefetch_related('projects')
    }

    client_ids = [e.client_id for e in emails if e.client_id]
    client_project_map = {}
    if client_ids:
        for project in Project.objects.filter(client_id__in=client_ids):
            if project.client_id not in client_project_map:
                client_project_map[project.client_id] = project

    results = []
    for t_id in thread_ids:
        email = email_map.get(t_id)
        if not email:
            continue

        current_snippet = email.snippet or get_fast_snippet(email.body or '')

        projects_data = []
        project_data = None
        mapped_thread = thread_map.get(t_id)
        if mapped_thread:
            prefetched = list(mapped_thread.projects.all())
            if prefetched:
                projects_data = [{"id": p.id, "name": p.project_name} for p in prefetched]
                project_data = projects_data[0]
        if not project_data and email.client_id in client_project_map:
            p = client_project_map[email.client_id]
            project_data = {"id": p.id, "name": p.project_name}

        email_addr_norm = normalize_email_address(parseaddr(email.sender)[1] or email.sender)
        user_addr_norm = normalize_email_address(user.email)
        sender_display = email.sender
        if email_addr_norm and email_addr_norm == user_addr_norm:
            user_name = user.name if hasattr(user, 'name') and user.name else "Me"
            sender_display = f"{user_name} <{email_addr_norm}>"
        elif email.client:
            label = client_display_name(email.client) or email.client.name or email_addr_norm
            sender_display = f"{label} <{email_addr_norm}>" if email_addr_norm else label

        results.append({
            "thread_id": email.thread_id,
            "subject": email.subject,
            "snippet": current_snippet,
            "sender": sender_display,
            "received_at": email.received_at,
            "project": project_data,
            "projects": projects_data,
        })

    return Response({
        "results": results,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_gmail(request):
    """Disconnect Gmail by deleting the token and updating user status"""
    user = request.user
    
    deleted_count, _ = GmailToken.objects.filter(user=user).delete()
    
    user.gmail = False
    user.save()
    
    return Response({"message": f"Successfully disconnected Gmail. {deleted_count} token(s) removed."})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_thread_to_project(request):
    """Link a Gmail thread to one or more projects"""
    user = request.user
    thread_id = request.data.get('thread_id')
    project_ids = request.data.get('project_ids', []) # List of project IDs

    if not thread_id:
        return Response({'error': 'thread_id is required'}, status=400)
    
    if not user.studio:
        return Response({'error': 'User has no studio'}, status=400)

    from .models import EmailThread
    from projects.models import Project

    thread_obj, created = EmailThread.objects.get_or_create(
        thread_id=thread_id,
        studio=user.studio
    )

    if project_ids:
        projects = Project.objects.filter(id__in=project_ids, studio=user.studio)
        thread_obj.projects.set(projects)
    else:
        thread_obj.projects.clear()
    
    return Response({
        "message": f"Thread {thread_id} linked to {thread_obj.projects.count()} projects",
        "projects": [{"id": p.id, "name": p.project_name} for p in thread_obj.projects.all()]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlink_thread_from_project(request):
    """Remove a Gmail thread from a specific project"""
    user = request.user
    thread_id = request.data.get('thread_id')
    project_id = request.data.get('project_id')

    if not thread_id or not project_id:
        return Response({'error': 'thread_id and project_id are required'}, status=400)

    if not user.studio:
        return Response({'error': 'User has no studio'}, status=400)

    from .models import EmailThread
    from projects.models import Project

    try:
        thread_obj = EmailThread.objects.get(thread_id=thread_id, studio=user.studio)
    except EmailThread.DoesNotExist:
        return Response({'error': 'Thread not found for this studio'}, status=404)

    try:
        project = Project.objects.get(id=project_id, studio=user.studio)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)

    thread_obj.projects.remove(project)

    return Response({
        "message": f"Thread {thread_id} removed from project {project_id}",
        "projects": [{"id": p.id, "name": p.project_name} for p in thread_obj.projects.all()]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_threads_by_project(request, project_id):
    """Retrieve all email threads associated with a project with optimization (Bulk Fetch)"""
    user = request.user
    if not user.studio:
        return Response({'error': 'User has no studio'}, status=400)

    from .models import Email, EmailThread
    from django.db.models import OuterRef, Subquery, Max
    from crm.models import Client
    from email.utils import parseaddr

    # Get thread IDs associated with this project and studio
    thread_ids_qs = EmailThread.objects.filter(
        projects__id=project_id, 
        studio=user.studio
    ).values_list('thread_id', flat=True)

    # Further filter and get latest date for sorting
    # Enforce a hard limit of 50
    threads_with_dates = Email.objects.filter(
        studio=user.studio, 
        thread_id__in=thread_ids_qs
    ).values('thread_id').annotate(
        last_received=Max('received_at')
    ).order_by('-last_received')[:50]

    thread_ids = [t['thread_id'] for t in threads_with_dates]

    if not thread_ids:
        return Response([])

    # Subquery to get the ID of the latest email for each thread
    latest_emails_ids = Email.objects.filter(
        thread_id=OuterRef('thread_id'),
        studio=user.studio
    ).order_by('-received_at').values('id')[:1]

    # Bulk fetch latest emails
    latest_emails = Email.objects.filter(
        id__in=Subquery(latest_emails_ids),
        thread_id__in=thread_ids
    ).select_related('client')

    email_map = {e.thread_id: e for e in latest_emails}
    data = []
    
    for t_id in thread_ids:
        email = email_map.get(t_id)
        if not email:
            continue
            
        # Use pre-calculated snippet
        current_snippet = email.snippet
        if not current_snippet and email.body:
            # High-performance fallback
            current_snippet = get_fast_snippet(email.body)
            
        email_addr_norm = normalize_email_address(parseaddr(email.sender)[1] or email.sender)
        user_addr_norm = normalize_email_address(user.email)
        sender_display = email.sender
        if email_addr_norm and email_addr_norm == user_addr_norm:
            user_name = user.name if hasattr(user, 'name') and user.name else "Me"
            sender_display = f"{user_name} <{email_addr_norm}>"
        elif email.client:
            label = client_display_name(email.client) or email.client.name or email_addr_norm
            sender_display = f"{label} <{email_addr_norm}>" if email_addr_norm else label

        data.append({
            "thread_id": email.thread_id,
            "subject": email.subject,
            "snippet": current_snippet,
            "sender": sender_display,
            "received_at": email.received_at
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_calendar_event(request):
    """
    Create an event on Google Calendar.
    Payload:
    {
        "summary": "Meeting with Client",
        "location": "Zoom",
        "description": "Discuss project updates",
        "start_time": "2023-05-28T09:00:00Z",
        "end_time": "2023-05-28T10:00:00Z",
        "attendees": ["guest1@example.com", "guest2@example.com"]
    }
    """
    user = request.user
    if not hasattr(user, 'gmail') or not user.gmail:
        return Response({'error': 'User has no Gmail/Calendar connected'}, status=400)
    
    summary = request.data.get('summary')
    start_time = request.data.get('start_time')
    end_time = request.data.get('end_time')
    time_zone = request.data.get('timezone', 'UTC')
    
    if not summary or not start_time or not end_time:
        return Response({'error': 'summary, start_time, and end_time are required'}, status=400)
    
    # Format attendees for Google API
    attendees_emails = request.data.get('attendees', []) or []
    attendees = [{'email': email} for email in attendees_emails if email]

    # Strip Z suffix so Google uses timeZone as wall-clock (client sends local parts + IANA tz)
    def _normalize_dt(value: str) -> str:
        return value.replace('Z', '').split('+')[0].split('.')[0]

    event_data = {
        'summary': summary,
        'location': request.data.get('location', ''),
        'description': request.data.get('description', ''),
        'start': {
            'dateTime': _normalize_dt(start_time),
            'timeZone': time_zone,
        },
        'end': {
            'dateTime': _normalize_dt(end_time),
            'timeZone': time_zone,
        },
    }
    if attendees:
        event_data['attendees'] = attendees

    result = create_google_calendar_event(user, event_data)
    
    if "error" in result:
        return Response(result, status=400)
        
    return Response(result, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_calendar_events(request):
    """
    GET /gmail/calendar/events/
    Fetch upcoming calendar events for the authenticated user.
    Query params:
      - days: number of days ahead to fetch (default: 7)
      - max_results: max events to return (default: 50)
    """
    user = request.user
    service = get_calendar_service(user)
    if not service:
        return Response({'error': 'Google Calendar not connected. Please connect Gmail/Calendar first.'}, status=400)

    try:
        max_results = min(250, max(1, int(request.query_params.get('max_results', 100))))

        time_min_param = request.query_params.get('time_min')
        time_max_param = request.query_params.get('time_max')

        if time_min_param and time_max_param:
            time_min = time_min_param
            time_max = time_max_param
        else:
            days = int(request.query_params.get('days', 42))
            now = timezone.now()
            time_min = now.isoformat()
            time_max = (now + timedelta(days=days)).isoformat()

        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])

        formatted = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            formatted.append({
                'id': event.get('id'),
                'summary': event.get('summary', '(No Title)'),
                'description': event.get('description', ''),
                'location': event.get('location', ''),
                'start': start,
                'end': end,
                'link': event.get('htmlLink', ''),
                'attendees': [a.get('email') for a in event.get('attendees', [])],
                'status': event.get('status', ''),
            })

        return Response({'events': formatted, 'count': len(formatted)})

    except Exception as e:
        return Response({'error': str(e)}, status=500)