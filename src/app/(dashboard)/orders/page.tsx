"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { cn } from "@/lib/utils";

const WEEKLY_DATA = [
  { day: "Mon", volume: 60 },
  { day: "Tue", volume: 130 },
  { day: "Wed", volume: 80 },
  { day: "Thu", volume: 150 },
  { day: "Fri", volume: 110 },
  { day: "Sat", volume: 170 },
  { day: "Sun", volume: 105 }
];

const TRAFFIC_DATA = [
  { name: "Organic", value: 45, color: "#2196f3" },
  { name: "Paid Social", value: 35, color: "#7a3dbf" },
  { name: "Direct Email", value: 20, color: "#94a3b8" }
];

const INITIAL_ORDERS = [
  {
    id: "#C-1001",
    date: "Jun 25, 2023, 11:30 AM",
    customerName: "John Doe",
    address: "123 Maple St",
    amount: 180.00,
    status: "Successful"
  },
  {
    id: "#O-1002",
    date: "Jun 26, 2023, 09:15 AM",
    customerName: "Sarah Chen",
    address: "456 Oak Ave",
    amount: 225.50,
    status: "Pending"
  },
  {
    id: "#C-1003",
    date: "Jun 26, 2023, 02:45 PM",
    customerName: "Michael Brown",
    address: "789 Pine Rd",
    amount: 99.99,
    status: "Shipped"
  },
  {
    id: "#C-1004",
    date: "Jun 27, 2023, 10:00 AM",
    customerName: "David Lee",
    address: "101 Cedar Ln",
    amount: 315.75,
    status: "Delivered"
  },
  {
    id: "#C-1005",
    date: "Jun 28, 2023, 08:30 AM",
    customerName: "Emily Wong",
    address: "202 Elm Ct",
    amount: 210.00,
    status: "Refunded"
  }
];

const STATUS_STYLES: Record<string, string> = {
  Successful: "bg-green-100 text-green-700 border border-green-200",
  Pending: "bg-orange-100 text-orange-700 border border-orange-200",
  Shipped: "bg-blue-100 text-blue-700 border border-blue-200",
  Delivered: "bg-purple-100 text-purple-700 border border-purple-200",
  Refunded: "bg-slate-100 text-slate-600 border border-slate-200"
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Filter orders
  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditStatus = (id: string) => {
    // Simple state toggling to prove interactivity
    setOrders(prev =>
      prev.map(o => {
        if (o.id === id) {
          const statuses = ["Successful", "Pending", "Shipped", "Delivered", "Refunded"];
          const currentIndex = statuses.indexOf(o.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return { ...o, status: statuses[nextIndex] };
        }
        return o;
      })
    );
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
      
      {/* Top Section - Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Overall Order Overview */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-slate-800 text-lg font-bold">Overall Order Overview</h2>
            <button className="bg-[#f3eafb] text-[#7a3dbf] hover:bg-[#ebd7fa] transition-colors rounded-xl px-4 py-1.5 text-xs font-bold shadow-sm">
              Past 6 months
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Weekly Order Volume Graph */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-sm font-bold">Weekly Order Volume</span>
                <span className="text-[#7a3dbf] text-xs font-bold bg-[#f3eafb] px-2.5 py-1 rounded-lg">Past 6 months</span>
              </div>
              
              <div className="w-full h-[180px] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                      domain={[0, 200]}
                      ticks={[0, 50, 100, 150, 200]}
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [value, "Orders"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#7a3dbf"
                      strokeWidth={3}
                      fill="#7a3dbf"
                      fillOpacity={0.08}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Order Metrics stack */}
            <div className="space-y-3 flex flex-col justify-center">
              <span className="text-slate-700 text-sm font-bold mb-1">Key Order Metrics</span>
              
              {/* Total Orders */}
              <div className="bg-[#f4ebfc] rounded-xl p-3 border border-[#ebd7fa] shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">2,845</p>
              </div>

              {/* Pending Orders */}
              <div className="bg-[#f4ebfc] rounded-xl p-3 border border-[#ebd7fa] shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Orders</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">14</p>
              </div>

              {/* Average Order Value */}
              <div className="bg-[#f4ebfc] rounded-xl p-3 border border-[#ebd7fa] shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Order Value</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">$118.30</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Card: Order Traffic Sources */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-slate-800 text-lg font-bold">Order Traffic Sources</h2>
          </div>

          <div className="space-y-3">
            <span className="text-slate-700 text-sm font-bold">Top 3 Traffic Sources</span>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Donut Chart */}
              <div className="w-[120px] h-[120px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TRAFFIC_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={54}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {TRAFFIC_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Traffic List */}
              <div className="flex-1 w-full space-y-1.5">
                {TRAFFIC_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section - Detailed Order Records */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-[#7a3dbf] text-xl font-bold">Detailed Order Records</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all"
              />
            </div>

            {/* Page Size Dropdown */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
              <span>Show:</span>
              {[10, 25, 50].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    pageSize === size ? "bg-[#7a3dbf] text-white" : "hover:bg-slate-100"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Shipping Address</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Link styled ID */}
                    <td className="py-4 px-4">
                      <Link href="#" className="text-blue-500 underline hover:text-blue-600">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-500">{order.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{order.customerName}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">{order.address}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-800">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn("px-3.5 py-1 rounded-full text-xs font-bold shadow-sm", STATUS_STYLES[order.status])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-4">
                        <button className="flex items-center gap-1 text-slate-500 hover:text-[#7a3dbf] transition-colors text-xs font-bold">
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleEditStatus(order.id)}
                          className="flex items-center gap-1 text-[#7a3dbf] hover:text-[#612d9c] transition-colors text-xs font-bold"
                        >
                          <Edit2 size={13} />
                          <span>Edit Status</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No orders found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filteredOrders.length} of {orders.length} records
          </p>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className={cn("h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors", "bg-[#7a3dbf] text-white shadow-md")}>
              1
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
