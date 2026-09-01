"use client";

import Link from "next/link";
import { Loader2, Lightbulb, Package } from "lucide-react";

import { useSellerGrowth } from "@/hooks/use-growth";

export default function SellerGrowthPage() {
  const { data, isLoading } = useSellerGrowth();
  const insights = data ?? [];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Growth</p>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2 mt-1">
          <Lightbulb size={22} className="text-[#7a3dbf]" />
          Seller insights
        </h1>
        <p className="text-sm text-[#8A79A5] mt-1">Restock and promote suggestions based on stock and recent paid orders.</p>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : insights.length === 0 ? (
        <p className="text-sm text-[#8A79A5]">No action items right now. Keep catalog stock healthy and listings active.</p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={`${insight.type}-${insight.productId ?? insight.title}`} className="rounded-2xl bg-white border border-[#ebd7fa] p-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#7a3dbf]">{insight.type}</p>
              <p className="font-bold text-[#3B1C5A] mt-1">{insight.title}</p>
              <p className="text-sm text-[#8A79A5] mt-1">{insight.detail}</p>
              {insight.productId && (
                <Link href="/all-products" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#7a3dbf]">
                  <Package size={14} /> Open products
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
