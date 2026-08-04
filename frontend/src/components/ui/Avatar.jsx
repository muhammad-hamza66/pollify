import clsx from "clsx";

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

// Falls back to initials on a gradient tile when there's no avatar URL --
// avatar is optional (default "") on the User model, so this is the common case.
export default function Avatar({ src, name = "?", size = "md", className }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(
          "rounded-full object-cover ring-2 ring-white dark:ring-surface-dark",
          sizeMap[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-primary-500 to-accent-500 ring-2 ring-white dark:ring-surface-dark select-none",
        sizeMap[size],
        className
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}
