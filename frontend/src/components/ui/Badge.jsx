import clsx from "clsx";

const tones = {
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  primary: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
  accent: "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

export default function Badge({ tone = "gray", className, children }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
