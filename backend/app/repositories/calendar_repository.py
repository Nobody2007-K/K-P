"""
CalendarRepository — CRUD for CalendarEvent model.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.calendar_event import CalendarEvent
from app.schemas.calendar_event import CalendarEventCreate, CalendarEventUpdate


class CalendarRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, created_by: UUID, data: CalendarEventCreate) -> CalendarEvent:
        event = CalendarEvent(created_by=created_by, **data.model_dump())
        self._db.add(event)
        await self._db.flush()
        await self._db.refresh(event)
        return event

    async def get_by_id(self, event_id: UUID) -> CalendarEvent | None:
        result = await self._db.execute(
            select(CalendarEvent).where(CalendarEvent.id == event_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> list[CalendarEvent]:
        result = await self._db.execute(
            select(CalendarEvent)
            .order_by(CalendarEvent.event_date.asc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def update(self, event: CalendarEvent, data: CalendarEventUpdate) -> CalendarEvent:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(event, field, value)
        await self._db.flush()
        await self._db.refresh(event)
        return event

    async def delete(self, event: CalendarEvent) -> None:
        await self._db.delete(event)
        await self._db.flush()
