"use client";

import { useState } from "react";
import { Loader2, UserCog } from "lucide-react";

import { useSellerStaff, useSellerStaffActions } from "@/hooks/use-growth";
import { apiErrorMessage } from "@/lib/api";
import type { StoreStaffMember } from "@/types/growth";

const ROLES = ["inventory", "orders", "finance", "support"] as const;

export default function SellerTeamPage() {
  const { data, isLoading, refetch } = useSellerStaff();
  const actions = useSellerStaffActions();
  const [form, setForm] = useState({ email: "", role: "inventory" as (typeof ROLES)[number] });
  const [error, setError] = useState("");
  const staff = data?.staff ?? [];

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await actions.invite.mutateAsync({ email: form.email.trim(), role: form.role });
      setForm({ email: "", role: "inventory" });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not add that teammate."));
    }
  }

  async function changeRole(member: StoreStaffMember, role: string) {
    try {
      await actions.update.mutateAsync({ id: member.id, role });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update role."));
    }
  }

  async function remove(member: StoreStaffMember) {
    if (!confirm(`Remove ${member.name} from this store?`)) return;
    try {
      await actions.remove.mutateAsync(member.id);
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not remove teammate."));
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Team</p>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2 mt-1">
          <UserCog size={22} className="text-[#7a3dbf]" />
          Store staff
        </h1>
        <p className="text-sm text-[#8A79A5] mt-1">
          Invite people who already have a Fastlink account. Roles limit what they can do in this dashboard.
        </p>
      </div>

      <form onSubmit={invite} className="rounded-2xl bg-white border border-[#ebd7fa] p-5 space-y-3">
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="grid sm:grid-cols-[1fr_160px_auto] gap-2">
          <input
            required
            type="email"
            placeholder="Teammate email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as (typeof ROLES)[number] }))}
            className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit" disabled={actions.invite.isPending} className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white">
            {actions.invite.isPending ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="space-y-3">
          {data?.owner && (
            <div className="rounded-2xl bg-white border border-[#ebd7fa] p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#3B1C5A]">{data.owner.name}</p>
                <p className="text-xs text-[#8A79A5]">{data.owner.email}</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7a3dbf]">Owner</span>
            </div>
          )}
          {staff.length === 0 ? (
            <p className="text-sm text-[#8A79A5]">No staff yet. Invite inventory, orders, finance, or support teammates.</p>
          ) : (
            staff.map((member) => (
              <div key={member.id} className="rounded-2xl bg-white border border-[#ebd7fa] p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[#3B1C5A]">{member.name}</p>
                  <p className="text-xs text-[#8A79A5]">
                    {member.email} · {member.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => changeRole(member, e.target.value)}
                    className="rounded-xl border border-[#EBD7FA] px-3 py-1.5 text-xs"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(member)}
                    className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
