import React from "react";
export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => {
  return <input type="checkbox" ref={ref} className={`w-5 h-5 rounded border-black/20 text-black focus:ring-black ${className}`} {...props} />;
});
Checkbox.displayName = "Checkbox";