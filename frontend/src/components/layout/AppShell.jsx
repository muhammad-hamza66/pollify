import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar, { MobileNav } from "./Sidebar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

export default function AppShell() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
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
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
}
