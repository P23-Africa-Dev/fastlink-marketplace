"use client";

import { Coins, Loader2 } from "lucide-react";

import { useMyLoyalty } from "@/hooks/use-growth";
import { formatPrice } from "@/lib/utils";

export default function AccountRewardsPage() {
  const { data, isLoading } = useMyLoyalty();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
          <Coins size={22} className="text-[#7a3dbf]" />
          Rewards
        </h1>
        <p className="text-sm text-[#8A79A5] mt-1">
          Earn 1 point per ₦{data?.earnPerNaira ?? 100} paid. Each point is ₦{data?.pointValue ?? 1} off at checkout (up to 50% of your cart).
        </p>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 max-w-md space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#8A79A5]">Balance</p>
          <p className="text-3xl font-extrabold text-[#6D349F]">{data?.points ?? 0} pts</p>
          <p className="text-sm text-[#8A79A5]">Worth {formatPrice(data?.nairaValue ?? 0)} at checkout</p>
        </div>
      )}
    </div>
  );
}
