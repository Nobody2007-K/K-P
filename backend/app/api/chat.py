"""
Chat routes:
  GET    /api/chat/messages
  POST   /api/chat/send
  PUT    /api/chat/{id}
  DELETE /api/chat/{id}
  GET    /api/chat/unread
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.message_repository import MessageRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import MessageResponse
from app.schemas.message import MessageCreate, MessageOut, MessageUpdate
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/messages", response_model=list[MessageOut])
async def get_messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageOut]:
    """Retrieve paginated conversation history."""
    user_repo = UserRepository(db)
    partner = await user_repo.get_partner(current_user.id)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")

    msg_repo = MessageRepository(db)
    messages = await msg_repo.get_conversation(current_user.id, partner.id, limit, offset)

    # Mark as delivered
    await msg_repo.mark_seen(current_user.id, partner.id)

    return [MessageOut.model_validate(m) for m in reversed(messages)]


@router.post("/send", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageOut:
    """Send a new message to your partner."""
    user_repo = UserRepository(db)
    partner = await user_repo.get_partner(current_user.id)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")

    msg_repo = MessageRepository(db)
    msg = await msg_repo.create(
        sender_id=current_user.id,
        receiver_id=partner.id,
        **body.model_dump(),
    )
    out = MessageOut.model_validate(msg)

    # Real-time delivery via WebSocket
    await ws_manager.send_message(current_user.id, partner.id, out.model_dump())

    return out


@router.put("/{message_id}", response_model=MessageOut)
async def edit_message(
    message_id: UUID,
    body: MessageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageOut:
    """Edit an existing message (only your own messages)."""
    repo = MessageRepository(db)
    msg = await repo.get_by_id(message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit others' messages")

    updated = await repo.update_message(message_id, body.message)
    return MessageOut.model_validate(updated)


@router.delete("/{message_id}", response_model=MessageResponse)
async def delete_message(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Soft-delete a message (only your own messages)."""
    repo = MessageRepository(db)
    msg = await repo.get_by_id(message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete others' messages")

    await repo.soft_delete(message_id)
    return MessageResponse(message="Message deleted")


@router.get("/unread", response_model=dict)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return the number of unread messages for the current user."""
    repo = MessageRepository(db)
    count = await repo.count_unread(current_user.id)
    return {"unread_count": count}
