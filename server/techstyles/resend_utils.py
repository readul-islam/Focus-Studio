import base64

import requests
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from techstyles.email_branding import email_brand_row_html

FROM_EMAIL = f"Focuspilot <{settings.DEFAULT_FROM_EMAIL}>"

RESEND_API_URL = "https://api.resend.com/emails"


def _send_via_resend(
    subject: str,
    from_email: str,
    to: list[str],
    html: str,
    plain: str,
    cc: list[str] | None = None,
    attachments: list[dict] | None = None,
) -> dict:
    payload: dict = {
        "from": from_email,
        "to": to,
        "subject": subject,
        "html": html,
        "text": plain,
    }
    if cc:
        payload["cc"] = cc
    if attachments:
        attach_list = []
        for att in attachments:
            content = att["content"]
            if isinstance(content, bytes):
                content = base64.b64encode(content).decode("ascii")
            attach_list.append({"filename": att["filename"], "content": content})
        payload["attachments"] = attach_list

    resp = requests.post(
        RESEND_API_URL,
        json=payload,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        timeout=60,
    )
    if not resp.ok:
        raise RuntimeError(f"Resend API error {resp.status_code}: {resp.text}")
    return resp.json() if resp.text else {}


def _send_smtp(
    subject: str,
    from_email: str,
    to: list[str],
    html: str,
    plain: str,
    cc: list[str] | None = None,
    attachments: list[dict] | None = None,
) -> dict:
    msg = EmailMultiAlternatives(subject=subject, body=plain, from_email=from_email, to=to, cc=cc or [])
    msg.attach_alternative(html, "text/html")
    if attachments:
        for att in attachments:
            msg.attach(att["filename"], att["content"], att.get("content_type", "application/octet-stream"))
    msg.send()
    return {}


def _send(subject: str, from_email: str, to: list[str], html: str, plain: str, cc: list[str] = None, attachments: list[dict] = None) -> dict:
    if getattr(settings, "RESEND_API_KEY", None):
        return _send_via_resend(subject, from_email, to, html, plain, cc=cc, attachments=attachments)
    return _send_smtp(subject, from_email, to, html, plain, cc=cc, attachments=attachments)


def send_registration_welcome_email(to_email: str, login_url: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject="Welcome to Focuspilot — Your Account is Ready",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_team_invitation_email(to_email: str, studio_name: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"You've been invited to join {studio_name} on Focuspilot",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_client_portal_welcome_email(to_email: str, studio_name: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"Your {studio_name} Client Portal Access",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_contractor_portal_welcome_email(to_email: str, studio_name: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"Your {studio_name} Contractor Portal Access",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_contractor_invite_email(
    to_email: str,
    project_name: str,
    studio_name: str,
    html_message: str,
    plain_message: str,
) -> dict:
    return _send(
        subject=f"{project_name} — your contractor access",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_purchase_order_email(
    to_emails: list[str],
    cc_emails: list[str],
    studio_name: str,
    po_id,
    html_message: str,
    plain_message: str,
    attachments: list[dict] | None = None,
) -> dict:
    return _send(
        subject=f"Purchase Order {po_id} from {studio_name}",
        from_email=FROM_EMAIL,
        to=to_emails,
        cc=cc_emails,
        html=html_message,
        plain=plain_message,
        attachments=attachments,
    )


def send_invoice_reminder_email(
    to_email: str,
    studio_name: str,
    invoice_number: str,
    html_message: str,
    plain_message: str,
) -> dict:
    return _send(
        subject=f'Payment reminder: {invoice_number} from {studio_name}',
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_proposal_email(to_email: str, studio_name: str, proposal_title: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"Proposal: {proposal_title}",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_otp_email(to_email: str, otp: str, name: str) -> dict:
    plain = f"Hi {name},\n\nYour Focuspilot verification code is: {otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nThe Focuspilot Team"
    html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Verify your email</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <tr><td style="background:#111827;padding:28px 40px;">
          {email_brand_row_html(align='left')}
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Verify your email</p>
          <p style="margin:0 0 32px;font-size:15px;color:#6b7280;">Hi {name}, enter this code to complete your registration.</p>
          <div style="background:#f3f4f6;border-radius:10px;padding:28px;text-align:center;margin-bottom:32px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Your verification code</p>
            <p style="margin:0;font-size:40px;font-weight:800;color:#111827;letter-spacing:12px;font-family:monospace;">{otp}</p>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">This code expires in <strong style="color:#6b7280;">10 minutes</strong>.</p>
          <p style="margin:0;font-size:13px;color:#9ca3af;">If you didn't create an account, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#d1d5db;text-align:center;">© Focuspilot · Do not reply to this email</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    return _send(
        subject="Your Focuspilot verification code",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html,
        plain=plain,
    )


def send_password_reset_email(to_email: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject="Reset your Focuspilot password",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_project_proposal_email(to_email: str, studio_name: str, project_name: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"Proposal: {project_name}",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_procurement_change_email(to_email: str, studio_name: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"Update to Your Approved Item — {studio_name}",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_bulk_procurement_change_email(to_email: str, studio_name: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=f"Update to Your Approved Items — {studio_name}",
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_contractor_notification_email(to_email: str, subject: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=subject,
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_supplier_notification_email(to_email: str, subject: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=subject,
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )


def send_studio_supplier_payment_email(to_email: str, subject: str, html_message: str, plain_message: str) -> dict:
    return _send(
        subject=subject,
        from_email=FROM_EMAIL,
        to=[to_email],
        html=html_message,
        plain=plain_message,
    )
