"""
NotificationService — create in-app notifications and optionally push via FCM.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationOut


class NotificationService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = NotificationRepository(db)

    async def create(self, receiver_id: UUID, title: str, message: str) -> NotificationOut:
        data = NotificationCreate(receiver_id=receiver_id, title=title, message=message)
        notif = await self._repo.create(data)
        logger.debug(f"Notification created for {receiver_id}: {title!r}")

        # Fire-and-forget FCM push — best-effort, never blocks the request
        await self._push_fcm(receiver_id, title, message)

        return NotificationOut.model_validate(notif)

    async def get_for_user(self, user_id: UUID) -> list[NotificationOut]:
        items = await self._repo.get_for_user(user_id)
        return [NotificationOut.model_validate(n) for n in items]

    async def mark_all_read(self, user_id: UUID) -> None:
        await self._repo.mark_all_read(user_id)

    async def _push_fcm(self, receiver_id: UUID, title: str, body: str) -> None:
        """Send a Firebase Cloud Messaging push notification (best-effort)."""
        try:
            import firebase_admin  # type: ignore
            from firebase_admin import messaging  # type: ignore

            if not firebase_admin._apps:
                cred = firebase_admin.credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)

            # In a real app you'd look up the device FCM token from the DB.
            # Here we log it since token storage is UI-side.
            logger.debug(f"FCM push would be sent to {receiver_id}: {title!r}")
        except Exception as exc:
            logger.warning(f"FCM push skipped: {exc}")
