"use client";

import { useState } from "react";
import {
  Search,
  Download,
  CreditCard,
  CheckCircle,
  Building,
  Wallet,
  TrendingUp,
  X,
  Send,
  HelpCircle,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import { cn } from "@/lib/utils";

interface PayoutRecord {
  id: string;
  bankName: string;
  accountNum: string;
  transferDate: string;
  status: "Transferred" | "Processing" | "Failed";
  amount: number;
}

const INITIAL_PAYOUTS: PayoutRecord[] = [
  {
    id: "#PAY-9801",
    bankName: "Zenith Bank PLC",
    accountNum: "•••• 4820",
    transferDate: "May 25, 2026",
    status: "Transferred",
    amount: 850000
  },
  {
    id: "#PAY-9802",
    bankName: "Zenith Bank PLC",
    accountNum: "•••• 4820",
    transferDate: "May 18, 2026",
    status: "Transferred",
    amount: 1200000
  },
  {
    id: "#PAY-9803",
    bankName: "Access Bank",
    accountNum: "•••• 9911",
    transferDate: "May 11, 2026",
    status: "Transferred",
    amount: 950000
  },
  {
    id: "#PAY-9804",
    bankName: "Zenith Bank PLC",
    accountNum: "•••• 4820",
    transferDate: "May 4, 2026",
    status: "Transferred",
    amount: 1100000
  },
  {
    id: "#PAY-9805",
    bankName: "GTBank",
    accountNum: "•••• 3051",
    transferDate: "Apr 27, 2026",
    status: "Failed",
    amount: 450000
  }
];

const HISTORICAL_PAYOUTS_DATA = [
  { month: "Jan", amount: 3800000 },
  { month: "Feb", amount: 4200000 },
  { month: "Mar", amount: 3500000 },
  { month: "Apr", amount: 5100000 },
  { month: "May", amount: 4100000 }
];

const STATUS_BADGE_CLASSES = {
  Transferred: "bg-green-50 text-green-700 border border-green-200",
  Processing: "bg-blue-50 text-blue-700 border border-blue-200",
  Failed: "bg-red-50 text-red-700 border border-red-200"
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [availableBalance, setAvailableBalance] = useState(1248500);
  const [heldBalance] = useState(120000);
  const [totalPayoutsToDate, setTotalPayoutsToDate] = useState(14890200);

  const [search, setSearch] = useState("");
  const [activeModal, setActiveModal] = useState<"instant" | "bank" | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Instant Payout inputs
  const [instantBank, setInstantBank] = useState("Zenith Bank PLC (•••• 4820)");
  const [instantAmount, setInstantAmount] = useState("");

  // Bank Manager inputs
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleInstantPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawValue = Number(instantAmount);
    
    if (isNaN(withdrawValue) || withdrawValue <= 0) {
      triggerToast("Please enter a valid transfer amount.");
      return;
    }
    
    if (withdrawValue > availableBalance) {
      triggerToast("Insufficient available balance.");
      return;
    }

    const fee = Math.round(withdrawValue * 0.01);
    const netWithdraw = withdrawValue - fee;

    // Update state
    setAvailableBalance(prev => prev - withdrawValue);
    setTotalPayoutsToDate(prev => prev + netWithdraw);

    // Add new pending record
    const newRecord: PayoutRecord = {
      id: `#PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      bankName: instantBank.split(" (")[0],
      accountNum: instantBank.includes("••••") ? "•••• " + instantBank.split("•••• ")[1]?.replace(")", "") : "•••• 4820",
      transferDate: "Today (Just now)",
      status: "Processing",
      amount: netWithdraw
    };

    setPayouts(prev => [newRecord, ...prev]);
    setActiveModal(null);
    setInstantAmount("");
    triggerToast(`Instant payout of ₦${netWithdraw.toLocaleString()} processed! (Fee: ₦${fee.toLocaleString()})`);
  };

  const handleLinkBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !holderName) {
      triggerToast("All bank fields are required.");
      return;
    }
    setActiveModal(null);
    setBankName("");
    setAccountNumber("");
    setHolderName("");
    triggerToast(`Successfully linked ${bankName} account!`);
  };

  // Filter records
  const filtered = payouts.filter(rec =>
    rec.id.toLowerCase().includes(search.toLowerCase()) ||
    rec.bankName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Telemetry Financial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Available Balance */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <Wallet className="text-[#7a3dbf]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              ₦{availableBalance.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Cleared for settlement</span>
          </div>
        </div>

        {/* Next Scheduled Payout */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
            <Clock className="text-[#1565c0]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Payout</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              ₦450,000
            </span>
            <span className="text-[10px] font-bold text-blue-500 block mt-0.5">Scheduled: June 2, 2026</span>
          </div>
        </div>

        {/* Total Settled */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <CheckCircle className="text-[#2e7d32]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Payouts to Date</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              ₦{totalPayoutsToDate.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-green-500 flex items-center mt-0.5">
              <TrendingUp size={12} className="mr-0.5" /> 100% Settled
            </span>
          </div>
        </div>

        {/* Reserve Hold */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#fff3e0] flex items-center justify-center shrink-0">
            <HelpCircle className="text-[#e65100]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reserve / Hold</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              ₦{heldBalance.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Safety reserve buffer</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Chart & Settlement Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column (Spans 2): Payout Monthly BarChart */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-lg font-bold">Monthly Bank Settlement Volume</h2>
            <span className="bg-[#f3eafb] text-[#7a3dbf] px-3.5 py-1 rounded-xl text-xs font-bold shadow-sm">
              Past 5 months
            </span>
          </div>

          <div className="h-[240px] select-none w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_PAYOUTS_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: "bold" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                  tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`}
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
                  formatter={(value: any) => [`₦${Number(value || 0).toLocaleString()}`, "Settled"]}
                />
                <Bar
                  dataKey="amount"
                  fill="#7a3dbf"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Settlement Controls & Bank details */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3 mb-4">
              Payout Control Actions
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Withdraw cleared earnings instantly to linked banks or manage auto-settlements.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setActiveModal("instant")}
              className="w-full bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Send size={15} />
              <span>Request Instant Payout</span>
            </button>

            <button
              onClick={() => setActiveModal("bank")}
              className="w-full bg-white border border-[#ebd7fa] hover:bg-[#faf6ff] text-[#7a3dbf] font-bold text-sm py-3 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard size={15} />
              <span>Link Bank Account</span>
            </button>
          </div>

          <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Settlement Account</span>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
                <Building size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">Zenith Bank PLC</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Account: •••• 4820 (Savings)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bank Settlements Log Table */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-[#7a3dbf] text-xl font-bold">Bank Settlements Log</h2>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search settlements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Settlement Bank</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Transfer Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 text-[#7a3dbf] font-bold">{rec.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{rec.bankName}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">{rec.accountNum}</td>
                    <td className="py-4 px-4 text-slate-400 font-medium">{rec.transferDate}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold leading-none inline-block shadow-sm border",
                        STATUS_BADGE_CLASSES[rec.status]
                      )}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-800">
                      ₦{rec.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => triggerToast(`Financial Settlement Statement ${rec.id} downloaded.`)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#7a3dbf] transition-all active:scale-95 inline-flex"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No settlement records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Request Instant Payout */}
      {activeModal === "instant" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleInstantPayoutSubmit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-1.5">
                <Wallet className="text-[#7a3dbf]" size={20} />
                <span>Request Instant Payout</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Transfer cleared available funds to your linked bank immediately.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Target Account</label>
                <select
                  value={instantBank}
                  onChange={(e) => setInstantBank(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="Zenith Bank PLC (•••• 4820)">Zenith Bank PLC (•••• 4820)</option>
                  <option value="Access Bank (•••• 9911)">Access Bank (•••• 9911)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Withdrawal Amount (Available: ₦{availableBalance.toLocaleString()})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={instantAmount}
                  onChange={(e) => setInstantAmount(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none"
                  max={availableBalance}
                  required
                />
              </div>

              {instantAmount && Number(instantAmount) > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-semibold text-slate-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Gross Settlement:</span>
                    <strong className="text-slate-800">₦{Number(instantAmount).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Instant fee (1.0%):</span>
                    <strong>- ₦{Math.round(Number(instantAmount) * 0.01).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-[#7a3dbf] font-bold">
                    <span>Net Transfer:</span>
                    <span>₦{(Number(instantAmount) - Math.round(Number(instantAmount) * 0.01)).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Request Transfer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Link Bank Account */}
      {activeModal === "bank" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleLinkBankSubmit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-1.5">
                <CreditCard className="text-[#7a3dbf]" size={20} />
                <span>Link Bank Account</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Add a new bank account to receive automated settlements.</p>
            </div>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                  required
                >
                  <option value="">-- Choose Partner Bank --</option>
                  <option value="Zenith Bank PLC">Zenith Bank PLC</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank">GTBank</option>
                  <option value="United Bank for Africa">United Bank for Africa</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Number (10 digits)</label>
                <input
                  type="text"
                  placeholder="e.g. 0122904810"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="e.g. ROKEN BALAN CO."
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Link Account
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
