"""
WebSocket Connection Manager.

Manages the two WebSocket connections (one per user) and broadcasts
real-time events: messages, typing, read-receipts, online status,
and live GPS locations.
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger


class ConnectionManager:
    """Singleton-style manager for the two WebSocket connections."""

    def __init__(self) -> None:
        # Maps user_id (str) -> WebSocket
        self._connections: dict[str, WebSocket] = {}

    # ── Connection lifecycle ──────────────────────────────────────────────

    async def connect(self, user_id: UUID, ws: WebSocket) -> None:
        await ws.accept()
        key = str(user_id)
        # Close previous connection for this user if any
        if key in self._connections:
            try:
                await self._connections[key].close()
            except Exception:
                pass
        self._connections[key] = ws
        logger.info(f"WebSocket connected: user={key}  total={len(self._connections)}")
        await self.broadcast_status(user_id, online=True)

    def disconnect(self, user_id: UUID) -> None:
        key = str(user_id)
        self._connections.pop(key, None)
        logger.info(f"WebSocket disconnected: user={key}  total={len(self._connections)}")

    def is_connected(self, user_id: UUID) -> bool:
        return str(user_id) in self._connections

    # ── Low-level send helpers ────────────────────────────────────────────

    async def send_to(self, user_id: UUID, payload: dict[str, Any]) -> bool:
        """Send *payload* to a specific user. Returns True if delivered."""
        ws = self._connections.get(str(user_id))
        if not ws:
            return False
        try:
            await ws.send_text(json.dumps(payload, default=str))
            return True
        except Exception as exc:
            logger.warning(f"Failed to send to {user_id}: {exc}")
            self.disconnect(user_id)
            return False

    async def broadcast(self, payload: dict[str, Any]) -> None:
        """Send *payload* to ALL connected users."""
        for uid_str in list(self._connections.keys()):
            await self.send_to(UUID(uid_str), payload)

    # ── Domain events ─────────────────────────────────────────────────────

    async def broadcast_status(self, user_id: UUID, *, online: bool) -> None:
        await self.broadcast({
            "event": "user_status",
            "user_id": str(user_id),
            "online": online,
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        })

    async def send_message(
        self, sender_id: UUID, receiver_id: UUID, message_data: dict[str, Any]
    ) -> None:
        payload = {
            "event": "new_message",
            "data": message_data,
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        }
        # Deliver to receiver (and echo back to sender for multi-device sync)
        await self.send_to(receiver_id, payload)
        await self.send_to(sender_id, payload)

    async def send_typing(self, sender_id: UUID, receiver_id: UUID, *, typing: bool) -> None:
        await self.send_to(receiver_id, {
            "event": "typing",
            "user_id": str(sender_id),
            "typing": typing,
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        })

    async def send_read_receipt(self, reader_id: UUID, partner_id: UUID) -> None:
        await self.send_to(partner_id, {
            "event": "read_receipt",
            "reader_id": str(reader_id),
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        })

    async def send_location(self, user_id: UUID, partner_id: UUID, location_data: dict) -> None:
        await self.send_to(partner_id, {
            "event": "location_update",
            "user_id": str(user_id),
            "data": location_data,
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        })


# Global singleton instance
ws_manager = ConnectionManager()
