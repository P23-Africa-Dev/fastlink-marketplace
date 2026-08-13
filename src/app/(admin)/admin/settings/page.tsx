"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminCommission, useUpdateCommission } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminCommission();
  const update = useUpdateCommission();
  const [rate, setRate] = useState("10");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (data?.rate != null) setRate(String(data.rate));
  }, [data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await update.mutateAsync(Number(rate));
      setMessage("Commission rate saved.");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update commission."));
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-3xl font-black text-[#14081c]">Platform commission</h1>
      <p className="text-sm font-medium text-slate-500">
        A single percentage applied to paid orders. Seller net = amount − this fee.
      </p>
      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <form onSubmit={save} className="bg-white rounded-3xl border border-[#e3d4f0] p-6 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rate (%)</label>
          <input
            type="number"
            min={0}
            max={50}
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full rounded-xl border border-[#e3d4f0] px-4 py-3 text-lg font-extrabold"
          />
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
          <button disabled={update.isPending} className="rounded-xl bg-[#14081c] text-[#d4a24c] font-bold px-5 py-3 text-sm">
            {update.isPending ? "Saving…" : "Save rate"}
          </button>
        </form>
      )}
    </div>
  );
}
