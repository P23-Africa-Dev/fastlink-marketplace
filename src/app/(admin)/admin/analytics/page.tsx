"use client";

import { Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { useAdminAnalytics } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>;
  }
  if (isError || !data) {
    return <p className="font-semibold text-rose-600">Could not load analytics.</p>;
  }

  const cards = [
    { label: "GMV", value: formatPrice(data.gmv) },
    { label: "Take", value: formatPrice(data.take) },
    { label: "Take rate", value: `${data.takeRate}%` },
    { label: "Orders", value: String(data.orders) },
    { label: "Buyers", value: String(data.buyers) },
    { label: "Sellers", value: String(data.sellers) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9a6b1f]">Marketplace</p>
        <h1 className="text-3xl font-black text-[#14081c]">Platform analytics</h1>
        <p className="text-xs text-slate-400 mt-1">30-day growth {data.growth30d}%</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl bg-white border border-[#e3d4f0] p-5">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="text-2xl font-black text-[#14081c] mt-2">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl bg-white border border-[#e3d4f0] p-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3d4f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="gmv" fill="#d4a24c" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
