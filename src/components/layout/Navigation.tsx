"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, ArrowUpRight, LogOut, User, Package, Heart, Shield, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/customize/wolf-oversized-heavyweight-tee", label: "Customize" },
  { href: "/bulk-orders", label: "Bulk Orders" },
  { href: "/about", label: "Who We Are" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href.includes("?")) {
    // For query-based links, only match if pathname + search matches
    const [path] = href.split("?");
    return pathname === path;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const firstName = session?.user?.name?.split(" ")[0] ?? "Account";
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "U";

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[100] pt-4 md:pt-6 pointer-events-none"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          <div className="flex items-center justify-between relative pointer-events-auto">

            {/* LEFT: Logo */}
            <div className="flex-shrink-0 z-10">
              <Logo variant="compact" tone="dark" priority className="h-8" />
            </div>

            {/* CENTER: Floating Pill Nav */}
            <nav className="hidden lg:block absolute left-1/2 -translate-x-1/2" aria-label="Main navigation">
              <div
                className={`flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-white border transition-all duration-300 ${
                  isScrolled
                    ? "shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-gray-200"
                    : "shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-gray-100"
                }`}
              >
                {navLinks.map((link) => {
                  const active = isActiveLink(pathname, link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`text-[14px] font-semibold px-5 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
                        active
                          ? "bg-[#F4F4F4] text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* RIGHT: Icons + CTA */}
            <div className="flex items-center gap-3 z-10">
              {/* Search */}
              <button
                aria-label="Search"
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                aria-label={`Cart (${itemCount} items)`}
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Auth: Logged Out */}
              {!session?.user ? (
                <Link
                  href="/login"
                  className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 bg-[#111] hover:bg-black text-white rounded-full text-[14px] font-bold transition-all shadow-lg shadow-gray-200/50"
                >
                  Login
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                    <ArrowUpRight size={14} className="text-white" />
                  </div>
                </Link>
              ) : (
                /* Auth: Logged In — User pill dropdown */
                <div className="relative hidden lg:block" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 px-4 py-2 bg-[#111] hover:bg-black text-white rounded-full text-[14px] font-bold transition-all shadow-lg shadow-gray-200/50"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[11px] font-bold">
                      {userInitial}
                    </div>
                    {firstName}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-primary truncate">{session.user.name}</p>
                          <p className="text-xs text-muted truncate">{session.user.email}</p>
                        </div>

                        <div className="py-1.5">
                          <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <User className="w-4 h-4 text-gray-400" /> My Account
                          </Link>
                          <Link href="/my-orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Package className="w-4 h-4 text-gray-400" /> My Orders
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Heart className="w-4 h-4 text-gray-400" /> Wishlist
                          </Link>
                          {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Shield className="w-4 h-4 text-gray-400" /> Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-gray-100 py-1.5">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="lg:hidden flex w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[105] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Card Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-4 top-20 z-[110] lg:hidden bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-6 max-h-[calc(100vh-6rem)] overflow-y-auto"
            >
              {/* Logged-in user info */}
              {session?.user && (
                <div className="pb-4 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{session.user.name}</p>
                      <p className="text-xs text-muted truncate">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const active = isActiveLink(pathname, link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-[16px] font-bold px-5 py-3.5 rounded-xl transition-colors ${
                        active ? "bg-gray-50 text-primary" : "text-gray-500 hover:text-primary hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Account links or login */}
              {session?.user ? (
                <div className="flex flex-col gap-1">
                  <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" /> My Account
                  </Link>
                  <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <ShoppingBag className="w-4 h-4" /> Cart {itemCount > 0 && <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">{itemCount}</span>}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}

                  <div className="h-px bg-gray-100 my-2" />

                  <button
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-[#111] text-white font-bold text-[16px] transition-all hover:bg-black"
                >
                  Login <ArrowUpRight size={18} />
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}