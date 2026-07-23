"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Send,
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

import { cn } from "@/lib/utils";

// Interface definitions
interface PaymentRecord {
  id: string;
  dateTime: string;
  gateway: "Stripe" | "PayPal" | "Transfer";
  customerName: string;
  customerAvatar: string;
  amount: number;
  status: "Successful" | "Pending" | "Failed" | "Refunded";
  fee: number;
  net: number;
}

const INITIAL_RECORDS: PaymentRecord[] = [
  {
    id: "#P-5432",
    dateTime: "Jul 12, 2023, 10:15 AM",
    gateway: "Stripe",
    customerName: "Roken Balan",
    customerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roken",
    amount: 245.50,
    status: "Successful",
    fee: 7.37,
    net: 238.13
  },
  {
    id: "#P-5433",
    dateTime: "Jul 12, 2023, 10:15 AM",
    gateway: "PayPal",
    customerName: "Pholles",
    customerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pholles",
    amount: 245.50,
    status: "Pending",
    fee: 9.82,
    net: 235.68
  },
  {
    id: "#P-5434",
    dateTime: "Jul 12, 2023, 10:15 AM",
    gateway: "Transfer",
    customerName: "Roken Balan",
    customerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roken",
    amount: 245.50,
    status: "Failed",
    fee: 0,
    net: 0
  },
  {
    id: "#P-5435",
    dateTime: "Jul 12, 2023, 10:15 AM",
    gateway: "Transfer",
    customerName: "Roken Balan",
    customerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roken",
    amount: 245.50,
    status: "Failed",
    fee: 0,
    net: 0
  },
  {
    id: "#P-5436",
    dateTime: "Jul 12, 2023, 10:15 AM",
    gateway: "Transfer",
    customerName: "Roken Balan",
    customerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roken",
    amount: 245.50,
    status: "Refunded",
    fee: -7.37,
    net: -238.13
  }
];

const CHART_VOLUME_DATA = [
  { name: "Jan", volume: 68 },
  { name: "Feb", volume: 75 },
  { name: "Mar", volume: 120 },
  { name: "Apr", volume: 160 },
  { name: "May", volume: 105 },
  { name: "Jun", volume: 175 }
];

const STATUS_BADGE_CLASSES = {
  Successful: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
  Refunded: "bg-slate-50 text-slate-500 border border-slate-200"
};

export default function PaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState("");
  
  // Interactive Simulator States
  const [isAlertFlaggedActive, setIsAlertFlaggedActive] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [activeModal, setActiveModal] = useState<"resolve" | "methods" | "forecast" | null>(null);

  // Filters logic
  const filtered = records.filter((rec) => {
    return (
      rec.id.toLowerCase().includes(search.toLowerCase()) ||
      rec.customerName.toLowerCase().includes(search.toLowerCase()) ||
      rec.gateway.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleResolveFlaggedTransaction = (approve: boolean) => {
    setActiveModal(null);
    setIsAlertFlaggedActive(false);
    
    if (approve) {
      // Add a simulated record to the table
      const resolvedRecord: PaymentRecord = {
        id: "#P-8942",
        dateTime: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        gateway: "Stripe",
        customerName: "Roken Balan",
        customerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roken",
        amount: 500.00,
        status: "Successful",
        fee: 15.00,
        net: 485.00
      };
      setRecords((prev) => [resolvedRecord, ...prev]);
      setToastMessage("Transaction #8942 Approved & Added to records!");
    } else {
      setToastMessage("Transaction #8942 Flagged & Voided successfully.");
    }
    
    setTimeout(() => setToastMessage(""), 4000);
  };

  const triggerActionMessage = (message: string) => {
    setActiveModal(null);
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Summary & Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Card: Payment Summary (Volume AreaChart & Metric Counters) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-lg font-bold">Payment Summary</h2>
            <span className="bg-[#f3eafb] text-[#7a3dbf] px-3.5 py-1 rounded-xl text-xs font-bold shadow-sm">
              Past 6 months
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6">
            {/* Monthly Transaction Volume AreaChart (Strictly Solid, No Gradients) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Monthly Transaction Volume
              </span>
              
              <div className="w-full h-[180px] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_VOLUME_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                    <XAxis
                      dataKey="name"
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
                      formatter={(value: any) => [value, "Transactions"]}
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

            {/* Metric counters stack */}
            <div className="space-y-3 flex flex-col justify-center">
              {/* Total Revenue */}
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Revenue to Date
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  $25,680
                </span>
              </div>

              {/* Pending Transactions */}
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pending Transactions
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  3
                </span>
              </div>

              {/* Average Transaction Value */}
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Average Transaction Value
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  $102
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Recent Alerts & Tasks */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col justify-between space-y-5">
          <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3">
            Recent Alerts & Tasks
          </h2>

          <div className="flex-1 divide-y divide-slate-100 flex flex-col justify-around">
            
            {/* Task 1: Resolve flagged transaction */}
            {isAlertFlaggedActive ? (
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <AlertOctagon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight">Resolve flagged transaction #8942</p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block truncate">Review suspicious charge</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveModal("resolve")}
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 shrink-0"
                >
                  Resolve
                </button>
              </div>
            ) : (
              <div className="py-3 flex items-center gap-3 text-slate-400">
                <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold line-through">Resolve flagged transaction #8942</p>
                  <span className="text-[9px] font-bold text-green-500 mt-0.5 block">Resolved successfully</span>
                </div>
              </div>
            )}

            {/* Task 2: Update payment methods */}
            <button
              onClick={() => setActiveModal("methods")}
              className="py-3 flex items-center justify-between gap-4 text-left w-full hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0">
                  <CreditCard size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">Update payment methods</p>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block truncate">Manage payout billing info</span>
                </div>
              </div>
              
              <ChevronRight className="text-slate-400" size={16} />
            </button>

            {/* Task 3: View Payout Forecast */}
            <button
              onClick={() => setActiveModal("forecast")}
              className="py-3 flex items-center justify-between gap-4 text-left w-full hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">View next Payout forecast</p>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block truncate">Check net merchant release</span>
                </div>
              </div>
              
              <ChevronRight className="text-slate-400" size={16} />
            </button>

          </div>
        </div>

      </div>

      {/* Bottom Card: Payment Records */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-[#7a3dbf] text-xl font-bold">Payment Records</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-inner"
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
                    "px-2.5 py-1 rounded-lg transition-all",
                    pageSize === size ? "bg-[#7a3dbf] text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* ID */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="text-blue-500 underline font-bold hover:text-blue-600"
                      >
                        {rec.id}
                      </button>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-4 font-medium text-slate-500">{rec.dateTime}</td>

                    {/* Gateway */}
                    <td className="py-4 px-4 font-bold text-slate-800">{rec.gateway}</td>

                    {/* Customer Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                          <Image
                            src={rec.customerAvatar}
                            alt={rec.customerName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-slate-800 font-bold leading-tight">{rec.customerName}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-extrabold text-slate-800">
                      ${rec.amount.toFixed(2)}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold leading-none inline-block shadow-sm border",
                        STATUS_BADGE_CLASSES[rec.status]
                      )}>
                        {rec.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="flex items-center gap-1 text-slate-500 hover:text-[#7a3dbf] transition-colors text-xs font-bold active:scale-95"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setSelectedReceipt(rec)}
                          className="flex items-center gap-1 text-[#7a3dbf] hover:text-[#612d9c] transition-colors text-xs font-bold active:scale-95"
                        >
                          <FileText size={14} />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filtered.length} of {records.length} records
          </p>
          
          <div className="flex items-center gap-1 select-none">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#7a3dbf] text-white shadow-md">
              1
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* MODAL 1: Resolve Flagged Transaction */}
      {activeModal === "resolve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-5">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-1.5">
                <AlertOctagon className="text-red-500" size={20} />
                <span>Resolve Flagged Charge #8942</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Please review this customer charge flagged by fraud shield</p>
            </div>

            <div className="space-y-3 bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name</span>
                <span className="text-slate-800 font-bold">Roken Balan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Charged</span>
                <span className="text-slate-800 font-extrabold text-sm">$500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Card Fingerprint</span>
                <span className="text-slate-800 font-bold">Visa ending in 4242</span>
              </div>
              <div className="border-t border-red-100 pt-2 flex flex-col gap-1">
                <span className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Flag Reason</span>
                <span className="text-slate-600 text-[11px] leading-relaxed">Multiple failed attempts followed by immediate location change. Device fingerprint matches active account history.</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleResolveFlaggedTransaction(false)}
                className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs rounded-xl transition-all active:scale-95"
              >
                Reject & Refund
              </button>
              <button
                type="button"
                onClick={() => handleResolveFlaggedTransaction(true)}
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Approve & Clear Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Billing & Payout Methods */}
      {activeModal === "methods" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <CreditCard className="text-[#7a3dbf]" size={18} />
                <span>Connected Billing Methods</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage the cards and accounts connected to your store</p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Account 1 */}
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs font-semibold bg-[#faf6ff]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-10 bg-white border rounded flex items-center justify-center font-bold text-[#1a1f71] text-[10px] tracking-tighter">
                    VISA
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold">Visa Payout Card (.... 4242)</p>
                    <span className="text-[9px] text-[#7a3dbf] font-bold uppercase tracking-wider mt-0.5 block">Primary Account</span>
                  </div>
                </div>
                <span className="text-green-500 font-bold">Active</span>
              </div>

              {/* Account 2 */}
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs font-semibold hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-10 bg-white border rounded flex items-center justify-center font-bold text-[#eb001b] text-[10px] tracking-tighter">
                    MC
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold">Mastercard Backup (.... 8890)</p>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block">Expiry: 12/28</span>
                  </div>
                </div>
                <button
                  onClick={() => triggerActionMessage("Backup account set as primary payout.")}
                  className="text-xs font-bold text-[#7a3dbf] hover:underline"
                >
                  Set Primary
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => triggerActionMessage("Redirecting to banking setup link...")}
                className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Payout Forecast */}
      {activeModal === "forecast" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <TrendingUp className="text-[#7a3dbf]" size={18} />
                <span>Next Payout Forecast</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Estimated payout based on current settled volume</p>
            </div>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Date</span>
                <span className="text-slate-800 font-bold">Aug 01, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Sales</span>
                <span className="text-slate-800 font-bold">$12,450.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processing Fees</span>
                <span className="text-red-500 font-bold">-$373.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reserve Held</span>
                <span className="text-slate-800 font-bold">$0.00</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between items-baseline">
                <span className="text-[#7a3dbf] font-bold">Net Payout Transfer</span>
                <span className="text-[#7a3dbf] font-black text-base">$12,076.50</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Payment Record Detail View */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedRecord(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setSelectedRecord(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold">Transaction Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">Metadata dump for Payment ID: {selectedRecord.id}</p>
            </div>

            <div className="space-y-3 bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID</span>
                <span className="text-slate-800 font-bold">{selectedRecord.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway Processor</span>
                <span className="text-slate-800 font-bold">{selectedRecord.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp</span>
                <span className="text-slate-850 font-bold">{selectedRecord.dateTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span className="text-slate-800 font-bold">{selectedRecord.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Charge</span>
                <span className="text-slate-800 font-extrabold">${selectedRecord.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processing Fee</span>
                <span className="text-red-500 font-bold">-${selectedRecord.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-400">Net Merchant Settlement</span>
                <span className="text-[#7a3dbf] font-black">${selectedRecord.net.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border leading-none", STATUS_BADGE_CLASSES[selectedRecord.status])}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Receipt Generator Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedReceipt(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border-4 border-double border-slate-200 font-mono space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header info */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <span className="font-extrabold text-sm block tracking-widest text-slate-800">ASTLINK MARKETPLACE</span>
              <p className="text-[10px] text-slate-400 font-semibold">Lekki Phase 1, Lagos, Nigeria</p>
              <p className="text-[9px] text-slate-400 font-semibold">Receipt ID: {selectedReceipt.id}-RPT</p>
            </div>

            {/* Invoice Table list */}
            <div className="text-[11px] space-y-2 text-slate-700 font-bold">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold border-b border-slate-200 pb-1">
                <span>ITEM DESCRIPTION</span>
                <span>TOTAL</span>
              </div>
              
              <div className="flex justify-between">
                <span>Checkout Purchase - Gross Vol</span>
                <span>${selectedReceipt.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Processing Fee ({selectedReceipt.gateway})</span>
                <span>-${selectedReceipt.fee.toFixed(2)}</span>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5 text-slate-800 font-extrabold">
                <div className="flex justify-between text-xs font-black">
                  <span>NET SETTLED</span>
                  <span>${selectedReceipt.net.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>PAYMENT METHOD</span>
                  <span>{selectedReceipt.gateway} API</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>TIMESTAMP</span>
                  <span>{selectedReceipt.dateTime}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>CUSTOMER</span>
                  <span>{selectedReceipt.customerName}</span>
                </div>
              </div>
            </div>

            {/* Footer barcode/thank you */}
            <div className="text-center pt-4 border-t border-dashed border-slate-300 space-y-3">
              <p className="text-[10px] text-slate-500 font-bold tracking-wider">THANK YOU FOR YOUR TRANSACTION!</p>
              
              {/* Mock Barcode */}
              <div className="bg-slate-200 h-10 w-44 mx-auto flex items-center justify-center relative select-none">
                <div className="absolute inset-0 flex items-center justify-around opacity-60">
                  <div className="w-1.5 h-full bg-slate-900" />
                  <div className="w-0.5 h-full bg-slate-900" />
                  <div className="w-2 h-full bg-slate-900" />
                  <div className="w-1 h-full bg-slate-900" />
                  <div className="w-0.5 h-full bg-slate-900" />
                  <div className="w-1.5 h-full bg-slate-900" />
                  <div className="w-1 h-full bg-slate-900" />
                  <div className="w-2.5 h-full bg-slate-900" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2 font-sans">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
              >
                Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
