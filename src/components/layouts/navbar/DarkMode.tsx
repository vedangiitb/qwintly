"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function DarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`
          cursor-pointer
flex items-center justify-center
   h-9 rounded-lg 
     hover:bg-muted
    transition-all duration-200 w-full gap-2 px-2        `}
        tabIndex={0}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span>
          {darkMode ? (
            <Moon className="w-4 h-4 text-blue-300" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-600 drop-shadow" />
          )}
        </span>
        <span
          className={`absolute left-0 right-0 mx-auto w-3 h-3 rounded-full pointer-events-none ${
            darkMode ? "bg-blue-400/30" : "bg-amber-200/30"
          } blur opacity-70 animate-pulse`}
        ></span>
      </button>
    </div>
  );
}
