"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { useSellerStore } from "@/hooks/use-dashboard";

export function PendingStoreBanner() {
  const { data } = useSellerStore();
  const store = data?.data;
  if (!store || store.status === "approved") return null;

  const isRejected = store.status === "rejected";

  return (
    <div
      className={
        isRejected
          ? "mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
          : "mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      }
    >
      <div className="flex items-start gap-2 text-sm">
        <AlertCircle size={18} className={isRejected ? "text-rose-600 shrink-0 mt-0.5" : "text-amber-600 shrink-0 mt-0.5"} />
        <div>
          <p className={`font-bold ${isRejected ? "text-rose-800" : "text-amber-900"}`}>
            {isRejected ? "Store application rejected" : "Store pending approval"}
          </p>
          <p className={`text-xs mt-0.5 ${isRejected ? "text-rose-700" : "text-amber-800"}`}>
            {isRejected
              ? "Contact support if you need help."
              : "You cannot publish products until an admin approves your store."}
          </p>
        </div>
      </div>
      <Link
        href="/vendor/pending"
        className="text-xs font-bold text-[#7a3dbf] hover:underline shrink-0"
      >
        View status →
      </Link>
    </div>
  );
}
