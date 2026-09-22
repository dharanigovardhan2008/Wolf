"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Drawer({ isOpen, onClose, children, side = "right" }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; side?: "left" | "right" }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-surface h-full shadow-float w-full max-w-md p-8 overflow-y-auto ${side === "right" ? "ml-auto" : "mr-auto"}`}>
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-muted hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}