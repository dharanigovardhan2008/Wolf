import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/brand/logo.png"
        alt="Wolf Theory Logo"
        width={40}
        height={40}
        className="w-10 h-10"
        priority
      />
      <span className="text-xl font-bold">Wolf Theory</span>
    </Link>
  );
}