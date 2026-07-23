"use client";

import Link from "next/link";
import {
  Search,
  User,
  Menu,
  X,
  Heart,
  ShoppingCart,
  Phone,
  Globe,
  ChevronDown,
  LayoutGrid,
  Store,
  ShoppingBag,
  Building2,
  Smartphone,
  Shirt,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

// ── Navigation data ────────────────────────────────────────────

const TOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/dashboard", label: "My Account" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/order-tracking", label: "Order Tracking" },
];

const CATEGORY_LINKS = [
  { href: "/products", label: "All Categories", icon: LayoutGrid },
  { href: "/products?type=local-stores", label: "Local Stores", icon: Store },
  { href: "/products?category=Groceries", label: "Groceries", icon: ShoppingBag },
  { href: "/products?type=malls", label: "Malls", icon: Building2 },
  { href: "/products?category=Electronics", label: "Electronics", icon: Smartphone },
  { href: "/products?category=Fashion", label: "Fashions", icon: Shirt },
];

// ── Component ──────────────────────────────────────────────────

export function Header() {
  const { itemCount, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openSearch, openMobileMenu, closeMobileMenu, isMobileMenuOpen, setSearchQuery } = useUIStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Stub wishlist count – replace with useWishlistStore once available
  const wishlistCount = 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchQuery(searchValue.trim());
      // navigate or open search overlay
      openSearch();
    }
  }

  return (
    <>
      {/* ── 1. Top strip ─────────────────────────────────────────── */}
      <div className="w-full bg-brand-50 border-b border-brand-100">
        <div className="container-wide flex h-9 items-center justify-between">
          {/* Left – page links */}
          <nav className="hidden items-center gap-5 md:flex">
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-neutral-500 transition-colors hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right – phone + language */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Phone size={12} className="shrink-0" />
              <span>Need help? Call us:</span>
              <a href="tel:+2349000000" className="font-medium text-neutral-700 hover:text-brand-600 transition-colors">
                +2349000000
              </a>
            </div>

            <div className="h-3.5 w-px bg-neutral-300 hidden md:block" />

            <button className="hidden md:flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-600 transition-colors">
              <Globe size={13} />
              <span className="font-medium">English</span>
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Main header bar ───────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-shadow duration-300",
          isScrolled && "shadow-brand-md",
        )}
      >
        <div className="bg-brand-600 w-full">
          <div className="container-wide flex h-[68px] items-center gap-4 md:gap-8">

            {/* Logo */}
            <Link href="/" className="flex shrink-0 flex-col leading-none select-none" aria-label="Fastlink Marketplace">
              <div className="flex items-center gap-1.5">
                {/* Stylised F-arrow icon */}
                <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M2 11L10 3L18 11L10 19" stroke="#5FD0C8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 11H24" stroke="#5FD0C8" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M2 6H12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                </svg>
                <span className="text-xl font-extrabold tracking-wide text-white md:text-2xl">
                  ASTLINK
                </span>
              </div>
              <span className="ml-[34px] text-[9px] font-semibold tracking-[0.25em] text-brand-200">
                MARKETPLACE
              </span>
            </Link>

            {/* Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-center overflow-hidden rounded-full bg-white shadow-brand"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search Products, Brand, Stores .."
                className="min-w-0 flex-1 bg-transparent px-5 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none"
                aria-label="Search"
              />
              <button
                type="submit"
                className="m-1 flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-700 shadow transition-all hover:bg-brand-50 hover:text-brand-600"
              >
                <Search size={15} />
                Search
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-5 shrink-0">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="group hidden items-center gap-2 md:flex"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              >
                <div className="relative">
                  <Heart
                    size={26}
                    className="fill-amber-400 stroke-amber-400 drop-shadow-sm transition-transform group-hover:scale-110"
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-white">Whistlist</span>
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="group flex items-center gap-2"
                aria-label={`Cart, ${itemCount} items`}
              >
                <div className="relative">
                  <ShoppingCart
                    size={26}
                    className="stroke-amber-400 transition-transform group-hover:scale-110"
                  />
                  {itemCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-bold text-white md:inline">Cart</span>
              </button>

              {/* Account */}
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="group hidden items-center gap-2 md:flex"
                aria-label="Account"
              >
                <User size={24} className="stroke-white transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold text-white">Account</span>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                className="flex h-9 w-9 items-center justify-center text-white md:hidden"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. Category nav bar ──────────────────────────────────── */}
        <nav className="w-full border-b border-brand-100 bg-brand-50" aria-label="Shop categories">
          <div className="container-wide flex h-11 items-center gap-1 overflow-x-auto scrollbar-none">
            {CATEGORY_LINKS.map((cat) => {
              const Icon = cat.icon;
              const isFirst = cat.label === "All Categories";
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors",
                    isFirst
                      ? "font-bold text-brand-900"
                      : "font-medium text-brand-700 hover:bg-brand-100 hover:text-brand-900",
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0",
                      isFirst ? "text-brand-600" : "text-brand-500",
                    )}
                  />
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ── Mobile full-screen menu ───────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white transition-all duration-300 md:hidden",
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* Close button */}
        <button
          onClick={closeMobileMenu}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <X size={20} />
        </button>

        <nav className="flex h-full flex-col gap-1 overflow-y-auto px-6 pt-16 pb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">
            Navigation
          </p>
          {TOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="rounded-lg px-4 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-4 h-px bg-brand-100" />

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">
            Shop by Category
          </p>
          {CATEGORY_LINKS.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon size={20} className="text-brand-500 shrink-0" />
                {cat.label}
              </Link>
            );
          })}

          <div className="mt-auto pt-6 border-t border-brand-100">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={closeMobileMenu}
              className="btn-primary w-full justify-center"
            >
              <User size={16} />
              {isAuthenticated ? "My Account" : "Sign In"}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
