import clsx from "clsx";

const tones = {
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  primary:
    "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
  blue: "bg-secondary-50 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-300",
  accent:
    "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300",
  green:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  yellow:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

export default function Badge({ tone = "gray", className, children }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
