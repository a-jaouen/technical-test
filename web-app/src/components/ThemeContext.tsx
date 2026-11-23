import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export enum Theme {
  Light = "light",
  Dark = "dark",
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(systemTheme);

  // Tailwind's `dark:` variant is driven by this class (see index.css)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === Theme.Dark);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === Theme.Light ? Theme.Dark : Theme.Light));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
