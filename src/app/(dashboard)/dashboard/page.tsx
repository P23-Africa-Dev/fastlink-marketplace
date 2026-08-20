"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Boxes,
  Users,
  Package,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Receipt,
  Truck,
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
import { useDashboardStats } from "@/hooks/use-dashboard";
import { formatOrderDate } from "@/lib/order-map";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "1y">("30d");
  const { data: statsRes } = useDashboardStats(timeframe);
  const stats = statsRes?.data;

  const chartData = stats?.chart?.length
    ? stats.chart
    : [{ name: "—", value: 0 }];

  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered">("All");

  const orders = (stats?.recentOrders ?? []).map((order) => {
    const uiStatus =
      order.status === "shipped" || order.displayStatus === "Shipped"
        ? "Shipped"
        : order.status === "delivered" || order.displayStatus === "Delivered"
          ? "Delivered"
          : "Processing";
    return {
      id: order.reference || order.id,
      title: order.title || order.customerName,
      sku: order.sku ? `SKU: ${order.sku}` : order.customerName,
      price: order.amount,
      quantity: order.quantity || 1,
      image: order.image || "",
      status: uiStatus as "Processing" | "Shipped" | "Delivered",
      delivery: order.delivery || formatOrderDate(order.date),
    };
  });

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "All") return true;
    return o.status === orderFilter;
  });

  const topProducts = stats?.topProducts ?? [];
  const activity = stats?.activitySummary;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-6">
      
      {/* ── Top Header Banner & Quick Actions ───────────────────────── */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
              Store Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-normal text-slate-500 mt-1">
            Overview of your store performance, orders, and sales telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/all-products?add=true"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
          <button
            onClick={() => alert("Downloading store performance report...")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf6ff] hover:bg-[#f3eafb] text-[#7a3dbf] border border-[#ebd7fa] text-xs font-semibold transition-all active:scale-95"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div> */}

      {/* ── Stats Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <StatCard
          title="Total Orders"
          value={(stats?.totalOrders ?? 0).toLocaleString()}
          icon={<ShoppingBag size={18} />}
          badgeText={`${stats?.ordersChange ?? 0}%`}
          badgeIcon={<TrendingUp size={11} />}
          variant="purple"
        />

        <StatCard
          title="Total Sales"
          value={`₦${Math.round(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<Receipt size={18} />}
          badgeText={`${stats?.revenueChange ?? 0}%`}
          badgeIcon={<TrendingUp size={11} />}
          variant="emerald"
        />

        <StatCard
          title="Total Customers"
          value={(stats?.totalCustomers ?? 0).toLocaleString()}
          icon={<Users size={18} />}
          badgeText="CRM"
          badgeIcon={<TrendingUp size={11} />}
          variant="blue"
        />

        <StatCard
          title="Total Products"
          value={(stats?.totalProducts ?? 0).toLocaleString()}
          icon={<Boxes size={18} />}
          badgeText="Live"
          badgeIcon={<TrendingUp size={11} />}
          variant="amber"
        />
      </div>

      {/* ── Main Dashboard Section ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        
        {/* Left Column: Recent Orders */}
        <div className="space-y-8 min-w-0">
          
          {/* Recent Orders Card */}
          <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[#7a3dbf] text-lg font-semibold tracking-tight">Recent Orders</h2>
                <p className="text-slate-400 text-xs font-normal mt-0.5">Manage and track your latest incoming orders</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#faf6ff] border border-[#ebd7fa] p-1 rounded-xl text-xs font-semibold">
                  {(["All", "Processing", "Shipped", "Delivered"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setOrderFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        orderFilter === tab
                          ? "bg-[#7a3dbf] text-white shadow-sm"
                          : "text-slate-600 hover:text-[#7a3dbf]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <Link
                  href="/orders"
                  className="hidden xl:flex items-center gap-1 text-[#7a3dbf] text-xs font-semibold hover:underline shrink-0"
                >
                  View All <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Orders List */}
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
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group bg-[#faf6ff] hover:bg-white border border-[#ebd7fa] hover:border-purple-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md"
                  >
                    {/* Item Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-white shrink-0 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {order.image ? (
                          <Image
                            src={order.image}
                            alt={order.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="m-auto mt-4 text-slate-300" size={24} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-slate-800 font-semibold text-sm sm:text-base leading-snug truncate">
                          {order.title}
                        </h3>
                        <p className="text-slate-400 text-xs font-normal mt-0.5">{order.sku}</p>
                        <div className="flex items-center gap-1.5 text-[#7a3dbf] font-medium text-xs mt-1.5">
                          <Truck size={14} className="text-[#7a3dbf] shrink-0" />
                          <span className="truncate">{order.delivery}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price, Quantity & Status */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                      <div className="text-left md:text-right">
                        <p className="text-xs font-normal text-slate-400 uppercase tracking-wider">Amount</p>
                        <span className="text-slate-900 font-semibold text-base sm:text-lg">
                          ₦{(order.price * order.quantity).toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}`}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#7a3dbf] hover:bg-purple-50"
                      >
                        View
                      </Link>

                      {/* Status Pill */}
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
                          order.status === "Processing"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : order.status === "Shipped"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Analytics & Hot Deals */}
        <div className="space-y-8 min-w-0">
          
          {/* Analytics Card */}
          <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#7a3dbf] text-lg font-semibold tracking-tight">Analytics Overview</h2>
                <p className="text-slate-400 text-xs font-normal">Revenue telemetry over time</p>
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

            {/* Recharts AreaChart with Gradient */}
            <div className="w-full h-[200px] mt-4 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7a3dbf"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#purpleGradient)"
                    dot={{ r: 4, fill: "#7a3dbf", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: "#7a3dbf", stroke: "#ffffff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {activity && (
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <div className="rounded-xl bg-[#faf6ff] px-2.5 py-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Views</p>
                  <p className="text-sm font-semibold text-slate-800">{activity.pageViews7d}</p>
                </div>
                <div className="rounded-xl bg-[#faf6ff] px-2.5 py-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Checkouts</p>
                  <p className="text-sm font-semibold text-slate-800">{activity.checkoutStarts7d}</p>
                </div>
                <div className="rounded-xl bg-[#faf6ff] px-2.5 py-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Reviews</p>
                  <p className="text-sm font-semibold text-slate-800">{activity.reviews7d}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-800 text-xs font-semibold uppercase tracking-wider">
                Top Products
              </h2>
              <Link href="/all-products" className="text-[#7a3dbf] text-xs font-semibold hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="bg-white rounded-[2.2rem] border border-[#ebd7fa] shadow-sm divide-y divide-slate-100 overflow-hidden">
              {topProducts.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">
                  No paid product sales yet.
                </p>
              ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#faf6ff]">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#7a3dbf]">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                      <p className="text-[11px] text-slate-400">{product.sales} sold</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-800">
                      ₦{Math.round(product.revenue).toLocaleString()}
                    </p>
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
