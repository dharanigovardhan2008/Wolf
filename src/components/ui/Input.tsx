import React from "react";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => {
  return <input ref={ref} className={`w-full border-b border-black/20 bg-transparent py-3 text-primary placeholder:text-muted focus:border-black focus:outline-none transition-colors ${className}`} {...props} />;
});
Input.displayName = "Input";