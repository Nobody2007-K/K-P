"""
Pydantic v2 schemas for Memories.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MemoryCreate(BaseModel):
    image_url: str | None = None
    video_url: str | None = None
    caption: str | None = Field(None, max_length=500)
    location_name: str | None = Field(None, max_length=255)
    latitude: float | None = Field(None, ge=-90.0, le=90.0)
    longitude: float | None = Field(None, ge=-180.0, le=180.0)


class MemoryUpdate(BaseModel):
    caption: str | None = Field(None, max_length=500)
    location_name: str | None = Field(None, max_length=255)
    latitude: float | None = Field(None, ge=-90.0, le=90.0)
    longitude: float | None = Field(None, ge=-180.0, le=180.0)


class MemoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    uploaded_by: UUID
    image_url: str | None
    video_url: str | None
    caption: str | None
    location_name: str | None
    latitude: float | None
    longitude: float | None
    created_at: datetime
