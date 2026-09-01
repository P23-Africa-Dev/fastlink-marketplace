"use client";

import { useState, useMemo } from "react";
import { Loader2, Webhook, Search, CheckCircle2, AlertTriangle, RefreshCcw, Activity } from "lucide-react";

import { useAdminWebhookReconciliation, useAdminWebhooks } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminWebhooksPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading, isError, refetch } = useAdminWebhooks({ status: status || undefined });
  const { data: reconciliation } = useAdminWebhookReconciliation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawRows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      const q = searchQuery.toLowerCase();
      const event = (row.event ?? "").toLowerCase();
      const ref = (row.reference ?? "").toLowerCase();
      return event.includes(q) || ref.includes(q);
    });
  }, [rawRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const failedCount = data?.failedCount ?? rawRows.filter((r) => r.status === "failed").length;
  const processedCount = rawRows.filter((r) => r.status === "processed").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Payment Gateway Ingestion
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Paystack Webhooks & Event Ingestion</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Real-time telemetry of payment gateway webhooks, event delivery confirmations, and payload signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#faf6ff] text-slate-700 border border-[#ebd7fa] text-xs font-bold rounded-xl transition active:scale-95"
          >
            <RefreshCcw size={15} className="text-[#7a3dbf]" />
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Processed Webhook Events"
          value={processedCount}
          icon={<CheckCircle2 size={20} />}
          variant="emerald"
          badgeText="Success"
          badgeType="success"
          subtitle="Successfully ingested payment webhooks"
        />

        <StatCard
          title="Failed / Rejected Events"
          value={failedCount}
          icon={<AlertTriangle size={20} />}
          variant={failedCount > 0 ? "rose" : "emerald"}
          badgeText={failedCount > 0 ? "Inspect Errors" : "0 Failed"}
          badgeType={failedCount > 0 ? "danger" : "success"}
          subtitle="Invalid signature or processing faults"
        />

        <StatCard
          title="Total Events Logged"
          value={rawRows.length}
          icon={<Activity size={20} />}
          variant="purple"
          badgeText="All Ingested"
          badgeType="neutral"
          subtitle="Cumulative webhook payloads"
        />

        <StatCard
          title="Orphan Events (24h)"
          value={reconciliation?.orphanEvents24h ?? 0}
          icon={<AlertTriangle size={20} />}
          variant={(reconciliation?.orphanEvents24h ?? 0) > 0 ? "amber" : "emerald"}
          badgeText={(reconciliation?.orphanEvents24h ?? 0) > 0 ? "Needs Reconciliation" : "Healthy"}
          badgeType={(reconciliation?.orphanEvents24h ?? 0) > 0 ? "warning" : "success"}
          subtitle="Webhook references with no matching payment"
        />
      </div>

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by event name or reference..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "", label: "All Statuses" },
              { id: "processed", label: "Processed" },
              { id: "failed", label: "Failed" },
              { id: "duplicate", label: "Duplicate" },
              { id: "invalid_signature", label: "Invalid Signature" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatus(st.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition",
                  status === st.id
                    ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-600/20"
                    : "bg-[#faf6ff] text-slate-600 hover:bg-[#f3eafb]"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading webhook events...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch webhook deliveries.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <Webhook size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No webhook events found</p>
            <p className="text-xs text-slate-400 mt-1">Events will record automatically as payment notifications arrive.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Timestamp</th>
                    <th className="px-4 py-3.5">Event Name</th>
                    <th className="px-4 py-3.5">Transaction Reference</th>
                    <th className="px-4 py-3.5">Matched Payments</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Processing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                        <span className="bg-[#f3eafb] text-[#7a3dbf] px-2.5 py-1 rounded-lg border border-[#ebd7fa]">
                          {row.event ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                        {row.reference ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold text-slate-700">
                          {row.matchedPayments ?? 0}
                          {(row.paidPayments ?? 0) > 0 ? ` (${row.paidPayments} paid)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            row.status === "processed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : row.status === "failed" || row.status === "invalid_signature"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRows.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="webhook events"
            />
          </>
        )}
      </div>
    </div>
  );
}
