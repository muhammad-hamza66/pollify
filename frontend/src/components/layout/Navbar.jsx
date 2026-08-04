import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  Settings,
  User as UserIcon,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import Avatar from "../ui/Avatar";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

export default function Navbar({ onMenuClick }) {
  const { user, status, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#e2e8f0] dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg">
      <div className="h-full flex items-center gap-4 px-4 lg:px-6 max-w-[1360px] mx-auto">
        <button
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-[#64748b]" />
        </button>

        <Link
          to={status === "authed" ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-lg shrink-0 text-[#0f172a] dark:text-white"
        >
          <div className="flex items-end gap-[3px] h-6 w-6">
            <div className="w-[5px] h-[10px] bg-primary-400 rounded-t-[1.5px]" />
            <div className="w-[5px] h-[16px] bg-primary-500 rounded-t-[1.5px]" />
            <div className="w-[5px] h-[22px] bg-primary-600 rounded-t-[1.5px]" />
          </div>
          <span className="hidden sm:inline">Pollify</span>
        </Link>

        {status === "authed" && (
          <form onSubmit={submitSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search polls, people, categories…"
                className="input pl-9 py-2 bg-[#f8fafc] dark:bg-gray-800/60 border-transparent hover:border-[#e2e8f0] dark:hover:border-gray-700 focus:bg-white dark:focus:bg-surface-dark-elevated"
              />
            </div>
          </form>
        )}

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {status === "authed" ? (
            <>
              <NotificationBell />
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Profile menu"
                >
                  <Avatar src={user?.avatar} name={user?.name} size="sm" />
                  <ChevronDown className="h-3 w-3 text-[#94a3b8] hidden sm:block" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark-elevated border border-[#e2e8f0] dark:border-gray-800 rounded-xl shadow-dropdown p-1.5 z-20 animate-scale-in">
                    <div className="px-3 py-2.5">
                      <p className="font-semibold text-sm text-[#0f172a] dark:text-gray-100">
                        {user?.name}
                      </p>
                      <p className="text-xs text-[#94a3b8]">
                        @{user?.username}
                      </p>
                    </div>
                    <div className="h-px bg-[#e2e8f0] dark:bg-gray-800 my-1" />
                    <Link
                      to={`/u/${user?.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0f172a] dark:text-gray-200 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-[#94a3b8]" /> Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0f172a] dark:text-gray-200 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-[#94a3b8]" /> Settings
                    </Link>
                    <div className="h-px bg-[#e2e8f0] dark:bg-gray-800 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn px-3 py-2 text-sm font-medium text-[#64748b] dark:text-gray-300 hover:text-[#0f172a] dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 text-sm shadow-sm shadow-primary-600/20"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
