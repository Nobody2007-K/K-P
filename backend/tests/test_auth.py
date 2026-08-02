"""
Authentication tests — login, refresh, logout, /me endpoint.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_success_kashish(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "Kashish", "password": "Preshna"})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["user"]["username"] == "Kashish"
    assert body["user"]["role"] == "boyfriend"


@pytest.mark.asyncio
async def test_login_success_preshna(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "Preshna", "password": "Kashish"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["username"] == "Preshna"
    assert body["user"]["role"] == "girlfriend"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "Kashish", "password": "wrongpassword"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_user(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={"username": "Unknown", "password": "test"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["username"] == "Kashish"
    # password_hash must never appear in response
    assert "password_hash" not in body


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/auth/me")
    assert resp.status_code == 403  # no bearer token


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    login = await client.post("/api/auth/login", json={"username": "Kashish", "password": "Preshna"})
    refresh_token = login.json()["refresh_token"]

    resp = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_refresh_invalid_token(client: AsyncClient):
    resp = await client.post("/api/auth/refresh", json={"refresh_token": "invalid.token.here"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/auth/logout", headers=auth_headers, json={})
    assert resp.status_code == 200
    assert resp.json()["message"] == "Logged out successfully"
