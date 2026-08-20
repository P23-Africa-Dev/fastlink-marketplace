"use client";

import Link from "next/link";
import Image from "next/image";
import logoSvg from "@/assets/logo.svg";
import {
  Search,
  User,
  Menu,
  X,
  LogOut,
  Heart,
  ShoppingCart,
  ChevronDown,
  LayoutGrid,
  ShoppingBag,
  Building2,
  Smartphone,
  Shirt,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/store/cart-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api";
import { accountHref } from "@/lib/auth-session";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchSuggest } from "@/hooks/use-products";
import { queryClient } from "@/lib/query-client";

// ── Navigation data ────────────────────────────────────────────

const TOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/order-tracking", label: "Order Tracking" },
];

const CATEGORY_LINKS = [
  { href: "/categories", label: "All Categories", icon: LayoutGrid },
  { href: "/malls", label: "Malls", icon: Building2 },
  { href: "/products?category=Groceries", label: "Groceries", icon: ShoppingBag },
  { href: "/products?category=Electronics", label: "Electronics", icon: Smartphone },
  { href: "/products?category=Fashion", label: "Fashions", icon: Shirt },
];

// ── Component ──────────────────────────────────────────────────

export function Header() {
  const router = useRouter();
  const { itemCount, openCart } = useCartStore();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openMobileMenu, closeMobileMenu, isMobileMenuOpen, setSearchQuery } = useUIStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchValue, 250);
  const { data: suggestions } = useSearchSuggest(debouncedSearch);
  const hasSuggestions =
    (suggestions?.products.length ?? 0) + (suggestions?.brands.length ?? 0) + (suggestions?.stores.length ?? 0) > 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchValue.trim();
    if (query) {
      setSearchQuery(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Clear local session even when token revocation fails.
    }
    logout();
    queryClient.clear();
    closeMobileMenu();
    router.push("/login");
  }

  return (
    <>
      {/* ── 1. Top strip ─────────────────────────────────────────── */}
      <div className="w-full bg-[#F5F1FA] border-b border-[#E9E0F2]">
        <div className="container-wide flex h-9 items-center justify-between">
          {/* Left – page links */}
          <nav className="hidden items-center gap-6 md:flex">
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-bold text-[#6D349F] transition-colors hover:text-[#52237A]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={accountHref(isAuthenticated, user?.role)}
              className="text-xs font-bold text-[#6D349F] transition-colors hover:text-[#52237A]"
            >
              My Account
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 transition-colors hover:text-rose-700"
              >
                Sign Out
              </button>
            )}
          </nav>

          {/* Right – phone + language */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5 text-xs text-[#7A6B8A]">
              <span>Need help? Call us:</span>
              <a href="tel:+2349000000" className="font-bold text-[#6D349F] hover:text-[#52237A] transition-colors">
                +2349000000
              </a>
            </div>

            <div className="h-3.5 w-px bg-[#D6CBE3] hidden md:block" />

            <button className="hidden md:flex items-center gap-1 text-xs font-medium text-[#6D349F] hover:text-[#52237A] transition-colors">
              <span>English</span>
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
        <div className="bg-[#7E37C9] w-full">
          <div className="container-wide flex h-[72px] items-center gap-4 md:gap-8">

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center select-none" aria-label="Fastlink Marketplace">
              <Image
                src={logoSvg}
                alt="Fastlink Marketplace"
                width={190}
                height={42}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex flex-1 items-center max-w-xl mx-auto min-w-0"
            >
              <div className="flex flex-1 items-center overflow-hidden rounded-full bg-white p-1 pl-4 sm:pl-5 shadow-sm min-w-0">
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => window.setTimeout(() => setSuggestOpen(false), 180)}
                placeholder="Search Products, Brand, Stores .."
                className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-neutral-700 placeholder:text-neutral-400 outline-none"
                aria-label="Search"
                autoComplete="off"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center shrink-0 rounded-full bg-[#7E37C9] sm:px-6 sm:py-2 text-sm font-semibold text-white transition-all hover:bg-[#6C2CB5]"
              >
                <Search size={18} className="sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </button>
              </div>
              {suggestOpen && hasSuggestions && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-lg border border-[#EBD7FA]">
                  {suggestions?.products.map((item) => (
                    <Link
                      key={item.id ?? item.slug}
                      href={`/products/${item.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3B1C5A] hover:bg-[#F6EFFD]"
                    >
                      {item.image ? (
                        <Image src={item.image} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-purple-100" />
                      )}
                      <span className="truncate font-semibold">{item.name}</span>
                    </Link>
                  ))}
                  {suggestions?.brands.map((item) => (
                    <Link key={`b-${item.slug}`} href={`/brands/${item.slug}`} className="block px-4 py-2 text-xs font-bold text-[#7a3dbf] hover:bg-[#F6EFFD]">
                      Brand · {item.name}
                    </Link>
                  ))}
                  {suggestions?.stores.map((item) => (
                    <Link key={`s-${item.slug}`} href={`/stores/${item.slug}`} className="block px-4 py-2 text-xs font-bold text-[#7a3dbf] hover:bg-[#F6EFFD]">
                      Store · {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </form>

            {/* Actions */}
            <div className="flex items-center gap-6 shrink-0 ml-auto md:ml-0">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="group hidden items-center gap-2 md:flex"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              >
                <div className="relative">
                  <Heart
                    size={24}
                    className="stroke-[#F59E0B] stroke-[2.2] fill-transparent transition-transform group-hover:scale-110"
                  />
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">Whistlist</span>
              </Link>

              {isAuthenticated && <NotificationBell />}

              {/* Cart */}
              <button
                onClick={openCart}
                className="group flex items-center gap-2"
                aria-label={`Cart, ${itemCount} items`}
              >
                <div className="relative">
                  <ShoppingCart
                    size={24}
                    className="stroke-[#F59E0B] stroke-[2.2] transition-transform group-hover:scale-110"
                  />
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                </div>
                <span className="hidden text-sm font-bold text-white md:inline">Cart</span>
              </button>

              {/* Account */}
              <Link
                href={accountHref(isAuthenticated, user?.role)}
                className="group hidden items-center gap-2 md:flex"
                aria-label="Account"
              >
                <User size={24} className="stroke-[#F59E0B] stroke-[2.2] transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold text-white">
                  {isAuthenticated ? "Account" : "Sign in"}
                </span>
              </Link>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-rose-100 hover:text-white"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              )}

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
        <nav className="w-full border-b border-[#E9E0F2] bg-[#F5F1FA]" aria-label="Shop categories">
          <div className="container-wide flex h-11 items-center gap-8 overflow-x-auto scrollbar-none">
            {CATEGORY_LINKS.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#6E627C] hover:text-[#52237A] transition-colors"
                >
                  <Icon size={18} className="text-[#6E627C] shrink-0" />
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

          <div className="mt-auto pt-6 border-t border-brand-100 space-y-2">
            <Link
              href={accountHref(isAuthenticated, user?.role)}
              onClick={closeMobileMenu}
              className="btn-primary w-full justify-center"
            >
              <User size={16} />
              {isAuthenticated ? "My Account" : "Sign In"}
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

