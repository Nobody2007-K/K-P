"""
LoveNoteRepository — CRUD for LoveNote model.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.love_note import LoveNote
from app.schemas.love_note import LoveNoteCreate, LoveNoteUpdate


class LoveNoteRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, created_by: UUID, data: LoveNoteCreate) -> LoveNote:
        note = LoveNote(created_by=created_by, **data.model_dump())
        self._db.add(note)
        await self._db.flush()
        await self._db.refresh(note)
        return note

    async def get_by_id(self, note_id: UUID) -> LoveNote | None:
        result = await self._db.execute(select(LoveNote).where(LoveNote.id == note_id))
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 50, offset: int = 0) -> list[LoveNote]:
        result = await self._db.execute(
            select(LoveNote).order_by(LoveNote.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def update(self, note: LoveNote, data: LoveNoteUpdate) -> LoveNote:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(note, field, value)
        await self._db.flush()
        await self._db.refresh(note)
        return note

    async def delete(self, note: LoveNote) -> None:
        await self._db.delete(note)
        await self._db.flush()
