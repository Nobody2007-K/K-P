"""
MemoryRepository — CRUD for Memory model.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.memory import Memory
from app.schemas.memory import MemoryCreate, MemoryUpdate


class MemoryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, uploaded_by: UUID, data: MemoryCreate) -> Memory:
        memory = Memory(uploaded_by=uploaded_by, **data.model_dump())
        self._db.add(memory)
        await self._db.flush()
        await self._db.refresh(memory)
        return memory

    async def get_by_id(self, memory_id: UUID) -> Memory | None:
        result = await self._db.execute(select(Memory).where(Memory.id == memory_id))
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 50, offset: int = 0) -> list[Memory]:
        result = await self._db.execute(
            select(Memory).order_by(Memory.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def update(self, memory: Memory, data: MemoryUpdate) -> Memory:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(memory, field, value)
        await self._db.flush()
        await self._db.refresh(memory)
        return memory

    async def delete(self, memory: Memory) -> None:
        await self._db.delete(memory)
        await self._db.flush()
