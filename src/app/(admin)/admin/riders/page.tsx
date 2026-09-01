"use client";

import { useState, useMemo } from "react";
import { Loader2, Bike, Search, CheckCircle2, Phone, MapPin, ShieldCheck, User, Truck } from "lucide-react";

import { useAdminRiders, useApproveRider } from "@/hooks/use-admin";
import { formatOrderDate } from "@/lib/order-map";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminRidersPage() {
  const { data, isLoading, isError, refetch } = useAdminRiders();
  const approve = useApproveRider();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const rawRiders = data?.data ?? [];

  async function handleApprove(riderId: string) {
    setApprovingId(riderId);
    try {
      await approve.mutateAsync(riderId);
      refetch();
    } finally {
      setApprovingId(null);
    }
  }

  const filteredRiders = useMemo(() => {
    return rawRiders.filter((r) => {
      const q = searchQuery.toLowerCase();
      const name = (r.user?.name ?? "").toLowerCase();
      const email = (r.user?.email ?? "").toLowerCase();
      const phone = (r.phone ?? "").toLowerCase();
      const city = (r.city ?? "").toLowerCase();
      const matchesSearch = name.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q);
      const matchesStatus = statusFilter === "all" || r.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawRiders, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRiders.length / pageSize));
  const paginatedRiders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRiders.slice(start, start + pageSize);
  }, [filteredRiders, currentPage, pageSize]);

  const activeRidersCount = rawRiders.filter((r) => r.status === "approved").length;
  const pendingRidersCount = rawRiders.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Dispatch & Last-Mile Delivery
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Riders & Dispatch Courier Fleet</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Approve courier applications, oversee driver vehicle compliance, and manage delivery fleets.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Bike size={18} />
          <span>{rawRiders.length} Registered Couriers</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Verified Riders"
          value={activeRidersCount}
          icon={<ShieldCheck size={20} />}
          variant="emerald"
          badgeText="Active Fleet"
          badgeType="success"
          subtitle="Ready for order dispatch"
        />

        <StatCard
          title="Pending Applications"
          value={pendingRidersCount}
          icon={<Bike size={20} />}
          variant={pendingRidersCount > 0 ? "amber" : "purple"}
          badgeText={pendingRidersCount > 0 ? "Action Required" : "All Approved"}
          badgeType={pendingRidersCount > 0 ? "warning" : "success"}
          subtitle="Awaiting driver license & verification"
        />

        <StatCard
          title="Total Fleet Profiles"
          value={rawRiders.length}
          icon={<Truck size={20} />}
          variant="purple"
          badgeText="Couriers"
          badgeType="neutral"
          subtitle="All registered rider records"
        />
      </div>

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by rider name, email, phone or city..."
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
              { id: "all", label: "All Couriers" },
              { id: "approved", label: "Approved" },
              { id: "pending", label: "Pending" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition",
                  statusFilter === st.id
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
            <p className="text-xs font-bold text-slate-400">Loading rider fleet...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch riders.
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-16">
            <Bike size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No riders found</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search or filter options.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Rider Profile</th>
                    <th className="px-4 py-3.5">Contact Phone</th>
                    <th className="px-4 py-3.5">Vehicle Type</th>
                    <th className="px-4 py-3.5">Operating City</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date Applied</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#f3eafb] text-[#7a3dbf] font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                            <Bike size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{rider.user?.name ?? "Rider"}</p>
                            <p className="text-[11px] text-slate-400">{rider.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          {rider.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 capitalize">
                        {rider.vehicleType ?? "Motorcycle"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {rider.city ?? "Nigeria"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            rider.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {rider.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {formatOrderDate(rider.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {rider.status !== "approved" ? (
                          <button
                            type="button"
                            disabled={approvingId === rider.id}
                            onClick={() => handleApprove(rider.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50"
                          >
                            {approvingId === rider.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            <span>Approve Rider</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Verified</span>
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
              totalItems={filteredRiders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="riders"
            />
          </>
        )}
      </div>
    </div>
  );
}
