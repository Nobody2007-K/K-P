/**
 * Auth store — holds the logged-in user in memory + localStorage.
 * Only two valid users exist. No backend needed for the frontend demo.
 */

import { HIM, HER } from "@/lib/kp-data";

export type AuthUser = typeof HIM | typeof HER;

/** The two valid credential pairs — exactly these, nothing else. */
const CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  Kashish: { password: "Preshna", user: HIM },
  Preshna: { password: "Kashish", user: HER },
};

const STORAGE_KEY = "kp-auth-user";

/** Attempt login. Returns the user on success, null on failure. */
export function attemptLogin(username: string, password: string): AuthUser | null {
  const entry = CREDENTIALS[username];
  if (!entry) return null;
  // Exact case-sensitive match
  if (entry.password !== password) return null;
  persistUser(entry.user);
  return entry.user;
}

/** Save user to localStorage so refresh keeps them logged in. */
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
    // Re-resolve from the source objects so avatar imports are fresh
    if (parsed.short === "Kashish") return HIM;
    if (parsed.short === "Preshna") return HER;
    return null;
  } catch {
    return null;
  }
}

/** Clear session. */
export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
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
