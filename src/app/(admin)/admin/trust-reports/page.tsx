"use client";

import { useState, useMemo } from "react";
import { Loader2, Flag, Search, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Eye, User } from "lucide-react";

import { useAdminTrustReports, useUpdateTrustReport } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminTrustReportsPage() {
  const [status, setStatus] = useState("open");
  const { data, isLoading, isError, refetch } = useAdminTrustReports({ status: status || undefined });
  const update = useUpdateTrustReport();
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const rawRows = data?.data ?? [];

  async function resolve(id: string, next: string) {
    const note =
      next === "dismissed" || next === "resolved"
        ? window.prompt("Admin note (optional):") ?? undefined
        : undefined;
    setError("");
    setResolvingId(id);
    try {
      await update.mutateAsync({ id, status: next, admin_note: note });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update report."));
    } finally {
      setResolvingId(null);
    }
  }

  const filteredRows = useMemo(() => {
    return rawRows.filter((report) => {
      const q = searchQuery.toLowerCase();
      const reason = (report.reason ?? "").toLowerCase();
      const subject = `${report.subjectType ?? ""} ${report.subjectLabel ?? ""}`.toLowerCase();
      const reporter = (report.reporter?.email ?? "").toLowerCase();
      return reason.includes(q) || subject.includes(q) || reporter.includes(q);
    });
  }, [rawRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const openCount = data?.openCount ?? rawRows.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Trust & Community Safety
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Trust & Safety Incident Reports</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Investigate reported listings, merchant fraud flags, and suspicious user violations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Flag size={18} />
          <span>{openCount} Open Incidents</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Open Safety Reports"
          value={openCount}
          icon={<ShieldAlert size={20} />}
          variant={openCount > 0 ? "rose" : "emerald"}
          badgeText={openCount > 0 ? "Requires Review" : "Clear"}
          badgeType={openCount > 0 ? "danger" : "success"}
          subtitle="User reports awaiting investigation"
        />

        <StatCard
          title="Investigating In-Progress"
          value={rawRows.filter((r) => r.status === "investigating").length}
          icon={<Eye size={20} />}
          variant="amber"
          badgeText="Active Audit"
          badgeType="warning"
          subtitle="Reports currently being reviewed"
        />

        <StatCard
          title="Total Reports Logged"
          value={rawRows.length}
          icon={<Flag size={20} />}
          variant="purple"
          badgeText="Historical"
          badgeType="neutral"
          subtitle="Total platform safety flags"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search reports by reason or reporter..."
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
              { id: "open", label: "Open" },
              { id: "investigating", label: "Investigating" },
              { id: "resolved", label: "Resolved" },
              { id: "dismissed", label: "Dismissed" },
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
            <p className="text-xs font-bold text-slate-400">Loading safety reports...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch trust reports.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <Flag size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No trust reports found</p>
            <p className="text-xs text-slate-400 mt-1">No community reports matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedRows.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl bg-white border border-[#ebd7fa] p-5 space-y-3 hover:shadow-sm transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{report.reason}</span>
                      <span
                        className={cn(
                          "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                          report.status === "open"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : report.status === "investigating"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Subject: <span className="font-bold text-slate-800">{report.subjectType}</span> ({report.subjectLabel}) · Reported by:{" "}
                      <span className="font-medium text-slate-700">{report.reporter?.email ?? "Anonymous"}</span>
                    </p>
                  </div>
                </div>

                {report.details && (
                  <p className="text-xs text-slate-700 bg-[#faf6ff] p-3 rounded-xl border border-[#ebd7fa] leading-relaxed">
                    {report.details}
                  </p>
                )}

                {report.adminNote && (
                  <p className="text-xs text-purple-900 bg-[#f3eafb] rounded-xl p-3 border border-[#ebd7fa]">
                    <span className="font-bold mr-1">Admin Audit Note:</span> {report.adminNote}
                  </p>
                )}

                {["open", "investigating"].includes(report.status) && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    {report.status === "open" && (
                      <button
                        type="button"
                        disabled={resolvingId === report.id}
                        onClick={() => resolve(report.id, "investigating")}
                        className="px-3 py-1.5 bg-[#f3eafb] text-[#7a3dbf] hover:bg-[#ebd7fa] rounded-xl text-xs font-bold transition"
                      >
                        Investigate
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={resolvingId === report.id}
                      onClick={() => resolve(report.id, "resolved")}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      disabled={resolvingId === report.id}
                      onClick={() => resolve(report.id, "dismissed")}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition"
                    >
                      Dismiss Report
                    </button>
                  </div>
                )}
              </div>
            ))}

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
              itemName="safety reports"
            />
          </div>
        )}
      </div>
    </div>
  );
}
