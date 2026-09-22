import React from "react";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className = "", ...props }, ref) => {
  return <textarea ref={ref} className={`w-full border border-black/20 bg-transparent p-4 rounded-xl text-primary placeholder:text-muted focus:border-black focus:outline-none transition-colors ${className}`} {...props} />;
});
Textarea.displayName = "Textarea";