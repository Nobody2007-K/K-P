"""
Security utilities:
  - Password hashing / verification with Argon2 (fallback to bcrypt)
  - JWT access & refresh token creation / verification
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.logging import logger

# ── Password hashing ──────────────────────────────────────────────────────────
# Argon2 is preferred; bcrypt is listed as a fallback scheme.
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__memory_cost=65536,   # 64 MiB
    argon2__time_cost=3,
    argon2__parallelism=4,
)


def hash_password(plain: str) -> str:
    """Return an Argon2 hash of *plain*."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*."""
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────
TokenData = Dict[str, Any]


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


def create_access_token(
    subject: str | UUID,
    extra: Optional[TokenData] = None,
) -> str:
    """Create a short-lived JWT access token."""
    expire = _utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: TokenData = {
        "sub": str(subject),
        "type": "access",
        "exp": expire,
        "iat": _utcnow(),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    subject: str | UUID,
    extra: Optional[TokenData] = None,
) -> str:
    """Create a long-lived JWT refresh token."""
    expire = _utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: TokenData = {
        "sub": str(subject),
        "type": "refresh",
        "exp": expire,
        "iat": _utcnow(),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT.  Returns the payload dict on success,
    None on any error (expired, invalid signature, malformed, etc.).
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError as exc:
        logger.debug(f"JWT decode failed: {exc}")
        return None


def decode_access_token(token: str) -> Optional[TokenData]:
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None


def decode_refresh_token(token: str) -> Optional[TokenData]:
    payload = decode_token(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None
