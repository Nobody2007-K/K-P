"""
LocationRepository — upsert-based live location management.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.location import LiveLocation
from app.schemas.location import LocationUpdate


class LocationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_user(self, user_id: UUID) -> LiveLocation | None:
        result = await self._db.execute(
            select(LiveLocation).where(LiveLocation.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def upsert(self, user_id: UUID, data: LocationUpdate) -> LiveLocation:
        """Create or update the single location row for a user."""
        existing = await self.get_by_user(user_id)
        if existing:
            for field, value in data.model_dump(exclude_none=True).items():
                setattr(existing, field, value)
            await self._db.flush()
            await self._db.refresh(existing)
            return existing

        location = LiveLocation(user_id=user_id, **data.model_dump())
        self._db.add(location)
        await self._db.flush()
        await self._db.refresh(location)
        return location

    async def get_all(self) -> list[LiveLocation]:
        result = await self._db.execute(select(LiveLocation))
        return list(result.scalars().all())
