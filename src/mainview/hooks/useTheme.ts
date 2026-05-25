// src/views/admin/hooks/useTheme.ts
import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read from localStorage or default to system
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      return stored || "system";
    }
    return "system";
  });

  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: "dark" | "light") => {
      root.classList.toggle("dark", t === "dark");
      setResolved(t);
    };

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(media.matches ? "dark" : "light");

      const listener = (e: MediaQueryListEvent) =>
        applyTheme(e.matches ? "dark" : "light");
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "system";
      return "dark";
    });
  }, []);

  return { theme, resolved, setTheme, toggleTheme };
}
