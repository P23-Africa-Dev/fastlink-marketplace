"use client";

import Link from "next/link";
import { Clock, ShieldCheck, Store } from "lucide-react";

import { useSellerStore } from "@/hooks/use-dashboard";

export default function VendorPendingPage() {
  const { data, isLoading } = useSellerStore();
  const store = data?.data;
  const status = store?.status;
  const kycStatus = store?.kycStatus;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center text-[#6D349F] font-semibold">
        Loading…
      </div>
    );
  }

  if (store?.canSell || (status === "approved" && kycStatus === "approved")) {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-8 max-w-md text-center space-y-4">
          <p className="font-bold text-[#3B1C5A]">Your store is verified!</p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold">
            Open dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (kycStatus === "rejected" || status === "rejected") {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-8 max-w-md text-center space-y-4">
          <p className="font-bold text-rose-700">Verification not approved</p>
          <p className="text-sm text-[#8A79A5]">
            {store?.kycRejectionReason ||
              "Your KYC was rejected. Update your details and resubmit, or contact support."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/vendor/register"
              className="inline-block rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold"
            >
              Fix KYC
            </Link>
            <Link href="/dashboard" className="text-sm font-bold text-[#7a3dbf] hover:underline self-center">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const underReview = kycStatus === "under_review" || kycStatus === "submitted";

  return (
    <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6 font-montserrat">
      <div className="rounded-3xl bg-white border border-[#EBD7FA] shadow-md p-8 sm:p-10 max-w-lg w-full space-y-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Clock size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#3B1C5A]">
            {underReview ? "Verification under review" : "Complete your verification"}
          </h1>
          <p className="text-sm text-[#8A79A5] mt-2">
            {underReview ? (
              store?.name ? (
                <>
                  <strong>{store.name}</strong> is pending admin review. You can still use a limited dashboard.
                </>
              ) : (
                "Your seller verification is pending admin review."
              )
            ) : (
              "Your account is ready. Complete business verification to start selling — or continue to your dashboard and finish later."
            )}
          </p>
        </div>
        <div className="rounded-2xl bg-[#FAF8FC] border border-[#EBD7FA] p-4 text-left text-sm text-[#5F6C72] space-y-2">
          <p className="flex items-center gap-2 font-semibold text-[#6D349F]">
            <Store size={16} /> Before KYC is approved
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>You can prepare product drafts</li>
            <li>Publishing, orders, and payouts stay locked</li>
            <li>Come back anytime to finish verification</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!underReview && (
            <Link
              href="/vendor/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold"
            >
              <ShieldCheck size={16} /> Complete KYC
            </Link>
          )}
          <Link
            href="/dashboard"
            className={
              underReview
                ? "inline-flex items-center justify-center rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold"
                : "inline-flex items-center justify-center rounded-xl border border-[#EBD7FA] px-5 py-2.5 text-sm font-bold text-[#6D349F]"
            }
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
