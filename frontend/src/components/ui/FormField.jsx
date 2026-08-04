import { AlertCircle } from "lucide-react";

export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-[#0f172a] dark:text-gray-200"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-[#94a3b8] dark:text-gray-500">{hint}</p>
      )}
    </div>
  );
}
