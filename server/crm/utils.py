from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from .models import GmailToken, Email, Client
from django.utils import timezone
import base64
from email.message import EmailMessage
from bs4 import BeautifulSoup

def get_gmail_service(studio):
    try:
        token = GmailToken.objects.get(studio=studio)
        
        creds = Credentials(
            token=token.access_token,
            refresh_token=token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GMAIL_CLIENT_ID,
            client_secret=settings.GMAIL_CLIENT_SECRET,
            scopes=settings.GMAIL_SCOPES.split(',')
        )
        
        return build('gmail', 'v1', credentials=creds)
    except GmailToken.DoesNotExist:
        return None
    except Exception as e:
        print(f"Error building Gmail service: {e}")
        return None

def fetch_gmail_messages(studio):
    service = get_gmail_service(studio)
    if not service:
        return {"error": "Gmail not connected"}
    
    # Get all client emails to filter
    client_emails = list(Client.objects.filter(studio=studio).values_list('email', flat=True))
    client_emails = [email for email in client_emails if email] # filter out None
    
    if not client_emails:
        return {"message": "No clients with email addresses found"}

    try:
        # Construct query to search for emails from or to any client
        # Requires batching if many clients, but starting simple
        # query = " OR ".join([f"from:{email} OR to:{email}" for email in client_emails])
        
        # Depending on volume, might be better to fetch recent messages and filter in python
        # Let's fetch messages from the last 7 days
        results = service.users().messages().list(userId='me', q='newer_than:7d').execute()
        messages = results.get('messages', [])
        
        fetched_count = 0
        
        for msg in messages:
            # Check if exists
            if Email.objects.filter(message_id=msg['id']).exists():
                continue
                
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            headers = txt['payload']['headers']
            
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            recipient = next((h['value'] for h in headers if h['name'] == 'To'), 'Unknown')
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
            
            # Simple check if related to any client
            related_client = None
            for client_email in client_emails:
                if client_email in sender or client_email in recipient:
                    related_client = Client.objects.filter(studio=studio, email=client_email).first()
                    break
            
            if not related_client:
                continue
                
            # Extract body
            body = ""
            if 'parts' in txt['payload']:
                for part in txt['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data')
                        if data:
                            body = base64.urlsafe_b64decode(data).decode()
                    elif part['mimeType'] == 'text/html':
                         # Prefer HTML but fallback to plain
                        data = part['body'].get('data')
                        if data:
                             html_content = base64.urlsafe_b64decode(data).decode()
                             # very simple text extraction
                             soup = BeautifulSoup(html_content, "html.parser")
                             body = soup.get_text()
            else:
                 data = txt['payload']['body'].get('data')
                 if data:
                    body = base64.urlsafe_b64decode(data).decode()
            
            received_at = timezone.now() # Approximate, ideally parse 'Date' header
            date_header = next((h['value'] for h in headers if h['name'] == 'Date'), None)
            from email.utils import parsedate_to_datetime
            if date_header:
                try:
                    received_at = parsedate_to_datetime(date_header)
                except:
                    pass

            Email.objects.create(
                studio=studio,
                client=related_client,
                sender=sender,
                recipient=recipient,
                subject=subject,
                body=body,
                received_at=received_at,
                message_id=msg['id'],
                thread_id=msg['threadId'],
                is_sent = (studio.support_email in sender) if studio.support_email else False
            )
            fetched_count += 1
            
        return {"fetched": fetched_count}

    except Exception as e:
        return {"error": str(e)}

def send_gmail_message(studio, to_email, subject, body, thread_id=None):
    service = get_gmail_service(studio)
    if not service:
        return {"error": "Gmail not connected"}
        
    try:
        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['Subject'] = subject
        
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        create_message = {
            'raw': encoded_message
        }
        
        if thread_id:
            create_message['threadId'] = thread_id
            
        sent_message = service.users().messages().send(userId="me", body=create_message).execute()
        
        # Save to DB
        client = Client.objects.filter(studio=studio, email=to_email).first()
        
        Email.objects.create(
            studio=studio,
            client=client,
            sender="me", # or studio email
            recipient=to_email,
            subject=subject,
            body=body,
            received_at=timezone.now(),
            message_id=sent_message['id'],
            thread_id=sent_message['threadId'],
            is_sent=True
        )
        
        return {"success": True, "message_id": sent_message['id']}
        
    except Exception as e:
        return {"error": str(e)}
