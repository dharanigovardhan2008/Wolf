import { Logo } from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Logo variant="mark" tone="dark" className="h-16 animate-pulse opacity-50" />
    </div>
  );
}

