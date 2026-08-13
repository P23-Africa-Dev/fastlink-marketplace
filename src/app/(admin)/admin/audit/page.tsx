"use client";

import { Loader2 } from "lucide-react";

import { useAdminAudit } from "@/hooks/use-admin";

export default function AdminAuditPage() {
  const { data, isLoading } = useAdminAudit();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Audit log</h1>
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">When</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Subject</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((log) => (
                <tr key={log.id} className="border-b border-slate-50">
                  <td className="p-4 text-xs text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</td>
                  <td className="p-4 text-xs font-semibold">{log.actor?.email ?? "system"}</td>
                  <td className="p-4 font-bold">{log.action}</td>
                  <td className="p-4 text-xs">{log.subjectType} #{log.subjectId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
