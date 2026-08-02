"""
K&P Love — FastAPI application entry point.

Run locally:
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Deployed on Railway:
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
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
    setup_logging()
    logger.info(f"🌹 {settings.APP_NAME} starting  env={settings.APP_ENV}")
    yield
    logger.info(f"🌹 {settings.APP_NAME} shutting down")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Private couples app — exclusively for Kashish & Preshna 💕",
    version="1.0.0",
    # Hide docs in production
    docs_url="/docs"  if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Railway env var: CORS_ORIGINS=*   → allows all origins (use during setup)
# Better:          CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
_origins = settings.cors_origins_list
_wildcard = "*" in _origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _wildcard else _origins,
    # Regex fallback catches any *.vercel.app preview deployments automatically
    allow_origin_regex=r"https://.*\.vercel\.app" if not _wildcard else None,
    # credentials=True cannot be combined with allow_origins=["*"]
    allow_credentials=not _wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(LoggingMiddleware)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Exception handlers ────────────────────────────────────────────────────────
register_exception_handlers(app)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(location.router)
app.include_router(memories.router)
app.include_router(notifications.router)
app.include_router(events.router)
app.include_router(playlist.router)
app.include_router(storage.router)
app.include_router(ws_router)


# ── Health / root ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}


@app.get("/", tags=["root"])
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME} API 💕"}
