"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";

import logoSvg from "@/assets/logo.svg";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/malls", label: "Malls", icon: Building2 },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/trust-reports", label: "Trust reports", icon: Flag },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/riders", label: "Riders", icon: Bike },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/ledger", label: "Ledger", icon: BookOpen },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/support", label: "Support", icon: HelpCircle },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/catalog", label: "Catalog CMS", icon: Landmark },
  { href: "/admin/settings", label: "Config", icon: Settings },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace(user.role === "seller" ? "/dashboard" : user.role === "rider" ? "/rider" : "/");
    }
  }, [token, user, router]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* still clear */
    }
    logout();
    queryClient.clear();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#efe8f4] font-montserrat flex flex-col">
      <header className="h-16 bg-[#14081c] text-white flex items-center px-4 md:px-6 shrink-0">
        <button className="lg:hidden mr-3" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <Link href="/admin" className="flex items-center gap-3">
          <Image src={logoSvg} alt="Fastlink" width={150} height={36} className="h-8 w-auto" />
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.25em] text-[#d4a24c]">
            Control
          </span>
        </Link>
        <div className="ml-auto text-right">
          <p className="text-xs font-bold">{user?.name ?? "Admin"}</p>
          <p className="text-[10px] font-semibold text-purple-200/80">{user?.email}</p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-64 flex-col bg-[#1b0d28] text-white py-6 px-3 shrink-0">
          <AdminNav pathname={pathname} onLogout={() => setConfirmLogout(true)} />
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 bg-[#1b0d28] text-white p-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-[#d4a24c]">Control</span>
                <button onClick={() => setOpen(false)}><X size={18} /></button>
              </div>
              <AdminNav pathname={pathname} onItemClick={() => setOpen(false)} onLogout={() => setConfirmLogout(true)} />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-5 md:p-8">{children}</main>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmLogout(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="font-extrabold text-slate-900 mb-2">Sign out of Control?</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmLogout(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold">Cancel</button>
              <button onClick={handleLogout} className="flex-1 rounded-xl bg-[#14081c] text-white py-2.5 text-xs font-bold">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminNav({
  pathname,
  onItemClick,
  onLogout,
}: {
  pathname: string;
  onItemClick?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active ? "bg-[#d4a24c] text-[#14081c]" : "text-purple-100/80 hover:bg-white/10",
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={onLogout} className="mt-4 flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-200 hover:bg-white/5 rounded-xl">
        <LogOut size={17} />
        Logout
      </button>
    </div>
  );
}
