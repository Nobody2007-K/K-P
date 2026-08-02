"""
Database Seed Script — creates the two predefined users for K&P Love.

Run from the backend/ directory:
  python -m scripts.seed

Passwords are hashed with Argon2 — never stored in plaintext.
"""

from __future__ import annotations

import asyncio
import sys
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

# Must be imported after load_dotenv so settings picks up .env
from app.core.security import hash_password  # noqa: E402
from app.database.session import AsyncSessionFactory  # noqa: E402
from app.models.user import User  # noqa: E402
from app.core.logging import setup_logging, logger  # noqa: E402

# ── Predefined users ──────────────────────────────────────────────────────────
USERS = [
    {
        "username": "Kashish",
        "display_name": "Kashish Shrestha",
        "role": "boyfriend",
        "password": "Preshna",   # hashed below — never stored as plaintext
    },
    {
        "username": "Preshna",
        "display_name": "Preshna GC",
        "role": "girlfriend",
        "password": "Kashish",   # hashed below — never stored as plaintext
    },
]


async def seed() -> None:
    setup_logging()
    logger.info("Starting database seed...")

    async with AsyncSessionFactory() as db:
        from sqlalchemy import select

        for user_data in USERS:
            existing = await db.execute(
                select(User).where(User.username == user_data["username"])
            )
            if existing.scalar_one_or_none():
                logger.info(f"User '{user_data['username']}' already exists — skipping")
                continue

            now = datetime.now(tz=timezone.utc)
            user = User(
                id=uuid.uuid4(),
                username=user_data["username"],
                display_name=user_data["display_name"],
                role=user_data["role"],
                password_hash=hash_password(user_data["password"]),
                online=False,
                created_at=now,
                updated_at=now,
            )
            db.add(user)
            logger.info(f"Creating user: {user_data['display_name']} ({user_data['role']})")

        await db.commit()

    logger.info("✅ Seed completed successfully — Kashish & Preshna are ready 💕")


if __name__ == "__main__":
    asyncio.run(seed())
