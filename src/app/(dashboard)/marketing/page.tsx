"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  X,
  TrendingUp,
  AlertOctagon,
  Calendar,
  Send,
  Megaphone,
  CheckCircle,
  Edit,
  ChevronLeft
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from "recharts";

import { cn } from "@/lib/utils";

// Interface definitions
interface CampaignRecord {
  id: string;
  startDate: string;
  name: string;
  platform: "Meta Ads" | "Google Ads" | "Mailchimp" | "Tiktok" | "Instagram";
  spend: number;
  conversions: number;
  roi: number;
  status: "Successful" | "Active" | "Completed" | "Reviewing" | "On Hold";
}

const INITIAL_RECORDS: CampaignRecord[] = [
  {
    id: "#C-9001",
    startDate: "Jun 1, 2023",
    name: "Summer Sale Blitz",
    platform: "Meta Ads",
    spend: 5000,
    conversions: 320,
    roi: 245,
    status: "Successful"
  },
  {
    id: "#C-9002",
    startDate: "Jun 10, 2023",
    name: "Product Launch",
    platform: "Google Ads",
    spend: 8000,
    conversions: 180,
    roi: 125,
    status: "Active"
  },
  {
    id: "#C-9003",
    startDate: "Jun 15, 2023",
    name: "Email Newsletter",
    platform: "Mailchimp",
    spend: 500,
    conversions: 150,
    roi: 400,
    status: "Completed"
  },
  {
    id: "#C-9004",
    startDate: "Jun 20, 2023",
    name: "Tiktok Challenge",
    platform: "Tiktok",
    spend: 1500,
    conversions: 95,
    roi: 130,
    status: "Reviewing"
  },
  {
    id: "#C-9005",
    startDate: "Jun 22, 2023",
    name: "Influencer Collab",
    platform: "Instagram",
    spend: 2000,
    conversions: 210,
    roi: 220,
    status: "On Hold"
  }
];

const CHART_CONVERSION_DATA = [
  { name: "Jan", volume: 65 },
  { name: "Feb", volume: 75 },
  { name: "Mar", volume: 165 },
  { name: "Apr", volume: 95 },
  { name: "May", volume: 35 },
  { name: "Jun", volume: 185 }
];

const STATUS_BADGE_CLASSES = {
  Successful: "bg-green-50 text-green-700 border border-green-200",
  Active: "bg-blue-50 text-blue-700 border border-blue-200",
  Completed: "bg-slate-50 text-slate-500 border border-slate-200",
  Reviewing: "bg-orange-50 text-orange-700 border border-orange-200",
  "On Hold": "bg-yellow-50 text-yellow-700 border border-yellow-200"
};

export default function MarketingPage() {
  const [records, setRecords] = useState<CampaignRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState("");
  
  // Interactive Simulator States
  const [isCtrAlertActive, setIsCtrAlertActive] = useState(true);
  const [isKeywordsTaskActive, setIsKeywordsTaskActive] = useState(true);
  const [isScheduleTaskActive, setIsScheduleTaskActive] = useState(true);

  const [selectedCampaignForAnalysis, setSelectedCampaignForAnalysis] = useState<CampaignRecord | null>(null);
  const [selectedCampaignForEdit, setSelectedCampaignForEdit] = useState<CampaignRecord | null>(null);
  
  const [activeModal, setActiveModal] = useState<"ctr" | "keywords" | "schedule" | null>(null);

  // Modal custom inputs
  const [ctrBidIncrease, setCtrBidIncrease] = useState("15");
  const [keywordsList, setKeywordsList] = useState(["summer", "beach", "discount", "clearance", "sale"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);
  const [socialPostContent, setSocialPostContent] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState("");

  // Edit Campaign Form Inputs
  const [editSpend, setEditSpend] = useState("");
  const [editConversions, setEditConversions] = useState("");
  const [editRoi, setEditRoi] = useState("");
  const [editStatus, setEditStatus] = useState<CampaignRecord["status"]>("Active");

  // Filters logic
  const filtered = records.filter((rec) => {
    return (
      rec.id.toLowerCase().includes(search.toLowerCase()) ||
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.platform.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleResolveCtr = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    setIsCtrAlertActive(false);
    
    // Simulate updating active campaign values (e.g. increase Google Ads spend/metrics slightly)
    setRecords(prev =>
      prev.map(c =>
        c.platform === "Google Ads"
          ? { ...c, spend: c.spend + 1200, roi: c.roi + 15, status: "Successful" }
          : c
      )
    );

    setToastMessage(`Google Ads bid increased by ${ctrBidIncrease}%! CTR alert resolved.`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleUpdateKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    setIsKeywordsTaskActive(false);
    setToastMessage("Campaign keywords updated successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywordsList.includes(newKeyword.trim())) {
      setKeywordsList(prev => [...prev, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywordsList(prev => prev.filter(k => k !== keyword));
  };

  const handleSchedulePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (socialPlatforms.length === 0 || !socialPostContent) return;

    setActiveModal(null);
    setIsScheduleTaskActive(false);
    setSocialPlatforms([]);
    setSocialPostContent("");
    setScheduleDateTime("");

    setToastMessage("Social media campaign posts queued for dispatch!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleTogglePlatform = (plat: string) => {
    setSocialPlatforms(prev =>
      prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]
    );
  };

  const handleOpenEditModal = (camp: CampaignRecord) => {
    setSelectedCampaignForEdit(camp);
    setEditSpend(camp.spend.toString());
    setEditConversions(camp.conversions.toString());
    setEditRoi(camp.roi.toString());
    setEditStatus(camp.status);
  };

  const handleSaveCampaignEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForEdit) return;

    setRecords(prev =>
      prev.map(c =>
        c.id === selectedCampaignForEdit.id
          ? {
              ...c,
              spend: Number(editSpend),
              conversions: Number(editConversions),
              roi: Number(editRoi),
              status: editStatus
            }
          : c
      )
    );

    setSelectedCampaignForEdit(null);
    setToastMessage(`Campaign ${selectedCampaignForEdit.id} successfully updated.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Stats calculation
  const totalAdSpend = records.reduce((sum, c) => sum + c.spend, 0);
  const activeCount = records.filter(c => c.status === "Active").length;

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
        
        {/* Left Card: Campaign Performance Overview (AreaChart & Metric Counters) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-lg font-bold">Campaign Performance Overview</h2>
            <span className="bg-[#f3eafb] text-[#7a3dbf] px-3.5 py-1 rounded-xl text-xs font-bold shadow-sm">
              Past 6 months
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6">
            {/* Monthly Campaign Conversion AreaChart (Strictly Solid, No Gradients) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Monthly Campaign Conversion
              </span>
              
              <div className="w-full h-[180px] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_CONVERSION_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                      formatter={(value: any) => [value, "Conversions"]}
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
              {/* Total Spend */}
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  Total Ad Spend to Date
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  ${totalAdSpend.toLocaleString()}
                </span>
              </div>

              {/* Active Campaigns */}
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Campaigns
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  {activeCount + 4}
                </span>
              </div>

              {/* Average Conversion Rate */}
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Avg. Conversion Rate
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                  3.2%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Marketing Alerts & Tasks */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col justify-between space-y-5">
          <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3">
            Marketing Alerts & Tasks
          </h2>

          <div className="flex-1 divide-y divide-slate-100 flex flex-col justify-around">
            
            {/* Task 1: Resolve flagged transaction */}
            {isCtrAlertActive ? (
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <AlertOctagon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight">Resolve low CTR on Google Ads #112</p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block truncate">Resolve low CTR</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveModal("ctr")}
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 shrink-0"
                >
                  Resolve
                </button>
              </div>
            ) : (
              <div className="py-3 flex items-center gap-3 text-slate-400">
                <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold line-through">Resolve low CTR on Google Ads #112</p>
                  <span className="text-[9px] font-bold text-green-500 mt-0.5 block">Resolved successfully</span>
                </div>
              </div>
            )}

            {/* Task 2: Update Summer Sale keywords */}
            {isKeywordsTaskActive ? (
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0">
                    <Megaphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight">Update campaign keywords for Summer Sale</p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block truncate">Update campaign keywords</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveModal("keywords")}
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 shrink-0"
                >
                  Update
                </button>
              </div>
            ) : (
              <div className="py-3 flex items-center gap-3 text-slate-400">
                <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold line-through">Update keywords for Summer Sale</p>
                  <span className="text-[9px] font-bold text-green-500 mt-0.5 block">Keywords synced</span>
                </div>
              </div>
            )}

            {/* Task 3: Schedule posts */}
            {isScheduleTaskActive ? (
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight">Schedule upcoming social media posts</p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block truncate">social media posts</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveModal("schedule")}
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 shrink-0"
                >
                  Schedule
                </button>
              </div>
            ) : (
              <div className="py-3 flex items-center gap-3 text-slate-400">
                <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold line-through">Schedule upcoming social media posts</p>
                  <span className="text-[9px] font-bold text-green-500 mt-0.5 block">Posts scheduled</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Bottom Card: Marketing Campaign Records */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-[#7a3dbf] text-xl font-bold">Marketing Campaign Records</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search campaigns..."
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Campaign ID</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Spend</th>
                <th className="py-3 px-4">Conversions</th>
                <th className="py-3 px-4">ROI</th>
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
                        onClick={() => setSelectedCampaignForAnalysis(rec)}
                        className="text-blue-500 underline font-bold hover:text-blue-600"
                      >
                        {rec.id}
                      </button>
                    </td>

                    {/* Start Date */}
                    <td className="py-4 px-4 font-medium text-slate-500">{rec.startDate}</td>

                    {/* Campaign Name */}
                    <td className="py-4 px-4 font-bold text-slate-800">{rec.name}</td>

                    {/* Platform */}
                    <td className="py-4 px-4 font-semibold text-slate-500">
                      {rec.platform}
                    </td>

                    {/* Spend */}
                    <td className="py-4 px-4 font-extrabold text-slate-800">
                      ${rec.spend.toLocaleString()}
                    </td>

                    {/* Conversions */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {rec.conversions}
                    </td>

                    {/* ROI */}
                    <td className="py-4 px-4 font-extrabold text-[#7a3dbf]">
                      {rec.roi}%
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
                          onClick={() => setSelectedCampaignForAnalysis(rec)}
                          className="flex items-center gap-1 text-slate-500 hover:text-[#7a3dbf] transition-colors text-xs font-bold active:scale-95"
                        >
                          <TrendingUp size={14} />
                          <span>Analyze</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rec)}
                          className="flex items-center gap-1 text-[#7a3dbf] hover:text-[#612d9c] transition-colors text-xs font-bold active:scale-95"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No marketing campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filtered.length} of {records.length} campaigns
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

      {/* MODAL 1: Resolve Low CTR Alert */}
      {activeModal === "ctr" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleResolveCtr} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-1.5">
                <AlertOctagon className="text-red-500" size={20} />
                <span>Resolve Low CTR (Google Ads #112)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Google Ads conversion rate is currently at 0.8% (Target: &gt;1.5%)</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Increase Keyword Bid Amount (%)</label>
                <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3.5 py-2 text-sm text-slate-800 shadow-sm flex items-center justify-between cursor-pointer">
                  <select
                    value={ctrBidIncrease}
                    onChange={(e) => setCtrBidIncrease(e.target.value)}
                    className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                  >
                    <option value="10">Increase by 10%</option>
                    <option value="15">Increase by 15% (Recommended)</option>
                    <option value="25">Increase by 25% (High Budget)</option>
                    <option value="50">Increase by 50% (Max Exposure)</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none text-slate-500 text-xs">▼</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-[#1565c0] rounded-xl p-3 text-[11px] font-semibold leading-relaxed">
                Applying this bid optimization will update the Google Ads active ad groups and increase spend budget to boost ad ranking in real-time.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Apply Bid & Resolve
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Summer Sale Keywords Editor */}
      {activeModal === "keywords" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleUpdateKeywords} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <Megaphone className="text-[#7a3dbf]" size={18} />
                <span>Summer Sale Keywords Manager</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Add or remove keywords for the active Summer Sale campaign</p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Tag Input block */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. sunscreen, discount"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-4 rounded-xl active:scale-95 transition-all shadow-sm"
                >
                  Add
                </button>
              </div>

              {/* Tag grid list */}
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto border border-slate-100 p-3 bg-slate-50/50 rounded-xl">
                {keywordsList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white border border-[#ebd7fa] text-xs font-bold text-[#7a3dbf] px-2.5 py-1 rounded-lg shadow-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(tag)}
                      className="text-red-400 hover:text-red-600 font-bold p-0.5 rounded"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                type="submit"
                className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                Sync Keywords
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Schedule Posts */}
      {activeModal === "schedule" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleSchedulePost} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <Calendar className="text-[#7a3dbf]" size={18} />
                <span>Schedule Social Campaigns</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Plan and queue promotional content across platforms</p>
            </div>

            <div className="space-y-4 pt-2 text-xs font-semibold text-slate-700">
              {/* Platforms */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Target channels</span>
                <div className="flex gap-2">
                  {["Facebook", "Instagram", "Twitter", "Tiktok"].map((plat) => {
                    const isSelected = socialPlatforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => handleTogglePlatform(plat)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg border font-bold text-center transition-all",
                          isSelected
                            ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Body */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Post description copy</span>
                <textarea
                  rows={3}
                  placeholder="e.g. Summer clear-out starts now! Grab 30% off our bestseller ceramics..."
                  value={socialPostContent}
                  onChange={(e) => setSocialPostContent(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all resize-none"
                  required
                />
              </div>

              {/* Date selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Schedule date & time</span>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all"
                  required
                />
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
                type="submit"
                className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                Schedule Posts
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Campaign Analytics Analyzer */}
      {selectedCampaignForAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedCampaignForAnalysis(null)} />
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-6">
            <button onClick={() => setSelectedCampaignForAnalysis(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-2">
                <Megaphone className="text-[#7a3dbf]" size={20} />
                <span>Campaign Analyzer: {selectedCampaignForAnalysis.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Performance metrics and ROI analysis for ID: {selectedCampaignForAnalysis.id}</p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-3 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ROI Return</span>
                <span className="text-base font-black text-[#7a3dbf] mt-0.5 block">{selectedCampaignForAnalysis.roi}%</span>
              </div>
              <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-3 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Conversions</span>
                <span className="text-base font-black text-slate-800 mt-0.5 block">{selectedCampaignForAnalysis.conversions}</span>
              </div>
              <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-3 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
                <span className="text-base font-black text-slate-800 mt-0.5 block">${selectedCampaignForAnalysis.spend.toLocaleString()}</span>
              </div>
            </div>

            {/* Campaign conversion bar chart simulator */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Daily Conversion Spikes (Mock)</span>
              
              <div className="h-[120px] w-full select-none mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { day: "Mon", count: Math.round(selectedCampaignForAnalysis.conversions / 5) },
                    { day: "Tue", count: Math.round(selectedCampaignForAnalysis.conversions / 4) },
                    { day: "Wed", count: Math.round(selectedCampaignForAnalysis.conversions / 3.5) },
                    { day: "Thu", count: Math.round(selectedCampaignForAnalysis.conversions / 6) },
                    { day: "Fri", count: Math.round(selectedCampaignForAnalysis.conversions / 3) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: "bold" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: "bold" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#7a3dbf"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
              <div className="text-xs font-semibold">
                <span className="text-slate-400">Target Channel: </span>
                <span className="text-slate-800 font-bold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-[10px] uppercase">
                  {selectedCampaignForAnalysis.platform}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaignForAnalysis(null)}
                className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Campaign Editor Form */}
      {selectedCampaignForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedCampaignForEdit(null)} />
          <form onSubmit={handleSaveCampaignEdit} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setSelectedCampaignForEdit(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold">Edit Campaign: {selectedCampaignForEdit.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Edit budget, conversions, and target status</p>
            </div>

            <div className="space-y-4 pt-2 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ad Spend ($)</label>
                  <input
                    type="number"
                    value={editSpend}
                    onChange={(e) => setEditSpend(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Conversions</label>
                  <input
                    type="number"
                    value={editConversions}
                    onChange={(e) => setEditConversions(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ROI (%)</label>
                  <input
                    type="number"
                    value={editRoi}
                    onChange={(e) => setEditRoi(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                  <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs text-slate-800 shadow-sm flex items-center justify-between cursor-pointer">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as CampaignRecord["status"])}
                      className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                    >
                      <option value="Successful">Successful</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                    <div className="absolute right-3.5 pointer-events-none text-slate-500 text-[10px]">▼</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCampaignForEdit(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                Save Edits
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
