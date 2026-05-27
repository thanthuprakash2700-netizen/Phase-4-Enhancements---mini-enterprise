from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext
from passlib.handlers.bcrypt import bcrypt

# Monkeypatch passlib to work with bcrypt 4.x/5.x
# passlib hasn't been updated to handle the 72-character limit check in newer bcrypt versions.
import passlib.handlers.bcrypt
_original_calc_checksum = passlib.handlers.bcrypt._BcryptBackend._calc_checksum
def _patched_calc_checksum(self, secret):
    if type(secret) is str:
        secret = secret.encode("utf-8")[:72].decode("utf-8", "ignore")
    elif type(secret) is bytes:
        secret = secret[:72]
    return _original_calc_checksum(self, secret)
passlib.handlers.bcrypt._BcryptBackend._calc_checksum = _patched_calc_checksum


from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode: dict[str, Any] = {"sub": subject, "exp": expires, "type": "access"}
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES
    )
    to_encode: dict[str, Any] = {"sub": subject, "exp": expires, "type": "refresh"}
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token: str) -> dict[str, Any] | None:
    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        return idinfo
    except ValueError:
        # Invalid token
        return None

