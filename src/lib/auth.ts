/**
 * Auth store — holds the logged-in user in memory + localStorage.
 * Login calls the backend and stores the JWT access token.
 */

import { HIM, HER } from "@/lib/kp-data";
import { API_BASE } from "@/lib/api";

export type AuthUser = typeof HIM | typeof HER;

const STORAGE_KEY = "kp-auth-user";
const TOKEN_KEY = "kp-access-token";

/** Map backend username → frontend user object. */
function resolveUser(username: string): AuthUser | null {
  if (username.toLowerCase() === "kashish") return HIM;
  if (username.toLowerCase() === "preshna") return HER;
  return null;
}

/**
 * Attempt login against the real backend.
 * Stores the JWT in localStorage on success.
 * Returns the user on success, null on failure.
 */
export async function attemptLogin(
  username: string,
  password: string,
): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      token_type?: string;
    };

    if (!data.access_token) return null;

    // Store JWT so every subsequent API call is authenticated
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("kp-refresh-token", data.refresh_token);
    }

    const user = resolveUser(username);
    if (user) persistUser(user);
    return user;
  } catch {
    // Backend unreachable — fail closed
    return null;
  }
}

/** Save user profile to localStorage so refresh keeps them logged in. */
function persistUser(user: AuthUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch { /* storage blocked */ }
}

/** Read user from localStorage (page refresh). */
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { short?: string };
    if (parsed.short === "Kashish") return HIM;
    if (parsed.short === "Preshna") return HER;
    return null;
  } catch {
    return null;
  }
}

/** Clear session — removes both the user profile and the JWT. */
export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("kp-refresh-token");
  } catch { /* storage blocked */ }
}

/** Is the logged-in user the boyfriend (Kashish)? */
export function isBoyfriend(user: AuthUser | null): boolean {
  return user?.role === "Boyfriend";
}

/** Is the logged-in user the girlfriend (Preshna)? */
export function isGirlfriend(user: AuthUser | null): boolean {
  return user?.role === "Girlfriend";
}

