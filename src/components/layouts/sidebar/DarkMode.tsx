"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function DarkMode({ isExpanded }: { isExpanded: boolean }) {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="mb-2">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`
          cursor-pointer flex items-center rounded-xl border border-white/10 shadow bg-white/10 px-2 py-2 gap-2 transition
          hover:bg-gradient-to-tr hover:from-indigo-400/20 hover:to-purple-300/10
          ${isExpanded ? "w-full" : "justify-center w-11"}
        `}
        tabIndex={0}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span>
          {darkMode ? (
            <Moon className="w-5 h-5 text-blue-300" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-600 drop-shadow" />
          )}
        </span>
        {isExpanded ? (
          <span className="text-sm font-medium ml-2 select-none">
            {darkMode ? "Dark Mode" : "Light Mode"}
          </span>
        ) : null}
        <span
          className={`absolute left-0 right-0 mx-auto w-3 h-3 rounded-full pointer-events-none ${
            darkMode ? "bg-blue-400/30" : "bg-amber-200/30"
          } blur opacity-70 animate-pulse`}
        ></span>
      </button>
    </div>
  );
}
