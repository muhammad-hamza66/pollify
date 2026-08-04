import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={clsx(
      "input",
      error &&
        "border-red-400 focus:border-red-500 focus:ring-red-500/10 hover:border-red-400",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
export default Input;
