"use client";

import Link from "next/link";
import Image from "next/image";
import logoSvg from "@/assets/logo.svg";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  CreditCard,
  Wallet,
  BarChart3,
  Megaphone,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/use-conversations";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  showStar?: boolean;
  hasUnread?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/orders", label: "Order", icon: ShoppingBag },
      { href: "/all-products", label: "Products", icon: Package },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/messages", label: "Messages", icon: MessageSquare, hasUnread: true },
    ],
  },
  {
    title: "FINANCE & GROWTH",
    items: [
      { href: "/payments", label: "Payments", icon: CreditCard, showStar: true },
      { href: "/payouts", label: "Payouts", icon: Wallet },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/marketing", label: "Marketing", icon: Megaphone },
      { href: "/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/support", label: "Support", icon: HelpCircle },
    ],
  },
];

interface SidebarNavProps {
  pathname: string;
  onItemClick?: () => void;
  onLogoutClick: () => void;
}

function SidebarNav({ pathname, onItemClick, onLogoutClick }: SidebarNavProps) {
  const { data } = useConversations();
  const unreadCount = (data?.data ?? []).reduce((sum, c) => sum + c.unreadCount, 0);

  const checkIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/all-products") {
      return pathname === "/all-products" || pathname.startsWith("/products");
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full select-none justify-between">
      <nav className="flex-1 overflow-y-auto pr-1 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="px-3.5 text-[10px] font-black uppercase tracking-wider text-purple-900/50">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map(({ href, label, icon: Icon, showStar, hasUnread }) => {
                const isActive = checkIsActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onItemClick}
                      className={cn(
                        "group flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl",
                        isActive
                          ? "bg-[#7a3dbf] text-white shadow-md shadow-purple-600/20 translate-x-0.5"
                          : "text-slate-700 hover:bg-[#ebd7fa]/80 hover:text-purple-950 hover:translate-x-0.5"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          size={19}
                          className={cn(
                            "transition-colors duration-200 shrink-0",
                            isActive
                              ? "text-white"
                              : "text-purple-700/80 group-hover:text-[#7a3dbf]"
                          )}
                        />
                        <span className="truncate">{label}</span>
                      </div>

                      {hasUnread && unreadCount > 0 && (
                        <span
                          className={cn(
                            "ml-2 shrink-0 px-2 py-0.5 text-[11px] font-extrabold rounded-full transition-colors",
                            isActive
                              ? "bg-white text-[#7a3dbf]"
                              : "bg-[#7a3dbf] text-white"
                          )}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="pt-4 mt-4 border-t border-[#ebd7fa]">
        <button
          onClick={onLogoutClick}
          className="group flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut
              size={19}
              className="text-purple-700/80 group-hover:text-red-600 transition-colors duration-200 shrink-0"
            />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function HeaderTitleContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { data } = useConversations();
  const conversations = data?.data ?? [];
  const messagesMatch = pathname.match(/^\/messages\/([^/]+)$/);
  const activeConversationId = messagesMatch ? messagesMatch[1] : null;
  const activeMessage = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId)
    : null;

  if (activeMessage) {
    return (
      <>
        <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
          Customer profile {activeMessage.buyer?.name ?? ""}
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
  const router = useRouter();
  const { logout, user, isAuthenticated } = useAuthStore();
  const { itemCount } = useCartStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "buyer") {
      router.replace("/");
    }
  }, [isAuthenticated, user?.role, router]);

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

        {/* Far Right: Cart Link */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="group flex items-center gap-2"
            aria-label={`View Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
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
          </Link>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-row relative overflow-hidden">
        {/* Sidebar Container */}
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#f5ebfc] border-r border-[#ebd7fa] py-5 px-3.5 shrink-0">
          <SidebarNav
            pathname={pathname}
            onLogoutClick={() => setShowLogoutConfirm(true)}
          />
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
              "absolute inset-y-0 left-0 w-64 bg-[#f5ebfc] flex flex-col p-5 shadow-2xl transition-transform duration-300 z-50",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#ebd7fa]/60">
              <span className="font-extrabold text-purple-900 text-base">Dashboard Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-700 hover:text-purple-900 p-1 focus:outline-none rounded-lg hover:bg-[#ebd7fa]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <SidebarNav
                pathname={pathname}
                onItemClick={() => setSidebarOpen(false)}
                onLogoutClick={() => {
                  setSidebarOpen(false);
                  setShowLogoutConfirm(true);
                }}
              />
            </div>
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
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  try {
                    await authApi.logout();
                  } catch {
                    /* still clear local session */
                  }
                  logout();
                  queryClient.clear();
                  window.location.href = "/login";
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
