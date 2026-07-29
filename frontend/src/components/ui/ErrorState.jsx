import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="mb-4 h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Couldn't load this</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
