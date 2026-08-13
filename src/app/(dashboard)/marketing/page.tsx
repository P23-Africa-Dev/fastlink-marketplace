"use client";

import { useState } from "react";
import { Megaphone, PlusCircle, Loader2, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { cn, formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import { useCampaigns, useCreateCampaign } from "@/hooks/use-inbox";

const CHANNELS = ["Meta Ads", "Google Ads", "Mailchimp", "Tiktok", "Instagram"];

const STATUS_BADGE: Record<string, string> = {
  Successful: "bg-green-50 text-green-700 border-green-200",
  Active: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-slate-50 text-slate-500 border-slate-200",
  Reviewing: "bg-orange-50 text-orange-700 border-orange-200",
  "On Hold": "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function MarketingPage() {
  const { data: records = [], isLoading, isError } = useCampaigns();
  const create = useCreateCampaign();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "Meta Ads", spend: "", conversions: "" });
  const [toastMessage, setToastMessage] = useState("");

  const filtered = records.filter((rec) =>
    `${rec.name} ${rec.channel}`.toLowerCase().includes(search.toLowerCase()),
  );

  const chart = records.map((rec) => ({ name: rec.name.slice(0, 10), volume: rec.conversions }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name: form.name,
        channel: form.channel,
        spend: Number(form.spend) || 0,
        conversions: Number(form.conversions) || 0,
      });
      setOpen(false);
      setForm({ name: "", channel: "Meta Ads", spend: "", conversions: "" });
      setToastMessage("Campaign saved.");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage(apiErrorMessage(err, "Could not save campaign."));
      setTimeout(() => setToastMessage(""), 3000);
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl">{toastMessage}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#f3eafb] flex items-center justify-center">
            <Megaphone className="text-[#7a3dbf]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Campaign records</h1>
            <p className="text-xs text-slate-400">Internal spend and conversion tracking — not connected to ad networks.</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="bg-[#7a3dbf] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
          <PlusCircle size={14} /> New campaign
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-[#ebd7fa]">
        <h2 className="font-bold text-slate-800 mb-4">Conversions</h2>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebd7fa" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="volume" fill="#7a3dbf" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-[#ebd7fa] space-y-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns…"
          className="w-full max-w-md bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-sm"
        />
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : isError ? (
          <p className="text-rose-600">Could not load campaigns.</p>
        ) : (
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Spend</th>
                <th className="py-3 px-3">Conversions</th>
                <th className="py-3 px-3">ROI</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((rec) => (
                <tr key={rec.id}>
                  <td className="py-3 px-3 font-bold">{rec.name}</td>
                  <td className="py-3 px-3">{rec.channel}</td>
                  <td className="py-3 px-3">{formatPrice(rec.spend)}</td>
                  <td className="py-3 px-3">{rec.conversions}</td>
                  <td className="py-3 px-3">{rec.roi}%</td>
                  <td className="py-3 px-3">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", STATUS_BADGE[rec.displayStatus] ?? "bg-slate-50")}>
                      {rec.displayStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatOrderDate(rec.startsAt ?? rec.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No campaigns yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <form onSubmit={handleCreate} className="relative z-10 bg-white rounded-2xl w-full max-w-md p-6 space-y-3 border border-[#ebd7fa]">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 text-slate-400"><X size={18} /></button>
            <h3 className="font-bold">New campaign</h3>
            <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Campaign name" className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-sm" />
            <select value={form.channel} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))} className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-sm">
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="number" min="0" value={form.spend} onChange={(e) => setForm((p) => ({ ...p, spend: e.target.value }))} placeholder="Spend" className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-sm" />
            <input type="number" min="0" value={form.conversions} onChange={(e) => setForm((p) => ({ ...p, conversions: e.target.value }))} placeholder="Conversions" className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-sm" />
            <button type="submit" disabled={create.isPending} className="w-full rounded-xl bg-[#7a3dbf] text-white font-bold py-2.5 text-sm">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}
