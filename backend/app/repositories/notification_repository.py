"""
NotificationRepository — CRUD for Notification model.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, data: NotificationCreate) -> Notification:
        notif = Notification(**data.model_dump())
        self._db.add(notif)
        await self._db.flush()
        await self._db.refresh(notif)
        return notif

    async def get_for_user(self, user_id: UUID, limit: int = 50) -> list[Notification]:
        result = await self._db.execute(
            select(Notification)
            .where(Notification.receiver_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def mark_all_read(self, user_id: UUID) -> None:
        await self._db.execute(
            update(Notification)
            .where(
                and_(Notification.receiver_id == user_id, Notification.read.is_(False))
            )
            .values(read=True)
        )
        await self._db.flush()
