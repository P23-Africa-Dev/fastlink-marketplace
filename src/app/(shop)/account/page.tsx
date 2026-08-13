"use client";

import Link from "next/link";
import { Package, MapPin, Heart, Bell, Gift, Coins } from "lucide-react";

const QUICK = [
  { href: "/account/orders", label: "My Orders", icon: Package, desc: "Track purchases and request returns" },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, desc: "Manage delivery addresses" },
  { href: "/wishlist", label: "Wishlist", icon: Heart, desc: "Saved products" },
  { href: "/account/notifications", label: "Notifications", icon: Bell, desc: "Order updates and alerts" },
  { href: "/account/referrals", label: "Referrals", icon: Gift, desc: "Share your code and track signups" },
  { href: "/account/rewards", label: "Rewards", icon: Coins, desc: "Loyalty points you can spend at checkout" },
];

export default function AccountHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A]">Welcome back</h1>
        <p className="text-sm text-[#8A79A5] mt-1">Manage your orders, addresses, and account settings.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {QUICK.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[#EBD7FA] bg-white p-5 hover:border-[#7a3dbf] transition-colors"
          >
            <Icon className="text-[#7a3dbf] mb-2" size={22} />
            <p className="font-bold text-[#3B1C5A]">{label}</p>
            <p className="text-xs text-[#8A79A5] mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
