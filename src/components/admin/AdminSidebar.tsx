
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Archive,
  Settings,
  FileText,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/styles", icon: Sparkles, label: "Styles" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/inventory", icon: Archive, label: "Inventory" },
  { href: "/admin/bulk-orders", icon: FileText, label: "Bulk Orders" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white md:flex">
        <div className="flex items-center justify-between border-b border-black/5 p-6">
          <Logo
            variant="compact"
            tone="dark"
            className="h-6"
          />

          <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Admin
          </span>
        </div>

        <nav
          className="flex-1 space-y-1 p-4"
          aria-label="Admin navigation"
        >
          {links.map(
            ({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  isActive(href)
                    ? "page"
                    : undefined
                }
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive(href)
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-black/5 hover:text-black"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          )}
        </nav>

        <div className="border-t border-black/5 p-4">
          <p className="mb-2 truncate px-2 text-xs text-gray-500">
            Signed in as {name}
          </p>

          <Link
            href="/"
            className="block rounded-full px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-black/5 hover:text-black"
          >
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="border-b border-black/5 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo
            variant="compact"
            tone="dark"
            className="h-6"
          />

          <Link
            href="/"
            className="text-xs font-semibold text-gray-500"
          >
            ← Store
          </Link>
        </div>

        <nav
          className="flex gap-2 overflow-x-auto px-4 pb-3"
          aria-label="Admin navigation"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                isActive(href)
                  ? "bg-black text-white"
                  : "bg-black/5 text-gray-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

