"""
Pydantic v2 schemas for Chat messages.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    message: str | None = Field(None, max_length=4096)
    message_type: str = Field("text", pattern="^(text|image|voice|file)$")
    image_url: str | None = None
    voice_url: str | None = None
    file_url: str | None = None


class MessageUpdate(BaseModel):
    message: str = Field(..., min_length=1, max_length=4096)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sender_id: UUID
    receiver_id: UUID
    message: str | None
    message_type: str
    image_url: str | None
    voice_url: str | None
    file_url: str | None
    sent_at: datetime
    delivered: bool
    seen: bool
    edited: bool
    deleted: bool
