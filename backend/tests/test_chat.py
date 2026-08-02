"""
Chat API tests — send, list, edit, delete messages; unread count.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_send_message(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/chat/send",
        json={"message": "Hello my love 💕", "message_type": "text"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["message"] == "Hello my love 💕"
    assert body["message_type"] == "text"
    assert body["deleted"] is False


@pytest.mark.asyncio
async def test_list_messages(client: AsyncClient, auth_headers: dict):
    # Send a message first
    await client.post(
        "/api/chat/send",
        json={"message": "Test msg", "message_type": "text"},
        headers=auth_headers,
    )
    resp = await client.get("/api/chat/messages", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_edit_message(client: AsyncClient, auth_headers: dict):
    send = await client.post(
        "/api/chat/send",
        json={"message": "Original", "message_type": "text"},
        headers=auth_headers,
    )
    msg_id = send.json()["id"]

    resp = await client.put(
        f"/api/chat/{msg_id}",
        json={"message": "Edited ✏️"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Edited ✏️"
    assert resp.json()["edited"] is True


@pytest.mark.asyncio
async def test_delete_message(client: AsyncClient, auth_headers: dict):
    send = await client.post(
        "/api/chat/send",
        json={"message": "Delete me", "message_type": "text"},
        headers=auth_headers,
    )
    msg_id = send.json()["id"]

    resp = await client.delete(f"/api/chat/{msg_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert "deleted" in resp.json()["message"].lower()


@pytest.mark.asyncio
async def test_cannot_edit_others_message(
    client: AsyncClient, auth_headers: dict, auth_headers_preshna: dict
):
    send = await client.post(
        "/api/chat/send",
        json={"message": "Kashish's msg", "message_type": "text"},
        headers=auth_headers,
    )
    msg_id = send.json()["id"]

    # Preshna tries to edit Kashish's message
    resp = await client.put(
        f"/api/chat/{msg_id}",
        json={"message": "Hacked!"},
        headers=auth_headers_preshna,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_unread_count(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/chat/unread", headers=auth_headers)
    assert resp.status_code == 200
    assert "unread_count" in resp.json()
