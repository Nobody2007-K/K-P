"""
Love Notes API tests.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_note(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/notes",
        json={"title": "My love letter", "content": "You are my everything 💕", "favorite": True},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "My love letter"
    assert body["favorite"] is True


@pytest.mark.asyncio
async def test_list_notes(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/api/notes",
        json={"title": "Note 1", "content": "Content 1"},
        headers=auth_headers,
    )
    resp = await client.get("/api/notes", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_update_note(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/api/notes",
        json={"title": "Old title", "content": "Old content"},
        headers=auth_headers,
    )
    note_id = create.json()["id"]

    resp = await client.put(
        f"/api/notes/{note_id}",
        json={"title": "New title", "favorite": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "New title"


@pytest.mark.asyncio
async def test_delete_note(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/api/notes",
        json={"title": "To delete", "content": "Bye"},
        headers=auth_headers,
    )
    note_id = create.json()["id"]

    resp = await client.delete(f"/api/notes/{note_id}", headers=auth_headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_cannot_delete_others_note(
    client: AsyncClient, auth_headers: dict, auth_headers_preshna: dict
):
    create = await client.post(
        "/api/notes",
        json={"title": "Kashish's note", "content": "Private"},
        headers=auth_headers,
    )
    note_id = create.json()["id"]

    # Preshna tries to delete Kashish's note
    resp = await client.delete(f"/api/notes/{note_id}", headers=auth_headers_preshna)
    assert resp.status_code == 403
