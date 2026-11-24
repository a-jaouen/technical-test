import { IoIosMoon, IoIosSunny } from "react-icons/io";

import { Theme, useTheme } from "../hooks/useTheme";

/**
 * Title of the app and the light or dark mode switch
 */
export function Header() {
  const { theme, nextTheme, toggleTheme } = useTheme();

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
