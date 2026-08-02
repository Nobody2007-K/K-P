"""
Pydantic v2 schemas for Live Location — extended with online status.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LocationUpdate(BaseModel):
    latitude:      float = Field(..., ge=-90.0,  le=90.0)
    longitude:     float = Field(..., ge=-180.0, le=180.0)
    accuracy:      float | None = Field(None, ge=0)
    altitude:      float | None = None
    heading:       float | None = Field(None, ge=0, le=360)
    speed:         float | None = Field(None, ge=0)
    battery_level: int   | None = Field(None, ge=0, le=100)


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:            UUID
    user_id:       UUID
    latitude:      float
    longitude:     float
    accuracy:      float | None = None
    altitude:      float | None = None
    heading:       float | None = None
    speed:         float | None = None
    battery_level: int   | None = None
    updated_at:    datetime
    online:        bool  = False   # derived, not stored


class BothLocationsOut(BaseModel):
    me:              LocationOut | None = None
    partner:         LocationOut | None = None
    distance_meters: float       | None = None
