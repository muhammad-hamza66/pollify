import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar, { MobileNav } from "./Sidebar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

export default function AppShell() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-surface-dark">
      <Navbar />
      <div className="flex max-w-[1360px] mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#131826" : "#fff",
            color: theme === "dark" ? "#f1f5f9" : "#0f172a",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 500,
            border:
              theme === "dark"
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid #e2e8f0",
            boxShadow:
              "0 4px 6px -1px rgba(15,23,42,.08), 0 12px 24px -4px rgba(15,23,42,.12)",
          },
        }}
      />
    </div>
  );
}
