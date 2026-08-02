"""
Calendar Events API tests.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_event(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/events",
        json={
            "title": "Our Anniversary",
            "description": "2 years together! 🎉",
            "event_date": "2025-06-15T00:00:00Z",
            "reminder_enabled": True,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Our Anniversary"
    assert body["reminder_enabled"] is True


@pytest.mark.asyncio
async def test_list_events(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/events", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_update_event(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/api/events",
        json={"title": "Date night", "event_date": "2025-07-01T18:00:00Z"},
        headers=auth_headers,
    )
    event_id = create.json()["id"]

    resp = await client.put(
        f"/api/events/{event_id}",
        json={"title": "Romantic dinner 🍽️"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Romantic dinner 🍽️"


@pytest.mark.asyncio
async def test_delete_event(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/api/events",
        json={"title": "Remove me", "event_date": "2025-08-01T10:00:00Z"},
        headers=auth_headers,
    )
    event_id = create.json()["id"]
    resp = await client.delete(f"/api/events/{event_id}", headers=auth_headers)
    assert resp.status_code == 200
