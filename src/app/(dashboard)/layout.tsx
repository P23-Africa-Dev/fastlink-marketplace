"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Menu, X, LogOut } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/store/messages-store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Order" },
  { href: "/all-products", label: "Products" },
  { href: "/customers", label: "Customers" },
  { href: "/messages", label: "Messages" },
  { href: "/payments", label: "Payments ⭐️" },
  { href: "/payouts", label: "Payouts" },
  { href: "/analytics", label: "Analytics" },
  { href: "/marketing", label: "Marketing" },
  { href: "/reviews", label: "Reviews" },
  { href: "/settings", label: "Settings" },
  { href: "/support", label: "Support" },
];

function HeaderTitleContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const conversations = useMessagesStore((state) => state.conversations);
  const messagesMatch = pathname.match(/^\/messages\/([^/]+)$/);
  const activeConversationId = messagesMatch ? messagesMatch[1] : null;
  const activeMessage = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId)
    : null;

  if (activeMessage) {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Customer profile {activeMessage.senderName}
        </h1>
        <p className="text-purple-200 text-xs md:text-sm font-medium">
          <Link href="/messages" className="hover:underline">
            Dashboard &gt;
          </Link>
        </p>
      </>
    );
  }

  if (pathname === "/orders") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Orders</h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Orders &gt; All Orders
        </p>
      </>
    );
  }

  if (pathname === "/all-products" || pathname === "/products") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Products</h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Products &gt; Inventory
        </p>
      </>
    );
  }

  if (pathname.endsWith("/add-new-product")) {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Add New Product</h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Products &gt; Add New Product
        </p>
      </>
    );
  }

  if (pathname === "/customers") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Customers</h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Customers &gt; All Customers
        </p>
      </>
    );
  }

  if (pathname === "/messages") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Messages</h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Messages &gt; Inbox
        </p>
      </>
    );
  }

  if (pathname === "/payments") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Payment History & Summary
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Payments &gt; All Records
        </p>
      </>
    );
  }

  if (pathname === "/payouts") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Payout Balance & Bank Settlements
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Payouts &gt; Financial Statements
        </p>
      </>
    );
  }

  if (pathname === "/analytics") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Store Analytics & Performance Metrics
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Analytics &gt; Telemetry & Reports
        </p>
      </>
    );
  }

  if (pathname === "/marketing") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Marketing Campaign Performance & Insights
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Marketing &gt; Campaigns
        </p>
      </>
    );
  }

  if (pathname === "/reviews") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Customer Feedback & Reviews
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Reviews &gt; Product Ratings
        </p>
      </>
    );
  }

  if (pathname === "/settings") {
    const view = searchParams ? searchParams.get("view") : null;
    if (view === "profile") {
      return (
        <>
          <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
            Profile Dashboard
          </h1>
          <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
            Dashboard &gt; Profile &gt; Account Overview
          </p>
        </>
      );
    }
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Account Settings & Profile
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Settings &gt; General
        </p>
      </>
    );
  }

  if (pathname === "/support") {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Merchant Help & Support Desk
        </h1>
        <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
          Dashboard &gt; Support &gt; Inquiries & Tickets
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Dashboard</h1>
      <p className="text-purple-200 text-xs md:text-sm font-medium">
        Welcome back, {user?.name ?? "FastLink Stores"}
      </p>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col bg-[#faf6ff] font-sans overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-[#7a3dbf] px-4 md:px-6 shadow-md">
        {/* Left Side: Logo & Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white lg:hidden focus:outline-none"
          >
            <Menu size={24} />
          </button>
          
          <Link href="/" className="flex flex-col select-none border border-white/30 rounded-2xl px-4 py-1.5 md:py-2">
            <div className="flex items-center gap-1.5 justify-center">
              {/* Official Fastlink Arrow Icon */}
              <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 11L10 3L18 11L10 19" stroke="#5FD0C8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11H24" stroke="#5FD0C8" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M2 6H12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              </svg>
              <span className="text-white font-display font-extrabold text-xl md:text-2xl tracking-wide leading-none">
                ASTLINK
              </span>
            </div>
            <span className="ml-[30px] text-[8px] font-bold tracking-[0.25em] text-[#5FD0C8] leading-none">
              MARKETPLACE
            </span>
          </Link>
        </div>

        {/* Center: Title */}
        <div className="hidden md:flex flex-col text-left ml-6 mr-auto">
          <Suspense fallback={
            <>
              <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Settings</h1>
              <p className="text-purple-200 text-xs md:text-sm font-medium">Loading...</p>
            </>
          }>
            <HeaderTitleContent />
          </Suspense>
        </div>

        {/* Center-Right: Search Input (desktop only) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <form className="w-full bg-[#fdfafb] rounded-full pl-6 pr-1 py-1 flex items-center shadow-inner">
            <input
              type="text"
              placeholder="Search Products, Brand, Stores .."
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none pr-3"
            />
            <button
              type="submit"
              className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm rounded-full px-6 py-2 transition-all shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Far Right: Cart Link */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-white font-bold text-base md:text-lg hover:underline">
            View Cart
          </Link>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-row relative overflow-hidden">
        {/* Sidebar Container */}
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-60 flex-col bg-[#f4ebfc] border-r border-[#ebd7fa] py-6 px-4">
          <nav className="flex-1">
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center px-4 py-2 text-base font-bold transition-all rounded-xl",
                        isActive
                          ? "bg-[#7a3dbf] text-white shadow-md shadow-purple-500/10"
                          : "text-slate-800 hover:bg-[#ebd7fa]"
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex w-full items-center px-4 py-2 text-base font-bold text-slate-800 hover:bg-[#ebd7fa] rounded-xl transition-all text-left"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Mobile Sidebar overlay & sidebar */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar Drawer */}
          <aside
            className={cn(
              "absolute inset-y-0 left-0 w-60 bg-[#f4ebfc] flex flex-col p-6 shadow-2xl transition-transform duration-300",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-purple-900 text-lg">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-800 p-1 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {NAV_ITEMS.map(({ href, label }) => {
                  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center px-4 py-2.5 text-base font-bold transition-all rounded-xl",
                          isActive
                            ? "bg-[#7a3dbf] text-white shadow-md"
                            : "text-slate-800 hover:bg-[#ebd7fa]"
                        )}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-base font-bold text-slate-800 hover:bg-[#ebd7fa] rounded-xl transition-all text-left"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#ebd7fa] rounded-full flex items-center justify-center text-[#7a3dbf] mb-4">
              <LogOut size={22} className="translate-x-0.5" />
            </div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">Confirm Sign Out</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to sign out? You will need to log back in to access your store dashboard.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
