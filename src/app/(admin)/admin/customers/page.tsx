"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminUsers, useUpdateAdminUser } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useAdminUsers({ q, role: "buyer", status });
  const updateUser = useUpdateAdminUser();
  const [error, setError] = useState("");

  async function setUserStatus(id: string, next: string) {
    setError("");
    try {
      await updateUser.mutateAsync({ id, status: next });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update customer."));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Buyers</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Customers</h1>
        <p className="text-sm text-[#8A79A5] mt-1">Registered buyers on the marketplace.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email"
          className="rounded-xl border border-[#EBD7FA] bg-white px-4 py-2.5 text-sm font-semibold"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#EBD7FA] bg-white px-3 py-2.5 text-sm font-semibold"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <div className="bg-white rounded-2xl border border-[#EBD7FA] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#8A79A5] border-b">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((user) => (
                <tr key={user.id} className="border-b border-[#F5F1FA]">
                  <td className="p-4">
                    <p className="font-bold text-[#3B1C5A]">{user.name}</p>
                    <p className="text-xs text-[#8A79A5]">{user.email}</p>
                  </td>
                  <td className="p-4 text-xs">{user.phone ?? "—"}</td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                        user.status === "suspended" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#8A79A5]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => setUserStatus(user.id, user.status === "suspended" ? "active" : "suspended")}
                      className="text-xs font-bold text-[#7a3dbf]"
                    >
                      {user.status === "suspended" ? "Activate" : "Suspend"}
                    </button>
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
