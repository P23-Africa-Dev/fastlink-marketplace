"use client";

import { useState, useMemo } from "react";
import { Loader2, ScrollText, Search, Shield, User, Clock, CheckCircle2 } from "lucide-react";

import { useAdminAudit } from "@/hooks/use-admin";
import { Pagination } from "@/components/dashboard/pagination";

export default function AdminAuditPage() {
  const { data, isLoading, isError } = useAdminAudit();
  const logs = data?.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const action = (log.action ?? "").toLowerCase();
      const actor = (log.actor?.email ?? log.actor?.name ?? "system").toLowerCase();
      const subject = `${log.subjectType ?? ""} ${log.subjectId ?? ""}`.toLowerCase();
      return action.includes(q) || actor.includes(q) || subject.includes(q);
    });
  }, [logs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Security & Governance
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Platform Audit Trail</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Immutable log of all administrative actions, staff modifications, and system events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2 rounded-xl text-[#7a3dbf] font-bold text-xs">
            <ScrollText size={16} />
            <span>{logs.length} Total Events Captured</span>
          </div>
        </div>
      </div>

      {/* ── Table Container ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        {/* Search / Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by actor, action or subject..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading audit records...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Failed to retrieve audit events.
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No audit events match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try refining or clearing your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Timestamp</th>
                    <th className="px-4 py-3.5">Actor</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Subject / Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#ebd7fa] text-[#7a3dbf] flex items-center justify-center font-bold">
                            {log.actor?.email ? <User size={13} /> : <Shield size={13} />}
                          </div>
                          <span>{log.actor?.email ?? "system"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#f3eafb] text-[#7a3dbf] font-mono text-[11px] border border-[#ebd7fa]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        <span className="font-bold text-slate-800">{log.subjectType}</span>
                        {log.subjectId && <span className="text-slate-400 ml-1">#{log.subjectId}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="audit entries"
            />
          </>
        )}
      </div>
    </div>
  );
}
