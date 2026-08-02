"""
UserRepository — all DB operations for the User model.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self._db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self._db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[User]:
        result = await self._db.execute(select(User))
        return list(result.scalars().all())

    async def get_partner(self, user_id: UUID) -> User | None:
        """Return the other user (there are only two)."""
        result = await self._db.execute(
            select(User).where(User.id != user_id)
        )
        return result.scalar_one_or_none()

    async def set_online(self, user_id: UUID, *, online: bool) -> None:
        from datetime import datetime, timezone

        values: dict = {"online": online}
        if not online:
            values["last_seen"] = datetime.now(tz=timezone.utc)

        await self._db.execute(
            update(User).where(User.id == user_id).values(**values)
        )
        await self._db.flush()

    async def update_avatar(self, user_id: UUID, url: str) -> User | None:
        await self._db.execute(
            update(User).where(User.id == user_id).values(avatar_url=url)
        )
        await self._db.flush()
        return await self.get_by_id(user_id)
