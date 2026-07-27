import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "novairis-theme-mode";
const LEGACY_KEY = "novairis-theme";

function getSystemTheme() {
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  return prefersLight ? "light" : "dark";
}

function getInitialMode() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  const legacy = localStorage.getItem(LEGACY_KEY);

  if (legacy === "light" || legacy === "dark") {
    return legacy;
  }

  return "system";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    if (!window.matchMedia) return;

    const mql = window.matchMedia("(prefers-color-scheme: light)");

    const onChange = () => {
      setSystemTheme(mql.matches ? "light" : "dark");
    };

    mql.addEventListener?.("change", onChange);

    return () => {
      mql.removeEventListener?.("change", onChange);
    };
  }, []);

  const theme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.classList.toggle(
      "theme-light",
      theme === "light"
    );

    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem(STORAGE_KEY, mode);
    localStorage.removeItem(LEGACY_KEY);
  }, [theme, mode]);

  function toggleTheme() {
    setMode(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }

  return ctx;
}
