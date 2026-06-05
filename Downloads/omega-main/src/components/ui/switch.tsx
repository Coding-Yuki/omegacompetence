"use client";

import * as React from "react";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, className = "", ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(checked);

    React.useEffect(() => {
      setInternalChecked(checked);
    }, [checked]);

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const newChecked = !internalChecked;
      setInternalChecked(newChecked);
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={internalChecked}
        ref={ref}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
          transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
          ${internalChecked ? "bg-red-500" : "bg-muted/40 border border-border/50"}
          ${className}
        `}
        {...props}
      >
        <span
          className={`
            pointer-events-none block h-4 w-4 rounded-full bg-foreground shadow-md ring-0 
            transition-transform duration-300 
            ${internalChecked ? "translate-x-5.5 bg-white" : "translate-x-0.5"}
          `}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
