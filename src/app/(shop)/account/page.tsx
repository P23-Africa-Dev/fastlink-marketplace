"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Heart,
  Bell,
  Gift,
  Coins,
  LogOut,
  User,
  Shield,
  MessageSquare,
  AlertTriangle,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

const QUICK = [
  { href: "/account/orders", label: "My Orders", icon: Package, desc: "Track purchases and request returns" },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, desc: "Manage delivery addresses" },
  { href: "/wishlist", label: "Wishlist", icon: Heart, desc: "Saved products & favorites" },
  { href: "/account/messages", label: "Messages", icon: MessageSquare, desc: "Support and vendor chats" },
  { href: "/account/notifications", label: "Notifications", icon: Bell, desc: "Order updates and security alerts" },
  { href: "/account/referrals", label: "Referrals", icon: Gift, desc: "Share your code and track signups" },
  { href: "/account/rewards", label: "Rewards", icon: Coins, desc: "Loyalty points you can spend at checkout" },
  { href: "/account/profile", label: "Profile Settings", icon: User, desc: "Update personal info & security" },
];

export default function AccountHubPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleLogout() {
    logout();
    setShowLogoutModal(false);
    router.push("/login");
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── Header Welcome Banner with Logout Button ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#f3eafb] to-[#ebd7fa] text-[#7a3dbf] font-bold text-xl flex items-center justify-center shadow-inner shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {user?.name ?? "Shopper"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {user?.email ?? "Manage your orders, addresses, and account settings."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition active:scale-95 shrink-0"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── Quick Navigation Grid ─────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {QUICK.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-[1.8rem] border border-[#ebd7fa] bg-white p-5 hover:border-[#7a3dbf]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>
              <p className="font-bold text-slate-900 text-base group-hover:text-[#7a3dbf] transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}

        {/* Quick Sign Out Card */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="group rounded-[1.8rem] border border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 p-5 transition-all text-left flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <LogOut size={20} />
            </div>
            <p className="font-bold text-rose-800 text-base">Sign Out</p>
            <p className="text-xs text-rose-600/80 mt-1">End current session on this browser</p>
          </div>
        </button>
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
