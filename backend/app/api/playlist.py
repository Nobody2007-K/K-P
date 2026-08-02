"""
Playlist routes:
  GET    /api/playlist
  POST   /api/playlist
  DELETE /api/playlist/{id}
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.playlist_repository import PlaylistRepository
from app.schemas.common import MessageResponse
from app.schemas.playlist import PlaylistCreate, PlaylistOut

router = APIRouter(prefix="/api/playlist", tags=["playlist"])


@router.get("", response_model=list[PlaylistOut])
async def list_playlist(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PlaylistOut]:
    repo = PlaylistRepository(db)
    items = await repo.get_all(limit, offset)
    return [PlaylistOut.model_validate(t) for t in items]


@router.post("", response_model=PlaylistOut, status_code=status.HTTP_201_CREATED)
async def add_track(
    body: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlaylistOut:
    repo = PlaylistRepository(db)
    track = await repo.create(current_user.id, body)
    return PlaylistOut.model_validate(track)


@router.delete("/{track_id}", response_model=MessageResponse)
async def delete_track(
    track_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    repo = PlaylistRepository(db)
    track = await repo.get_by_id(track_id)
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")
    await repo.delete(track)
    return MessageResponse(message="Track removed from playlist")
