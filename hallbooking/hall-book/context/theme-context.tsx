import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { Appearance } from "react-native";

export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  accent: string;
  accentText: string;
  placeholder: string;
  modalBackground: string;
};

const lightColors: ThemeColors = {
  background: "#f5f7fa",
  card: "#fff",
  text: "#1a237e",
  subText: "#666",
  border: "#ddd",
  accent: "#5e35b1",
  accentText: "#fff",
  placeholder: "#999",
  modalBackground: "rgba(0,0,0,0.5)",
};

const darkColors: ThemeColors = {
  background: "#0b1120",
  card: "#1f2937",
  text: "#f3f4f6",
  subText: "#d1d5db",
  border: "#374151",
  accent: "#8b5cf6",
  accentText: "#fff",
  placeholder: "#9ca3af",
  modalBackground: "rgba(0, 0, 0, 0.65)",
};

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(
    (Appearance.getColorScheme() as ThemeMode) ?? "light"
  );

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: mode === "dark" ? darkColors : lightColors,
      toggleMode,
    }),
    [mode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
