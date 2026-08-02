"""
LocationService — GPS update, distance calculation, reverse geocoding.
"""

from __future__ import annotations

import math
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.repositories.location_repository import LocationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.location import BothLocationsOut, LocationOut, LocationUpdate


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in meters between two coordinates."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class LocationService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = LocationRepository(db)
        self._user_repo = UserRepository(db)

    async def update(self, user_id: UUID, data: LocationUpdate) -> LocationOut:
        location = await self._repo.upsert(user_id, data)
        logger.debug(f"Location updated for user {user_id}")
        return LocationOut.model_validate(location)

    async def get_mine(self, user_id: UUID) -> LocationOut:
        loc = await self._repo.get_by_user(user_id)
        if not loc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
        return LocationOut.model_validate(loc)

    async def get_partner(self, user_id: UUID) -> LocationOut:
        partner = await self._user_repo.get_partner(user_id)
        if not partner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
        loc = await self._repo.get_by_user(partner.id)
        if not loc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Partner location not available",
            )
        return LocationOut.model_validate(loc)

    async def get_both(self, user_id: UUID) -> BothLocationsOut:
        my_loc = await self._repo.get_by_user(user_id)
        partner = await self._user_repo.get_partner(user_id)
        partner_loc = await self._repo.get_by_user(partner.id) if partner else None

        distance: float | None = None
        if my_loc and partner_loc:
            distance = _haversine(
                my_loc.latitude, my_loc.longitude,
                partner_loc.latitude, partner_loc.longitude,
            )

        return BothLocationsOut(
            me=LocationOut.model_validate(my_loc) if my_loc else None,
            partner=LocationOut.model_validate(partner_loc) if partner_loc else None,
            distance_meters=round(distance, 2) if distance is not None else None,
        )
