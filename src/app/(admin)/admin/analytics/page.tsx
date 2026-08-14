"use client";

import { Loader2, DollarSign, TrendingUp, Percent, ShoppingBag, Users, Store } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { useAdminAnalytics } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#7a3dbf]" />
        <p className="text-sm font-bold text-slate-400">Aggregating platform analytics...</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-semibold">
        Could not load platform analytics. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Marketplace Intelligence
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Platform Revenue & Metrics</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Holistic insights into marketplace turnover, take rate commissions, and user base growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-700 font-bold text-xs">
            <TrendingUp size={16} />
            <span>30-Day Growth: +{data.growth30d}%</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Gross Merchandise Value (GMV)"
          value={formatPrice(data.gmv)}
          icon={<DollarSign size={20} />}
          variant="purple"
          badgeText={`+${data.growth30d}% 30d`}
          badgeType="success"
          subtitle="Total customer order payments"
        />

        <StatCard
          title="Marketplace Take Revenue"
          value={formatPrice(data.take)}
          icon={<TrendingUp size={20} />}
          variant="emerald"
          badgeText="Net Earned"
          badgeType="success"
          subtitle="Platform commission & processing"
        />

        <StatCard
          title="Take Rate Efficiency"
          value={`${data.takeRate}%`}
          icon={<Percent size={20} />}
          variant="amber"
          badgeText="Effective Fee"
          badgeType="warning"
          subtitle="Average marketplace cut"
        />

        <StatCard
          title="Total Orders Processed"
          value={data.orders.toLocaleString()}
          icon={<ShoppingBag size={20} />}
          variant="blue"
          badgeText="Completed"
          badgeType="info"
          subtitle="Global marketplace transactions"
        />

        <StatCard
          title="Active Buyers"
          value={data.buyers.toLocaleString()}
          icon={<Users size={20} />}
          variant="purple"
          badgeText="Customer Base"
          badgeType="neutral"
          subtitle="Registered consumer accounts"
        />

        <StatCard
          title="Active Sellers / Merchants"
          value={data.sellers.toLocaleString()}
          icon={<Store size={20} />}
          variant="emerald"
          badgeText="Store Network"
          badgeType="success"
          subtitle="Approved merchant stores"
        />
      </div>

      {/* ── Charts Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">GMV Timeline & Distribution</h3>
              <p className="text-xs text-slate-400 font-medium">Daily gross volume processed</p>
            </div>
            <span className="text-xs font-bold text-[#7a3dbf] bg-[#f3eafb] px-3 py-1 rounded-lg">
              30-Day Curve
            </span>
          </div>
          <div className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a3dbf" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7a3dbf" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3eafb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "#ebd7fa" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "#ebd7fa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "1rem",
                    border: "1px solid #ebd7fa",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(val) => [formatPrice(Number(val)), "GMV"]}
                />
                <Area type="monotone" dataKey="gmv" stroke="#7a3dbf" strokeWidth={3} fill="url(#gmvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Volume Comparison Bars</h3>
              <p className="text-xs text-slate-400 font-medium">Periodic volume distribution</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              Volume by Period
            </span>
          </div>
          <div className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3eafb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "#ebd7fa" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={{ stroke: "#ebd7fa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "1rem",
                    border: "1px solid #ebd7fa",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(val) => [formatPrice(Number(val)), "GMV"]}
                />
                <Bar dataKey="gmv" fill="#7a3dbf" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
