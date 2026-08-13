"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Trash2,
  Mail,
  Users,
  UserPlus,
  UserCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Sparkles,
  TrendingUp,
  Eye
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { cn } from "@/lib/utils";
import { useSellerCustomers } from "@/hooks/use-dashboard";
import { formatOrderDate } from "@/lib/order-map";
import type { SellerCustomer } from "@/types/seller";

const ACQUISITION_DATA = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 65 },
  { month: "Mar", count: 80 },
  { month: "Apr", count: 120 },
  { month: "May", count: 142 }
];

const SEGMENTS_DATA = [
  { name: "Active", value: 65, color: "#7a3dbf" },
  { name: "New", value: 15, color: "#10b981" },
  { name: "Dormant", value: 12, color: "#f59e0b" },
  { name: "VIP", value: 8, color: "#3b82f6" }
];

const INITIAL_CUSTOMERS = [
  {
    id: "#C-2001",
    name: "David Miller",
    email: "david.m@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    orders: 15,
    spent: 780000,
    status: "Active",
    joinDate: "Jan 12, 2024",
    tier: "VIP",
    phone: "+234 809 123 4567",
    address: "Lagos, Nigeria",
    notes: "High spending client. Prefers premium accessories and electronics.",
    preferredCategory: "Electronics"
  },
  {
    id: "#C-2002",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    orders: 12,
    spent: 620000,
    status: "Active",
    joinDate: "Feb 05, 2024",
    tier: "Gold",
    phone: "+234 812 345 6789",
    address: "Abuja, Nigeria",
    notes: "Frequently orders watches. Responds well to holiday promotions.",
    preferredCategory: "Watches"
  },
  {
    id: "#C-2003",
    name: "James Wilson",
    email: "james.w@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    orders: 8,
    spent: 290000,
    status: "Inactive",
    joinDate: "Feb 28, 2024",
    tier: "Silver",
    phone: "+234 701 987 6543",
    address: "Port Harcourt, Nigeria",
    notes: "Inactive for the last 30 days. Needs re-engagement discount.",
    preferredCategory: "Footwear"
  },
  {
    id: "#C-2004",
    name: "Olivia Thompson",
    email: "olivia.t@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    orders: 22,
    spent: 1450000,
    status: "Active",
    joinDate: "Mar 10, 2024",
    tier: "VIP",
    phone: "+234 905 444 3322",
    address: "Ibadan, Nigeria",
    notes: "Top VIP shopper. Orders luxury smart TVs and screens.",
    preferredCategory: "Monitors"
  },
  {
    id: "#C-2005",
    name: "Liam Johnson",
    email: "liam.j@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    orders: 4,
    spent: 120000,
    status: "Active",
    joinDate: "Mar 22, 2024",
    tier: "Bronze",
    phone: "+234 803 222 1100",
    address: "Kano, Nigeria",
    notes: "New account. Primarily buys essentials.",
    preferredCategory: "Essentials"
  }
];

const INITIAL_CAMPAIGNS = [
  {
    id: "camp-1",
    title: "VIP Weekend Spotlight",
    description: "Enjoy exclusive early access to the Highlander Men's Chronograph watch collection and 15% off base prices.",
    ctaText: "Shop VIP Collection",
    targetTier: "VIP",
    bgColor: "#7a3dbf",
    status: "Active",
    clicks: 128,
    conversions: 32
  },
  {
    id: "camp-2",
    title: "Welcome Aboard Promo",
    description: "Get ₦5,000 flat discount on your first order of electronics or devices of ₦50,000 and above.",
    ctaText: "Claim Welcome Coupon",
    targetTier: "Bronze",
    bgColor: "#10b981",
    status: "Active",
    clicks: 94,
    conversions: 18
  }
];

const TIER_COLORS: Record<string, string> = {
  VIP: "text-blue-600 bg-blue-50 border-blue-200",
  Gold: "text-amber-600 bg-amber-50 border-amber-200",
  Silver: "text-slate-500 bg-slate-50 border-slate-200",
  Bronze: "text-orange-600 bg-orange-50 border-orange-200"
};

const BG_COLORS = [
  { name: "Brand Purple", hex: "#7a3dbf" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Ocean Blue", hex: "#3b82f6" },
  { name: "Coral Orange", hex: "#f97316" },
  { name: "Amber Gold", hex: "#f59e0b" },
  { name: "Dark Slate", hex: "#1e293b" }
];

function toDirectoryCustomer(row: SellerCustomer) {
  return {
    id: `#C-${row.id}`,
    rawId: row.id,
    name: row.name,
    email: row.email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.name)}`,
    orders: row.orders,
    spent: row.spent,
    status: row.status,
    joinDate: formatOrderDate(row.joinDate),
    tier: row.tier,
    phone: row.phone || "—",
    address: row.address || "—",
    notes: "Customer from store orders.",
    preferredCategory: row.preferredCategory || "—",
  };
}

export default function CustomersPage() {
  const { data: customerPage } = useSellerCustomers();
  const customers = (customerPage?.data ?? []).map(toDirectoryCustomer);
  const [activeTab, setActiveTab] = useState<"directory" | "campaigns">("directory");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  
  // Modals / Detail drawer states
  const [selectedCustomer, setSelectedCustomer] = useState<ReturnType<typeof toDirectoryCustomer> | null>(null);
  const [drawerCustomer, setDrawerCustomer] = useState<ReturnType<typeof toDirectoryCustomer> | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  
  // Add Customer modal states
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTier, setNewTier] = useState("Bronze");

  // Campaigns states
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [campaignHeadline, setCampaignHeadline] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [campaignCta, setCampaignCta] = useState("Shop Now");
  const [campaignBg, setCampaignBg] = useState("#7a3dbf");
  const [campaignTarget, setCampaignTarget] = useState("All");

  // Filters
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    const matchesTier =
      tierFilter === "All" || c.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleDelete = () => {
    setToastMessage("Customers come from orders and cannot be deleted.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    // Trigger mock success toast
    setToastMessage(`Email successfully sent to ${selectedCustomer.name}!`);
    setTimeout(() => setToastMessage(""), 4000);

    // Reset composer
    setSelectedCustomer(null);
    setEmailSubject("");
    setEmailBody("");
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(false);
    setToastMessage("Customers appear automatically after they place an order.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Launch Campaign Creative
  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignHeadline || !campaignDescription) return;

    const newCamp = {
      id: `camp-${campaigns.length + 1}`,
      title: campaignHeadline,
      description: campaignDescription,
      ctaText: campaignCta,
      targetTier: campaignTarget,
      bgColor: campaignBg,
      status: "Active",
      clicks: 0,
      conversions: 0
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    setCampaignHeadline("");
    setCampaignDescription("");
    setCampaignCta("Shop Now");
    setCampaignBg("#7a3dbf");
    setCampaignTarget("All");

    setToastMessage("Loyalty Campaign Creative Launched!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSaveNotes = () => {
    if (!drawerCustomer) return;
    setDrawerCustomer((prev) => (prev ? { ...prev, notes: customerNotes } : null));
    setToastMessage("Customer internal notes updated.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleOpenDrawer = (customer: ReturnType<typeof toDirectoryCustomer>) => {
    setDrawerCustomer(customer);
    setCustomerNotes(customer.notes);
  };

  const handleToggleCampaign = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Paused" : "Active" } : c)
    );
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  // Metrics calculations
  const totalSpend = customers.reduce((sum, c) => sum + c.spent, 0);
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const vipCount = customers.filter((c) => c.tier === "VIP").length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold">Customer Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track shopper stats, engagement, and creative marketing campaigns</p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
        >
          <UserPlus size={16} />
          Add Customer
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Customers */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <Users className="text-[#7a3dbf]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total Customers</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{customers.length}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 18.6% vs last month</span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <UserCheck className="text-[#2e7d32]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Active Customers</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{activeCount + 951}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 12.3% vs last month</span>
          </div>
        </div>

        {/* VIP Spenders */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
            <Award className="text-[#1565c0]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">VIP Customers</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{vipCount + 82}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 5.7% vs last month</span>
          </div>
        </div>

        {/* Total Value Contributed */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#fff3e0] flex items-center justify-center shrink-0">
            <Users className="text-[#e65100]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Value Contributed</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">₦{(totalSpend + 3260000).toLocaleString()}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 24.8% vs last month</span>
          </div>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("directory")}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all",
            activeTab === "directory"
              ? "border-[#7a3dbf] text-[#7a3dbf]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Customer Directory & Analytics
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "campaigns"
              ? "border-[#7a3dbf] text-[#7a3dbf]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          <Sparkles size={16} />
          Loyalty Campaigns & Creatives
        </button>
      </div>

      {/* CONDITIONAL TAB 1: Directory & Analytics */}
      {activeTab === "directory" && (
        <div className="space-y-8">
          {/* Middle Section - Creative Analytics (No Gradients) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Customer Acquisition (BarChart) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-slate-800 text-lg font-bold">Acquisition Traffic</h2>
                <span className="text-[#7a3dbf] text-xs font-bold bg-[#f3eafb] px-3 py-1 rounded-lg">Monthly Cohort</span>
              </div>

              <div className="w-full h-[200px] select-none mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ACQUISITION_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                      dy={8}
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
                      cursor={{ fill: "#fbf8ff" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#7a3dbf"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Card: Segment Breakdown (PieChart) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-slate-800 text-lg font-bold">Customer Segments</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2">
                {/* Donut Chart */}
                <div className="w-[130px] h-[130px] shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SEGMENTS_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={54}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {SEGMENTS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Solid Color Legend List */}
                <div className="flex-1 w-full space-y-2">
                  {SEGMENTS_DATA.map((item) => (
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

          {/* Detailed Customer Table */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
            
            {/* Controls Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-[#7a3dbf] text-xl font-bold">Customer Directory</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-sm"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-full px-4 py-2 text-xs font-bold text-slate-700 shadow-sm flex items-center justify-between min-w-[120px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none">▼</div>
                </div>

                {/* Tier Filter */}
                <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-full px-4 py-2 text-xs font-bold text-slate-700 shadow-sm flex items-center justify-between min-w-[120px]">
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                  >
                    <option value="All">All Tiers</option>
                    <option value="VIP">VIP</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none">▼</div>
                </div>
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Join Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                  {filtered.length > 0 ? (
                    filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* ID Link to open detail drawer */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleOpenDrawer(c)}
                            className="text-blue-500 underline font-bold hover:text-blue-600 text-left"
                          >
                            {c.id}
                          </button>
                        </td>

                        {/* Customer Identity */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                              <Image
                                src={c.avatar}
                                alt={c.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <button
                                onClick={() => handleOpenDrawer(c)}
                                className="text-slate-800 font-bold leading-tight hover:underline text-left block"
                              >
                                {c.name}
                              </button>
                              <p className="text-slate-400 text-xs mt-0.5">{c.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-4 px-4">
                          <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold border", TIER_COLORS[c.tier])}>
                            {c.tier}
                          </span>
                        </td>

                        {/* Orders count */}
                        <td className="py-4 px-4 font-bold text-slate-800">{c.orders}</td>

                        {/* Total Spent */}
                        <td className="py-4 px-4 font-extrabold text-slate-800">
                          ₦{c.spent.toLocaleString()}
                        </td>

                        {/* Status badge */}
                        <td className="py-4 px-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            c.status === "Active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          )}>
                            {c.status}
                          </span>
                        </td>

                        {/* Join Date */}
                        <td className="py-4 px-4 font-medium text-slate-500">{c.joinDate}</td>

                        {/* Action buttons */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => handleOpenDrawer(c)}
                              className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90 flex items-center justify-center"
                              title="View Customer Profile"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90 flex items-center justify-center"
                              title="Send Email"
                            >
                              <Mail size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete()}
                              className="p-2 border border-slate-200 hover:border-red-500 rounded-lg text-slate-400 hover:text-red-500 transition-all bg-white shadow-sm active:scale-90"
                              title="Delete Customer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No customers found matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Directory Footer / Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400">
                Showing {filtered.length} of {customers.length} records
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
        </div>
      )}

      {/* CONDITIONAL TAB 2: Loyalty Campaigns & Ad Creatives */}
      {activeTab === "campaigns" && (
        <div className="space-y-8 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
            
            {/* Left: Campaign Creative Form */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
              <div>
                <h2 className="text-[#7a3dbf] text-lg font-bold">Campaign Designer</h2>
                <p className="text-slate-400 text-xs mt-0.5">Design a visual advertising creative for segment targeting</p>
              </div>

              <form onSubmit={handleLaunchCampaign} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Creative Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Clearance Bonanza!"
                    value={campaignHeadline}
                    onChange={(e) => setCampaignHeadline(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Campaign Description</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Enjoy up to 40% discount on all luxury watches and screens. Exclusive deal only."
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-medium resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Button CTA Text</label>
                    <input
                      type="text"
                      value={campaignCta}
                      onChange={(e) => setCampaignCta(e.target.value)}
                      className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target Segment Tier</label>
                    <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 shadow-sm flex items-center justify-between cursor-pointer">
                      <select
                        value={campaignTarget}
                        onChange={(e) => setCampaignTarget(e.target.value)}
                        className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                      >
                        <option value="All">All Tiers</option>
                        <option value="VIP">VIP Only</option>
                        <option value="Gold">Gold Only</option>
                        <option value="Silver">Silver Only</option>
                        <option value="Bronze">Bronze Only</option>
                      </select>
                      <div className="absolute right-4 pointer-events-none text-slate-500">▼</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Solid Theme Color</label>
                  <div className="flex flex-wrap gap-2.5">
                    {BG_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setCampaignBg(color.hex)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold border transition-all text-white active:scale-95 shadow-sm",
                          campaignBg === color.hex ? "ring-2 ring-purple-600 ring-offset-2 scale-105" : "opacity-85 hover:opacity-100"
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Launch Campaign Creative
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Live Graphic Preview */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Live Creative Banner Preview</span>
              
              <div
                className="rounded-[2rem] p-8 shadow-xl text-white flex flex-col justify-between relative overflow-hidden h-[300px] transition-all duration-300 shadow-purple-500/10"
                style={{ backgroundColor: campaignBg }}
              >
                {/* Decorative Solid Graphics */}
                <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-black/15" />
                
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full">
                    CAMPAIGN CREATIVE
                  </span>
                  {campaignTarget !== "All" && (
                    <span className="text-[10px] font-bold bg-yellow-400 text-slate-900 px-2.5 py-0.5 rounded-md">
                      Target: {campaignTarget}
                    </span>
                  )}
                </div>

                <div className="space-y-2 z-10">
                  <h3 className="text-2xl font-black leading-tight truncate">
                    {campaignHeadline || "Your Campaign Headline"}
                  </h3>
                  <p className="text-white/80 text-xs font-medium leading-relaxed line-clamp-3">
                    {campaignDescription || "Type a promotional description inside the creative builder. It will render here in real-time as a solid-colored ad card."}
                  </p>
                </div>

                <div className="z-10 pt-2 self-start">
                  <span className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-full px-6 py-2.5 transition-all shadow-md cursor-default flex items-center gap-1.5">
                    {campaignCta}
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Active Campaigns Directory List */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
            <div>
              <h2 className="text-[#7a3dbf] text-xl font-bold">Active Segment Creatives</h2>
              <p className="text-slate-400 text-xs mt-0.5">Currently active advertising banners displayed in customers dashboard views</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-5 flex flex-col justify-between gap-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Compact Creative Preview Thumbnail */}
                    <div
                      className="h-20 w-24 rounded-xl shrink-0 flex flex-col justify-center items-center p-2 text-center text-white relative overflow-hidden"
                      style={{ backgroundColor: camp.bgColor }}
                    >
                      <Sparkles size={16} className="text-white/80 mb-1" />
                      <span className="text-[8px] font-black tracking-wider leading-none uppercase max-w-full truncate px-1">
                        {camp.title}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-slate-800 font-bold text-sm truncate">{camp.title}</h4>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">
                          {camp.targetTier}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs font-medium mt-1 line-clamp-2 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Metrics & Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clicks</span>
                        <span className="text-xs font-extrabold text-slate-800">{camp.clicks}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Conversions</span>
                        <span className="text-xs font-extrabold text-slate-800">{camp.conversions}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CR</span>
                        <span className="text-xs font-extrabold text-[#7a3dbf]">
                          {camp.clicks > 0 ? `${((camp.conversions / camp.clicks) * 100).toFixed(1)}%` : "0%"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Active Status Toggle */}
                      <button
                        onClick={() => handleToggleCampaign(camp.id)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          camp.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-400 border-slate-200"
                        )}
                      >
                        {camp.status}
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(camp.id)}
                        className="p-1.5 border border-slate-200 hover:border-red-500 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-lg active:scale-90"
                        title="Delete Campaign"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* COMPONENT: Customer Detail Sidebar Drawer */}
      {drawerCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay background */}
          <div className="absolute inset-0 bg-black/35 transition-opacity" onClick={() => setDrawerCustomer(null)} />
          
          {/* Slide-over Container */}
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#ebd7fa] overflow-y-auto">
              
              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-1.5 text-[#7a3dbf] font-bold">
                    <UserCheck size={18} />
                    <span>Customer File details</span>
                  </div>
                  <button
                    onClick={() => setDrawerCustomer(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Profile Card Summary */}
                <div className="text-center space-y-3 pt-2">
                  <div className="relative h-20 w-20 rounded-full border-2 border-[#ebd7fa] bg-slate-50 overflow-hidden mx-auto">
                    <Image
                      src={drawerCustomer.avatar}
                      alt={drawerCustomer.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-slate-800 text-lg font-black">{drawerCustomer.name}</h3>
                    <p className="text-slate-400 text-xs font-semibold">{drawerCustomer.email}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border", TIER_COLORS[drawerCustomer.tier])}>
                        {drawerCustomer.tier} Tier
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                        drawerCustomer.status === "Active" ? "bg-green-50 text-green-600 border border-green-200" : "bg-slate-100 text-slate-400 border border-slate-200"
                      )}>
                        {drawerCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Customer Metrics Grid (Strictly Solid, No Gradients) */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#f3eafb] rounded-xl p-3 border border-[#ebd7fa] text-center">
                    <span className="text-[9px] font-bold text-[#7a3dbf] uppercase tracking-wider block">LTV Spent</span>
                    <span className="text-xs font-black text-slate-800 mt-1 block">₦{drawerCustomer.spent.toLocaleString()}</span>
                  </div>
                  <div className="bg-[#e8f5e9] rounded-xl p-3 border border-green-200 text-center">
                    <span className="text-[9px] font-bold text-[#2e7d32] uppercase tracking-wider block">Orders</span>
                    <span className="text-xs font-black text-slate-800 mt-1 block">{drawerCustomer.orders}</span>
                  </div>
                  <div className="bg-[#e3f2fd] rounded-xl p-3 border border-blue-200 text-center">
                    <span className="text-[9px] font-bold text-[#1565c0] uppercase tracking-wider block">Avg Order</span>
                    <span className="text-xs font-black text-slate-800 mt-1 block">
                      ₦{drawerCustomer.orders > 0 ? Math.round(drawerCustomer.spent / drawerCustomer.orders).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>

                {/* Personal & Account Metadata */}
                <div className="space-y-3.5 bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider mb-2">Account Meta Info</h4>
                  
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Account ID</span>
                    <span className="text-slate-700 font-bold">{drawerCustomer.id}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Phone Number</span>
                    <span className="text-slate-700 font-bold">{drawerCustomer.phone}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Delivery Address</span>
                    <span className="text-slate-700 font-bold truncate max-w-[200px]" title={drawerCustomer.address}>
                      {drawerCustomer.address}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Preferred Category</span>
                    <span className="text-slate-700 font-bold bg-[#ebd7fa] text-[#7a3dbf] px-2 py-0.5 rounded text-[10px] uppercase">
                      {drawerCustomer.preferredCategory}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Joined Platform</span>
                    <span className="text-slate-500 font-bold">{drawerCustomer.joinDate}</span>
                  </div>
                </div>

                {/* Internal Notes Editor */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Merchant Notes (Internal Only)</label>
                  <textarea
                    rows={4}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Write private notes on this shopper..."
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all resize-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="w-full py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    Save Notes
                  </button>
                </div>

                {/* Mock Purchase History List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>Recent Sales Logs</span>
                  </h4>
                  
                  <div className="divide-y divide-slate-100">
                    <div className="py-2.5 flex justify-between text-xs font-semibold items-center">
                      <div>
                        <p className="text-slate-800 font-bold">₦120,000 (1 Item)</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Order #FL-ORD-3304 • Completed</p>
                      </div>
                      <span className="text-slate-500 font-medium">May 14, 2026</span>
                    </div>
                    {drawerCustomer.orders > 1 && (
                      <div className="py-2.5 flex justify-between text-xs font-semibold items-center">
                        <div>
                          <p className="text-slate-800 font-bold">₦185,000 (2 Items)</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">Order #FL-ORD-2911 • Completed</p>
                        </div>
                        <span className="text-slate-500 font-medium">Apr 28, 2026</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-[#faf6ff] flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCustomer(drawerCustomer);
                    setDrawerCustomer(null);
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-[#ebd7fa] text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Mail size={13} className="text-[#7a3dbf]" />
                  Send Email Message
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete customer account ${drawerCustomer.name}?`)) {
                      handleDelete();
                    }
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center active:scale-95"
                  title="Remove Customer Record"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Email Composer Popup */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedCustomer(null)} />
          
          {/* Box container */}
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 border border-[#ebd7fa]">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-slate-800 text-lg font-bold flex items-center gap-2 mb-1">
              <Mail className="text-[#7a3dbf]" size={20} />
              Compose Email
            </h3>
            <p className="text-xs text-slate-400 mb-6">Send a direct message to {selectedCustomer.name} ({selectedCustomer.email})</p>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject</label>
                <input
                  type="text"
                  placeholder="Special discount offer, order update, etc."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Message Body</label>
                <textarea
                  rows={5}
                  placeholder="Type your message here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-medium resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Customer Drawer */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/45" onClick={() => setIsAdding(false)} />
          
          {/* Box container */}
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa]">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-slate-800 text-lg font-bold flex items-center gap-2 mb-1">
              <UserPlus className="text-[#7a3dbf]" size={20} />
              Add New Customer
            </h3>
            <p className="text-xs text-slate-400 mb-6">Enter customer details to add them to your directory list</p>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Avery"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. jordan@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Customer Tier</label>
                <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm text-slate-800 shadow-sm flex items-center justify-between cursor-pointer">
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none text-slate-500">▼</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
