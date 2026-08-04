import { forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20 hover:shadow-md hover:shadow-primary-600/25",
  secondary:
    "bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm shadow-secondary-600/20 hover:shadow-md hover:shadow-secondary-600/25",
  accent:
    "bg-accent-600 text-white hover:bg-accent-700 shadow-sm shadow-accent-600/20",
  outline:
    "border border-[#e2e8f0] dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
  ghost:
    "text-[#64748b] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0f172a] dark:hover:text-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20",
  subtle:
    "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5",
  lg: "text-sm px-5 py-3",
  icon: "p-2 rounded-lg",
};

const Button = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx("btn", variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
