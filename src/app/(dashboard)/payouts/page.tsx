"use client";

import { useState } from "react";
import {
  Search,
  Building,
  Wallet,
  TrendingUp,
  X,
  Send,
  Clock,
  Loader2,
} from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api";
import { usePayoutAccount, useRequestPayout, useSavePayoutAccount, useSellerPayouts } from "@/hooks/use-payments";
import type { PayoutDisplayStatus } from "@/types/payment";

const STATUS_BADGE_CLASSES: Record<PayoutDisplayStatus, string> = {
  Transferred: "bg-green-50 text-green-700 border border-green-200",
  Processing: "bg-blue-50 text-blue-700 border border-blue-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
};

export default function PayoutsPage() {
  const { data, isLoading, isError } = useSellerPayouts();
  const account = usePayoutAccount();
  const requestPayout = useRequestPayout();
  const saveAccount = useSavePayoutAccount();

  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [activeModal, setActiveModal] = useState<"request" | "bank" | null>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");

  const payouts = data?.data ?? [];
  const summary = data?.summary;
  const bank = account.data?.data;

  const filtered = payouts.filter((rec) =>
    `${rec.id} ${rec.bankName ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  function triggerToast(message: string) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 4000);
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (isNaN(value) || value <= 0) {
      triggerToast("Please enter a valid transfer amount.");
      return;
    }
    try {
      await requestPayout.mutateAsync(value);
      setActiveModal(null);
      setAmount("");
      triggerToast("Payout requested. It stays pending until an admin approves it.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not request payout."));
    }
  }

  async function handleBank(e: React.FormEvent) {
    e.preventDefault();
    if (!bankName || !accountNumber || !holderName) {
      triggerToast("All bank fields are required.");
      return;
    }
    try {
      await saveAccount.mutateAsync({
        bank_name: bankName,
        bank_account_number: accountNumber,
        bank_account_name: holderName,
      });
      setActiveModal(null);
      setBankName("");
      setAccountNumber("");
      setHolderName("");
      triggerToast("Bank account saved.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not save bank account."));
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <Wallet className="text-[#7a3dbf]" size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available</span>
            <span className="text-xl font-extrabold text-slate-800">{formatPrice(summary?.available ?? 0)}</span>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Clock className="text-blue-600" size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-xl font-extrabold text-slate-800">{formatPrice(summary?.pending ?? 0)}</span>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="text-emerald-600" size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transferred</span>
            <span className="text-xl font-extrabold text-slate-800">{formatPrice(summary?.transferred ?? 0)}</span>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Building className="text-amber-600" size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bank</span>
            <span className="text-sm font-extrabold text-slate-800 truncate block">{bank?.bankName ?? "Not linked"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveModal("request")}
          className="rounded-xl bg-[#7a3dbf] text-white font-bold px-5 py-3 text-sm shadow-md"
        >
          Request payout
        </button>
        <button
          onClick={() => setActiveModal("bank")}
          className="rounded-xl bg-white border border-[#ebd7fa] text-[#7a3dbf] font-bold px-5 py-3 text-sm"
        >
          Link bank account
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-slate-800 text-lg font-bold">Payout history</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payouts"
              className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] pl-9 pr-4 py-2.5 text-xs font-semibold"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
          </div>
        )}
        {isError && <p className="text-sm font-semibold text-rose-600">Could not load payouts.</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-sm font-semibold text-slate-400 py-10 text-center">No payout records yet.</p>
        )}

        {filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 pr-4">ID</th>
                  <th className="py-3 pr-4">Bank</th>
                  <th className="py-3 pr-4">Account</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-50 text-sm">
                    <td className="py-4 pr-4 font-bold text-slate-800">#{rec.id}</td>
                    <td className="py-4 pr-4 font-semibold">{rec.bankName ?? "—"}</td>
                    <td className="py-4 pr-4 text-slate-500">{rec.accountNumber}</td>
                    <td className="py-4 pr-4 font-bold">{formatPrice(rec.amount)}</td>
                    <td className="py-4">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold border", STATUS_BADGE_CLASSES[rec.displayStatus])}>
                        {rec.displayStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400">
              <X size={18} />
            </button>
            {activeModal === "request" ? (
              <form onSubmit={handleRequest} className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-800">Request payout</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Available: {formatPrice(summary?.available ?? 0)}. Requests stay pending until an admin approves.
                </p>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full rounded-xl border border-[#ebd7fa] px-4 py-3 text-sm font-semibold"
                />
                <button
                  disabled={requestPayout.isPending}
                  className="w-full rounded-xl bg-[#7a3dbf] text-white font-bold py-3 disabled:opacity-60"
                >
                  {requestPayout.isPending ? "Submitting…" : "Submit request"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBank} className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-800">Link bank account</h3>
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" className="w-full rounded-xl border border-[#ebd7fa] px-4 py-3 text-sm font-semibold" />
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" className="w-full rounded-xl border border-[#ebd7fa] px-4 py-3 text-sm font-semibold" />
                <input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Account name" className="w-full rounded-xl border border-[#ebd7fa] px-4 py-3 text-sm font-semibold" />
                <button disabled={saveAccount.isPending} className="w-full rounded-xl bg-[#7a3dbf] text-white font-bold py-3 disabled:opacity-60">
                  {saveAccount.isPending ? "Saving…" : "Save account"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
