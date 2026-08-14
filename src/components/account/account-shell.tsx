"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  MapPin,
  MessageSquare,
  Package,
  Bell,
  Heart,
  Gift,
  Coins,
  User,
  LogOut,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/messages", label: "Messages", icon: MessageSquare },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/referrals", label: "Referrals", icon: Gift },
  { href: "/account/rewards", label: "Rewards", icon: Coins },
  { href: "/account/profile", label: "Profile Settings", icon: User },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleLogout() {
    logout();
    setShowLogoutModal(false);
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-sans">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-4">
          {/* User Profile Card */}
          <div className="bg-white rounded-[1.8rem] border border-[#ebd7fa] p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#f3eafb] to-[#ebd7fa] text-[#7a3dbf] font-bold text-base flex items-center justify-center shadow-inner shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{user?.name ?? "My Account"}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email ?? "Shopper"}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white rounded-[1.8rem] border border-[#ebd7fa] p-3 shadow-sm space-y-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
              {LINKS.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all",
                      active
                        ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-600/20"
                        : "text-slate-600 hover:bg-[#faf6ff] hover:text-[#7a3dbf]",
                    )}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* Logout Sidebar Action */}
              <div className="pt-2 mt-2 border-t border-slate-100 hidden lg:block">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* ── Logout Confirmation Modal ─────────────────────────────── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
        >
          <div className="bg-white rounded-[2rem] border border-[#ebd7fa] shadow-2xl p-6 sm:p-8 max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <LogOut size={22} />
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to sign out of your Fastlink account?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition active:scale-95"
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
