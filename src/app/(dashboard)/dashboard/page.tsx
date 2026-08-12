"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  ShoppingBag,
  Receipt,
  Boxes,
  Users,
  Package,
  TrendingUp,
  Truck,
  Wallet,
  ChevronRight,
  Plus,
  Minus,
  Clock,
  Sparkles,
  Download,
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
import headphonesImg from "@/assets/headphones.png";

export default function DashboardPage() {
  // Chart period state
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "1y">("30d");

  // Chart data variants
  const chartDataMap = {
    "7d": [
      { name: "Mon", value: 35000 },
      { name: "Tue", value: 42000 },
      { name: "Wed", value: 38000 },
      { name: "Thu", value: 65000 },
      { name: "Fri", value: 72000 },
      { name: "Sat", value: 85000 },
      { name: "Sun", value: 91000 },
    ],
    "30d": [
      { name: "May 8", value: 20000 },
      { name: "May 11", value: 30000 },
      { name: "May 15", value: 25000 },
      { name: "May 18", value: 50000 },
      { name: "May 22", value: 70000 },
      { name: "May 25", value: 45000 },
      { name: "May 29", value: 60000 },
      { name: "Jun 1", value: 78000 },
      { name: "Jun 5", value: 55000 },
      { name: "Jun 8", value: 82000 },
      { name: "Jun 10", value: 70000 },
    ],
    "1y": [
      { name: "Jan", value: 180000 },
      { name: "Feb", value: 240000 },
      { name: "Mar", value: 310000 },
      { name: "Apr", value: 290000 },
      { name: "May", value: 450000 },
      { name: "Jun", value: 520000 },
      { name: "Jul", value: 610000 },
      { name: "Aug", value: 780000 },
    ],
  };

  // Filter tab for orders
  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered">("All");

  // Orders list state
  const [orders, setOrders] = useState([
    {
      id: "ord-1",
      title: "Highlander Men's Chronograph Watch",
      sku: "SKU: HLC-CHR-001",
      price: 49000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&auto=format",
      status: "Processing" as const,
      delivery: "Same Day: Jun 4-24",
    },
    {
      id: "ord-2",
      title: 'Samsung 65" 4K Crystal UHD Smart TV',
      sku: "SKU: SAM-65-4K",
      price: 290000,
      quantity: 3,
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300&auto=format",
      status: "Processing" as const,
      delivery: "Express: Jun 4-24",
    },
    {
      id: "ord-3",
      title: 'Apple MacBook Pro 16" M3 Max - Space Black',
      sku: "SKU: APP-MBP-16",
      price: 1850000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format",
      status: "Shipped" as const,
      delivery: "Standard: Jun 2-18",
    },
    {
      id: "ord-4",
      title: "Nike Air Max 270 React Sneakers",
      sku: "SKU: NKE-AM270-W",
      price: 75000,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format",
      status: "Delivered" as const,
      delivery: "Delivered: Jun 1",
    },
  ]);

  // Quantity control
  const handleQuantityChange = (id: string, delta: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return { ...o, quantity: Math.max(1, o.quantity + delta) };
        }
        return o;
      })
    );
  };

  // Countdown timer for Hot Deals
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "All") return true;
    return o.status === orderFilter;
  });

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
          value="1,248"
          icon={<ShoppingBag size={18} />}
          badgeText="18.6%"
          badgeIcon={<TrendingUp size={11} />}
          variant="purple"
        />

        <StatCard
          title="Total Sales"
          value="₦2,450,000"
          icon={<Receipt size={18} />}
          badgeText="24.8%"
          badgeIcon={<TrendingUp size={11} />}
          variant="emerald"
        />

        <StatCard
          title="Total Customers"
          value="856"
          icon={<Users size={18} />}
          badgeText="15.7%"
          badgeIcon={<TrendingUp size={11} />}
          variant="blue"
        />

        <StatCard
          title="Total Products"
          value="320"
          icon={<Boxes size={18} />}
          badgeText="9.3%"
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
                        <Image
                          src={order.image}
                          alt={order.title}
                          fill
                          className="object-cover"
                        />
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

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => handleQuantityChange(order.id, -1)}
                          className="px-2.5 py-1.5 text-slate-500 hover:bg-purple-50 hover:text-[#7a3dbf] font-semibold text-xs border-r border-slate-200 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3.5 py-1 text-slate-800 font-semibold text-xs">
                          {order.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(order.id, 1)}
                          className="px-2.5 py-1.5 text-slate-500 hover:bg-purple-50 hover:text-[#7a3dbf] font-semibold text-xs border-l border-slate-200 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

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
                <AreaChart data={chartDataMap[timeframe]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

            {/* Stats Row */}
            {/* <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center">
              <div className="p-2 rounded-xl bg-[#faf6ff]/60 border border-[#ebd7fa]/40">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Visitors</p>
                <p className="text-sm sm:text-base font-semibold text-slate-800 mt-0.5">12,540</p>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                  <TrendingUp size={10} /> 12.5%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#faf6ff]/60 border border-[#ebd7fa]/40">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Orders</p>
                <p className="text-sm sm:text-base font-semibold text-slate-800 mt-0.5">1,248</p>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                  <TrendingUp size={10} /> 18.6%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#faf6ff]/60 border border-[#ebd7fa]/40">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</p>
                <p className="text-sm sm:text-base font-semibold text-slate-800 mt-0.5">₦2.45M</p>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                  <TrendingUp size={10} /> 24.8%
                </span>
              </div>
            </div> */}
          </div>

          {/* Hot Deals Banner */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#7a3dbf]" />
                Hot Deals & Promotions
              </h2>
              <Link href="/products?deals=true" className="text-[#7a3dbf] text-xs font-semibold hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight size={13} />
              </Link>
            </div>
            
            <div className="relative bg-gradient-to-br from-[#7a3dbf] via-[#682fad] to-[#52237a] rounded-[2.2rem] p-6 shadow-xl text-white flex items-center justify-between overflow-hidden min-h-[195px] group">
              {/* Animated glow effects */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-start justify-center max-w-[58%] z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/30 text-yellow-300 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md">
                  <Clock size={11} />
                  <span>Ends in {formatTime(timeLeft.hours)}h:{formatTime(timeLeft.minutes)}m:{formatTime(timeLeft.seconds)}s</span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight">
                    Big Savings on Top Products
                  </h3>
                  <p className="text-purple-200 text-xs font-medium mt-1">
                    Boost sales with featured discounts up to 40% Off!
                  </p>
                </div>

                <Link
                  href="/products?deals=true"
                  className="bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-semibold text-xs rounded-full px-5 py-2.5 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Shop Deals</span>
                  <ShoppingCart size={14} />
                </Link>
              </div>

              {/* Headphones Product Image */}
              <div className="absolute right-1 bottom-1 w-[155px] h-[175px] z-10 pointer-events-none">
                <Image
                  src={headphonesImg}
                  alt="Hot deals headphones"
                  fill
                  className="object-contain transform rotate-[-6deg] group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
