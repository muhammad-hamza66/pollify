import { Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../../assets/logo.png";

// Layout for /login, /register, /forgot-password etc. Redirects away if
// already authenticated so a logged-in user can't land back on auth screens.
export default function AuthShell() {
  const { status } = useAuth();
  if (status === "authed") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-600 to-accent-700 text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-2 font-bold text-xl">
          <span className="h-10 w-10 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Pollify" className="h-8 w-auto max-w-full object-contain" />
          </span>
          Pollify
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Where communities make up their mind, together.
          </h1>
          <p className="text-white/80">
            Create polls, watch results roll in, and follow the conversations that matter to you.
          </p>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Pollify</p>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden flex items-center gap-2 font-bold">
            <span className="h-10 w-10 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Pollify" className="h-8 w-auto max-w-full object-contain" />
            </span>
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
