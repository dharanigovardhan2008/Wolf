import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Logo variant="mark" tone="dark" className="h-20 mb-8 opacity-20" />
      <h2 className="text-4xl font-black uppercase text-primary mb-4">404 - Not Found</h2>
      <p className="text-muted mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-black text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-black/90 transition-all rounded-full"
      >
        Return Home
      </Link>
    </div>
  );
}

