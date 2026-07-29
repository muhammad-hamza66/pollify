import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Vote, LogOut, Settings, User as UserIcon, Menu } from "lucide-react";
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
    <header className="sticky top-0 z-30 h-16 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur">
      <div className="h-full flex items-center gap-4 px-4 lg:px-6">
        <button className="lg:hidden p-2 -ml-2" onClick={onMenuClick} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link to={status === "authed" ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Vote className="h-4 w-4 text-white" />
          </span>
          <span className="hidden sm:inline">Pollify</span>
        </Link>

        {status === "authed" && (
          <form onSubmit={submitSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search polls, people, categories..."
                className="input pl-9 bg-gray-50 dark:bg-gray-800/60 border-transparent"
              />
            </div>
          </form>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {status === "authed" ? (
            <>
              <NotificationBell />
              <div className="relative ml-1" ref={menuRef}>
                <button onClick={() => setMenuOpen((v) => !v)} aria-label="Profile menu">
                  <Avatar src={user?.avatar} name={user?.name} size="sm" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 card p-1.5 z-20">
                    <p className="px-3 py-2 text-sm">
                      <span className="font-semibold block">{user?.name}</span>
                      <span className="text-gray-400">@{user?.username}</span>
                    </p>
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <Link
                      to={`/u/${user?.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <UserIcon className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Settings className="h-3.5 w-3.5" /> Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Log in
              </Link>
              <Link to="/register" className="btn bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
