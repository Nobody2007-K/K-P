/**
 * Shared API client — used by all backend calls.
 * Token is stored in localStorage under "kp-access-token".
 */

export const API_BASE = (
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? ""
)
  .replace(/\/$/, "") || "http://localhost:8000";

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
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

/** Same as apiFetch but WITHOUT the Content-Type header (needed for FormData). */
export async function apiFetchForm(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = localStorage.getItem("kp-access-token");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

// ── Memory types ──────────────────────────────────────────────────────────────
export interface MemoryOut {
  id: string;
  uploaded_by: string;
  image_url: string | null;
  video_url: string | null;
  caption: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

// ── Memory API calls ──────────────────────────────────────────────────────────
export async function fetchMemories(): Promise<MemoryOut[]> {
  const res = await apiFetch("/api/memories");
  if (!res.ok) throw new Error("Failed to fetch memories");
  return res.json() as Promise<MemoryOut[]>;
}

export async function createMemory(form: FormData): Promise<MemoryOut> {
  const res = await apiFetchForm("/api/memories", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create memory");
  }
  return res.json() as Promise<MemoryOut>;
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await apiFetch(`/api/memories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete memory");
}
