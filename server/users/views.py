from rest_framework import generics, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import (
    RegisterSerializer, CustomTokenObtainPairSerializer, InvitationSerializer,
    StudioSerializer, AcceptInvitationSerializer,
    StudioBrandingSerializer, RolePermissionSerializer,
    StudioPhaseTemplateSerializer, StudioDefaultTaskSerializer,
    ProjectTemplateSerializer,
    UserNotificationPreferencesSerializer, UserAppearancePreferencesSerializer,
    ChangePasswordSerializer,
)
from .models import (
    User, Invitation, Studio, PasswordResetToken,
    RolePermission, StudioPhaseTemplate, StudioDefaultTask, ProjectTemplate,
    UserNotificationPreferences, UserAppearancePreferences,
    PERMISSION_CHOICES,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import User, Invitation, Studio
from task.models import Task
from projects.models import Project
from time_tracker.models import TimeLog, TimeSession
from finance.models import PurchaseOrder
from datetime import timedelta, date
from gmail.utils import get_today_meetings
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from techstyles.resend_utils import (
    send_registration_welcome_email,
    send_team_invitation_email,
    send_password_reset_email,
    send_otp_email,
)
from techstyles.email_branding import email_brand_row_html, email_header_inner_html
from .models import OtpVerification
from rest_framework.views import APIView
from techstyles.currency import get_curency_details_json
from django.shortcuts import redirect
import secrets
import string
from .utils import get_dashboard_data, generate_daily_brief

def _cookie_settings(secure: bool) -> dict:
    """
    Production: SameSite=None; Secure; Domain from AUTH_COOKIE_DOMAIN (e.g. .focuspilot.io).

    Development: SameSite=Lax; no Secure; no Domain — localhost:3000 and localhost:8000
    are same-site, so Lax works and Secure is not needed on HTTP.
    SameSite=None without Secure is rejected by all browsers.
    """
    cookie: dict = {
        'httponly': True,
        'secure': secure,
        'samesite': 'None' if secure else 'Lax',
        'path': '/',
    }
    domain = getattr(settings, 'AUTH_COOKIE_DOMAIN', '') or ''
    if secure and domain:
        cookie['domain'] = domain
    return cookie


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login — issues access + refresh as httpOnly cookies, returns user payload only."""
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        tf = getattr(user, 'two_factor', None)
        if tf and tf.is_enabled:
            secure = not settings.DEBUG
            cookie = _cookie_settings(secure)
            response = Response({'requires_2fa': True}, status=status.HTTP_200_OK)
            response.set_cookie('pending_2fa', user.email, max_age=60 * 10, **cookie)
            return response

        refresh = RefreshToken.for_user(user)
        secure = not settings.DEBUG
        cookie = _cookie_settings(secure)
        response = Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
        response.set_cookie('access', str(refresh.access_token), max_age=86400, **cookie)
        response.set_cookie('refresh', str(refresh), max_age=86400, **cookie)
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """Reads refresh cookie, issues new access cookie. Rotates refresh cookie."""

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token missing.'}, status=status.HTTP_401_UNAUTHORIZED)
        # Inject the cookie value into request.data so the parent serializer finds it.
        # DRF request.data can be an immutable QueryDict — force a plain dict copy.
        request._full_data = {'refresh': refresh_token}
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            secure = not settings.DEBUG
            cookie = _cookie_settings(secure)
            access = response.data.pop('access')
            response.set_cookie('access', access, max_age=86400, **cookie)
            if 'refresh' in response.data:
                new_refresh = response.data.pop('refresh')
                response.set_cookie('refresh', new_refresh, max_age=86400, **cookie)
        return response


class LogoutView(APIView):
    """Blacklists the refresh token and clears all auth + pending cookies."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh')
        if refresh_token:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken as RT
                token = RT(refresh_token)
                token.blacklist()
            except Exception:
                pass
        response = Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)
        secure = not settings.DEBUG
        domain = getattr(settings, 'AUTH_COOKIE_DOMAIN', '') or None
        if not secure:
            domain = None
        response.delete_cookie('access', path='/', domain=domain)
        response.delete_cookie('refresh', path='/', domain=domain)
        response.delete_cookie('pending_email', path='/', domain=domain)
        response.delete_cookie('pending_2fa', path='/', domain=domain)
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Studio creator is always admin
        user.role = 'admin'
        user.save(update_fields=['role'])
        user_name = serializer.data['name']
        login_url = f"{settings.FRONTEND_URL}/login"

        subject = "Welcome to Focuspilot!"

        message = f"""
Hello {user_name},

Welcome to Focuspilot! Your account has been successfully created.

You can log in using the link below:
{login_url}

Please keep your login details secure. If this was not you, please contact support immediately.

Best regards,
The Focuspilot Team
"""

        html_message = f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Welcome to Focuspilot</title>
    <!--[if mso]>
      <style type="text/css">
        body,
        table,
        td {{
          font-family: Arial, Helvetica, sans-serif !important;
        }}
      </style>
    <![endif]-->
    <style type="text/css">
      /* iOS-specific fixes */
      @media screen and (max-width: 600px) {{
        .mobile-padding {{
          padding: 24px 20px !important;
        }}
        .mobile-text-center {{
          text-align: center !important;
        }}
        .mobile-block {{
          display: block !important;
          width: 100% !important;
        }}
      }}
      
      /* Fix for iOS rounded corners */
      .rounded-fix {{
        border-radius: 0 !important;
      }}
      
      /* Force solid colors for iOS */
      .ios-solid-bg {{
        background: #111827 !important;
        background-image: none !important;
      }}
      
      /* Remove box-shadow for iOS */
      .ios-no-shadow {{
        box-shadow: none !important;
      }}
      
      /* Fallback for gradients */
      .gradient-fallback {{
        background-color: #111827 !important;
      }}
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <!-- Email Container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
      <tr>
        <td style="padding: 20px;">
          <!-- Main Content Table -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0;">
            <!-- Header Section with Solid Color (iOS fix) -->
            <tr>
              <td class="ios-solid-bg gradient-fallback" style="padding: 40px 20px; text-align: center; background-color: #111827; position: relative;">
                {email_header_inner_html(title='Welcome to Focuspilot!', subtitle='Get ready for something amazing ✨', align='center')}
              </td>
            </tr>

            <!-- Greeting Section -->
            <tr>
              <td class="mobile-padding" style="padding: 40px 30px 24px;">
                <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700;">
                  Hello {user_name},
                </h2>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
                  Thank you for registering with Focuspilot! Your account has been successfully created. 🎉
                </p>
              </td>
            </tr>

            <!-- CTA Section -->
            <tr>
              <td class="mobile-padding" style="padding: 0 30px 32px;">
                <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.5;">
                  Click the button below to log in to your dashboard:
                </p>

                <!-- CTA Button with Solid Color -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td class="mobile-text-center" style="text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 8px; background-color: #111827;">
                            <a href="{login_url}" style="display: block; padding: 16px 40px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; white-space: nowrap; -webkit-text-size-adjust: none;">
                              Log In to Dashboard &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Alternative Link Section -->
            <tr>
              <td class="mobile-padding" style="padding: 0 30px 32px;">
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                  <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                    Or copy and paste this link into your browser:
                  </p>
                  <div style="background-color: #f9fafb; padding: 12px 16px; border-left: 3px solid #e07a57;">
                    <p style="margin: 0; color: #111827; font-size: 14px; word-break: break-all; font-family: 'Courier New', monospace;">
                      <a href="{login_url}" style="color: #111827; text-decoration: none; font-weight: 500;">
                        {login_url}
                      </a>
                    </p>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Security Notice -->
            <tr>
              <td class="mobile-padding" style="padding: 0 30px 40px;">
                <div style="background-color: #f9fafb; border-left: 4px solid #e07a57; padding: 16px; border-radius: 0;">
                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                    <strong style="color: #111827; display: block; margin-bottom: 6px; font-size: 15px;">
                      🔒 Security Notice
                    </strong>
                    Please keep your login details secure. If you did not register for this account, contact support immediately.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer Section with Solid Color -->
            <tr>
              <td class="ios-solid-bg gradient-fallback" style="padding: 32px 20px; background-color: #111827;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="text-align: center;">
                      <!-- Copyright -->
                      <p style="margin: 0 0 12px; color: rgba(255, 255, 255, 0.7); font-size: 13px;">
                        © 2025 Focuspilot. All rights reserved.
                      </p>

                      <!-- Address/Links -->
                      <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                        <a href="#" style="color: rgba(255, 255, 255, 0.6); text-decoration: none; margin: 0 6px;">
                          Privacy Policy
                        </a>
                        •
                        <a href="#" style="color: rgba(255, 255, 255, 0.6); text-decoration: none; margin: 0 6px;">
                          Terms of Service
                        </a>
                        •
                        <a href="#" style="color: rgba(255, 255, 255, 0.6); text-decoration: none; margin: 0 6px;">
                          Support
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Spacer for additional information -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 24px auto 0;">
            <tr>
              <td style="text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                  This email was sent to you because you registered for a Focuspilot account.<br />
                  If you have questions, please contact us at
                  <a href="mailto:support@focuspilot.io" style="color: #111827; text-decoration: none; font-weight: 500;">
                    support@focuspilot.io
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
        # Generate OTP and send verification email instead of welcome email
        otp = OtpVerification.generate_for(user)
        try:
            send_otp_email(user.email, otp, user.name or user.email)
        except Exception as e:
            print(f"Error sending OTP email to {user.email}: {e}")

        # Set short-lived pending_email cookie — no auth cookies yet
        secure = not settings.DEBUG
        cookie = _cookie_settings(secure)
        response = Response({'requires_otp': True}, status=status.HTTP_201_CREATED)
        response.set_cookie(
            'pending_email', user.email,
            max_age=60 * 10,  # 10 minutes
            **cookie,
        )
        return response


class OtpSessionView(APIView):
    """Return the email stored in the pending_email cookie — no auth required."""
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.COOKIES.get('pending_email')
        if not email:
            return Response({'detail': 'No pending session.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'email': email})


class VerifyOtpView(APIView):
    """Validate the OTP, issue auth cookies, clear pending_email cookie."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.COOKIES.get('pending_email')
        if not email:
            return Response({'detail': 'No pending session.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = request.data.get('otp', '').strip()
        if not otp or len(otp) != 6:
            return Response({'detail': 'Invalid OTP format.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            record = user.otp_verification
        except (User.DoesNotExist, OtpVerification.DoesNotExist):
            return Response({'detail': 'Invalid session.'}, status=status.HTTP_400_BAD_REQUEST)

        if record.attempts >= 5:
            return Response({'detail': 'Too many attempts. Request a new code.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        if not record.is_valid(otp):
            record.record_attempt()
            if timezone.now() > record.expires_at:
                return Response({'detail': 'OTP expired. Request a new code.'}, status=status.HTTP_400_BAD_REQUEST)
            remaining = 5 - record.attempts
            return Response(
                {'detail': f'Invalid code. {remaining} attempt(s) remaining.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP valid — mark user active, delete OTP record, issue auth cookies
        user.is_active = True
        user.save(update_fields=['is_active'])
        record.delete()

        # Send welcome email now that email is verified
        user_name = user.name or user.email
        login_url = f"{settings.FRONTEND_URL}/login"
        plain_message = f"""Hello {user_name},

Welcome to Focuspilot! Your email has been verified and your account is ready.

You can log in using the link below:
{login_url}

Best regards,
The Focuspilot Team
"""
        html_message = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to Focuspilot</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <tr><td style="background:#111827;padding:28px 40px;">
          {email_brand_row_html(align='left')}
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Welcome, {user_name}!</p>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;">Your email is verified and your account is ready to use.</p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#111827;border-radius:8px;padding:12px 28px;">
              <a href="{login_url}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Go to Focuspilot →</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#9ca3af;">If this wasn't you, please contact our support team immediately.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#d1d5db;text-align:center;">© Focuspilot · Do not reply to this email</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
        try:
            send_registration_welcome_email(user.email, login_url, html_message, plain_message)
        except Exception as e:
            print(f"Error sending welcome email to {user.email}: {e}")

        refresh = RefreshToken.for_user(user)
        secure = not settings.DEBUG
        cookie = _cookie_settings(secure)
        response = Response({'detail': 'Email verified.'}, status=status.HTTP_200_OK)
        response.set_cookie('access', str(refresh.access_token), max_age=86400, **cookie)
        response.set_cookie('refresh', str(refresh), max_age=86400, **cookie)
        response.delete_cookie('pending_email', path='/', domain=cookie.get('domain'))
        return response


class ResendOtpView(APIView):
    """Generate a new OTP and resend the email."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.COOKIES.get('pending_email')
        if not email:
            return Response({'detail': 'No pending session.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid session.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = OtpVerification.generate_for(user)
        try:
            send_otp_email(user.email, otp, user.name or user.email)
        except Exception as e:
            print(f"Error resending OTP to {user.email}: {e}")
            return Response({'detail': 'Failed to send email. Try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Refresh the pending_email cookie TTL
        secure = not settings.DEBUG
        cookie = _cookie_settings(secure)
        response = Response({'detail': 'New code sent.'}, status=status.HTTP_200_OK)
        response.set_cookie('pending_email', user.email, max_age=60 * 10, **cookie)
        return response


class SendInvitationView(generics.CreateAPIView):
    queryset = Invitation.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = InvitationSerializer

    def create(self, request, *args, **kwargs):
        from .permissions import check_role_permission
        if not check_role_permission(request.user, 'team.edit'):
            return Response({"error": "You don't have permission to invite team members."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        role = serializer.validated_data.pop('role', 'member')
        invitation = serializer.save(sender=self.request.user)

        # Generate a secure temporary password
        alphabet = string.ascii_letters + string.digits + string.punctuation
        temp_password = ''.join(secrets.choice(alphabet) for i in range(12))

        # Check if user already exists
        user_exists = User.objects.filter(email=invitation.email).exists()

        if not user_exists:
            # Create user account with temporary password
            user = User.objects.create_user(
                name=invitation.email,
                email=invitation.email,
                password=temp_password,
                studio=self.request.user.studio,
                role=role,
            )
        else:
            # User exists, update their password, studio and role
            user = User.objects.get(email=invitation.email)
            user.set_password(temp_password)
            user.studio = self.request.user.studio
            user.role = role
            user.save()
        
        login_url = f"{settings.FRONTEND_URL}/login"
        
        subject = f"You've been invited to join {self.request.user.studio.name if self.request.user.studio else 'Focuspilot'}"

        message = f"""
Hello,

{self.request.user.name or self.request.user.email} has invited you to join their team on Focuspilot.

Your account has been created with the following credentials:

Email: {invitation.email}
Temporary Password: {temp_password}

Please log in using the link below and change your password:
{login_url}

For security reasons, please change your password after your first login.

Best regards,
The Focuspilot Team
        """
        
        html_message = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Team Invitation - Focuspilot</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {{font-family: Arial, Helvetica, sans-serif !important;}}
  </style>
  <![endif]-->
  <style type="text/css">
    /* iOS-specific fixes */
    @media screen and (max-width: 600px) {{
      .mobile-padding {{
        padding: 24px 20px !important;
      }}
      .mobile-text-center {{
        text-align: center !important;
      }}
      .mobile-block {{
        display: block !important;
        width: 100% !important;
      }}
      .mobile-card {{
        width: 100% !important;
        display: block !important;
        margin-bottom: 12px !important;
      }}
    }}
    
    /* Force solid colors for iOS */
    .ios-solid-bg {{
      background: #111827 !important;
      background-image: none !important;
    }}
    
    /* Fallback for gradients */
    .gradient-fallback {{
      background-color: #111827 !important;
    }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-text-size-adjust: 100%;">
  
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td style="padding: 20px 0;">
        
        <!-- Main Content Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
          
          <!-- Header Section with Solid Color -->
          <tr>
            <td class="ios-solid-bg gradient-fallback" style="padding: 40px 20px 32px; text-align: center; background-color: #111827; mso-line-height-rule: exactly;">
              {email_header_inner_html(title='Team Invitation', subtitle="You've been invited to collaborate! 🤝", align='center')}
            </td>
          </tr>
          
          <!-- Greeting Section -->
          <tr>
            <td class="mobile-padding" style="padding: 40px 30px 24px; mso-line-height-rule: exactly;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; mso-line-height-rule: exactly;">
                Hello,
              </h2>
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7; mso-line-height-rule: exactly;">
                <span style="background-color: #111827; padding: 4px 12px; color: #ffffff; font-weight: 600;">{self.request.user.name or self.request.user.email}</span> has invited you to join their team on Focuspilot. 🎉
              </p>
            </td>
          </tr>
          
          <!-- Credentials Section -->
          <tr>
            <td class="mobile-padding" style="padding: 0 30px 32px; mso-line-height-rule: exactly;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.5; font-weight: 500; mso-line-height-rule: exactly;">
                Your account has been created with the following credentials:
              </p>
              
              <!-- Credentials Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 24px;">
                <!-- Email -->
                <div style="margin-bottom: 20px;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; mso-line-height-rule: exactly;">
                    📧 Email Address
                  </p>
                  <div style="background: #ffffff; padding: 12px 16px; border-left: 3px solid #111827;">
                    <p style="margin: 0; color: #111827; font-size: 15px; font-family: 'Courier New', monospace; word-break: break-all; font-weight: 500; mso-line-height-rule: exactly;">
                      {invitation.email}
                    </p>
                  </div>
                </div>
                
                <!-- Password -->
                <div>
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; mso-line-height-rule: exactly;">
                    🔑 Temporary Password
                  </p>
                  <div style="background: #ffffff; padding: 12px 16px; border-left: 3px solid #111827;">
                    <p style="margin: 0; color: #111827; font-size: 15px; font-family: 'Courier New', monospace; word-break: break-all; font-weight: 500; mso-line-height-rule: exactly;">
                      {temp_password}
                    </p>
                  </div>
                </div>
              </div>
              
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.5; mso-line-height-rule: exactly;">
                Click the button below to log in:
              </p>
              
              <!-- CTA Button with Solid Color -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tr>
                  <td class="mobile-text-center" style="text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #111827;">
                          <a href="{login_url}" style="display: block; padding: 16px 40px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; white-space: nowrap; -webkit-text-size-adjust: none;">
                            Log In to Focuspilot &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Alternative Link Section -->
          <tr>
            <td class="mobile-padding" style="padding: 0 30px 32px; mso-line-height-rule: exactly;">
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5; mso-line-height-rule: exactly;">
                  Or copy and paste this link into your browser:
                </p>
                <div style="background-color: #f9fafb; padding: 12px 16px; border-left: 3px solid #111827;">
                  <p style="margin: 0; color: #111827; font-size: 14px; word-break: break-all; font-family: 'Courier New', monospace; mso-line-height-rule: exactly;">
                    <a href="{login_url}" style="color: #111827; text-decoration: none; font-weight: 500;">
                      {login_url}
                    </a>
                  </p>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Security Notice -->
          <tr>
            <td class="mobile-padding" style="padding: 0 30px 32px; mso-line-height-rule: exactly;">
              <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 16px;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; mso-line-height-rule: exactly;">
                  <strong style="color: #111827; display: block; margin-bottom: 6px; font-size: 15px;">🔒 Important Security Notice</strong>
                  Keep your login credentials secure. We recommend changing your password immediately after your first login. If you did not expect this invitation, please contact support.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer Section with Solid Color -->
          <tr>
            <td class="ios-solid-bg gradient-fallback" style="padding: 32px 20px; background-color: #111827; mso-line-height-rule: exactly;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tr>
                  <td style="text-align: center;">
                    <!-- Copyright -->
                    <p style="margin: 0 0 12px; color: rgba(255, 255, 255, 0.7); font-size: 13px; mso-line-height-rule: exactly;">
                      © 2025 Focuspilot. All rights reserved.
                    </p>
                    
                    <!-- Address/Links -->
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 12px; mso-line-height-rule: exactly;">
                      <a href="#" style="color: rgba(255, 255, 255, 0.6); text-decoration: none; margin: 0 6px;">Privacy Policy</a> •
                      <a href="#" style="color: rgba(255, 255, 255, 0.6); text-decoration: none; margin: 0 6px;">Terms of Service</a> •
                      <a href="#" style="color: rgba(255, 255, 255, 0.6); text-decoration: none; margin: 0 6px;">Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Spacer for additional information -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 24px auto 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5; mso-line-height-rule: exactly;">
                This email was sent to you because you were invited to join a team on Focuspilot.<br>
                If you have questions, please contact us at <a href="mailto:support@focuspilot.io" style="color: #111827; text-decoration: none; font-weight: 500;">support@focuspilot.io</a>
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>

        """
        
        studio_name = self.request.user.studio.name if self.request.user.studio else 'Focuspilot'
        try:
            send_team_invitation_email(invitation.email, studio_name, html_message, message)
        except Exception as e:
            print(f"Error sending invitation email to {invitation.email}: {str(e)}")

class StudioCreateView(generics.CreateAPIView):
    queryset = Studio.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = StudioSerializer

    def perform_create(self, serializer):
        studio = serializer.save()
        user = self.request.user
        user.studio = studio
        user.save()

class StudioUpdateView(generics.RetrieveUpdateAPIView):
    """
    Endpoint for users to update their own studio information.
    """
    queryset = Studio.objects.all()
    serializer_class = StudioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.studio

class StudioMemberManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .permissions import check_role_permission
        if not check_role_permission(request.user, 'team.view'):
            return Response({"error": "You don't have permission to view team members."}, status=status.HTTP_403_FORBIDDEN)

        studio = request.user.studio
        if not studio:
            return Response({"error": "User does not belong to a studio"}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(studio=studio)
        serialized_users = UserSerializer(users, many=True).data

        final_list = []
        for user_data in serialized_users:
            if user_data.get('name') == user_data.get('email'):
                user_data['status'] = 'Pending'
            else:
                user_data['status'] = 'Active'
            final_list.append(user_data)

        return Response(final_list, status=status.HTTP_200_OK)

    def patch(self, request):
        from .permissions import check_role_permission
        if not check_role_permission(request.user, 'team.edit'):
            return Response({"error": "You don't have permission to change member roles."}, status=status.HTTP_403_FORBIDDEN)

        studio = request.user.studio
        if not studio:
            return Response({"error": "User does not belong to a studio"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.data.get('user_id')
        new_role = request.data.get('role')

        if not user_id or not new_role:
            return Response({"error": "user_id and role are required"}, status=status.HTTP_400_BAD_REQUEST)

        if new_role not in ('admin', 'manager', 'member'):
            return Response({"error": "role must be admin, manager, or member"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = User.objects.get(id=user_id, studio=studio)
        except User.DoesNotExist:
            return Response({"error": "User not found in this studio"}, status=status.HTTP_404_NOT_FOUND)

        member.role = new_role
        member.save(update_fields=['role'])
        return Response(UserSerializer(member).data, status=status.HTTP_200_OK)

    def post(self, request):
        studio = request.user.studio
        if not studio:
            return Response({"error": "User does not belong to a studio"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_remove = User.objects.get(id=user_id, studio=studio)
            user_to_remove.studio = None
            user_to_remove.save()
            return Response({"message": "User removed from studio successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found in this studio"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_studio_users(request):
    """
    Get all users for a specific studio.
    Query Parameters:
        - studio_id: The ID of the studio (required)
    """
    studio_id = request.query_params.get('studio_id')
    
    if not studio_id:
        return Response(
            {'error': 'studio_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    users = User.objects.filter(studio_id=studio_id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get the currently logged-in user's information.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    """
    Update the currently logged-in user's information.
    Supports JSON or multipart (profile_picture file upload).
    """
    user = User.objects.get(id=request.user.id)

    # JSON clear: { "profile_picture": null }
    if (
        request.content_type
        and 'application/json' in request.content_type
        and 'profile_picture' in request.data
        and request.data.get('profile_picture') in (None, '', 'null')
    ):
        if user.profile_picture:
            user.profile_picture.delete(save=False)
        user.profile_picture = None
        user.save(update_fields=['profile_picture'])

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PendingInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .permissions import check_role_permission
        if not check_role_permission(request.user, 'team.view'):
            return Response({"error": "You don't have permission to view pending invitations."}, status=status.HTTP_403_FORBIDDEN)

        studio = request.user.studio
        invites = Invitation.objects.filter(
            sender__studio=studio,
            status='PENDING'
        )

        serializer = InvitationSerializer(invites, many=True)
        return Response(serializer.data)

class AcceptInvitationView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = AcceptInvitationSerializer

    def get(self, request, *args, **kwargs):
        token = request.query_params.get('token')
        if not token:
            return Response({"error": "Token is required"}, status=400)

        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist:
            return Response({"error": "Invalid or expired token"}, status=404)

        invitation.status = 'ACCEPTED'
        invitation.save()

        redirect_url = f"{settings.FRONTEND_URL}/login?email={invitation.email}"
        return redirect(redirect_url)
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        invitation = Invitation.objects.get(token=token)
        
        secure = not settings.DEBUG
        cookie = _cookie_settings(secure)

        try:
            user = User.objects.get(email=invitation.email)
            user.studio = invitation.sender.studio
            user.save()

            invitation.status = 'ACCEPTED'
            invitation.save()

            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': 'Invitation accepted successfully. You have been added to the studio.',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
            response.set_cookie('access', str(refresh.access_token), max_age=86400, **cookie)
            response.set_cookie('refresh', str(refresh), max_age=86400, **cookie)
            return response

        except User.DoesNotExist:
            name = serializer.validated_data['name']
            password = serializer.validated_data['password']

            user = User.objects.create_user(
                email=invitation.email,
                name=name,
                password=password,
                studio=invitation.sender.studio
            )

            invitation.status = 'ACCEPTED'
            invitation.save()

            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': 'Account created successfully.',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
            response.set_cookie('access', str(refresh.access_token), max_age=86400, **cookie)
            response.set_cookie('refresh', str(refresh), max_age=86400, **cookie)
            return response

@api_view(['GET'])
@permission_classes([AllowAny])
def get_currency_details(request):
    """
    Get currency information with optional search by code.
    """
    search = request.query_params.get("code", "").lower()

    currency_list = get_curency_details_json()

    if search:
        currency_list = [
            c for c in currency_list
            if search in c["code"].lower()
        ]

    return Response(currency_list, status=status.HTTP_200_OK)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dashboard_data = get_dashboard_data(request.user)
        return Response(dashboard_data, status=status.HTTP_200_OK)

class DailyBriefView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        dashboard_data = get_dashboard_data(user)
        daily_brief = generate_daily_brief(user, dashboard_data)
        
        response_data = {
            'daily_brief': daily_brief
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return success regardless to avoid user enumeration
            return Response({'message': 'If an account with that email exists, a reset link has been sent.'}, status=status.HTTP_200_OK)

        # Invalidate any existing tokens for this user
        PasswordResetToken.objects.filter(user=user).delete()

        reset_token = PasswordResetToken.objects.create(user=user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"

        subject = "Reset your Focuspilot password"
        message = f"""
Hello {user.name or user.email},

We received a request to reset the password for your Focuspilot account.

Click the link below to set a new password (valid for 1 hour):
{reset_url}

If you did not request a password reset, you can safely ignore this email.

Best regards,
The Focuspilot Team
"""
        html_message = f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Reset Your Password</title>
    <style type="text/css">
      @media screen and (max-width: 600px) {{
        .mobile-padding {{ padding: 24px 20px !important; }}
        .mobile-text-center {{ text-align: center !important; }}
      }}
      .ios-solid-bg {{ background: #111827 !important; background-image: none !important; }}
      .gradient-fallback {{ background-color: #111827 !important; }}
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td class="ios-solid-bg gradient-fallback" style="padding: 40px 20px; text-align: center; background-color: #111827;">
                {email_header_inner_html(title='Password Reset', subtitle='Focuspilot Account Security', align='center')}
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding: 40px 30px 24px;">
                <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 700;">Hello {user.name or user.email},</h2>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
                  We received a request to reset the password for your Focuspilot account.
                  Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding: 0 30px 32px; text-align: center;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="border-radius: 8px; background-color: #111827;">
                      <a href="{reset_url}" style="display: block; padding: 16px 40px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; white-space: nowrap; -webkit-text-size-adjust: none;">
                        Reset Password &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding: 0 30px 32px;">
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                  <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">Or copy and paste this link:</p>
                  <div style="background-color: #f9fafb; padding: 12px 16px; border-left: 3px solid #e07a57;">
                    <p style="margin: 0; color: #111827; font-size: 13px; word-break: break-all; font-family: 'Courier New', monospace;">
                      <a href="{reset_url}" style="color: #111827; text-decoration: none;">{reset_url}</a>
                    </p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding: 0 30px 40px;">
                <div style="background-color: #f9fafb; border-left: 4px solid #e07a57; padding: 16px;">
                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                    <strong style="color: #111827; display: block; margin-bottom: 6px;">🔒 Didn't request this?</strong>
                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="ios-solid-bg gradient-fallback" style="padding: 32px 20px; background-color: #111827; text-align: center;">
                <p style="margin: 0 0 12px; color: rgba(255,255,255,0.7); font-size: 13px;">© 2025 Focuspilot. All rights reserved.</p>
                <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                  <a href="#" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 6px;">Privacy Policy</a> •
                  <a href="#" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 6px;">Terms of Service</a> •
                  <a href="#" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 6px;">Support</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
        try:
            send_password_reset_email(user.email, html_message, message)
        except Exception as e:
            print(f"Error sending password reset email to {user.email}: {str(e)}")

        return Response({'message': 'If an account with that email exists, a reset link has been sent.'}, status=status.HTTP_200_OK)


class ValidateResetTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        if not token:
            return Response({'error': 'token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)
        if not reset_token.is_valid():
            reset_token.delete()
            return Response({'error': 'Reset token has expired.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'valid': True}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '')

        if not token or not new_password:
            return Response({'error': 'token and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_token.is_valid():
            reset_token.delete()
            return Response({'error': 'Reset token has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.delete()

        return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_integration_status(request):
    """
    Get the integration status for Xero and Gmail for the user's studio.
    """
    user = request.user
    if not user.studio:
        return Response(
            {'error': 'User does not belong to a studio'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check Xero status
    xero_connected = user.studio.xero
    # Optional: Cross reference with token existence for robustness
    if xero_connected:
        from xero.models import XeroToken
        if not XeroToken.objects.filter(studio=user.studio).exists():
            xero_connected = False
            # Ideally we might want to update the studio flag here too, but let's just return current reality
            
    # Check Gmail status
    gmail_connected = user.gmail
    if gmail_connected:
        from gmail.models import GmailToken
        if not GmailToken.objects.filter(user=user).exists():
            gmail_connected = False

    from gmail.utils import is_google_calendar_connected
    calendar_connected = is_google_calendar_connected(user) if gmail_connected else False

    notion_connected = False
    if getattr(user.studio, 'notion', False):
        from notion.views import is_notion_connected
        notion_connected = is_notion_connected(user.studio)

    zapier_configured = False
    if user.studio:
        from integrations.models import StudioApiKey, WebhookEndpoint
        zapier_configured = (
            StudioApiKey.objects.filter(studio=user.studio, revoked_at__isnull=True).exists()
            or WebhookEndpoint.objects.filter(studio=user.studio, is_active=True).exists()
        )

    return Response({
        'xero_connected': xero_connected,
        'gmail_connected': gmail_connected,
        'calendar_connected': calendar_connected,
        'notion_connected': notion_connected,
        'zapier_configured': zapier_configured,
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Users'],
    summary='Update user pay per hour',
    description='Updates the pay_per_hour field for a given user by ID.',
    request=inline_serializer(
        name='UpdatePayPerHourRequest',
        fields={
            'user_id': serializers.IntegerField(help_text='ID of the user to update'),
            'pay_per_hour': serializers.FloatField(help_text='New pay per hour value'),
        }
    ),
    responses={
        200: inline_serializer(
            name='UpdatePayPerHourResponse',
            fields={
                'message': serializers.CharField(),
                'user_id': serializers.IntegerField(),
                'pay_per_hour': serializers.FloatField(),
            }
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_pay_per_hour(request):
    user_id = request.data.get('user_id')
    pay_per_hour = request.data.get('pay_per_hour')

    if user_id is None or pay_per_hour is None:
        return Response(
            {'error': 'user_id and pay_per_hour are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    user.pay_per_hour = pay_per_hour
    user.save(update_fields=['pay_per_hour'])

    return Response({
        'message': 'pay_per_hour updated successfully.',
        'user_id': user.id,
        'pay_per_hour': user.pay_per_hour,
    }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Branding — GET/PATCH /users/studio/branding/
# ---------------------------------------------------------------------------

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def studio_branding(request):
    """
    GET: Return the studio's branding settings (primary logo, monochrome logo, primary color, secondary color).
    PATCH: Update one or more branding fields. Accepts multipart/form-data for logo uploads.
    """
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        serializer = StudioBrandingSerializer(studio, context={'request': request})
        return Response(serializer.data)

    serializer = StudioBrandingSerializer(studio, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Roles & Permissions — GET/PATCH /users/studio/roles/
# ---------------------------------------------------------------------------

def _seed_role_permissions(studio):
    """Create default permission rows for all roles if they don't exist yet."""
    admin_always_on = {p for p, _ in PERMISSION_CHOICES}
    manager_defaults = {
        'projects.view', 'projects.edit',
        'tasks.view', 'tasks.edit',
        'finance.view',
        'clients.view', 'clients.edit',
        'library.view', 'library.edit',
        'procurement.view',
        'documents.view', 'documents.edit',
        'reports.view',
        'team.view',
    }
    member_defaults = {
        'projects.view',
        'tasks.view', 'tasks.edit',
        'clients.view',
        'library.view',
        'documents.view',
    }
    defaults_map = {'admin': admin_always_on, 'manager': manager_defaults, 'member': member_defaults}

    for role, enabled_set in defaults_map.items():
        for perm, _ in PERMISSION_CHOICES:
            RolePermission.objects.get_or_create(
                studio=studio, role=role, permission=perm,
                defaults={'enabled': perm in enabled_set},
            )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def studio_roles(request):
    """
    GET: Return the studio's permissions matrix as {permission_key: {admin: bool, manager: bool, member: bool}}.
         Missing rows are seeded with defaults on first call.
    PATCH: Update enabled/disabled state for manager and member permissions.
           Accepts a list of {role, permission, enabled} objects or {permissions: [...]} wrapper.
           Admin permissions are immutable and will be silently skipped.
    """
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    _seed_role_permissions(studio)

    if request.method == 'GET':
        permissions = RolePermission.objects.filter(studio=studio).order_by('role', 'permission')
        # Return as a matrix: {permission: {admin: bool, manager: bool, member: bool}}
        matrix = {}
        for rp in permissions:
            if rp.permission not in matrix:
                matrix[rp.permission] = {}
            matrix[rp.permission][rp.role] = rp.enabled
        return Response(matrix)

    # PATCH: expects list of {role, permission, enabled}
    updates = request.data if isinstance(request.data, list) else request.data.get('permissions', [])
    for item in updates:
        role = item.get('role')
        perm = item.get('permission')
        enabled = item.get('enabled')
        if role == 'admin' and request.user.role != 'admin':
            continue  # Only admins can modify admin permissions
        RolePermission.objects.filter(studio=studio, role=role, permission=perm).update(enabled=enabled)

    permissions = RolePermission.objects.filter(studio=studio).order_by('role', 'permission')
    matrix = {}
    for rp in permissions:
        if rp.permission not in matrix:
            matrix[rp.permission] = {}
        matrix[rp.permission][rp.role] = rp.enabled
    return Response(matrix)


# ---------------------------------------------------------------------------
# Project Templates — /users/studio/templates/
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_templates(request):
    """
    Manage the studio's project templates.

    Requires authentication. The studio is resolved from the authenticated user.

    GET /users/studio/templates/
        Returns all project templates belonging to the user's studio,
        each with its ordered list of phases and their default tasks.

    POST /users/studio/templates/
        Creates a new project template for the studio.
        Phases and their default tasks can be provided inline.

        Request body:
            {
                "name": "Full Interior Design",
                "phases": [                          # optional
                    {
                        "name": "Discovery",
                        "color": "#888888",
                        "default_tasks": [           # optional
                            {"title": "Client kickoff meeting"},
                            {"title": "Site survey and measurements"}
                        ]
                    }
                ]
            }

        Returns: 201 with the created template object.
    """
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        templates = ProjectTemplate.objects.filter(studio=studio).prefetch_related('phases__default_tasks')
        serializer = ProjectTemplateSerializer(templates, many=True)
        return Response(serializer.data)

    serializer = ProjectTemplateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(studio=studio)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_template_detail(request, template_id):
    """
    Retrieve, update, or delete a single project template.

    Requires authentication. The template must belong to the user's studio.

    Path param:
        template_id (int): ID of the project template.

    GET /users/studio/templates/<template_id>/
        Returns the template with all its phases and default tasks.

    PATCH /users/studio/templates/<template_id>/
        Partially updates the template. Sending "phases" replaces all
        existing phases and their tasks.

        Request body (all fields optional):
            {
                "name": "Updated Name",
                "phases": [...]    # replaces all existing phases if provided
            }

        Returns: 200 with the updated template object.

    DELETE /users/studio/templates/<template_id>/
        Permanently deletes the template along with all its phases and tasks.
        Returns: 204 No Content.
    """
    studio = request.user.studio
    try:
        template = ProjectTemplate.objects.get(id=template_id, studio=studio)
    except ProjectTemplate.DoesNotExist:
        return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProjectTemplateSerializer(template)
        return Response(serializer.data)

    if request.method == 'DELETE':
        template.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = ProjectTemplateSerializer(template, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_template_phases(request, template_id):
    """
    List or add phases within a project template.

    Requires authentication. The template must belong to the user's studio.

    Path param:
        template_id (int): ID of the project template.

    GET /users/studio/templates/<template_id>/phases/
        Returns all phases for the template, ordered by position,
        each including their default tasks.

    POST /users/studio/templates/<template_id>/phases/
        Adds a new phase to the template. The phase is appended at the end
        (order is set automatically based on current phase count).

        Request body:
            {
                "name": "Procurement",
                "color": "#3B82F6",              # optional
                "default_tasks": [               # optional
                    {"title": "Source materials"},
                    {"title": "Issue purchase orders"}
                ]
            }

        Returns: 201 with the created phase object.
    """
    studio = request.user.studio
    try:
        template = ProjectTemplate.objects.get(id=template_id, studio=studio)
    except ProjectTemplate.DoesNotExist:
        return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudioPhaseTemplateSerializer(template.phases.all(), many=True)
        return Response(serializer.data)

    serializer = StudioPhaseTemplateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    order = template.phases.count()
    serializer.save(template=template, studio=studio, order=order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_template_phase_detail(request, template_id, phase_id):
    """
    Update or delete a single phase within a project template.

    Requires authentication. The phase must belong to the given template,
    which must belong to the user's studio.

    Path params:
        template_id (int): ID of the parent project template.
        phase_id    (int): ID of the phase to update or delete.

    PATCH /users/studio/templates/<template_id>/phases/<phase_id>/
        Partially updates the phase. Sending "default_tasks" replaces all
        existing tasks for the phase.

        Request body (all fields optional):
            {
                "name": "Concept Design",
                "color": "#EF4444",
                "order": 2,
                "default_tasks": [    # replaces all existing tasks if provided
                    {"title": "Mood board creation"},
                    {"title": "Client presentation"}
                ]
            }

        Returns: 200 with the updated phase object.

    DELETE /users/studio/templates/<template_id>/phases/<phase_id>/
        Permanently deletes the phase and all its default tasks.
        Returns: 204 No Content.
    """
    studio = request.user.studio
    try:
        phase = StudioPhaseTemplate.objects.get(id=phase_id, template__id=template_id, studio=studio)
    except StudioPhaseTemplate.DoesNotExist:
        return Response({'error': 'Phase not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        phase.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = StudioPhaseTemplateSerializer(phase, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_template_phase_tasks(request, template_id, phase_id):
    """
    List or add default tasks for a phase within a project template.

    Requires authentication. The phase must belong to the given template,
    which must belong to the user's studio.

    Path params:
        template_id (int): ID of the parent project template.
        phase_id    (int): ID of the phase.

    GET /users/studio/templates/<template_id>/phases/<phase_id>/tasks/
        Returns all default tasks for the phase, ordered by position.

    POST /users/studio/templates/<template_id>/phases/<phase_id>/tasks/
        Adds a single task to the phase. Existing tasks are not affected.

        Request body:
            {"title": "Client kickoff meeting"}

        Returns: 201 with the created task object {id, title, order}.
    """
    studio = request.user.studio
    try:
        phase = StudioPhaseTemplate.objects.get(id=phase_id, template__id=template_id, studio=studio)
    except StudioPhaseTemplate.DoesNotExist:
        return Response({'error': 'Phase not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudioDefaultTaskSerializer(phase.default_tasks.all(), many=True)
        return Response(serializer.data)

    title = request.data.get('title', '').strip()
    if not title:
        return Response({'error': 'title is required.'}, status=status.HTTP_400_BAD_REQUEST)
    order = phase.default_tasks.count()
    task = StudioDefaultTask.objects.create(phase_template=phase, title=title, order=order)
    return Response(StudioDefaultTaskSerializer(task).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_template_phase_task_detail(request, template_id, phase_id, task_id):
    """
    Update or delete a single default task within a phase.

    Requires authentication. The task must belong to the given phase,
    which must belong to the given template and the user's studio.

    Path params:
        template_id (int): ID of the parent project template.
        phase_id    (int): ID of the parent phase.
        task_id     (int): ID of the task.

    PATCH /users/studio/templates/<template_id>/phases/<phase_id>/tasks/<task_id>/
        Updates the task title or order.

        Request body (all fields optional):
            {"title": "Updated task name", "order": 2}

        Returns: 200 with the updated task object.

    DELETE /users/studio/templates/<template_id>/phases/<phase_id>/tasks/<task_id>/
        Permanently deletes the task.
        Returns: 204 No Content.
    """
    studio = request.user.studio
    try:
        task = StudioDefaultTask.objects.get(
            id=task_id,
            phase_template__id=phase_id,
            phase_template__template__id=template_id,
            phase_template__studio=studio,
        )
    except StudioDefaultTask.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = StudioDefaultTaskSerializer(task, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Templates — /users/studio/phase-templates/
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def studio_phase_templates(request):
    """
    GET: Return all phase templates for the studio, ordered by position, with their default tasks.
    POST: Create a new phase template. Optionally include a nested default_tasks list.
    """
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        templates = StudioPhaseTemplate.objects.filter(studio=studio).prefetch_related('default_tasks')
        serializer = StudioPhaseTemplateSerializer(templates, many=True)
        return Response(serializer.data)

    serializer = StudioPhaseTemplateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(studio=studio)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def studio_phase_template_detail(request, template_id):
    """
    PATCH: Partially update a phase template (name, color, order, default_tasks).
           If default_tasks is included, existing tasks are replaced.
    DELETE: Permanently delete the phase template and all its default tasks.
    """
    studio = request.user.studio
    try:
        template = StudioPhaseTemplate.objects.get(id=template_id, studio=studio)
    except StudioPhaseTemplate.DoesNotExist:
        return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        template.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = StudioPhaseTemplateSerializer(template, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def studio_default_tasks(request, template_id):
    """
    GET: Return all default tasks for the given phase template, ordered by position.
    POST: Replace all default tasks for the template with a new ordered list.
          Expects body: {"tasks": ["Task title 1", "Task title 2", ...]}.
          All existing tasks are deleted before the new ones are created.
    """
    studio = request.user.studio
    try:
        template = StudioPhaseTemplate.objects.get(id=template_id, studio=studio)
    except StudioPhaseTemplate.DoesNotExist:
        return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudioDefaultTaskSerializer(template.default_tasks.all(), many=True)
        return Response(serializer.data)

    # POST: replace all default tasks with new list (one title per item)
    titles = request.data.get('tasks', [])
    template.default_tasks.all().delete()
    created = []
    for i, title in enumerate(titles):
        task = StudioDefaultTask.objects.create(phase_template=template, title=title, order=i)
        created.append({'id': task.id, 'title': task.title, 'order': task.order})
    return Response(created, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Security — POST /users/self/change-password/
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Update the authenticated user's password.
    Requires current_password for verification, plus new_password and confirm_new_password (must match, min 8 chars).
    """
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    if not user.check_password(serializer.validated_data['current_password']):
        return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'message': 'Password updated successfully.'})


# ---------------------------------------------------------------------------
# Notification Preferences — GET/PATCH /users/self/notification-preferences/
# ---------------------------------------------------------------------------

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def notification_preferences(request):
    """
    GET: Return the authenticated user's notification preferences.
         A default record is created automatically if none exists yet.
    PATCH: Update one or more notification toggles (project_updates, comments, reminders, marketing_emails).
    """
    prefs, _ = UserNotificationPreferences.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserNotificationPreferencesSerializer(prefs).data)

    serializer = UserNotificationPreferencesSerializer(prefs, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Appearance Preferences — GET/PATCH /users/self/appearance/
# ---------------------------------------------------------------------------

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def appearance_preferences(request):
    """
    GET: Return the authenticated user's appearance preferences (theme, density, accent_color).
         A default record is created automatically if none exists yet.
    PATCH: Update one or more appearance fields.
           theme: 'system' | 'light' | 'dark'
           density: 'comfortable' | 'compact' | 'spacious'
           accent_color: any CSS color string.
    """
    prefs, _ = UserAppearancePreferences.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(UserAppearancePreferencesSerializer(prefs).data)

    serializer = UserAppearancePreferencesSerializer(prefs, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_default_studio_phases(request):
    """
    Returns the default studio phases that can be used as a starting template.
    """
    default_phases = [
        {
            'name': 'Feasibility & Briefing',
            'description': 'Initial discovery and research phase',
            'progress': 0
        },
        {
            'name': 'Concept Design',
            'description': 'Conceptual design development',
            'progress': 0
        },
        {
            'name': 'Design Development',
            'description': 'Detailed design development',
            'progress': 0
        },
        {
            'name': 'Technical Drawings',
            'description': 'Technical drawings and documentation',
            'progress': 0
        },
        {
            'name': 'Procurement',
            'description': 'Procurement and sourcing',
            'progress': 0
        },
        {
            'name': 'Site / Implementation',
            'description': 'On-site implementation and installation',
            'progress': 0
        },
    ]
    return Response(default_phases, status=status.HTTP_200_OK)
