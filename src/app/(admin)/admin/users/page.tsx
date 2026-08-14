"use client";

import { useState, useMemo } from "react";
import { Loader2, Users, Search, UserCheck, UserX, Shield, Store, Mail } from "lucide-react";

import { useAdminUsers, useUpdateAdminUser } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading, isError } = useAdminUsers({ q, role, status });
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
      setError(apiErrorMessage(err, "Could not update user status."));
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
        (u.store?.name && u.store.name.toLowerCase().includes(query));
      const matchesRole = !role || u.role?.toLowerCase() === role.toLowerCase();
      const matchesStatus = !status || u.status?.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [rawUsers, q, role, status]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const adminCount = rawUsers.filter((u) => u.role === "admin").length;
  const sellerCount = rawUsers.filter((u) => u.role === "seller").length;
  const buyerCount = rawUsers.filter((u) => u.role === "buyer").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Identity & Access Management
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">All Platform User Accounts</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Global directory of administrator staff, sellers, buyers, and account authorization states.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Users size={18} />
          <span>{rawUsers.length} Registered Accounts</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Merchants / Sellers"
          value={sellerCount}
          icon={<Store size={20} />}
          variant="purple"
          badgeText="Store Owners"
          badgeType="neutral"
          subtitle="Registered vendor accounts"
        />

        <StatCard
          title="Consumers / Buyers"
          value={buyerCount}
          icon={<Users size={20} />}
          variant="emerald"
          badgeText="Shoppers"
          badgeType="success"
          subtitle="Consumer retail accounts"
        />

        <StatCard
          title="Administrators / Staff"
          value={adminCount}
          icon={<Shield size={20} />}
          variant="blue"
          badgeText="Privileged"
          badgeType="info"
          subtitle="Staff with system control"
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
              placeholder="Search by user name or email..."
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
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading user accounts...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch user directory.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search query or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">User Profile</th>
                    <th className="px-4 py-3.5">Account Role</th>
                    <th className="px-4 py-3.5">Store Outlet</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Access Controls</th>
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
                      <td className="px-4 py-3.5 font-bold capitalize text-slate-800">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-lg text-[11px]",
                            user.role === "admin"
                              ? "bg-purple-100 text-[#7a3dbf]"
                              : user.role === "seller"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {user.store?.name ? (
                          <div className="flex items-center gap-1.5">
                            <Store size={12} className="text-[#7a3dbf]" />
                            <span>{user.store.name}</span>
                          </div>
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
                      <td className="px-4 py-3.5 text-right">
                        {user.role !== "admin" ? (
                          <button
                            type="button"
                            disabled={updatingId === user.id}
                            onClick={() => setUserStatus(user.id, user.status === "suspended" ? "active" : "suspended")}
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50",
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
                            <span>{user.status === "suspended" ? "Activate" : "Suspend"}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Protected</span>
                        )}
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
              itemName="users"
            />
          </>
        )}
      </div>
    </div>
  );
}
