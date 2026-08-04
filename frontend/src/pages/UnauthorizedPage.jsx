import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mb-4">
        <ShieldAlert className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-[#0f172a] dark:text-white">
        You don't have access to this page
      </h1>
      <p className="text-sm text-[#64748b] dark:text-gray-400 mt-2 max-w-sm">
        Log in with an account that has permission, or head back to your
        dashboard.
      </p>
      <Link
        to="/dashboard"
        className="btn bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 mt-6 shadow-sm shadow-primary-600/20"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
