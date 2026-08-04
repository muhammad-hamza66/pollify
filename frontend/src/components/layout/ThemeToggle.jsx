import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-xl text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#64748b] dark:hover:text-gray-300 transition-all duration-200 ${className || ""}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300" />
      )}
    </button>
  );
}
