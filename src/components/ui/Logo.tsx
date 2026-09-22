import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark" | "compact";
  tone?: "dark" | "light";
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = "compact", tone = "dark", className, priority = false }: LogoProps) {
  const isLight = tone === "light";
  
  if (variant === "full") {
    return (
      <Link href="/" className={cn("inline-block", className)} aria-label="Wolf Theory">
        <Image
          src={isLight ? "/brand/logo-white.png" : "/brand/logo.png"}
          alt="Wolf Theory"
          width={320}
          height={118}
          priority={priority}
          className="w-full h-auto"
        />
      </Link>
    );
  }

  if (variant === "mark") {
    return (
      <Link href="/" className={cn("inline-block", className)} aria-label="Wolf Theory">
        <Image
          src="/brand/logo-mark.png"
          alt="Wolf Theory"
          width={64}
          height={64}
          priority={priority}
          className={cn("w-auto h-full", isLight && "invert")}
        />
      </Link>
    );
  }

  // Compact variant
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)} aria-label="Wolf Theory">
      <Image
        src="/brand/logo-mark.png"
        alt="Wolf Theory Mark"
        width={36}
        height={36}
        priority={priority}
        className={cn("w-auto h-full object-contain shrink-0", isLight && "invert")}
      />
      <span className={cn(
        "font-bold text-sm tracking-widest uppercase whitespace-nowrap hidden sm:block",
        isLight ? "text-white" : "text-primary"
      )}>
        WOLF THEORY
      </span>
    </Link>
  );
}

