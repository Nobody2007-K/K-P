"""
StorageService — Supabase Storage upload / signed-URL generation.
"""

from __future__ import annotations

import uuid
from pathlib import PurePosixPath

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.core.logging import logger

try:
    from supabase import create_client, Client as SupabaseClient  # type: ignore
    _supabase: SupabaseClient = create_client(
        settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
    )
except Exception as exc:  # noqa: BLE001
    logger.warning(f"Supabase client init failed (storage disabled): {exc}")
    _supabase = None  # type: ignore


class StorageService:
    """Thin wrapper around Supabase Storage buckets."""

    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
    ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

    def __init__(self) -> None:
        self._client = _supabase

    def _ensure_client(self) -> None:
        if not self._client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Storage service not available",
            )

    async def upload_image(self, file: UploadFile, folder: str = "misc") -> str:
        """Upload an image and return the public URL."""
        self._ensure_client()
        if file.content_type not in self.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported image type: {file.content_type}",
            )
        return await self._upload(file, settings.STORAGE_BUCKET_MEMORIES, folder)

    async def upload_audio(self, file: UploadFile, folder: str = "voices") -> str:
        """Upload a voice note and return the public URL."""
        self._ensure_client()
        if file.content_type not in self.ALLOWED_AUDIO_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported audio type: {file.content_type}",
            )
        return await self._upload(file, settings.STORAGE_BUCKET_VOICES, folder)

    async def upload_avatar(self, file: UploadFile, username: str) -> str:
        """Upload a user avatar and return the public URL."""
        self._ensure_client()
        if file.content_type not in self.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Avatar must be an image",
            )
        return await self._upload(file, settings.STORAGE_BUCKET_AVATARS, username)

    async def _upload(self, file: UploadFile, bucket: str, folder: str) -> str:
        content = await file.read()
        if len(content) > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds 50 MB limit",
            )

        ext = PurePosixPath(file.filename or "file").suffix or ".bin"
        path = f"{folder}/{uuid.uuid4()}{ext}"

        try:
            self._client.storage.from_(bucket).upload(
                path,
                content,
                file_options={"content-type": file.content_type or "application/octet-stream"},
            )
            public_url: str = self._client.storage.from_(bucket).get_public_url(path)
            logger.info(f"Uploaded to {bucket}/{path}")
            return public_url
        except Exception as exc:
            logger.error(f"Storage upload failed: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="File upload failed",
            ) from exc
