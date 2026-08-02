"""
K&P Love — FastAPI application entry point.

Run with:
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api import auth, chat, events, location, memories, notifications, playlist, storage
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.middleware.logging_middleware import LoggingMiddleware
from app.utils.errors import register_exception_handlers
from app.websocket.router import router as ws_router


# ── Rate limiter ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup / shutdown lifecycle."""
    setup_logging()
    logger.info(f"🌹 {settings.APP_NAME} backend starting ({settings.APP_ENV})")
    yield
    logger.info(f"🌹 {settings.APP_NAME} backend shutting down")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Private couples application — exclusively for Kashish & Preshna 💕",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Exception handlers ────────────────────────────────────────────────────────
register_exception_handlers(app)

# ── API routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(location.router)
app.include_router(memories.router)
app.include_router(notifications.router)
app.include_router(events.router)
app.include_router(playlist.router)
app.include_router(storage.router)
app.include_router(ws_router)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
    }


@app.get("/", tags=["root"])
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME} API 💕"}
