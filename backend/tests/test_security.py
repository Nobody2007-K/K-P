"""
Security unit tests — password hashing, JWT creation/verification.
"""

from __future__ import annotations

import time
import uuid

import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)


# ── Password hashing ──────────────────────────────────────────────────────────

def test_hash_password_is_not_plaintext():
    hashed = hash_password("Preshna")
    assert hashed != "Preshna"
    assert len(hashed) > 20


def test_verify_password_correct():
    hashed = hash_password("Preshna")
    assert verify_password("Preshna", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("Preshna")
    assert verify_password("wrong", hashed) is False


def test_hash_is_unique_per_call():
    """Argon2 uses a random salt — same password → different hashes."""
    h1 = hash_password("Kashish")
    h2 = hash_password("Kashish")
    assert h1 != h2


# ── JWT tokens ────────────────────────────────────────────────────────────────

def test_access_token_roundtrip():
    user_id = uuid.uuid4()
    token = create_access_token(user_id)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "access"


def test_refresh_token_roundtrip():
    user_id = uuid.uuid4()
    token = create_refresh_token(user_id)
    payload = decode_refresh_token(token)
    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "refresh"


def test_access_token_rejected_as_refresh():
    user_id = uuid.uuid4()
    token = create_access_token(user_id)
    # Must not be accepted as refresh
    assert decode_refresh_token(token) is None


def test_refresh_token_rejected_as_access():
    user_id = uuid.uuid4()
    token = create_refresh_token(user_id)
    assert decode_access_token(token) is None


def test_tampered_token_rejected():
    token = create_access_token(uuid.uuid4())
    tampered = token[:-5] + "XXXXX"
    assert decode_access_token(tampered) is None


def test_invalid_token_string():
    assert decode_access_token("not.a.token") is None
    assert decode_refresh_token("garbage") is None
