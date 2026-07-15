"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useCartStore, selectTotalItems } from "@/lib/stores/cart-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { LoginModal } from "@/components/customer/LoginModal";
import { CartModal } from "@/components/customer/CartModal";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "w-full max-w-7xl mx-auto px-4 pt-4" }: NavbarProps) {
  const pathname = usePathname();
  const totalItems = useCartStore(selectTotalItems);
  const toggleCart = useUiStore((state) => state.toggleCart);
  const isCartOpen = useUiStore((state) => state.isCartOpen);
  const setCartOpen = useUiStore((state) => state.setCartOpen);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Order tracking", href: "/order-tracking" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className={`relative z-50 ${className}`}>
      <div className="bg-primary-dark text-white px-6 py-4 rounded-b-2xl rounded-t-none flex items-center justify-between shadow-xl">
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center group">
          {/* Custom slanted checkered flag motion logo */}
          <svg
            className="h-7 w-9 text-white mr-3 transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 32 20"
            fill="currentColor"
          >
            {/* Checker squares slanted */}
            <path d="M3 2 L7 2 L5 6 L1 6 Z" />
            <path d="M9 2 L13 2 L11 6 L7 6 Z" />
            <path d="M5 6 L9 6 L7 10 L3 10 Z" />
            <path d="M11 6 L15 6 L13 10 L9 10 Z" />
            <path d="M7 10 L11 10 L9 14 L5 14 Z" />
            <path d="M13 10 L17 10 L15 14 L11 14 Z" />
            {/* Speed streaks */}
            <rect x="19" y="3" width="10" height="2" rx="1" />
            <rect x="17" y="7" width="12" height="2" rx="1" />
            <rect x="15" y="11" width="8" height="2" rx="1" />
          </svg>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider leading-none">
              FASTLINK
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-accent-orange leading-none mt-0.5">
              MARKETPLACE
            </span>
          </div>
        </Link>

        {/* Center: Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors duration-200 hover:text-secondary ${
                  isActive
                    ? "font-extrabold text-white underline underline-offset-8 decoration-accent-orange decoration-2"
                    : "font-medium text-white/80"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Search & Actions */}
        <div className="hidden md:flex items-center space-x-4 flex-1 justify-end max-w-xl ml-4">
          {/* Search bar */}
          <div className="relative w-full max-w-[280px] lg:max-w-[340px]">
            <input
              type="text"
              placeholder="Search shops, malls..."
              className="w-full bg-surface-light text-primary-dark placeholder:text-primary-dark/50 rounded-full pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-dark/60" />
          </div>

          {/* Cart Icon */}
          <button
            onClick={toggleCart}
            aria-label="Toggle cart"
            className="h-10 w-10 bg-white text-primary-dark rounded-full flex items-center justify-center relative hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-orange text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => setLoginModalOpen(true)}
            aria-label="Profile dashboard"
            className="h-10 w-10 bg-accent-orange text-primary-dark rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <User className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={toggleCart}
            className="h-9 w-9 bg-white text-primary-dark rounded-full flex items-center justify-center relative"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-orange text-white text-[8px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-white hover:text-secondary focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-primary-dark border border-secondary-border/20 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search shops, malls..."
              className="w-full bg-surface-light text-primary-dark placeholder:text-primary-dark/50 rounded-full pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-dark/60" />
          </div>
          <nav className="flex flex-col gap-2.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm py-2 px-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-white font-bold"
                      : "text-white/80 hover:bg-surface-light/10"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-surface-light/10 pt-3 flex items-center justify-between">
            <span className="text-xs text-white/60">Account Dashboard</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setLoginModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-bold text-accent-orange"
            >
              <User className="h-4 w-4" />
              Role Selection
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Cart Modal Overlay */}
      <CartModal isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
export default Navbar;
