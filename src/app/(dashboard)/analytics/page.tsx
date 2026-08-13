"use client";

import { useState } from "react";
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { cn, formatPrice } from "@/lib/utils";
import { useSellerAnalytics } from "@/hooks/use-inbox";

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7days", label: "Last 7 Days" },
  { id: "30days", label: "Last 30 Days" },
  { id: "1year", label: "Last Year" },
] as const;

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<(typeof RANGES)[number]["id"]>("7days");
  const { data, isLoading, isError } = useSellerAnalytics(timeframe);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ebd7fa] pb-4">
        {RANGES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTimeframe(t.id)}
            className={cn(
              "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl border",
              timeframe === t.id ? "bg-[#7a3dbf] text-white border-[#7a3dbf]" : "bg-white text-slate-500 border-slate-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
      )}
      {isError && <p className="text-rose-600 font-semibold">Could not load analytics.</p>}
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, label: "Sales Revenue", value: formatPrice(data.revenue), change: data.revenueChange },
              { icon: Users, label: "Unique Visitors", value: String(data.visitors), change: data.visitorsChange },
              { icon: ShoppingCart, label: "Orders", value: String(data.orders), change: data.ordersChange },
              { icon: Activity, label: "Conversion Rate", value: `${data.conversion}%`, change: data.conversionChange },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
                  <card.icon className="text-[#7a3dbf]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                  <span className="text-xl font-extrabold text-slate-800 block">{card.value}</span>
                  <span className="text-[10px] font-bold text-green-500 flex items-center mt-0.5">
                    <TrendingUp size={12} className="mr-0.5" /> {card.change} vs last period
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
              <h2 className="text-slate-800 text-base font-bold">Revenue Timeline</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebd7fa" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#7a3dbf" fill="#f3eafb" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
              <h2 className="text-slate-800 text-base font-bold">Store Traffic</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartTraffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebd7fa" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#7a3dbf" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
