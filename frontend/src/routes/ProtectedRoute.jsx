import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <PageLoader />;
  if (status === "guest") return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
