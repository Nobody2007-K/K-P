"""
User ORM model — exactly two rows will ever exist.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'boyfriend' | 'girlfriend'
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    online: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_seen: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    sent_messages: Mapped[list["Message"]] = relationship(  # noqa: F821
        "Message", foreign_keys="[Message.sender_id]", back_populates="sender"
    )
    received_messages: Mapped[list["Message"]] = relationship(  # noqa: F821
        "Message", foreign_keys="[Message.receiver_id]", back_populates="receiver"
    )
    live_location: Mapped["LiveLocation | None"] = relationship(  # noqa: F821
        "LiveLocation", back_populates="user", uselist=False
    )
    memories: Mapped[list["Memory"]] = relationship(  # noqa: F821
        "Memory", back_populates="uploader"
    )
    love_notes: Mapped[list["LoveNote"]] = relationship(  # noqa: F821
        "LoveNote", back_populates="creator"
    )
    calendar_events: Mapped[list["CalendarEvent"]] = relationship(  # noqa: F821
        "CalendarEvent", back_populates="creator"
    )
    notifications: Mapped[list["Notification"]] = relationship(  # noqa: F821
        "Notification", back_populates="receiver"
    )
    playlists: Mapped[list["Playlist"]] = relationship(  # noqa: F821
        "Playlist", back_populates="creator"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r} role={self.role!r}>"
