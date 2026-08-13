"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { useAdminOverview } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="font-semibold text-rose-600">Could not load platform overview.</p>;
  }

  const cards = [
    { label: "GMV (paid)", value: formatPrice(data.gmv), href: "/admin/orders" },
    { label: "Take (fees)", value: formatPrice(data.take), href: "/admin/payments" },
    { label: "Users", value: String(data.users), href: "/admin/users" },
    { label: "Pending stores", value: String(data.pendingStores), href: "/admin/stores" },
    { label: "Pending payouts", value: `${data.pendingPayouts} · ${formatPrice(data.pendingPayoutAmount)}`, href: "/admin/payouts" },
    { label: "Products", value: String(data.products), href: "/admin/products" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a6b1f]">Marketplace</p>
        <h1 className="text-3xl font-black text-[#14081c]">Control overview</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-3xl bg-white border border-[#e3d4f0] p-5 shadow-sm hover:border-[#d4a24c] transition"
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="text-2xl font-black text-[#14081c] mt-2">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
