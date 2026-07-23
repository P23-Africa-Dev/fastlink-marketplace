"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Mail,
  Truck,
  Wallet,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import headphonesImg from "@/assets/headphones.png";

export default function DashboardPage() {
  const chartData = [
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
    { name: "Jun 10", value: 70000 }
  ];

  const [orders, setOrders] = useState([
    {
      id: "ord-1",
      title: "Highlander Men's Chronograph",
      sku: "SKU: HLC-CHR-001",
      price: 49000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=200&auto=format",
      status: "Processing",
      delivery: "Same Day: Jun 4-24"
    },
    {
      id: "ord-2",
      title: 'Samsung 65" 4K Smart TV',
      sku: "SKU: SAM-65-4K",
      price: 290000,
      quantity: 3,
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200&auto=format",
      status: "Processing",
      delivery: "Same Day: Jun 4-24"
    }
  ]);

  const handleQuantityChange = (id: string, delta: number) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === id) {
          return { ...o, quantity: Math.max(1, o.quantity + delta) };
        }
        return o;
      })
    );
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Total Orders */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <ShoppingCart className="text-[#7a3dbf]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total Orders</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">1,248</span>
              <span className="text-[11px] sm:text-xs font-bold text-green-500 flex items-center shrink-0">
                <TrendingUp size={12} className="mr-0.5" /> 18.6%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">vs last month</p>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <Wallet className="text-[#2e7d32]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total Sales</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">₦2,450,000</span>
              <span className="text-[11px] sm:text-xs font-bold text-green-500 flex items-center shrink-0">
                <TrendingUp size={12} className="mr-0.5" /> 24.8%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">vs last month</p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
            <Users className="text-[#1565c0]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total Customers</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">856</span>
              <span className="text-[11px] sm:text-xs font-bold text-green-500 flex items-center shrink-0">
                <TrendingUp size={12} className="mr-0.5" /> 15.7%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">vs last month</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#fff3e0] flex items-center justify-center shrink-0">
            <Package className="text-[#e65100]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total Products</p>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">320</span>
              <span className="text-[11px] sm:text-xs font-bold text-green-500 flex items-center shrink-0">
                <TrendingUp size={12} className="mr-0.5" /> 9.3%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">vs last month</p>
          </div>
        </div>

      </div>

      {/* Main Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Column: Recent Orders & Newsletter */}
        <div className="space-y-8">
          
          {/* Recent Orders Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#7a3dbf] text-lg font-bold">Recent Orders</h2>
              <Link href="/orders" className="text-[#7a3dbf] text-sm font-bold hover:underline flex items-center gap-0.5">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-100 shadow-sm">
                      <Image
                        src={order.image}
                        alt={order.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-bold text-sm sm:text-base leading-snug">{order.title}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">{order.sku}</p>
                      <div className="flex items-center gap-1.5 text-[#7a3dbf] font-semibold text-xs mt-1.5">
                        <Truck size={14} />
                        <span>{order.delivery}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-slate-800 font-extrabold text-sm sm:text-base">
                      ₦{order.price.toLocaleString()}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(order.id, -1)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 font-bold text-sm border-r border-slate-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-slate-800 font-semibold text-sm">
                        {order.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(order.id, 1)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 font-bold text-sm border-l border-slate-200 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <span className="bg-[#ebd7fa] text-[#7a3dbf] px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-[#7a3dbf] flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25">
              <Mail className="text-white" size={26} />
            </div>
            <div className="flex-1 w-full">
              <p className="text-slate-800 font-bold text-sm md:text-base mb-3 text-center md:text-left">
                Subscribe to our Newsletter and stay updated with First Link.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full">
                <input
                  type="email"
                  placeholder="Your valid email"
                  className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column: Analytics & Hot Deals */}
        <div className="space-y-8">
          
          {/* Analytics Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#7a3dbf] text-lg font-bold">Analytics Overview</h2>
              <Link href="/dashboard/analytics" className="text-[#7a3dbf] text-sm font-bold hover:underline">
                View Report
              </Link>
            </div>

            {/* Recharts AreaChart representation */}
            <div className="w-full h-[180px] mt-4 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    ticks={["May 8", "May 15", "May 22", "May 29", "Jun 5"]}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                    dy={10}
                  />
                  <YAxis hide={true} domain={[0, 90000]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ebd7fa",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#1e293b",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => label || "Date"}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="#7a3dbf"
                    strokeWidth={3}
                    fill="#7a3dbf"
                    fillOpacity={0.08}
                    dot={{ r: 4.5, fill: "#7a3dbf", stroke: "white", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#7a3dbf", stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Visitors</p>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">12,540</p>
                <span className="text-[10px] font-bold text-green-500">↑ 12.5%</span>
              </div>
              <div className="border-x border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Orders</p>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">1,248</p>
                <span className="text-[10px] font-bold text-green-500">↑ 18.6%</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</p>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">₦2.45M</p>
                <span className="text-[10px] font-bold text-green-500">↑ 24.8%</span>
              </div>
            </div>
          </div>

          {/* Hot Deals Banner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-800 text-sm font-bold uppercase tracking-wider">Hot Deals</h2>
              <Link href="/products?deals=true" className="text-[#7a3dbf] text-xs font-bold hover:underline uppercase tracking-wider">
                View All
              </Link>
            </div>
            
            <div className="bg-[#7a3dbf] rounded-[2rem] p-6 shadow-lg text-white flex items-center justify-between relative overflow-hidden h-[180px] hover:shadow-xl transition-all duration-200">
              {/* Decorative sparkle shapes in background */}
              <div className="absolute top-8 left-1/3 opacity-30 select-none pointer-events-none">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-yellow-300">
                  <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
                </svg>
              </div>
              
              <div className="flex flex-col items-start justify-center max-w-[60%] z-10">
                <h3 className="text-lg font-extrabold leading-snug">Big Savings on Top Products</h3>
                <p className="text-purple-200 text-xs font-semibold mt-1">Up to 40% Off</p>
                <Link
                  href="/products?deals=true"
                  className="bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-bold text-xs rounded-full px-5 py-2 mt-4 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  Shop Now
                  <ShoppingCart size={13} />
                </Link>
              </div>

              {/* Headphones Image */}
              <div className="absolute right-2 bottom-0 w-[150px] h-[160px] z-10">
                <Image
                  src={headphonesImg}
                  alt="Hot deals headphones"
                  fill
                  className="object-contain transform rotate-[-5deg] hover:scale-105 transition-all duration-300"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
