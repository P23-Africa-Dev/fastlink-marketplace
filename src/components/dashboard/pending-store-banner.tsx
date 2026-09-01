"use client";

import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";

import { useSellerStore } from "@/hooks/use-dashboard";

function kycProgress(status?: string | null): { filled: number; total: number; label: string } {
  const total = 4;
  switch (status) {
    case "approved":
      return { filled: 4, total, label: "Verified" };
    case "submitted":
    case "under_review":
      return { filled: 3, total, label: "Under review" };
    case "in_progress":
      return { filled: 2, total, label: "In progress" };
    case "rejected":
      return { filled: 1, total, label: "Needs attention" };
    default:
      return { filled: 0, total, label: "Not started" };
  }
}

export function PendingStoreBanner() {
  const { data } = useSellerStore();
  const store = data?.data;
  if (!store || store.canSell) return null;

  const isRejected = store.kycStatus === "rejected" || store.status === "rejected";
  const isReview = store.kycStatus === "under_review" || store.kycStatus === "submitted";
  const progress = kycProgress(store.kycStatus);

  const title = isRejected
    ? "Verification rejected"
    : isReview
      ? "Verification under review"
      : "Verification required";

  const body = isRejected
    ? store.kycRejectionReason || "Update your KYC details and resubmit for review."
    : isReview
      ? "You can prepare product drafts while we review your business verification."
      : "Complete your KYC verification to start selling on the marketplace.";

  return (
    <div
      className={
        isRejected
          ? "mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
          : "mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      }
    >
      <div className="flex items-start gap-2 text-sm min-w-0">
        <AlertCircle
          size={18}
          className={isRejected ? "text-rose-600 shrink-0 mt-0.5" : "text-amber-600 shrink-0 mt-0.5"}
        />
        <div className="min-w-0">
          <p className={`font-bold ${isRejected ? "text-rose-800" : "text-amber-900"}`}>{title}</p>
          <p className={`text-xs mt-0.5 ${isRejected ? "text-rose-700" : "text-amber-800"}`}>{body}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1" aria-label={`KYC progress ${progress.filled} of ${progress.total}`}>
              {Array.from({ length: progress.total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-4 rounded-full ${
                    i < progress.filled ? (isRejected ? "bg-rose-500" : "bg-amber-500") : "bg-black/10"
                  }`}
                />
              ))}
            </div>
            <span className={`text-[10px] font-bold ${isRejected ? "text-rose-700" : "text-amber-800"}`}>
              {progress.filled}/{progress.total} · {progress.label}
            </span>
          </div>
        </div>
      </div>
      <Link
        href="/vendor/register"
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shrink-0 ${
          isRejected ? "bg-rose-600 hover:bg-rose-700" : "bg-[#7a3dbf] hover:bg-[#6a2fad]"
        }`}
      >
        <ShieldCheck size={14} />
        {isRejected ? "Fix KYC" : isReview ? "View status" : "Complete KYC"}
      </Link>
    </div>
  );
}
