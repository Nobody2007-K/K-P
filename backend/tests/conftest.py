"""
Pytest fixtures — shared test infrastructure.
Uses an in-memory SQLite async database so no Supabase connection is required.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import create_access_token, hash_password
from app.database.base import Base
from app.database.session import get_db
from app.models.user import User

# ── In-memory async SQLite engine ─────────────────────────────────────────────
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionFactory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def setup_db():
    """Create all tables once for the test session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db(setup_db) -> AsyncGenerator[AsyncSession, None]:
    """Provide a test DB session that rolls back after each test."""
    async with test_engine.connect() as conn:
        await conn.begin_nested()
        session = AsyncSession(bind=conn, expire_on_commit=False)
        try:
            yield session
        finally:
            await session.close()
            await conn.rollback()


@pytest_asyncio.fixture
async def users(db: AsyncSession):
    """Insert the two predefined users and return them."""
    now = datetime.now(tz=timezone.utc)

    kashish = User(
        id=uuid.uuid4(),
        username="Kashish",
        display_name="Kashish Shrestha",
        role="boyfriend",
        password_hash=hash_password("Preshna"),
        online=False,
        created_at=now,
        updated_at=now,
    )
    preshna = User(
        id=uuid.uuid4(),
        username="Preshna",
        display_name="Preshna GC",
        role="girlfriend",
        password_hash=hash_password("Kashish"),
        online=False,
        created_at=now,
        updated_at=now,
    )
    db.add(kashish)
    db.add(preshna)
    await db.flush()
    return kashish, preshna


def _build_app(db_session: AsyncSession) -> FastAPI:
    """Build the app with the test DB session injected."""
    from app.main import app as real_app

    async def override_get_db():
        yield db_session

    real_app.dependency_overrides[get_db] = override_get_db
    return real_app


@pytest_asyncio.fixture
async def client(db: AsyncSession, users) -> AsyncGenerator[AsyncClient, None]:
    """Authenticated HTTP client (logged in as Kashish)."""
    kashish, _ = users
    app = _build_app(db)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_headers(users) -> dict:
    """Bearer headers for Kashish."""
    kashish, _ = users
    token = create_access_token(
        kashish.id, extra={"username": kashish.username, "role": kashish.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers_preshna(users) -> dict:
    """Bearer headers for Preshna."""
    _, preshna = users
    token = create_access_token(
        preshna.id, extra={"username": preshna.username, "role": preshna.role}
    )
    return {"Authorization": f"Bearer {token}"}
