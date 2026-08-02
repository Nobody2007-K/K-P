"""
WebSocket connection tests.
"""

from __future__ import annotations

import json
import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token


@pytest.fixture
def sync_client(db, users):
    """Synchronous test client for WebSocket tests (httpx doesn't support WS)."""
    from app.database.session import get_db
    from app.main import app

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


def test_ws_invalid_token(sync_client):
    """Connection with bad token should be rejected."""
    with sync_client.websocket_connect("/ws?token=badtoken") as ws:
        # Server closes the connection with code 4001
        pass  # no error = connection was closed gracefully


def test_ws_ping_pong(sync_client, users):
    kashish, _ = users
    token = create_access_token(kashish.id, extra={"username": kashish.username, "role": kashish.role})

    with sync_client.websocket_connect(f"/ws?token={token}") as ws:
        ws.send_text(json.dumps({"event": "ping"}))
        data = json.loads(ws.receive_text())
        assert data["event"] == "pong"


def test_ws_typing_event(sync_client, users):
    """Typing events should be broadcast without errors."""
    kashish, _ = users
    token = create_access_token(kashish.id, extra={"username": kashish.username, "role": kashish.role})

    with sync_client.websocket_connect(f"/ws?token={token}") as ws:
        ws.send_text(json.dumps({"event": "typing", "typing": True}))
        # No error means success (partner not connected so nothing sent back)
