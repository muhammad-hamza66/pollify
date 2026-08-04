import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Compass,
  PlusCircle,
  Bookmark,
  User,
  Settings,
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
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[#e2e8f0] dark:border-gray-800 h-[calc(100vh-3.5rem)] sticky top-14 px-3 py-5">
      <NavLinkGroup />
      <div className="mt-5 px-1">
        <a
          href="/create"
          className="btn w-full bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20 hover:shadow-md hover:shadow-primary-600/25 py-2.5 text-sm"
        >
          <PlusCircle className="h-4 w-4" /> Create Poll
        </a>
      </div>
      {user && (
        <NavLink
          to={`/u/${user.username}`}
          className="mt-auto flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-[#64748b] hover:text-[#0f172a] dark:hover:text-gray-200 transition-colors"
        >
          <User className="h-4 w-4" /> My Profile
        </NavLink>
      )}
    </aside>
  );
}

function NavLinkGroup() {
  return (
    <nav className="space-y-0.5">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 shadow-sm"
                : "text-[#64748b] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f172a] dark:hover:text-gray-200"
            )
          }
        >
          <Icon className="h-[18px] w-[18px]" />
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
    { to: "/create", label: "Create", icon: PlusCircle },
    { to: "/saved", label: "Saved", icon: Bookmark },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-surface-dark-elevated/90 backdrop-blur-lg border-t border-[#e2e8f0] dark:border-gray-800 flex items-center justify-around py-1.5 safe-area-bottom">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors",
              isActive
                ? "text-primary-600"
                : "text-[#94a3b8] dark:text-gray-500"
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
