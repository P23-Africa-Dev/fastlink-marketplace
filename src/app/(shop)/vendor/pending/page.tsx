"use client";

import Link from "next/link";
import { Clock, Store } from "lucide-react";

import { useSellerStore } from "@/hooks/use-dashboard";

export default function VendorPendingPage() {
  const { data, isLoading } = useSellerStore();
  const store = data?.data;
  const status = store?.status;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center text-[#6D349F] font-semibold">
        Loading…
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-8 max-w-md text-center space-y-4">
          <p className="font-bold text-[#3B1C5A]">Your store is approved!</p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold">
            Open dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-8 max-w-md text-center space-y-4">
          <p className="font-bold text-rose-700">Application not approved</p>
          <p className="text-sm text-[#8A79A5]">
            Your store application was rejected. Contact support if you believe this was a mistake.
          </p>
          <Link href="/support" className="text-sm font-bold text-[#7a3dbf] hover:underline">
            Contact support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6 font-montserrat">
      <div className="rounded-3xl bg-white border border-[#EBD7FA] shadow-md p-8 sm:p-10 max-w-lg w-full space-y-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Clock size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#3B1C5A]">Application under review</h1>
          <p className="text-sm text-[#8A79A5] mt-2">
            {store?.name ? (
              <>
                <strong>{store.name}</strong> is pending admin approval. We&apos;ll notify you when it&apos;s ready.
              </>
            ) : (
              "Your seller application is pending admin approval."
            )}
          </p>
        </div>
        <div className="rounded-2xl bg-[#FAF8FC] border border-[#EBD7FA] p-4 text-left text-sm text-[#5F6C72] space-y-2">
          <p className="flex items-center gap-2 font-semibold text-[#6D349F]">
            <Store size={16} /> While you wait
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>You cannot publish products yet</li>
            <li>Orders and payouts unlock after approval</li>
            <li>Check notifications for updates</li>
          </ul>
        </div>
        <Link href="/" className="inline-block text-sm font-bold text-[#7a3dbf] hover:underline">
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
