"""
PlaylistRepository — CRUD for Playlist model.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.playlist import Playlist
from app.schemas.playlist import PlaylistCreate


class PlaylistRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, created_by: UUID, data: PlaylistCreate) -> Playlist:
        track = Playlist(created_by=created_by, **data.model_dump())
        self._db.add(track)
        await self._db.flush()
        await self._db.refresh(track)
        return track

    async def get_by_id(self, track_id: UUID) -> Playlist | None:
        result = await self._db.execute(select(Playlist).where(Playlist.id == track_id))
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> list[Playlist]:
        result = await self._db.execute(
            select(Playlist).order_by(Playlist.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def delete(self, track: Playlist) -> None:
        await self._db.delete(track)
        await self._db.flush()
