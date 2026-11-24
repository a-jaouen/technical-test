import { useEffect, useState } from "react";

export enum Theme {
  Light = "light",
  Dark = "dark",
}

interface ThemeSwitch {
  theme: Theme;
  nextTheme: Theme;
  toggleTheme: () => void;
}

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light;

/**
 * Hold the light or dark theme, starting from the system one, and apply it to the page
 */
export function useTheme(): ThemeSwitch {
  const [theme, setTheme] = useState<Theme>(systemTheme);
  const nextTheme = theme === Theme.Light ? Theme.Dark : Theme.Light;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === Theme.Dark);
  }, [theme]);

  return { theme, nextTheme, toggleTheme: () => setTheme(nextTheme) };
}
