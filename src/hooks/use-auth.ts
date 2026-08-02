/**
 * useAuth — reactive auth state hook.
 * Reads/writes to the auth store and triggers re-renders on change.
 */

import { useCallback, useEffect, useState } from "react";
import { type AuthUser, attemptLogin, getStoredUser, logout as clearAuth } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "kp-auth-user") setUser(getStoredUser());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const result = await attemptLogin(username, password);
      if (result) setUser(result);
      return result !== null;
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return { user, login, logout, isLoggedIn: user !== null };
}
