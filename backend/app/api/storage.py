"""
Storage routes — direct file upload endpoints.
  POST /api/storage/avatar    — upload profile photo
  POST /api/storage/voice     — upload voice note
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserMe
from app.services.storage_service import StorageService

router = APIRouter(prefix="/api/storage", tags=["storage"])


@router.post("/avatar", response_model=UserMe)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserMe:
    """Upload a new profile avatar. Returns updated user profile."""
    storage = StorageService()
    url = await storage.upload_avatar(file, current_user.username)

    repo = UserRepository(db)
    updated = await repo.update_avatar(current_user.id, url)
    return UserMe.model_validate(updated)


@router.post("/voice", response_model=dict)
async def upload_voice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Upload a voice note. Returns the public URL."""
    storage = StorageService()
    url = await storage.upload_audio(file)
    return {"voice_url": url}
