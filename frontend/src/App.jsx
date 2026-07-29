import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import AuthShell from "./components/layout/AuthShell";
import PageLoader from "./components/ui/PageLoader";

// Route-level code splitting: each page ships as its own chunk, loaded on
// navigation, instead of one large bundle for the whole app.
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyOtpPage = lazy(() => import("./pages/auth/VerifyOtpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const CreatePollPage = lazy(() => import("./pages/CreatePollPage"));
const PollDetailsPage = lazy(() => import("./pages/PollDetailsPage"));
const PollAnalyticsPage = lazy(() => import("./pages/PollAnalyticsPage"));
const SavedPollsPage = lazy(() => import("./pages/SavedPollsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Auth flow */}
            <Route element={<AuthShell />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Authenticated app */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/create" element={<CreatePollPage />} />
                <Route path="/polls/:id" element={<PollDetailsPage />} />
                <Route path="/polls/:id/analytics" element={<PollAnalyticsPage />} />
                <Route path="/saved" element={<SavedPollsPage />} />
                <Route path="/u/:username" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
