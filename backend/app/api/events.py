"""
Calendar Events routes:
  GET    /api/events
  POST   /api/events
  PUT    /api/events/{id}
  DELETE /api/events/{id}
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.calendar_repository import CalendarRepository
from app.schemas.calendar_event import CalendarEventCreate, CalendarEventOut, CalendarEventUpdate
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/api/events", tags=["calendar"])


@router.get("", response_model=list[CalendarEventOut])
async def list_events(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CalendarEventOut]:
    repo = CalendarRepository(db)
    items = await repo.get_all(limit, offset)
    return [CalendarEventOut.model_validate(e) for e in items]


@router.post("", response_model=CalendarEventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    body: CalendarEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendarEventOut:
    repo = CalendarRepository(db)
    event = await repo.create(current_user.id, body)
    return CalendarEventOut.model_validate(event)


@router.put("/{event_id}", response_model=CalendarEventOut)
async def update_event(
    event_id: UUID,
    body: CalendarEventUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendarEventOut:
    repo = CalendarRepository(db)
    event = await repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    # Both users can edit each other's events (shared calendar)
    updated = await repo.update(event, body)
    return CalendarEventOut.model_validate(updated)


@router.delete("/{event_id}", response_model=MessageResponse)
async def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    repo = CalendarRepository(db)
    event = await repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    await repo.delete(event)
    return MessageResponse(message="Event deleted")
