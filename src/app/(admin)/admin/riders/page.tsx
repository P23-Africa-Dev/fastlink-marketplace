"use client";

import { Loader2 } from "lucide-react";

import { useAdminRiders, useApproveRider } from "@/hooks/use-admin";
import { formatOrderDate } from "@/lib/order-map";

export default function AdminRidersPage() {
  const { data, isLoading } = useAdminRiders();
  const approve = useApproveRider();
  const riders = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Riders</h1>
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Rider</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">City</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} className="border-b border-slate-50">
                  <td className="p-4 font-bold">{rider.user?.name ?? "—"}<div className="text-xs font-normal text-slate-400">{rider.user?.email}</div></td>
                  <td className="p-4 text-xs">{rider.phone}</td>
                  <td className="p-4 text-xs">{rider.vehicleType}</td>
                  <td className="p-4 text-xs">{rider.city ?? "—"}</td>
                  <td className="p-4 text-xs font-black uppercase">{rider.status}</td>
                  <td className="p-4 text-xs text-slate-400">{formatOrderDate(rider.createdAt)}</td>
                  <td className="p-4">
                    {rider.status !== "approved" && (
                      <button
                        onClick={() => approve.mutate(rider.id)}
                        className="rounded-xl bg-[#14081c] text-white text-[10px] font-black uppercase px-3 py-1.5"
                      >
                        Approve
                      </button>
                    )}
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
