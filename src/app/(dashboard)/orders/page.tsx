"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  MoreVertical,
  CheckCircle2,
  X,
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
  Cell,
} from "recharts";

import { useOrdersStore, Order } from "@/store/orders-store";
import { Pagination } from "@/components/dashboard/pagination";
import { cn } from "@/lib/utils";

const WEEKLY_DATA = [
  { day: "Mon", volume: 60 },
  { day: "Tue", volume: 130 },
  { day: "Wed", volume: 80 },
  { day: "Thu", volume: 150 },
  { day: "Fri", volume: 110 },
  { day: "Sat", volume: 170 },
  { day: "Sun", volume: 105 },
];

const TRAFFIC_DATA = [
  { name: "Organic Search", value: 45, color: "#2196f3" },
  { name: "Paid Social", value: 35, color: "#7a3dbf" },
  { name: "Direct Email", value: 20, color: "#94a3b8" },
];

const STATUS_STYLES: Record<string, string> = {
  Successful: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-purple-50 text-purple-700 border-purple-200",
  Refunded: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DashboardOrdersPage() {
  const { orders, updateOrderStatus } = useOrdersStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Active dropdown row ID state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Status Change Modal state
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Order["status"]>("Successful");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Open modal for specific order
  const handleOpenStatusModal = (order: Order) => {
    setTargetOrder(order);
    setSelectedStatus(order.status);
    setOpenDropdownId(null);
  };

  // Submit modal status update
  const handleConfirmStatusUpdate = () => {
    if (targetOrder) {
      updateOrderStatus(targetOrder.id, selectedStatus);
      setToastMessage(`Order ${targetOrder.id} status updated to "${selectedStatus}"`);
      setShowToast(true);
      setTargetOrder(null);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans pb-8">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-emerald-200 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── Top Section - Analytics Cards ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Overall Order Overview */}
        <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-slate-800 text-base sm:text-lg font-semibold">Overall Order Overview</h2>
              <p className="text-slate-400 text-xs font-normal">Order volume telemetry and key performance metrics</p>
            </div>
            <button className="bg-[#f3eafb] text-[#7a3dbf] hover:bg-[#ebd7fa] transition-colors rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-sm">
              Past 6 months
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Weekly Order Volume Graph */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs sm:text-sm font-semibold">Weekly Order Volume</span>
                <span className="text-[#7a3dbf] text-[11px] font-semibold bg-[#f3eafb] px-2.5 py-0.5 rounded-lg">
                  Past 6 months
                </span>
              </div>
              
              <div className="w-full h-[185px] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="orderVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7a3dbf" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#7a3dbf" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "600" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "600" }}
                      domain={[0, 200]}
                      ticks={[0, 50, 100, 150, 200]}
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
                      formatter={(value: any) => [value, "Orders"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#7a3dbf"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#orderVolumeGradient)"
                      dot={{ r: 4, fill: "#7a3dbf", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#7a3dbf", stroke: "#ffffff", strokeWidth: 2.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Order Metrics stack */}
            <div className="space-y-3 flex flex-col justify-center">
              <span className="text-slate-700 text-xs sm:text-sm font-semibold mb-1">Key Order Metrics</span>
              
              <div className="bg-[#faf6ff] rounded-2xl p-3 border border-[#ebd7fa] shadow-sm hover:border-purple-300 transition-colors">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
                <div className="flex items-baseline justify-between mt-0.5">
                  <p className="text-lg font-semibold text-slate-800">2,845</p>
                  <span className="text-[10px] font-semibold text-emerald-600">+12.4%</span>
                </div>
              </div>

              <div className="bg-[#faf6ff] rounded-2xl p-3 border border-[#ebd7fa] shadow-sm hover:border-purple-300 transition-colors">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</p>
                <div className="flex items-baseline justify-between mt-0.5">
                  <p className="text-lg font-semibold text-slate-800">14</p>
                  <span className="text-[10px] font-semibold text-amber-600">Requires Action</span>
                </div>
              </div>

              <div className="bg-[#faf6ff] rounded-2xl p-3 border border-[#ebd7fa] shadow-sm hover:border-purple-300 transition-colors">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average Order Value</p>
                <div className="flex items-baseline justify-between mt-0.5">
                  <p className="text-lg font-semibold text-slate-800">₦118,300</p>
                  <span className="text-[10px] font-semibold text-emerald-600">+5.2%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Card: Order Traffic Sources */}
        <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col justify-between hover:shadow-md transition-all">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-slate-800 text-base sm:text-lg font-semibold">Order Traffic Sources</h2>
              <p className="text-slate-400 text-xs font-normal">Customer acquisition breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-slate-700 text-xs sm:text-sm font-semibold">Top 3 Acquisition Channels</span>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="w-[130px] h-[130px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TRAFFIC_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {TRAFFIC_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xs font-semibold text-slate-800">100%</span>
                  <span className="text-[9px] font-normal text-slate-400">Total</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2.5">
                {TRAFFIC_DATA.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="shrink-0">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Section - Detailed Order Records ─────────────────── */}
      <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Card Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-[#7a3dbf] text-xl font-semibold tracking-tight">Detailed Order Records</h2>
            <p className="text-slate-400 text-xs font-normal mt-0.5">Filter, search, and edit order status records</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search Order ID, Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all"
              />
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
              <span className="hidden sm:inline">Show:</span>
              {[10, 25, 50].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border transition-colors",
                    pageSize === size
                      ? "bg-[#7a3dbf] text-white border-[#7a3dbf]"
                      : "bg-[#faf6ff] border-[#ebd7fa] text-slate-600 hover:bg-[#f3eafb]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Export CSV Button Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            {["All", "Successful", "Pending", "Shipped", "Delivered", "Refunded"].map((status) => {
              const count = statusCounts[status] || 0;
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 border",
                    isActive
                      ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-sm"
                      : "bg-[#faf6ff] text-slate-600 border-[#ebd7fa] hover:bg-[#f3eafb]"
                  )}
                >
                  <span className="whitespace-nowrap">{status === "All" ? "All Orders" : status}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                      isActive ? "bg-white/25 text-white" : "bg-[#ebd7fa] text-[#7a3dbf]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Export CSV Button (Placed on Table Control Bar) */}
          <button
            onClick={() => alert("Exporting order records to CSV...")}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#faf6ff] hover:bg-[#f3eafb] text-[#7a3dbf] border border-[#ebd7fa] text-xs font-semibold transition-all active:scale-95 shrink-0"
          >
            <Download size={15} />
            <span className="whitespace-nowrap">Export CSV</span>
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto select-none rounded-2xl border border-slate-100" ref={dropdownRef}>
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#faf6ff] border-b border-[#ebd7fa] text-[11px] font-semibold uppercase tracking-wider text-[#7a3dbf]">
                <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Date & Time</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Customer Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Shipping Address</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-normal text-slate-700">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const isDropdownOpen = openDropdownId === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-[#faf6ff]/50 transition-colors">
                      {/* Order ID */}
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#7a3dbf]">
                        <Link href={`/orders/${order.rawId}`} className="hover:underline flex items-center gap-1">
                          <span>{order.id}</span>
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap font-normal text-slate-500 text-xs sm:text-sm">
                        {order.date}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#f3eafb] text-[#7a3dbf] font-semibold text-xs flex items-center justify-center shrink-0">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                              {order.customerName}
                            </p>
                            <p className="text-[11px] font-normal text-slate-400 whitespace-nowrap">{order.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Shipping Address */}
                      <td className="py-4 px-4 whitespace-nowrap font-normal text-slate-500 text-xs sm:text-sm">
                        {order.address}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-800">
                        ₦{order.amount.toLocaleString()}
                      </td>

                      {/* Status Pill */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold shadow-sm border inline-block whitespace-nowrap", STATUS_STYLES[order.status])}>
                          {order.status}
                        </span>
                      </td>

                      {/* Actions Ellipsis Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap text-center relative">
                        <div className="inline-block text-left relative">
                          <button
                            onClick={() => setOpenDropdownId(isDropdownOpen ? null : order.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-[#7a3dbf] hover:bg-[#f3eafb] transition-all focus:outline-none"
                            aria-label="Order actions"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Menu */}
                          {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-[#ebd7fa] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-left">
                              <Link
                                href={`/orders/${order.rawId}`}
                                onClick={() => setOpenDropdownId(null)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#faf6ff] hover:text-[#7a3dbf] transition-colors whitespace-nowrap"
                              >
                                <Eye size={15} />
                                <span>View Details</span>
                              </Link>
                              
                              <button
                                onClick={() => handleOpenStatusModal(order)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#faf6ff] hover:text-[#7a3dbf] transition-colors whitespace-nowrap"
                              >
                                <Edit2 size={14} />
                                <span>Change Status</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium whitespace-nowrap">
                    No orders found matching your search query or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Functional Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50]}
          itemName="orders"
        />

      </div>

      {/* Change Status Modal */}
      {targetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setTargetOrder(null)}
          />
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-900 text-base font-semibold">Update Order Status</h3>
              <button
                onClick={() => setTargetOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-500 text-xs font-normal leading-relaxed">
              Select a new status for order <strong className="text-slate-800">{targetOrder.id}</strong>:
            </p>

            <div className="space-y-2">
              {(["Successful", "Pending", "Shipped", "Delivered", "Refunded"] as const).map((status) => (
                <label
                  key={status}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all text-xs font-semibold",
                    selectedStatus === status
                      ? "bg-[#faf6ff] border-[#7a3dbf] text-[#7a3dbf] shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="accent-[#7a3dbf]"
                    />
                    <span>{status}</span>
                  </div>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold border", STATUS_STYLES[status])}>
                    {status}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTargetOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-600/20"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
