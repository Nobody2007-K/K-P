/**
 * Location utilities — Haversine distance, formatting, WebSocket client.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LocationState extends LatLng {
  updatedAt: string;   // ISO timestamp
  online: boolean;
}

export interface BothLocations {
  me: LocationState | null;
  partner: LocationState | null;
  distance: number | null;   // metres
}

// ── Haversine ────────────────────────────────────────────────────────────────
export function haversineMetres(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** "12 m away ❤️"  or  "1.2 km away ❤️" */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m away ❤️`;
  return `${(metres / 1000).toFixed(1)} km away ❤️`;
}

/** "🟢 Live Now"  or  "⚪ Last seen 5 min ago" */
export function formatOnlineStatus(updatedAt: string): string {
  const diff = (Date.now() - new Date(updatedAt).getTime()) / 1000;
  if (diff < 30) return "🟢 Live Now";
  if (diff < 60) return `⚪ ${Math.round(diff)}s ago`;
  if (diff < 3600) return `⚪ ${Math.round(diff / 60)} min ago`;
  return `⚪ ${Math.round(diff / 3600)}h ago`;
}

/** Is a timestamp within the last 30 seconds? */
export function isOnline(updatedAt: string): boolean {
  return (Date.now() - new Date(updatedAt).getTime()) / 1000 < 30;
}

// ── Mock in-memory location store (offline / demo mode) ──────────────────────
// Used when the backend isn't reachable. Simulates Kathmandu coordinates.
const MOCK_LOCATIONS: Record<string, LocationState> = {
  Kashish: {
    latitude:  27.7215,
    longitude: 85.3183,
    updatedAt: new Date().toISOString(),
    online: true,
  },
  Preshna: {
    latitude:  27.6784,
    longitude: 85.3095,
    updatedAt: new Date(Date.now() - 45_000).toISOString(),
    online: false,
  },
};

export function getMockLocation(username: string): LocationState | null {
  return MOCK_LOCATIONS[username] ?? null;
}

export function setMockLocation(username: string, lat: number, lng: number) {
  const now = new Date().toISOString();
  MOCK_LOCATIONS[username] = { latitude: lat, longitude: lng, updatedAt: now, online: true };
}

// ── Backend API calls ────────────────────────────────────────────────────────
const API_BASE = (import.meta.env["VITE_API_URL"] as string | undefined ?? "").replace(/\/$/, "") || "http://localhost:8000";

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("kp-access-token");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

export async function postLocationUpdate(lat: number, lng: number): Promise<boolean> {
  try {
    const res = await apiFetch("/api/location/update", {
      method: "POST",
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
    return res.ok;
  } catch {
    return false;   // backend not reachable — fall back to mock
  }
}

export async function fetchBothLocations(): Promise<BothLocations | null> {
  try {
    const res = await apiFetch("/api/location/both");
    if (!res.ok) return null;
    return (await res.json()) as BothLocations;
  } catch {
    return null;
  }
}

// ── WebSocket client ─────────────────────────────────────────────────────────
export type WsLocationMessage = {
  event: "location_update";
  user_id: string;
  data: { latitude: number; longitude: number; updated_at: string };
};

export function createLocationWs(
  token: string,
  onMessage: (msg: WsLocationMessage) => void,
): WebSocket | null {
  try {
    const wsBase = API_BASE.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/ws?token=${token}`);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as { event?: string };
        if (msg.event === "location_update") onMessage(msg as WsLocationMessage);
      } catch { /* ignore malformed frames */ }
    };
    return ws;
  } catch {
    return null;
  }
}
