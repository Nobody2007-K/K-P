"""
Pydantic v2 schemas for Playlist.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PlaylistCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    artist: str | None = Field(None, max_length=255)
    album: str | None = Field(None, max_length=255)
    cover_image: str | None = None
    duration: int | None = Field(None, ge=0)
    audio_url: str | None = None


class PlaylistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    artist: str | None
    album: str | None
    cover_image: str | None
    duration: int | None
    audio_url: str | None
    created_by: UUID
    created_at: datetime
