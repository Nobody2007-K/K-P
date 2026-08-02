"""
Pydantic v2 schemas for User.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    username: str
    display_name: str
    role: str


class UserPublic(UserBase):
    """Safe schema — never exposes password_hash."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    avatar_url: str | None = None
    online: bool = False
    last_seen: datetime | None = None
    created_at: datetime
    updated_at: datetime


class UserMe(UserPublic):
    """Extended view for the authenticated user themselves."""
    pass
