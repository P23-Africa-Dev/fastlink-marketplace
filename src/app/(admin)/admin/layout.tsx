"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Store,
  Users,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Wallet,
  HelpCircle,
  Bike,
  BarChart3,
  Landmark,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
  BookOpen,
  Flag,
  Scale,
  AlertTriangle,
  PackageCheck,
  Webhook,
  MapPin,
  Tag,
  ShieldAlert,
  Sliders,
  type LucideIcon,
} from "lucide-react";

import logoSvg from "@/assets/logo.svg";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { homeForRole } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

interface AdminNavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: LucideIcon;
  }[];
}

const NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "OVERVIEW & ANALYTICS",
    items: [
      { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
      { href: "/admin/malls", label: "Malls Directory", icon: Building2 },
    ],
  },
  {
    title: "OPERATIONS & LOGISTICS",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/returns", label: "Returns", icon: RotateCcw },
      { href: "/admin/delivery-zones", label: "Delivery Zones", icon: MapPin },
      { href: "/admin/riders", label: "Riders Fleet", icon: Bike },
    ],
  },
  {
    title: "VENDORS & CATALOG",
    items: [
      { href: "/admin/vendors", label: "Vendors Management", icon: Store },
      { href: "/admin/stores", label: "Stores", icon: Building2 },
      { href: "/admin/products", label: "Products Catalog", icon: Tag },
      { href: "/admin/catalog", label: "Catalog CMS", icon: Landmark },
      { href: "/admin/promos", label: "Promotions & Deals", icon: Sliders },
    ],
  },
  {
    title: "USERS & CUSTOMERS",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/users", label: "System Users", icon: Users },
      { href: "/admin/verification", label: "Verification Requests", icon: ShieldCheck },
    ],
  },
  {
    title: "FINANCE & SETTLEMENTS",
    items: [
      { href: "/admin/payments", label: "Transactions", icon: CreditCard },
      { href: "/admin/payouts", label: "Vendor Payouts", icon: Wallet },
      { href: "/admin/ledger", label: "Financial Ledger", icon: BookOpen },
      { href: "/admin/chargebacks", label: "Chargebacks", icon: AlertTriangle },
    ],
  },
  {
    title: "GOVERNANCE & TRUST",
    items: [
      { href: "/admin/disputes", label: "Dispute Resolutions", icon: Scale },
      { href: "/admin/moderation", label: "Content Moderation", icon: PackageCheck },
      { href: "/admin/trust-reports", label: "Trust & Safety Reports", icon: Flag },
    ],
  },
  {
    title: "SYSTEM & AUDIT",
    items: [
      { href: "/admin/support", label: "Support Tickets", icon: HelpCircle },
      { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
      { href: "/admin/settings", label: "Platform Config", icon: Settings },
    ],
  },
];

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Admin Overview", subtitle: "Admin > Overview > Platform Health" },
  "/admin/analytics": { title: "Platform Analytics & Metrics", subtitle: "Admin > Analytics > Marketplace Performance" },
  "/admin/malls": { title: "Malls & Locations", subtitle: "Admin > Operations > Physical Malls" },
  "/admin/orders": { title: "Global Orders Management", subtitle: "Admin > Operations > All Orders" },
  "/admin/returns": { title: "Returns & RMA Management", subtitle: "Admin > Operations > Returns" },
  "/admin/delivery-zones": { title: "Delivery Zones & Geo Fencing", subtitle: "Admin > Logistics > Delivery Zones" },
  "/admin/riders": { title: "Riders & Dispatch Fleet", subtitle: "Admin > Logistics > Fleet Management" },
  "/admin/vendors": { title: "Vendors & Merchant Accounts", subtitle: "Admin > Merchants > Vendors" },
  "/admin/stores": { title: "Store Outlets", subtitle: "Admin > Merchants > Stores" },
  "/admin/products": { title: "Product Inventory Oversight", subtitle: "Admin > Catalog > Products" },
  "/admin/catalog": { title: "Catalog CMS & Categories", subtitle: "Admin > Catalog > CMS Taxonomy" },
  "/admin/promos": { title: "Platform Promotions & Coupons", subtitle: "Admin > Marketing > Promos" },
  "/admin/customers": { title: "Customer Directory", subtitle: "Admin > Users > Customers" },
  "/admin/users": { title: "System User Accounts & Staff", subtitle: "Admin > Users > Staff & Roles" },
  "/admin/verification": { title: "KYC & Store Verifications", subtitle: "Admin > Compliance > Verifications" },
  "/admin/payments": { title: "Payments & Inward Cashflow", subtitle: "Admin > Finance > Transactions" },
  "/admin/payouts": { title: "Vendor Payouts & Settlements", subtitle: "Admin > Finance > Payouts" },
  "/admin/ledger": { title: "Platform Ledger & Balances", subtitle: "Admin > Finance > General Ledger" },
  "/admin/chargebacks": { title: "Chargebacks & Payment Claims", subtitle: "Admin > Finance > Chargebacks" },
  "/admin/disputes": { title: "Escalated Disputes & Resolution", subtitle: "Admin > Trust > Disputes" },
  "/admin/moderation": { title: "Listing Moderation & Approvals", subtitle: "Admin > Trust > Moderation" },
  "/admin/trust-reports": { title: "Trust & Safety Reports", subtitle: "Admin > Trust > Reports" },
  "/admin/support": { title: "Support Helpdesk & Tickets", subtitle: "Admin > Support > Tickets" },
  "/admin/audit": { title: "System Audit & Security Logs", subtitle: "Admin > System > Audit Logs" },
  "/admin/webhooks": { title: "Webhook Deliveries & Events", subtitle: "Admin > System > Webhooks" },
  "/admin/settings": { title: "Global Platform Settings", subtitle: "Admin > System > Configuration" },
};

function HeaderTitleContent() {
  const pathname = usePathname();
  const routeInfo = ROUTE_TITLES[pathname] || {
    title: "Admin Dashboard",
    subtitle: `Admin > ${pathname.replace("/admin/", "").replace("-", " ")}`,
  };

  return (
    <>
      <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
        {routeInfo.title}
      </h1>
      <p className="text-purple-200 text-[10px] md:text-xs font-semibold">
        {routeInfo.subtitle}
      </p>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, hasHydrated, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !isAuthenticated) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace(homeForRole(user.role));
    }
  }, [hasHydrated, token, isAuthenticated, user, router]);

  if (!hasHydrated || !token || !isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf6ff] text-[#6D349F] font-semibold text-sm">
        Loading…
      </div>
    );
  }

  async function handleLogout() {
    setShowLogoutConfirm(false);
    try {
      await authApi.logout();
    } catch {
      /* still clear */
    }
    logout();
    queryClient.clear();
    window.location.href = "/login";
  }

  const checkIsActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#faf6ff] font-sans overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-[#7a3dbf] px-4 md:px-6 shadow-md shrink-0">
        {/* Left Side: Logo & Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white lg:hidden focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          <Link href="/admin" className="flex shrink-0 items-center gap-2 select-none" aria-label="Fastlink Admin">
            <Image
              src={logoSvg}
              alt="Fastlink Marketplace"
              width={180}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-sm">
              Admin
            </span>
          </Link>
        </div>

        {/* Center: Title */}
        <div className="hidden md:flex flex-col text-left ml-6 mr-auto">
          <Suspense
            fallback={
              <>
                <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">Admin Dashboard</h1>
                <p className="text-purple-200 text-xs md:text-sm font-medium">Loading...</p>
              </>
            }
          >
            <HeaderTitleContent />
          </Suspense>
        </div>

        {/* Right Side: Admin Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-white leading-tight">{user?.name ?? "Super Admin"}</span>
            <span className="text-[11px] font-medium text-purple-200">{user?.email ?? "admin@fastmarket.com"}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white font-black text-sm shadow-inner">
            {(user?.name?.[0] ?? "A").toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-row relative overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#f5ebfc] border-r border-[#ebd7fa] py-5 px-3.5 shrink-0 overflow-hidden">
          <AdminSidebarContent
            pathname={pathname}
            checkIsActive={checkIsActive}
            onLogoutClick={() => setShowLogoutConfirm(true)}
          />
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={cn(
              "absolute inset-y-0 left-0 w-72 bg-[#f5ebfc] flex flex-col p-5 shadow-2xl transition-transform duration-300 z-50",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#ebd7fa]/60">
              <span className="font-extrabold text-purple-950 text-base flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#7a3dbf]" /> Admin Menu
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-700 hover:text-purple-900 p-1 focus:outline-none rounded-lg hover:bg-[#ebd7fa]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <AdminSidebarContent
                pathname={pathname}
                checkIsActive={checkIsActive}
                onItemClick={() => setSidebarOpen(false)}
                onLogoutClick={() => {
                  setSidebarOpen(false);
                  setShowLogoutConfirm(true);
                }}
              />
            </div>
          </aside>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#faf6ff]">
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
            <h3 className="text-slate-900 text-lg font-bold mb-2">Sign out of Control?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to log out of the Admin panel? You will need admin credentials to sign back in.
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
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/20"
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

function AdminSidebarContent({
  pathname,
  checkIsActive,
  onItemClick,
  onLogoutClick,
}: {
  pathname: string;
  checkIsActive: (href: string) => boolean;
  onItemClick?: () => void;
  onLogoutClick: () => void;
}) {
  return (
    <div className="flex flex-col h-full select-none justify-between">
      <nav className="flex-1 overflow-y-auto pr-1 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="px-3.5 text-[10px] font-black uppercase tracking-wider text-purple-900/50">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const isActive = checkIsActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onItemClick}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 text-xs font-bold transition-all duration-200 rounded-xl",
                        isActive
                          ? "bg-[#7a3dbf] text-white shadow-md shadow-purple-600/20 translate-x-0.5"
                          : "text-slate-700 hover:bg-[#ebd7fa]/80 hover:text-purple-950 hover:translate-x-0.5"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={17}
                          className={cn(
                            "transition-colors duration-200 shrink-0",
                            isActive
                              ? "text-white"
                              : "text-purple-700/80 group-hover:text-[#7a3dbf]"
                          )}
                        />
                        <span className="truncate">{label}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="pt-3 mt-3 border-t border-[#ebd7fa]">
        <button
          onClick={onLogoutClick}
          className="group flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut
              size={17}
              className="text-purple-700/80 group-hover:text-red-600 transition-colors duration-200 shrink-0"
            />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
}
