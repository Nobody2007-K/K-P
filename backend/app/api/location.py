"""
Live Location routes:
  POST /api/location/update  — upsert current user's coordinates
  GET  /api/location/me      — return own last location
  GET  /api/location/partner — return partner's last location
  GET  /api/location/both    — return both + Haversine distance
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.location_repository import LocationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.location import BothLocationsOut, LocationOut, LocationUpdate
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/api/location", tags=["location"])


def _haversine_metres(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS coordinates (metres)."""
    R = 6_371_000
    phi1, phi2   = math.radians(lat1), math.radians(lat2)
    dphi         = math.radians(lat2 - lat1)
    dlambda      = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _is_online(updated_at: datetime | None) -> bool:
    """True if updated within the last 30 seconds."""
    if not updated_at:
        return False
    diff = (datetime.now(tz=timezone.utc) - updated_at).total_seconds()
    return diff < 30


@router.post("/update", response_model=LocationOut)
async def update_location(
    body: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LocationOut:
    """
    Upsert the current user's GPS coordinates.
    Always updates the same row — never creates duplicates.
    Broadcasts location_update event via WebSocket.
    """
    repo = LocationRepository(db)
    location = await repo.upsert(current_user.id, body)
    out = LocationOut.model_validate(location)

    # Real-time broadcast to partner
    user_repo = UserRepository(db)
    partner   = await user_repo.get_partner(current_user.id)
    if partner and ws_manager.is_connected(partner.id):
        await ws_manager.send_location(
            current_user.id,
            partner.id,
            {
                "latitude":   out.latitude,
                "longitude":  out.longitude,
                "updated_at": out.updated_at.isoformat() if out.updated_at else None,
            },
        )

    return out


@router.get("/me", response_model=LocationOut)
async def get_my_location(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LocationOut:
    """Return the current user's last known location."""
    from fastapi import HTTPException, status
    repo     = LocationRepository(db)
    location = await repo.get_by_user(current_user.id)
    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return LocationOut.model_validate(location)


@router.get("/partner", response_model=LocationOut)
async def get_partner_location(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LocationOut:
    """Return the partner's last known location."""
    from fastapi import HTTPException, status
    user_repo = UserRepository(db)
    partner   = await user_repo.get_partner(current_user.id)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    repo     = LocationRepository(db)
    location = await repo.get_by_user(partner.id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner location not available",
        )
    return LocationOut.model_validate(location)


@router.get("/both", response_model=dict)
async def get_both_locations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Return both users' locations, distance (metres), and partner online status.
    Response shape:
      { "me": {...}, "partner": {..., "online": bool}, "distance": float, "unit": "meters" }
    """
    repo      = LocationRepository(db)
    user_repo = UserRepository(db)

    my_loc  = await repo.get_by_user(current_user.id)
    partner = await user_repo.get_partner(current_user.id)
    partner_loc = await repo.get_by_user(partner.id) if partner else None

    distance: float | None = None
    if my_loc and partner_loc:
        distance = round(
            _haversine_metres(
                my_loc.latitude,  my_loc.longitude,
                partner_loc.latitude, partner_loc.longitude,
            ),
            2,
        )

    def _loc_dict(loc) -> dict | None:
        if not loc:
            return None
        return {
            "latitude":   loc.latitude,
            "longitude":  loc.longitude,
            "updated_at": loc.updated_at.isoformat() if loc.updated_at else None,
            "online":     _is_online(loc.updated_at),
        }

    partner_dict = _loc_dict(partner_loc)
    if partner_dict and partner_loc:
        partner_dict["online"] = _is_online(partner_loc.updated_at)

    return {
        "me":       _loc_dict(my_loc),
        "partner":  partner_dict,
        "distance": distance,
        "unit":     "meters",
    }
