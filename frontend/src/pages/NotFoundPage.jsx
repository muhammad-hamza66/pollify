import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">404</p>
      <h1 className="text-xl font-bold mt-4">Page not found</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn bg-primary-600 text-white px-5 py-2.5 mt-6">
        <Compass className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}
