import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="mb-4 h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="font-semibold text-[#0f172a] dark:text-gray-100">
        Couldn't load this
      </h3>
      <p className="text-sm text-[#64748b] dark:text-gray-400 mt-1.5 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
