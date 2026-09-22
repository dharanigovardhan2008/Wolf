"use client";

import { Logo } from "@/components/ui/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Logo variant="mark" tone="dark" className="h-20 mb-8 opacity-20" />
      <h2 className="text-4xl font-black uppercase text-primary mb-4">Something went wrong!</h2>
      <p className="text-muted mb-8 max-w-md">
        We&apos;ve encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="bg-black text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-black/90 transition-all rounded-full"
      >
        Try Again
      </button>
    </div>
  );
}

