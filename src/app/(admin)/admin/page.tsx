"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  ShoppingBag,
  Package,
  Truck,
  ChevronRight,
  Store,
  Wallet,
  Building2,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { StatCard } from "@/components/dashboard/stat-card";
import { useAdminOverview, useAdminOrders, useAdminAnalytics, useAdminVerification } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";

export default function AdminOverviewPage() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "1y">("30d");
  const [orderFilter, setOrderFilter] = useState<string>("All");

  const overviewQuery = useAdminOverview();
  const ordersQuery = useAdminOrders();
  const analyticsQuery = useAdminAnalytics();
  const verificationQuery = useAdminVerification();

  const overview = overviewQuery.data;
  const rawOrders = ordersQuery.data?.data ?? [];
  const chartData = analyticsQuery.data?.chart?.length
    ? analyticsQuery.data.chart
    : [
        { name: "Week 1", gmv: 120000 },
        { name: "Week 2", gmv: 340000 },
        { name: "Week 3", gmv: 580000 },
        { name: "Week 4", gmv: 890000 },
      ];

  const pendingStores = verificationQuery.data?.pendingStores ?? [];
  const pendingApps = overview?.pendingApplications ?? (overview?.pendingStores ?? 0) + (overview?.pendingRiders ?? 0);

  const filteredOrders = rawOrders.filter((order) => {
    if (orderFilter === "All") return true;
    return order.status?.toLowerCase() === orderFilter.toLowerCase();
  });

  if (overviewQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3 font-sans">
        <Loader2 className="h-9 w-9 animate-spin text-[#7a3dbf]" />
        <p className="text-xs font-semibold text-slate-400">Loading overview telemetry...</p>
      </div>
    );
  }

  if (overviewQuery.isError || !overview) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-semibold font-sans">
        Could not load platform overview data. Please check your connection or permissions.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans pb-6">
      {/* ── Top Header Actions ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time transactions, merchant verification, and marketplace volume.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/verification"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <ShieldCheck size={16} />
            <span>Review KYC ({pendingApps})</span>
          </Link>
          <Link
            href="/admin/payouts"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#faf6ff] text-slate-700 border border-[#ebd7fa] text-xs font-semibold transition-all active:scale-95 shadow-sm"
          >
            <Wallet size={15} className="text-[#7a3dbf]" />
            <span>Payouts Queue</span>
          </Link>
        </div>
      </div>

      {/* ── Stats Cards Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <Link href="/admin/orders" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Total GMV Volume"
            value={formatPrice(overview.gmv)}
            icon={<DollarSign size={18} />}
            badgeText="All Settled"
            badgeType="success"
            variant="purple"
          />
        </Link>

        <Link href="/admin/payments" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Marketplace Take (Fees)"
            value={formatPrice(overview.take)}
            icon={<TrendingUp size={18} />}
            badgeText="Net Revenue"
            badgeType="success"
            variant="emerald"
          />
        </Link>

        <Link href="/admin/users" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Registered Users"
            value={overview.users.toLocaleString()}
            icon={<Users size={18} />}
            badgeText="Active Base"
            badgeType="info"
            variant="blue"
          />
        </Link>

        <Link href="/admin/verification" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Pending KYC Approvals"
            value={pendingApps}
            icon={<ShieldCheck size={18} />}
            badgeText={pendingApps > 0 ? "Action Required" : "Up to Date"}
            badgeType={pendingApps > 0 ? "warning" : "success"}
            variant="amber"
          />
        </Link>
      </div>

      {/* ── Main Dashboard 2-Column Layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* Left Column: Recent Orders Fulfillment Feed */}
        <div className="space-y-8 min-w-0">
          <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[#7a3dbf] text-lg font-semibold tracking-tight">Recent Platform Orders</h2>
                <p className="text-slate-400 text-xs font-normal mt-0.5">Live transactions across all merchant storefronts</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#faf6ff] border border-[#ebd7fa] p-1 rounded-xl text-xs font-semibold">
                  {(["All", "Pending", "Shipped", "Delivered"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setOrderFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        orderFilter.toLowerCase() === tab.toLowerCase()
                          ? "bg-[#7a3dbf] text-white shadow-sm"
                          : "text-slate-600 hover:text-[#7a3dbf]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <Link
                  href="/admin/orders"
                  className="hidden xl:flex items-center gap-1 text-[#7a3dbf] text-xs font-semibold hover:underline shrink-0"
                >
                  View All <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-[#faf6ff] rounded-2xl border border-dashed border-[#ebd7fa]">
                  <Package className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-slate-600 font-semibold text-sm">No orders matching &quot;{orderFilter}&quot;</p>
                  <button
                    onClick={() => setOrderFilter("All")}
                    className="mt-3 text-xs font-semibold text-[#7a3dbf] underline"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                filteredOrders.slice(0, 6).map((order) => (
                  <div
                    key={order.id}
                    className="group bg-[#faf6ff] hover:bg-white border border-[#ebd7fa] hover:border-purple-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md"
                  >
                    {/* Item Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 rounded-2xl bg-white text-[#7a3dbf] flex items-center justify-center shrink-0 border border-[#ebd7fa] shadow-sm group-hover:scale-105 transition-transform">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-slate-900 font-semibold text-sm leading-snug truncate">
                          Order #{order.reference?.replace(/^#/, "") || order.id}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Store: <span className="text-slate-700 font-medium">{order.store?.name ?? "Merchant Outlet"}</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-[#7a3dbf] font-medium text-xs mt-1">
                          <Truck size={13} className="text-[#7a3dbf] shrink-0" />
                          <span className="truncate">{order.shippingAddress?.city ?? "Delivery Zone"} · {formatOrderDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price, Status & Actions */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Amount</p>
                        <span className="text-slate-900 font-bold text-base">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                          order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.status === "shipped"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {order.status}
                      </span>

                      <Link
                        href="/admin/orders"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#ebd7fa] text-xs font-semibold text-[#7a3dbf] hover:bg-[#f3eafb] transition"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: GMV Revenue Chart & Pending Verification Queue */}
        <div className="space-y-8 min-w-0">
          {/* Revenue Telemetry Chart */}
          <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#7a3dbf] text-lg font-semibold tracking-tight">GMV Growth Telemetry</h2>
                <p className="text-slate-400 text-xs font-normal">Platform gross volume curve</p>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-[#faf6ff] border border-[#ebd7fa] p-1 rounded-xl text-[11px] font-semibold">
                {(["7d", "30d", "1y"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                      timeframe === t
                        ? "bg-[#7a3dbf] text-white shadow-sm"
                        : "text-slate-600 hover:text-[#7a3dbf]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts AreaChart with Purple Gradient */}
            <div className="w-full h-[200px] mt-4 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminGmvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7a3dbf" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7a3dbf" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3eafb" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "600" }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: "600" }}
                    tickFormatter={(val) => `₦${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ebd7fa",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(122, 61, 191, 0.15)",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, "GMV Volume"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    stroke="#7a3dbf"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#adminGmvGradient)"
                    dot={{ r: 4, fill: "#7a3dbf", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: "#7a3dbf", stroke: "#ffffff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Verification Applications Card */}
          <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[#7a3dbf] text-base font-semibold tracking-tight">Pending Verifications</h2>
                <p className="text-slate-400 text-xs font-normal">Stores & couriers requiring KYC audit</p>
              </div>
              <Link href="/admin/verification" className="text-xs font-bold text-[#7a3dbf] hover:underline flex items-center gap-1">
                Queue ({pendingApps}) <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {pendingStores.length === 0 ? (
                <div className="text-center py-6 bg-[#faf6ff] rounded-2xl border border-dashed border-[#ebd7fa]">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs font-bold text-slate-700">All KYC applications cleared</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No pending merchant audits.</p>
                </div>
              ) : (
                pendingStores.slice(0, 3).map((store) => (
                  <div
                    key={store.id}
                    className="p-3.5 rounded-2xl bg-[#faf6ff] border border-[#ebd7fa] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-white text-[#7a3dbf] flex items-center justify-center shrink-0 border border-[#ebd7fa] shadow-2xs">
                        <Store size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{store.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{store.owner?.email ?? "Merchant"}</p>
                      </div>
                    </div>

                    <Link
                      href="/admin/verification"
                      className="px-3 py-1 bg-white hover:bg-[#f3eafb] text-[#7a3dbf] border border-[#ebd7fa] rounded-lg text-xs font-bold transition shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
