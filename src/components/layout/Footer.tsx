"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="w-full px-8 py-12 border-t border-black/5 bg-surface mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        
        <div className="max-w-[280px]">
          <Logo variant="full" tone="dark" className="w-full mb-6" />
          <p className="text-muted text-sm">
            Premium custom streetwear. Designed by you, crafted by us.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-black">Shop</span>
            <Link href="/shop" className="text-sm text-muted hover:text-primary transition-colors">Tees</Link>
            <Link href="/shop" className="text-sm text-muted hover:text-primary transition-colors">Oversized</Link>
            <Link href="/customize/wolf-oversized-heavyweight-tee" className="text-sm text-muted hover:text-primary transition-colors">Custom Tees</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-black">Company</span>
            <Link href="/about" className="text-sm text-muted hover:text-primary transition-colors">Who we are</Link>
            <Link href="/contact" className="text-sm text-muted hover:text-primary transition-colors">Contact</Link>
            <Link href="/faq" className="text-sm text-muted hover:text-primary transition-colors">FAQ</Link>
          </div>
        </div>

      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 pt-6 border-t border-black/5">
        <p className="text-xs text-muted">© {new Date().getFullYear()} Wolf Theory. All rights reserved.</p>
        
        <div className="flex gap-4 text-muted">
          <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6c.86 0 1.6.06 1.81.09v2.1h-1.24c-.98 0-1.17.47-1.17 1.15V12h2.3l-.3 3h-2v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
          </a>
          <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
          </a>
          <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
