import { forwardRef } from "react";
import clsx from "clsx";

const Textarea = forwardRef(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      "input resize-none",
      error &&
        "border-red-400 focus:border-red-500 focus:ring-red-500/10 hover:border-red-400",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
export default Textarea;
