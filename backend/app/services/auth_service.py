"""
AuthService — login, token refresh, logout business logic.
"""

from __future__ import annotations

from fastapi import HTTPException, status

from app.core.logging import logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    verify_password,
)
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AccessTokenResponse, LoginRequest, TokenResponse
from app.schemas.user import UserPublic
from sqlalchemy.ext.asyncio import AsyncSession


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    async def login(self, request: LoginRequest) -> TokenResponse:
        user = await self._repo.get_by_username(request.username)

        if not user or not verify_password(request.password, user.password_hash):
            logger.warning(f"Failed login attempt for username={request.username!r}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        await self._repo.set_online(user.id, online=True)
        logger.info(f"Login successful for {user.username!r} ({user.role})")

        access_token = create_access_token(
            user.id,
            extra={"username": user.username, "role": user.role},
        )
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserPublic.model_validate(user),
        )

    async def refresh(self, refresh_token: str) -> AccessTokenResponse:
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        from uuid import UUID
        user_id = UUID(payload["sub"])
        user = await self._repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        new_access = create_access_token(
            user.id,
            extra={"username": user.username, "role": user.role},
        )
        return AccessTokenResponse(access_token=new_access)

    async def logout(self, user_id) -> None:
        await self._repo.set_online(user_id, online=False)
        logger.info(f"User {user_id} logged out")
