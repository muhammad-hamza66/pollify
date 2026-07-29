import { Vote } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center animate-pulse">
          <Vote className="h-6 w-6 text-white" />
        </span>
        <p className="text-sm text-gray-400">Loading Pollify...</p>
      </div>
    </div>
  );
}
