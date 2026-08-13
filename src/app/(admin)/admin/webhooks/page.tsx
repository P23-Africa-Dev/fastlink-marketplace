"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminWebhooks } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

export default function AdminWebhooksPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useAdminWebhooks({ status: status || undefined });
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Finance</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Paystack webhooks</h1>
        <p className="text-sm text-[#8A79A5] mt-1">{data?.failedCount ?? 0} failed events</p>
      </div>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#EBD7FA] bg-white px-3 py-2 text-sm">
        <option value="">All statuses</option>
        <option value="processed">Processed</option>
        <option value="failed">Failed</option>
        <option value="duplicate">Duplicate</option>
        <option value="invalid_signature">Invalid signature</option>
        <option value="ignored">Ignored</option>
      </select>
      <div className="bg-white rounded-2xl border border-[#EBD7FA] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-[#8A79A5] border-b">
                <th className="p-4">When</th>
                <th className="p-4">Event</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F5F1FA]">
                  <td className="p-4 text-xs">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="p-4">{row.event ?? "—"}</td>
                  <td className="p-4 text-xs font-mono">{row.reference ?? "—"}</td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-black uppercase", row.status === "processed" ? "text-emerald-700" : row.status === "failed" ? "text-rose-700" : "text-amber-700")}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
