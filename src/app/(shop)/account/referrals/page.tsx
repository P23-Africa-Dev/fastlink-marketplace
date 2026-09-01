"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";

import { useMyReferral } from "@/hooks/use-growth";

export default function AccountReferralsPage() {
  const { data, isLoading } = useMyReferral();
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!data?.code) return;
    await navigator.clipboard.writeText(data.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
          <Gift size={22} className="text-[#7a3dbf]" />
          Referrals
        </h1>
        <p className="text-sm text-[#8A79A5] mt-1">Share your code. Friends enter it when they create an account.</p>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 space-y-4 max-w-md">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#8A79A5]">Your code</p>
            <p className="text-2xl font-extrabold text-[#6D349F] tracking-wide mt-1">{data?.code ?? "—"}</p>
          </div>
          <p className="text-sm text-[#8A79A5]">
            Signups attributed to you: <span className="font-bold text-[#3B1C5A]">{data?.signups ?? 0}</span>
          </p>
          <button
            type="button"
            onClick={copy}
            className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      )}
    </div>
  );
}
