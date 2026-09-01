"use client";

import { useState, useMemo } from "react";
import { Loader2, Users, Search, UserCheck, UserX, Phone, Mail, Calendar, Shield } from "lucide-react";

import { useAdminUsers, useUpdateAdminUser } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading, isError } = useAdminUsers({ q, role: "buyer", status });
  const updateUser = useUpdateAdminUser();
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawUsers = data?.data ?? [];

  async function setUserStatus(id: string, next: string) {
    setError("");
    setUpdatingId(id);
    try {
      await updateUser.mutateAsync({ id, status: next });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update customer status."));
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return rawUsers.filter((u) => {
      const query = q.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.phone && u.phone.includes(query));
      const matchesStatus = !status || u.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rawUsers, q, status]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const activeCount = rawUsers.filter((u) => u.status === "active").length;
  const suspendedCount = rawUsers.filter((u) => u.status === "suspended").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Consumer Base
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Registered Marketplace Customers</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Browse buyer accounts, oversee account statuses, and audit customer profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Users size={18} />
          <span>{rawUsers.length} Total Registered</span>
        </div>
      </div>

      {/* ── Stat Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Customers"
          value={rawUsers.length.toLocaleString()}
          icon={<Users size={20} />}
          variant="purple"
          badgeText="Buyers"
          badgeType="neutral"
          subtitle="All consumer profiles"
        />

        <StatCard
          title="Active Accounts"
          value={activeCount.toLocaleString()}
          icon={<UserCheck size={20} />}
          variant="emerald"
          badgeText="Good Standing"
          badgeType="success"
          subtitle="Can browse & place orders"
        />

        <StatCard
          title="Suspended Accounts"
          value={suspendedCount.toLocaleString()}
          icon={<UserX size={20} />}
          variant={suspendedCount > 0 ? "rose" : "purple"}
          badgeText={suspendedCount > 0 ? "Blocked" : "None"}
          badgeType={suspendedCount > 0 ? "danger" : "neutral"}
          subtitle="Restricted access"
        />
      </div>

      {/* ── Table & Filters Container ────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        {/* Search / Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by customer name, email or phone..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading customers...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Failed to load customers directory.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or clearing the filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Customer Details</th>
                    <th className="px-4 py-3.5">Contact Phone</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date Joined</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#f3eafb] to-[#ebd7fa] text-[#7a3dbf] font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                            {user.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{user.name}</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                              <Mail size={12} />
                              <span>{user.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {user.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            user.status === "suspended"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={updatingId === user.id}
                          onClick={() => setUserStatus(user.id, user.status === "suspended" ? "active" : "suspended")}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5",
                            user.status === "suspended"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          )}
                        >
                          {updatingId === user.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : user.status === "suspended" ? (
                            <UserCheck size={12} />
                          ) : (
                            <UserX size={12} />
                          )}
                          <span>{user.status === "suspended" ? "Activate User" : "Suspend User"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="customers"
            />
          </>
        )}
      </div>
    </div>
  );
}
