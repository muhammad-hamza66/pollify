import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Compass,
  PlusCircle,
  Bookmark,
  User,
  Settings,
  Vote,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/trending", label: "Trending", icon: TrendingUp },
  { to: "/saved", label: "Saved Polls", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-100 dark:border-gray-800 h-[calc(100vh-4rem)] sticky top-16 px-3 py-6">
      <NavLinkGroup />
      <div className="mt-6 px-2">
        <a
          href="/create"
          className="btn w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:opacity-90 shadow-glow"
        >
          <PlusCircle className="h-4 w-4" /> Create Poll
        </a>
      </div>
      {user && (
        <NavLink
          to={`/u/${user.username}`}
          className="mt-auto flex items-center gap-2 px-2 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
        >
          <User className="h-4 w-4 text-gray-400" /> My Profile
        </NavLink>
      )}
    </aside>
  );
}

function NavLinkGroup() {
  return (
    <nav className="space-y-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const items = [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/explore", label: "Explore", icon: Compass },
    { to: "/create", label: "Create", icon: Vote },
    { to: "/saved", label: "Saved", icon: Bookmark },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-surface-dark-elevated/90 backdrop-blur border-t border-gray-100 dark:border-gray-800 flex items-center justify-around py-2">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium",
              isActive ? "text-primary-600" : "text-gray-400"
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
