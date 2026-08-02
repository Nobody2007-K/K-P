"""
Love Notes routes:
  GET    /api/notes
  POST   /api/notes
  PUT    /api/notes/{id}
  DELETE /api/notes/{id}
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.love_note_repository import LoveNoteRepository
from app.schemas.common import MessageResponse
from app.schemas.love_note import LoveNoteCreate, LoveNoteOut, LoveNoteUpdate

router = APIRouter(prefix="/api/notes", tags=["love-notes"])


@router.get("", response_model=list[LoveNoteOut])
async def list_notes(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[LoveNoteOut]:
    repo = LoveNoteRepository(db)
    items = await repo.get_all(limit, offset)
    return [LoveNoteOut.model_validate(n) for n in items]


@router.post("", response_model=LoveNoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    body: LoveNoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoveNoteOut:
    repo = LoveNoteRepository(db)
    note = await repo.create(current_user.id, body)
    return LoveNoteOut.model_validate(note)


@router.put("/{note_id}", response_model=LoveNoteOut)
async def update_note(
    note_id: UUID,
    body: LoveNoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoveNoteOut:
    repo = LoveNoteRepository(db)
    note = await repo.get_by_id(note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your note")
    updated = await repo.update(note, body)
    return LoveNoteOut.model_validate(updated)


@router.delete("/{note_id}", response_model=MessageResponse)
async def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    repo = LoveNoteRepository(db)
    note = await repo.get_by_id(note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your note")
    await repo.delete(note)
    return MessageResponse(message="Note deleted")
