import React from "react";
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = "", ...props }, ref) => {
  return <select ref={ref} className={`w-full border-b border-black/20 bg-transparent py-3 text-primary focus:border-black focus:outline-none transition-colors appearance-none ${className}`} {...props} />;
});
Select.displayName = "Select";