import React from "react";
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "icon" }>(({ className = "", variant = "primary", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-black text-white hover:bg-black/90 rounded-full px-8 py-4 text-sm tracking-wide uppercase",
    secondary: "bg-transparent border border-black/20 text-black hover:bg-black/5 rounded-full px-8 py-4 text-sm tracking-wide uppercase",
    ghost: "bg-transparent text-black hover:bg-black/5 rounded-full px-6 py-3 text-sm",
    icon: "w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 text-black"
  };
  return <button ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />;
});
Button.displayName = "Button";