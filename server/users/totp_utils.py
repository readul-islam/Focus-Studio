"""TOTP helpers for authenticator-app 2FA."""
import hashlib
import secrets

import pyotp
from django.core.signing import Signer

_TOTP_SIGNER = Signer(salt='focuspilot-totp-v1')


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def sign_totp_secret(secret: str) -> str:
    return _TOTP_SIGNER.sign(secret)


def unsign_totp_secret(signed: str) -> str:
    return _TOTP_SIGNER.unsign(signed)


def get_totp(signed_secret: str) -> pyotp.TOTP:
    secret = unsign_totp_secret(signed_secret)
    return pyotp.TOTP(secret)


def provisioning_uri(signed_secret: str, email: str, issuer: str = 'Focuspilot') -> str:
    totp = get_totp(signed_secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer)


def verify_totp_code(signed_secret: str, code: str, *, valid_window: int = 1) -> bool:
    if not code or not code.isdigit() or len(code) != 6:
        return False
    totp = get_totp(signed_secret)
    return totp.verify(code, valid_window=valid_window)


def generate_backup_codes(count: int = 10) -> tuple[list[str], list[str]]:
    """Return (plain codes for user, sha256 hashes for storage)."""
    plain: list[str] = []
    hashes: list[str] = []
    for _ in range(count):
        raw = ''.join(secrets.token_hex(2).upper() for _ in range(2))
        code = f'{raw[:4]}-{raw[4:]}'
        plain.append(code)
        hashes.append(hashlib.sha256(raw.encode()).hexdigest())
    return plain, hashes


def verify_backup_code(code: str, stored_hashes: list[str]) -> tuple[bool, list[str]]:
    normalized = code.replace('-', '').replace(' ', '').upper()
    if len(normalized) < 8:
        return False, stored_hashes
    digest = hashlib.sha256(normalized.encode()).hexdigest()
    if digest in stored_hashes:
        remaining = [h for h in stored_hashes if h != digest]
        return True, remaining
    return False, stored_hashes
