"use client";

import { useState } from "react";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  Search,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import { cn } from "@/lib/utils";

// Timeframe telemetry mocks
const TELEMETRY_DATA = {
  today: {
    revenue: 125000,
    revenueChange: "+8.4%",
    visitors: 850,
    visitorsChange: "+12.1%",
    orders: 45,
    ordersChange: "+5.3%",
    conversion: "5.29%",
    conversionChange: "+0.4%",
    chartRevenue: [
      { name: "9 AM", value: 12000 },
      { name: "11 AM", value: 25000 },
      { name: "1 PM", value: 18000 },
      { name: "3 PM", value: 35000 },
      { name: "5 PM", value: 45000 },
      { name: "7 PM", value: 38000 },
      { name: "9 PM", value: 50000 }
    ],
    chartTraffic: [
      { name: "9 AM", visitors: 80 },
      { name: "11 AM", visitors: 140 },
      { name: "1 PM", visitors: 110 },
      { name: "3 PM", visitors: 190 },
      { name: "5 PM", visitors: 220 },
      { name: "7 PM", visitors: 180 },
      { name: "9 PM", visitors: 250 }
    ]
  },
  "7days": {
    revenue: 980000,
    revenueChange: "+11.2%",
    visitors: 4500,
    visitorsChange: "+8.9%",
    orders: 310,
    ordersChange: "+14.2%",
    conversion: "6.88%",
    conversionChange: "+1.2%",
    chartRevenue: [
      { name: "Mon", value: 110000 },
      { name: "Tue", value: 140000 },
      { name: "Wed", value: 125000 },
      { name: "Thu", value: 180000 },
      { name: "Fri", value: 220000 },
      { name: "Sat", value: 165000 },
      { name: "Sun", value: 190000 }
    ],
    chartTraffic: [
      { name: "Mon", visitors: 580 },
      { name: "Tue", visitors: 710 },
      { name: "Wed", visitors: 620 },
      { name: "Thu", visitors: 890 },
      { name: "Fri", visitors: 980 },
      { name: "Sat", visitors: 750 },
      { name: "Sun", visitors: 880 }
    ]
  },
  "30days": {
    revenue: 4250000,
    revenueChange: "+14.8%",
    visitors: 18450,
    visitorsChange: "+9.2%",
    orders: 1420,
    ordersChange: "+10.5%",
    conversion: "7.69%",
    conversionChange: "+1.9%",
    chartRevenue: [
      { name: "Wk 1", value: 920000 },
      { name: "Wk 2", value: 1150000 },
      { name: "Wk 3", value: 1080000 },
      { name: "Wk 4", value: 1350000 }
    ],
    chartTraffic: [
      { name: "Wk 1", visitors: 4200 },
      { name: "Wk 2", visitors: 5100 },
      { name: "Wk 3", visitors: 4800 },
      { name: "Wk 4", visitors: 5900 }
    ]
  }
};

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  conversion: string;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
}

const PRODUCTS_PERFORMANCE: ProductPerformance[] = [
  {
    name: "Highlander Men's Chronograph",
    sales: 120,
    revenue: 5880000,
    conversion: "4.2%",
    stockStatus: "In Stock"
  },
  {
    name: "Premium Wireless Mouse",
    sales: 98,
    revenue: 490000,
    conversion: "5.1%",
    stockStatus: "Low Stock"
  },
  {
    name: 'Samsung 65" 4K Smart TV',
    sales: 45,
    revenue: 13050000,
    conversion: "3.2%",
    stockStatus: "In Stock"
  },
  {
    name: "Noise Cancelling Headphones",
    sales: 74,
    revenue: 1850000,
    conversion: "4.8%",
    stockStatus: "In Stock"
  },
  {
    name: "Mechanical Keyboard RGB",
    sales: 0,
    revenue: 0,
    conversion: "0.0%",
    stockStatus: "Out of Stock"
  }
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<"today" | "7days" | "30days">("7days");
  const [search, setSearch] = useState("");
  const [liveViewers, setLiveViewers] = useState(14);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeData = TELEMETRY_DATA[timeframe];

  // Refresh live shoppers simulator
  const handleRefreshLiveViewers = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLiveViewers(Math.floor(8 + Math.random() * 12));
      setIsRefreshing(false);
    }, 800);
  };

  const filteredProducts = PRODUCTS_PERFORMANCE.filter(prod =>
    prod.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Timeframe selector header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebd7fa] pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "Last 7 Days" },
            { id: "30days", label: "Last 30 Days" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as "today" | "7days" | "30days")}
              className={cn(
                "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border",
                timeframe === t.id
                  ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Last updated: <strong className="text-slate-600">Just now</strong>
        </span>
      </div>

      {/* Telemetry Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales Revenue */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <DollarSign className="text-[#7a3dbf]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sales Revenue</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              ₦{activeData.revenue.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-green-500 flex items-center mt-0.5">
              <TrendingUp size={12} className="mr-0.5" /> {activeData.revenueChange} vs last period
            </span>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
            <Users className="text-[#1565c0]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unique Visitors</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              {activeData.visitors.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-green-500 flex items-center mt-0.5">
              <TrendingUp size={12} className="mr-0.5" /> {activeData.visitorsChange} vs last period
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <ShoppingCart className="text-[#2e7d32]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              {activeData.orders}
            </span>
            <span className="text-[10px] font-bold text-green-500 flex items-center mt-0.5">
              <TrendingUp size={12} className="mr-0.5" /> {activeData.ordersChange} vs last period
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#fff3e0] flex items-center justify-center shrink-0">
            <Activity className="text-[#e65100]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              {activeData.conversion}
            </span>
            <span className="text-[10px] font-bold text-green-500 flex items-center mt-0.5">
              <TrendingUp size={12} className="mr-0.5" /> {activeData.conversionChange} vs last period
            </span>
          </div>
        </div>

      </div>

      {/* Primary Performance Graphs section (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Revenue Performance AreaChart (Strictly Solid colors) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-base font-bold">Revenue Timeline Performance</h2>
            <span className="text-xs font-bold text-[#7a3dbf] bg-[#f3eafb] px-3.5 py-0.5 rounded-lg border border-[#ebd7fa]">
              Sales Trend (₦)
            </span>
          </div>

          <div className="h-[200px] select-none w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData.chartRevenue} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                  tickFormatter={(val) => `₦${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ebd7fa",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#1e293b",
                  }}
                  formatter={(value: any) => [`₦${Number(value || 0).toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7a3dbf"
                  strokeWidth={3}
                  fill="#7a3dbf"
                  fillOpacity={0.08}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Traffic BarChart (Solid Blue/Purple bars) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-base font-bold">Storefront Traffic Telemetry</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-0.5 rounded-lg border border-blue-200">
              Unique Visitors
            </span>
          </div>

          <div className="h-[200px] select-none w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData.chartTraffic} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ebd7fa",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#1e293b",
                  }}
                  formatter={(value: any) => [value, "Visitors"]}
                />
                <Bar
                  dataKey="visitors"
                  fill="#1565c0"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Products list & acquisition & live viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column (Spans 2): Top Performing Products */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-slate-800 text-lg font-bold">Top Performing Products</h2>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-center">Conversion</th>
                  <th className="py-2.5 px-3">Total Income</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-800">{prod.name}</td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-slate-800">{prod.sales}</td>
                      <td className="py-3.5 px-3 text-center text-blue-600 font-bold">{prod.conversion}</td>
                      <td className="py-3.5 px-3 font-extrabold text-[#7a3dbf]">₦{prod.revenue.toLocaleString()}</td>
                      <td className="py-3.5 px-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                          prod.stockStatus === "In Stock" && "bg-green-50 text-green-700 border-green-200",
                          prod.stockStatus === "Low Stock" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          prod.stockStatus === "Out of Stock" && "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {prod.stockStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No matching products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Acquisition Channels & Live Viewers Simulator */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Live Viewers Simulator */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 block">Live Storefront Traffic</span>
              <button
                type="button"
                onClick={handleRefreshLiveViewers}
                className={cn(
                  "p-1.5 rounded-lg border border-[#ebd7fa] text-[#7a3dbf] hover:bg-[#faf6ff] transition-all active:scale-95",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-bold text-slate-800">
                <strong className="text-red-500 text-base">{liveViewers}</strong> shoppers currently active on store
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active page paths</span>
              
              <div className="space-y-1.5 text-[10px] font-bold text-slate-600">
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="truncate">/products/wireless-mouse</span>
                  <span className="text-[#7a3dbf] shrink-0 font-extrabold">{Math.round(liveViewers * 0.4)} browsing</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="truncate">/products/chronograph-watch</span>
                  <span className="text-[#7a3dbf] shrink-0 font-extrabold">{Math.round(liveViewers * 0.3)} browsing</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="truncate">/cart</span>
                  <span className="text-[#7a3dbf] shrink-0 font-extrabold">{Math.round(liveViewers * 0.2)} in-cart</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acquisition Channels Progress Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4 flex-1 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-3">Acquisition Channels</span>
            
            <div className="space-y-3 flex-1 flex flex-col justify-around">
              {/* Organic Search */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Organic Search</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7a3dbf] h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              {/* Direct Traffic */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Direct Traffic</span>
                  <span>35%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "35%" }} />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Social Referrals</span>
                  <span>12%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-600 h-full rounded-full" style={{ width: "12%" }} />
                </div>
              </div>

              {/* Email Campaigns */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Email Newsletters</span>
                  <span>8%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "8%" }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
