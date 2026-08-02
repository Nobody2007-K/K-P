"""
MessageRepository — all DB operations for chat messages.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message


class MessageRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, **kwargs) -> Message:
        msg = Message(**kwargs)
        self._db.add(msg)
        await self._db.flush()
        await self._db.refresh(msg)
        return msg

    async def get_by_id(self, message_id: UUID) -> Message | None:
        result = await self._db.execute(
            select(Message).where(Message.id == message_id)
        )
        return result.scalar_one_or_none()

    async def get_conversation(
        self,
        user_a: UUID,
        user_b: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Message]:
        stmt = (
            select(Message)
            .where(
                and_(
                    Message.deleted.is_(False),
                    or_(
                        and_(Message.sender_id == user_a, Message.receiver_id == user_b),
                        and_(Message.sender_id == user_b, Message.receiver_id == user_a),
                    ),
                )
            )
            .order_by(Message.sent_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def count_unread(self, receiver_id: UUID) -> int:
        result = await self._db.execute(
            select(func.count()).where(
                and_(Message.receiver_id == receiver_id, Message.seen.is_(False), Message.deleted.is_(False))
            )
        )
        return result.scalar_one()

    async def mark_seen(self, receiver_id: UUID, sender_id: UUID) -> None:
        await self._db.execute(
            update(Message)
            .where(
                and_(
                    Message.receiver_id == receiver_id,
                    Message.sender_id == sender_id,
                    Message.seen.is_(False),
                )
            )
            .values(seen=True)
        )
        await self._db.flush()

    async def update_message(self, message_id: UUID, new_text: str) -> Message | None:
        await self._db.execute(
            update(Message)
            .where(Message.id == message_id)
            .values(message=new_text, edited=True)
        )
        await self._db.flush()
        return await self.get_by_id(message_id)

    async def soft_delete(self, message_id: UUID) -> None:
        await self._db.execute(
            update(Message).where(Message.id == message_id).values(deleted=True)
        )
        await self._db.flush()
