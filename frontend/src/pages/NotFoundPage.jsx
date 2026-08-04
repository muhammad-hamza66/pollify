import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-extrabold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
        404
      </p>
      <h1 className="text-xl font-bold mt-4 text-[#0f172a] dark:text-white">
        Page not found
      </h1>
      <p className="text-sm text-[#64748b] dark:text-gray-400 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="btn bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 mt-6 shadow-sm shadow-primary-600/20"
      >
        <Compass className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}
