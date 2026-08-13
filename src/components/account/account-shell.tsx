"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/messages", label: "Messages", icon: MessageSquare },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/referrals", label: "Referrals", icon: Gift },
  { href: "/account/rewards", label: "Rewards", icon: Coins },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-montserrat">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <h2 className="text-lg font-extrabold text-[#6D349F] mb-4">My Account</h2>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {LINKS.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "bg-[#7a3dbf] text-white"
                      : "text-[#6D349F] hover:bg-[#EBD7FA]/60",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
