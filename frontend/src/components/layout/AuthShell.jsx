import { Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

// Layout for /login, /register, /forgot-password etc. Redirects away if
// already authenticated so a logged-in user can't land back on auth screens.
export default function AuthShell() {
  const { status } = useAuth();
  if (status === "authed") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-white/[0.06] blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-white/[0.06] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary-400/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 font-bold text-xl">
          <div className="flex items-end gap-[3px] h-6 w-6">
            <div className="w-[5px] h-[10px] bg-white/60 rounded-t-[1.5px]" />
            <div className="w-[5px] h-[16px] bg-white/80 rounded-t-[1.5px]" />
            <div className="w-[5px] h-[22px] bg-white rounded-t-[1.5px]" />
          </div>
          Pollify
        </div>

        {/* Tagline */}
        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Where communities make up their mind, together.
          </h1>
          <p className="text-white/70 leading-relaxed">
            Create polls, watch results roll in, and follow the conversations
            that matter to you.
          </p>
        </div>

        {/* Footer */}
        <p className="relative text-sm text-white/40">
          © {new Date().getFullYear()} Pollify
        </p>
      </div>

      {/* Right: Auth Form */}
      <div className="flex flex-col bg-white dark:bg-surface-dark">
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden flex items-center gap-2 font-bold text-[#0f172a] dark:text-white">
            <div className="flex items-end gap-[3px] h-6 w-6">
              <div className="w-[5px] h-[10px] bg-primary-400 rounded-t-[1.5px]" />
              <div className="w-[5px] h-[16px] bg-primary-500 rounded-t-[1.5px]" />
              <div className="w-[5px] h-[22px] bg-primary-600 rounded-t-[1.5px]" />
            </div>
            Pollify
          </div>
          <ThemeToggle className="ml-auto" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
