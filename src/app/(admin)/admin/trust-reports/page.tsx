"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminTrustReports, useUpdateTrustReport } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminTrustReportsPage() {
  const [status, setStatus] = useState("open");
  const { data, isLoading, refetch } = useAdminTrustReports({ status: status || undefined });
  const update = useUpdateTrustReport();
  const [error, setError] = useState("");

  async function resolve(id: string, next: string) {
    const note =
      next === "dismissed" || next === "resolved"
        ? window.prompt("Admin note (optional):") ?? undefined
        : undefined;
    setError("");
    try {
      await update.mutateAsync({ id, status: next, admin_note: note });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update report."));
    }
  }

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Trust & Safety</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Trust reports</h1>
        <p className="text-sm text-[#8A79A5] mt-1">
          {data?.openCount ?? 0} open report{(data?.openCount ?? 0) === 1 ? "" : "s"}
        </p>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-xl border border-[#EBD7FA] bg-white px-3 py-2.5 text-sm font-semibold"
      >
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
      </select>

      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#7a3dbf]" />
        </div>
      ) : (
        <div className="space-y-4">
          {rows.length === 0 && <p className="text-sm text-[#8A79A5]">No reports in this filter.</p>}
          {rows.map((report) => (
            <div key={report.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-bold text-[#3B1C5A]">{report.reason}</p>
                  <p className="text-xs text-[#8A79A5]">
                    {report.subjectType}: {report.subjectLabel} · {report.reporter?.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase",
                    report.status === "open" ? "text-amber-700" : "text-emerald-700",
                  )}
                >
                  {report.status}
                </span>
              </div>
              {report.details && <p className="text-sm text-[#5F6C72]">{report.details}</p>}
              {report.adminNote && (
                <p className="text-xs text-[#6D349F] bg-[#FAF8FC] rounded-lg p-2">Note: {report.adminNote}</p>
              )}
              {["open", "investigating"].includes(report.status) && (
                <div className="flex flex-wrap gap-3">
                  {report.status === "open" && (
                    <button
                      type="button"
                      onClick={() => resolve(report.id, "investigating")}
                      className="text-xs font-bold text-[#7a3dbf]"
                    >
                      Investigate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => resolve(report.id, "resolved")}
                    className="text-xs font-bold text-emerald-700"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => resolve(report.id, "dismissed")}
                    className="text-xs font-bold text-rose-700"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
