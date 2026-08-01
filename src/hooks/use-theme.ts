import { useCallback, useEffect, useState } from "react";

const KEY = "kp-theme";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = useCallback((next: boolean) => {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(KEY, next ? "dark" : "light");
  }, []);

  return { dark, toggle };
}
