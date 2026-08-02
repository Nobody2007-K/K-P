"""
Memories routes:
  GET    /api/memories
  POST   /api/memories
  PUT    /api/memories/{id}
  DELETE /api/memories/{id}
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.memory_repository import MemoryRepository
from app.schemas.common import MessageResponse
from app.schemas.memory import MemoryCreate, MemoryOut, MemoryUpdate
from app.services.storage_service import StorageService

router = APIRouter(prefix="/api/memories", tags=["memories"])


@router.get("", response_model=list[MemoryOut])
async def list_memories(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MemoryOut]:
    repo = MemoryRepository(db)
    items = await repo.get_all(limit, offset)
    return [MemoryOut.model_validate(m) for m in items]


@router.post("", response_model=MemoryOut, status_code=status.HTTP_201_CREATED)
async def create_memory(
    caption: str | None = Form(None),
    location_name: str | None = Form(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    image: UploadFile | None = File(None),
    video: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MemoryOut:
    """Upload a memory with optional image/video file."""
    storage = StorageService()
    image_url: str | None = None
    video_url: str | None = None

    if image:
        image_url = await storage.upload_image(image, folder="memories")
    if video:
        # Reuse image upload but with video bucket path
        video_url = await storage._upload(video, "memories", "videos")

    repo = MemoryRepository(db)
    data = MemoryCreate(
        image_url=image_url,
        video_url=video_url,
        caption=caption,
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
    )
    memory = await repo.create(current_user.id, data)
    return MemoryOut.model_validate(memory)


@router.put("/{memory_id}", response_model=MemoryOut)
async def update_memory(
    memory_id: UUID,
    body: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MemoryOut:
    repo = MemoryRepository(db)
    memory = await repo.get_by_id(memory_id)
    if not memory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    if memory.uploaded_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your memory")
    updated = await repo.update(memory, body)
    return MemoryOut.model_validate(updated)


@router.delete("/{memory_id}", response_model=MessageResponse)
async def delete_memory(
    memory_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    repo = MemoryRepository(db)
    memory = await repo.get_by_id(memory_id)
    if not memory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    if memory.uploaded_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your memory")
    await repo.delete(memory)
    return MessageResponse(message="Memory deleted")
