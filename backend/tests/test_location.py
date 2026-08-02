"""
Location API tests — update, get own, get partner, get both + distance.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


LOCATION_PAYLOAD = {
    "latitude": 27.7172,
    "longitude": 85.3240,
    "accuracy": 10.0,
    "battery_level": 85,
}


@pytest.mark.asyncio
async def test_update_location(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/location/update", json=LOCATION_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["latitude"] == LOCATION_PAYLOAD["latitude"]
    assert body["longitude"] == LOCATION_PAYLOAD["longitude"]


@pytest.mark.asyncio
async def test_get_my_location(client: AsyncClient, auth_headers: dict):
    await client.post("/api/location/update", json=LOCATION_PAYLOAD, headers=auth_headers)
    resp = await client.get("/api/location/me", headers=auth_headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_both_locations(
    client: AsyncClient, auth_headers: dict, auth_headers_preshna: dict
):
    # Both users share location
    await client.post("/api/location/update", json=LOCATION_PAYLOAD, headers=auth_headers)
    await client.post(
        "/api/location/update",
        json={"latitude": 27.7200, "longitude": 85.3300},
        headers=auth_headers_preshna,
    )
    resp = await client.get("/api/location/both", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["me"] is not None
    assert body["partner"] is not None
    assert body["distance_meters"] is not None
    assert body["distance_meters"] >= 0


@pytest.mark.asyncio
async def test_invalid_coordinates(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/location/update",
        json={"latitude": 200.0, "longitude": 85.0},  # invalid lat
        headers=auth_headers,
    )
    assert resp.status_code == 422
