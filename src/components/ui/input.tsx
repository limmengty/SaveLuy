import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
    if (startAdornment || endAdornment) {
      return (
        <div
          className={cn(
            "flex h-12 w-full items-center rounded-xl border border-input bg-card px-4 py-2.5 text-sm ring-offset-background transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
            className
          )}
        >
          {startAdornment && (
            <div className="mr-2.5 flex items-center shrink-0 text-muted-foreground font-semibold select-none">
              {startAdornment}
            </div>
          )}
          <input
            type={type}
            className="w-full bg-transparent p-0 text-foreground placeholder:text-muted-foreground/80 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed"
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <div className="ml-2.5 flex items-center shrink-0 text-muted-foreground select-none">
              {endAdornment}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
