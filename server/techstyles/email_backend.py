import ssl
import certifi
from django.core.mail.backends.smtp import EmailBackend

class CertifiEmailBackend(EmailBackend):
    """
    Custom EmailBackend that uses certifi for SSL certificate verification.
    This fixes SSL: CERTIFICATE_VERIFY_FAILED errors on macOS.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())
