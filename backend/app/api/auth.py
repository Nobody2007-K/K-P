"""
Auth routes:
  POST /api/auth/login
  POST /api/auth/refresh
  POST /api/auth/logout
  GET  /api/auth/me
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    TokenResponse,
)
from app.schemas.common import MessageResponse
from app.schemas.user import UserMe
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate with username + password.
    Returns access token, refresh token, and user info.
    No sign-up or registration — only the two predefined users can log in.
    """
    service = AuthService(db)
    return await service.login(body)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> AccessTokenResponse:
    """
    Exchange a valid refresh token for a new access token.
    Enables automatic login / session persistence.
    """
    service = AuthService(db)
    return await service.refresh(body.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    body: LogoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Mark user offline and invalidate session state."""
    service = AuthService(db)
    await service.logout(current_user.id)
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserMe)
async def get_me(current_user: User = Depends(get_current_user)) -> UserMe:
    """Return the authenticated user's profile."""
    return UserMe.model_validate(current_user)
