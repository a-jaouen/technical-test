import { IoIosMoon, IoIosSunny } from "react-icons/io";

import { Theme, useTheme } from "./ThemeContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === Theme.Light ? Theme.Dark : Theme.Light;

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <h1 className="text-2xl font-semibold">PokeBattle</h1>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${nextTheme} mode`}
        className="rounded-md border p-2 text-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {theme === Theme.Light ? <IoIosMoon /> : <IoIosSunny />}
      </button>
    </header>
  );
}
