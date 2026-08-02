"""
Import all models here so Alembic can detect them via Base.metadata.
"""

from app.models.user import User
from app.models.message import Message
from app.models.location import LiveLocation
from app.models.memory import Memory
from app.models.love_note import LoveNote
from app.models.calendar_event import CalendarEvent
from app.models.notification import Notification
from app.models.playlist import Playlist

__all__ = [
    "User",
    "Message",
    "LiveLocation",
    "Memory",
    "LoveNote",
    "CalendarEvent",
    "Notification",
    "Playlist",
]
