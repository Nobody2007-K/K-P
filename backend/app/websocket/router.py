"""
WebSocket endpoint — authenticated persistent connection for real-time features.

Connect URL: ws://<host>/ws?token=<access_token>

Incoming client event types (JSON):
  { "event": "typing",       "typing": true/false }
  { "event": "read_receipt" }
  { "event": "ping" }
"""

from __future__ import annotations

import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.logging import logger
from app.core.security import decode_access_token
from app.database.session import AsyncSessionFactory
from app.repositories.user_repository import UserRepository
from app.websocket.manager import ws_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(
    ws: WebSocket,
    token: str = Query(..., description="Valid JWT access token"),
) -> None:
    """
    Authenticated WebSocket endpoint.

    The client must pass ?token=<access_token> as a query parameter
    (Browser WebSocket API does not support custom headers).
    """
    # ── Auth ──────────────────────────────────────────────────────────────
    payload = decode_access_token(token)
    if not payload:
        await ws.close(code=4001, reason="Invalid or expired token")
        return

    from uuid import UUID
    user_id = UUID(payload["sub"])

    async with AsyncSessionFactory() as db:
        repo = UserRepository(db)
        user = await repo.get_by_id(user_id)
        if not user:
            await ws.close(code=4001, reason="User not found")
            return
        partner = await repo.get_partner(user_id)
        await repo.set_online(user_id, online=True)
        await db.commit()

    partner_id = partner.id if partner else None

    # ── Handshake ─────────────────────────────────────────────────────────
    await ws_manager.connect(user_id, ws)

    try:
        while True:
            raw = await ws.receive_text()
            try:
                data: dict = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send_text(json.dumps({"error": "Invalid JSON"}))
                continue

            event = data.get("event", "")

            if event == "ping":
                await ws.send_text(json.dumps({"event": "pong"}))

            elif event == "typing":
                if partner_id:
                    await ws_manager.send_typing(
                        user_id, partner_id, typing=bool(data.get("typing", False))
                    )

            elif event == "read_receipt":
                if partner_id:
                    await ws_manager.send_read_receipt(user_id, partner_id)

            else:
                logger.debug(f"Unknown WS event from {user_id}: {event!r}")

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: {user_id}")
    except Exception as exc:
        logger.error(f"WebSocket error for {user_id}: {exc}")
    finally:
        ws_manager.disconnect(user_id)
        async with AsyncSessionFactory() as db:
            repo = UserRepository(db)
            await repo.set_online(user_id, online=False)
            await db.commit()
        await ws_manager.broadcast_status(user_id, online=False)
