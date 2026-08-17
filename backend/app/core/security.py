from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import jwt
import bcrypt
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    Supports both direct native bcrypt and legacy passlib hash formats.
    """
    if not plain_password or not hashed_password:
        return False

    # 1. Native bcrypt verification
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        if bcrypt.checkpw(pwd_bytes, hash_bytes):
            return True
    except Exception:
        pass

    # 2. Legacy passlib bcrypt fallback verification
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except Exception:
        pass

    return False


def get_password_hash(password: str) -> str:
    """
    Generates a secure bcrypt hash of a plain-text password using native bcrypt.
    """
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(
    subject: Any,
    email: Optional[str] = None,
    is_admin: Optional[bool] = False,
    full_name: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generates a signed JWT Access Token containing user subject identity, email, admin state, and expiration time.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "email": email,
        "is_admin": is_admin,
        "full_name": full_name,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and validates a JWT token string.
    Returns payload dictionary if valid, or None if expired/invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
