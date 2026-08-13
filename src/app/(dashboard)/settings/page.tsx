"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronRight,
  X,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Camera,
  Edit,
  Activity,
  Sliders,
  Link2,
  ShieldCheck,
  Building,
  Info
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { apiErrorMessage, authApi } from "@/lib/api";
import { useSellerSettings, useUpdateSellerSettings } from "@/hooks/use-dashboard";

// Interface definitions for settings configuration
interface NotificationRule {
  id: string;
  label: string;
  email: boolean;
  push: boolean;
}

interface ConnectedApp {
  id: string;
  name: string;
  connected: boolean;
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7a3dbf] border-t-transparent" />
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams ? searchParams.get("view") || "general" : "general";

  const { user, updateUser } = useAuthStore();
  const { data: settingsRes } = useSellerSettings();
  const updateSettings = useUpdateSellerSettings();

  // Toast notifications
  const [toast, setToast] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Switch tabs
  const handleTabChange = (targetView: "general" | "profile") => {
    router.push(`/settings?view=${targetView}`);
  };

  // --- GENERAL SETTINGS STATES (View 1) ---
  const [genName, setGenName] = useState("");
  const [genEmail, setGenEmail] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("Sarah");

  // Load defaults or store values
  useEffect(() => {
    if (view === "general") {
      setGenName(user?.name || "");
      setGenEmail(user?.email || "");
      setGenPhone(user?.phone || "");
    } else {
      const parts = (user?.name || "").split(" ");
      setProfFirstName(parts[0] || "");
      setProfLastName(parts.slice(1).join(" ") || "");
      setGenEmail(user?.email || "");
      setProfPhone(user?.phone || "");
    }
  }, [user, view]);

  useEffect(() => {
    const n = settingsRes?.data.notifications;
    if (!n) return;
    setNotifications([
      { id: "sale", label: "New Sale", email: Boolean(n.sale?.email), push: Boolean(n.sale?.push) },
      { id: "order", label: "Order Update", email: Boolean(n.order?.email), push: Boolean(n.order?.push) },
      { id: "stock", label: "Low Stock Alert", email: Boolean(n.stock?.email), push: Boolean(n.stock?.push) },
    ]);
  }, [settingsRes]);

  // Modal active state: 'avatar' | 'verify' | '2fa' | 'tax' | null
  const [activeModal, setActiveModal] = useState<"avatar" | "verify" | "2fa" | "tax" | null>(null);

  // General Settings inputs
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("GMT-08");

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationRule[]>([
    { id: "sale", label: "New Sale", email: true, push: true },
    { id: "order", label: "Order Update", email: true, push: false },
    { id: "stock", label: "Low Stock Alert", email: false, push: true },
  ]);

  // Connected Apps State
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([
    { id: "stripe", name: "Stripe", connected: true },
    { id: "paypal", name: "PayPal", connected: true },
    { id: "analytics", name: "Google Analytics", connected: true },
  ]);

  // Security passwords state
  const [currPassword, setCurrPassword] = useState("••••••••••••");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  // --- PROFILE DASHBOARD STATES (View 2) ---
  const [profFirstName, setProfFirstName] = useState("Roken");
  const [profSecondName, setProfSecondName] = useState("Balan");
  const [profLastName, setProfLastName] = useState("Balan");
  const [profPhone, setProfPhone] = useState("+1 (555) 019-2834");
  const [address1, setAddress1] = useState("120 Pine Street, Suite 400");
  const [address2, setAddress2] = useState("San Francisco, CA 94111");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated alert triggers
  const [isDeviceVerified, setIsDeviceVerified] = useState(false);
  const [is2faAlertSolved, setIs2faAlertSolved] = useState(false);
  const [isTaxAlertSolved, setIsTaxAlertSolved] = useState(false);

  // Modal custom inputs
  const [verifyCode, setVerifyCode] = useState("");
  const [taxId, setTaxId] = useState("");
  const [taxName, setTaxName] = useState("");

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genName.trim() || !genEmail.trim()) {
      triggerToast("Name and email are required.");
      return;
    }
    try {
      const { data } = await authApi.updateProfile({ name: genName, phone: genPhone });
      updateUser(data);
      triggerToast("Basic profile information updated successfully!");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not update profile."));
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        notifications: Object.fromEntries(
          notifications.map((rule) => [rule.id, { email: rule.email, push: rule.push }]),
        ),
      });
      triggerToast("Preferences saved.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not save preferences."));
    }
  };

  const handleToggleNotification = (id: string, field: "email" | "push") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: !n[field] } : n))
    );
  };

  const handleToggleConnectedApp = (id: string) => {
    setConnectedApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, connected: !app.connected } : app))
    );
    const app = connectedApps.find((a) => a.id === id);
    if (app) {
      triggerToast(`${app.name} status updated.`);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      triggerToast("Please fill in password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("Passwords do not match.");
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setCurrPassword("••••••••••••");
    triggerToast("Your password was updated successfully!");
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const name = [profFirstName, profLastName].filter(Boolean).join(" ") || genName;
      const { data } = await authApi.updateProfile({ name, phone: profPhone });
      updateUser(data);
      if (settingsRes?.data.store) {
        await updateSettings.mutateAsync({
          bank_name: settingsRes.data.store.bankName || undefined,
          bank_account_number: settingsRes.data.store.bankAccountNumber || undefined,
          bank_account_name: settingsRes.data.store.bankAccountName || undefined,
        });
      }
      triggerToast("Profile details saved.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not save billing profile."));
    }
  };

  const handleAvatarChangeSubmit = (seed: string) => {
    setAvatarSeed(seed);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    updateUser({ avatar: newAvatar });
    setActiveModal(null);
    triggerToast("Avatar seeds successfully re-randomized!");
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans relative pb-12">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Tabs View Switcher at Page Top */}
      <div className="flex border-b border-[#ebd7fa] pb-px">
        <button
          onClick={() => handleTabChange("general")}
          className={cn(
            "px-6 py-3 font-bold text-sm transition-all rounded-t-2xl border-t border-x flex items-center gap-2",
            view === "general"
              ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-sm"
              : "bg-white text-slate-600 border-[#ebd7fa] hover:bg-[#faf6ff]"
          )}
        >
          <Sliders size={15} />
          <span>General Settings</span>
        </button>
        <button
          onClick={() => handleTabChange("profile")}
          className={cn(
            "px-6 py-3 font-bold text-sm transition-all rounded-t-2xl border-t border-x ml-2 flex items-center gap-2",
            view === "profile"
              ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-sm"
              : "bg-white text-slate-600 border-[#ebd7fa] hover:bg-[#faf6ff]"
          )}
        >
          <Activity size={15} />
          <span>Profile Overview</span>
        </button>
      </div>

      {/* VIEW 1: GENERAL SETTINGS */}
      {view === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile & Basic Info */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa]">
              <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3 mb-6">
                Profile & Basic Info
              </h2>

              <form onSubmit={handleUpdateBasicInfo} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
                {/* Avatar Display */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-[#7a3dbf] group shadow-inner">
                    <Image
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                      alt="User avatar"
                      width={112}
                      height={112}
                      className="object-cover h-full w-full bg-purple-50"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={20} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal("avatar")}
                    className="bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95"
                  >
                    <Edit size={12} />
                    <span>Edit Avatar</span>
                  </button>
                </div>

                {/* Info Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={genName}
                        onChange={(e) => setGenName(e.target.value)}
                        className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 pr-10"
                      />
                      <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300" size={14} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={genEmail}
                        onChange={(e) => setGenEmail(e.target.value)}
                        className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 pr-10"
                      />
                      <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300" size={14} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3 items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={genPhone}
                        onChange={(e) => setGenPhone(e.target.value)}
                        className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 pr-10"
                      />
                      <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300" size={14} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
                    <span className="text-xs font-semibold text-slate-400">
                      Member Since: <strong className="text-slate-600">Oct 15, 2021</strong>
                    </span>
                    <button
                      type="submit"
                      className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 w-full sm:w-auto"
                    >
                      Update Basic Info
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Account Preferences, Notifications & Integrations Grid Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
              
              {/* Tab Header Mocks */}
              <div className="flex border-b border-slate-100">
                <span className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#7a3dbf] border-b-2 border-[#7a3dbf] bg-white rounded-t-xl">
                  Account Preferences
                </span>
                <span className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notification Settings
                </span>
                <span className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Connected Apps
                </span>
              </div>

              {/* Three Parallel Columns layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Column 1: Preferences */}
                <form onSubmit={handleUpdatePreferences} className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                      >
                        <option value="USD">USD, EUR, GBP</option>
                        <option value="NGN">NGN (Nigerian Naira)</option>
                        <option value="CAD">CAD (Canadian Dollar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                      >
                        <option value="English">English, Spanish, French</option>
                        <option value="German">German, Polish</option>
                        <option value="Chinese">Mandarin, Cantonese</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                      >
                        <option value="GMT-08">(GMT-08:00) Pacific Time (US & Canada)</option>
                        <option value="GMT+01">(GMT+01:00) West African Time</option>
                        <option value="GMT+00">(GMT+00:00) Greenwich Mean Time</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Save Changes
                  </button>
                </form>

                {/* Column 2: Notification Toggle rules */}
                <div className="space-y-4 border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0 md:px-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Headings */}
                    <div className="grid grid-cols-[1fr_50px_50px] gap-2 items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-50">
                      <span>Alert Type</span>
                      <span className="text-center">Email</span>
                      <span className="text-center">Push</span>
                    </div>

                    {/* Notification Rules rows */}
                    {notifications.map((n) => (
                      <div key={n.id} className="grid grid-cols-[1fr_50px_50px] gap-2 items-center text-xs font-semibold text-slate-700 py-1">
                        <span>{n.label}</span>
                        {/* Email Toggle */}
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleNotification(n.id, "email")}
                            className={cn(
                              "w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer",
                              n.email ? "bg-[#7a3dbf]" : "bg-slate-200"
                            )}
                          >
                            <span className={cn(
                              "h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                              n.email ? "translate-x-4.5" : "translate-x-0.5"
                            )} />
                          </button>
                        </div>

                        {/* Push Toggle */}
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleNotification(n.id, "push")}
                            className={cn(
                              "w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer",
                              n.push ? "bg-[#7a3dbf]" : "bg-slate-200"
                            )}
                          >
                            <span className={cn(
                              "h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                              n.push ? "translate-x-4.5" : "translate-x-0.5"
                            )} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#faf6ff] border border-[#ebd7fa] text-[#7a3dbf] rounded-xl p-3 text-[10px] font-bold leading-normal">
                    💡 Rules define real-time notifications sent to your email and primary smartphone app.
                  </div>
                </div>

                {/* Column 3: Connected Apps */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Integrations</span>

                    {/* App links */}
                    {connectedApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between border border-[#ebd7fa] rounded-xl p-3 bg-[#faf6ff]">
                        <div className="flex items-center gap-2">
                          <Link2 size={14} className="text-[#7a3dbf]" />
                          <span className="text-xs font-bold text-slate-700">{app.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleConnectedApp(app.id)}
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95",
                            app.connected
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          )}
                        >
                          {app.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Connecting apps allows FastLink to fetch external payment metadata and sync inventories automatically.
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Security, 2FA & Session Logs */}
          <div className="space-y-6">
            
            {/* Security & Login */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-5">
              <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3">
                Security & Login
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currPassword}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 focus:outline-none cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Change Password
                </button>
              </form>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Secure your store with a secondary code</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (!is2faEnabled) {
                        setActiveModal("2fa");
                      } else {
                        setIs2faEnabled(false);
                        triggerToast("2FA disabled.");
                      }
                    }}
                    className={cn(
                      "w-10 h-5.5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer",
                      is2faEnabled ? "bg-[#7a3dbf]" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                      is2faEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>

              {/* Session History */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Session History</span>
                
                <div className="space-y-2">
                  {[
                    "San Francisco, CA - Jul 10, 2023, 11:30 AM",
                    "San Francisco, CA - Jul 10, 2023, 9:15 AM",
                    "Jul 10, 2023, 5:30 AM",
                    "San Francisco, CA - Jul 10, 2023, 5:35 PM",
                    "Jul 10, 2023, 7:00 AM",
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{session}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: PROFILE DASHBOARD */}
      {view === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          
          {/* Left Column (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Overview */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa]">
              <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3 mb-6">
                Account Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
                
                {/* User info details left */}
                <div className="flex gap-4 items-start">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#7a3dbf] bg-purple-50 shrink-0">
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profFirstName}`}
                      alt="Profile Avatar"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => setActiveModal("avatar")}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                    >
                      <Edit size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-800 text-xl font-bold">{profFirstName} {profLastName}</h3>
                      <span className="bg-[#f3eafb] text-[#7a3dbf] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#ebd7fa]">
                        Owner & Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">Member Since: Jan 2021</p>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
                      <Activity size={14} className="text-[#7a3dbf]" />
                      <span>Last Login: 5 minutes ago</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 space-y-1 max-w-[260px]">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-[#7a3dbf]">Complete Profile</span>
                        <span className="text-slate-500">Completion: 85%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#7a3dbf] h-full rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numerical Stats Stack Right */}
                <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
                  <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks</span>
                    <span className="text-xl font-extrabold text-slate-800">12</span>
                  </div>

                  <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Tickets</span>
                    <span className="text-xl font-extrabold text-slate-800">1</span>
                  </div>

                  <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Locations</span>
                    <span className="text-xl font-extrabold text-slate-800">3</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Contact & Billing Information */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
              
              {/* Header with Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h2 className="text-slate-800 text-lg font-bold">
                  Contact & Billing Information
                </h2>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search Contacts/Settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>
              </div>

              {/* Multi Column Fields */}
              <form onSubmit={handleSaveBilling} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Personal Details */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Personal Details</span>
                  
                  {/* First Name */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={profFirstName}
                      onChange={(e) => setProfFirstName(e.target.value)}
                      className="w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf] pr-10"
                    />
                    <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>

                  {/* Second/Middle Name */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Second Name"
                      value={profSecondName}
                      onChange={(e) => setProfSecondName(e.target.value)}
                      className="w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf] pr-10"
                    />
                    <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>

                  {/* Last Name */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={profLastName}
                      onChange={(e) => setProfLastName(e.target.value)}
                      className="w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf] pr-10"
                    />
                    <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>

                  {/* Work Email */}
                  <div className="relative">
                    <input
                      type="email"
                      value={genEmail}
                      onChange={(e) => setGenEmail(e.target.value)}
                      className="w-full bg-white border border-[#ebd7fa] rounded-xl pl-4 pr-10 py-2 text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                    />
                    <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                  </div>

                  {/* Phone Number */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Business Address & Connected Social Logins */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Business & Billing Address</span>
                    
                    {/* Primary address 1 */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Primary Address 1"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        className="w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf] pr-10"
                      />
                      <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    </div>

                    {/* Address Line 2 */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Address & Girlings 2"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                        className="w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf] pr-10"
                      />
                      <Edit className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Building size={13} />
                      <span>Billing Settings</span>
                    </button>
                  </div>

                  {/* Connected Accounts icons row */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Accounts</span>
                    <div className="flex gap-2">
                      <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.73 0 3.32.63 4.56 1.66l2.368-2.368C17.37 1.63 14.93 1 12.24 1 6.64 1 2.08 5.56 2.08 11.2s4.56 10.2 10.16 10.2c5.84 0 9.72-4.11 9.72-9.9 0-.67-.06-1.3-.18-1.89h-9.54z" />
                        </svg>
                      </div>
                      <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM15.165 5.042a2.528 2.528 0 0 1 2.523-2.52 2.528 2.528 0 0 1 2.52 2.52v2.52h-2.52a2.528 2.528 0 0 1-2.523-2.52zm0 1.261a2.528 2.528 0 0 1 2.523 2.52v5.043a2.528 2.528 0 0 1-2.523 2.522h-5.042a2.528 2.528 0 0 1-2.52-2.522V8.823a2.528 2.528 0 0 1 2.52-2.52h5.042zm-6.342 12.655a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522a2.528 2.528 0 0 1-2.52-2.52zm0-1.261a2.528 2.528 0 0 1 2.52-2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52H8.823a2.528 2.528 0 0 1 2.52 2.52v5.043zm6.342-6.342a2.528 2.528 0 0 1-2.523 2.52h-5.042a2.528 2.528 0 0 1-2.52-2.52V8.823a2.528 2.528 0 0 1 2.52-2.52h5.042a2.528 2.528 0 0 1 2.523 2.52v5.042z" />
                        </svg>
                      </div>
                      <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 text-xs font-bold">
                        •••
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

          </div>

          {/* Right Column: Recent Alerts & Tasks */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
              <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3">
                Recent Alerts & Tasks
              </h2>

              <div className="divide-y divide-slate-100">
                {/* Alert 1: Verify login */}
                {!isDeviceVerified ? (
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block">Verify New Device Login</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Verify New Device Login</span>
                    </div>
                    <button
                      onClick={() => setActiveModal("verify")}
                      className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm shrink-0 active:scale-95"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div className="py-3.5 flex items-center gap-3 text-slate-400">
                    <CheckCircle className="text-green-500 shrink-0" size={16} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold line-through">Verify New Device Login</span>
                      <span className="text-[9px] text-green-500 font-bold block mt-0.5">Approved successfully</span>
                    </div>
                  </div>
                )}

                {/* Alert 2: 2FA */}
                {!is2faAlertSolved ? (
                  <button
                    onClick={() => setActiveModal("2fa")}
                    className="w-full py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 transition-all rounded-lg"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block">Set Up Two-Factor Authentication</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Set Up Two-Factor Authentication</span>
                    </div>
                    <ChevronRight className="text-slate-400 shrink-0" size={16} />
                  </button>
                ) : (
                  <div className="py-3.5 flex items-center gap-3 text-slate-400">
                    <CheckCircle className="text-green-500 shrink-0" size={16} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold line-through">Set Up Two-Factor Authentication</span>
                      <span className="text-[9px] text-green-500 font-bold block mt-0.5">2FA set up completed</span>
                    </div>
                  </div>
                )}

                {/* Alert 3: Tax Information */}
                {!isTaxAlertSolved ? (
                  <button
                    onClick={() => setActiveModal("tax")}
                    className="w-full py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 transition-all rounded-lg"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block">Complete Tax Information</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Complete Tax Information</span>
                    </div>
                    <ChevronRight className="text-slate-400 shrink-0" size={16} />
                  </button>
                ) : (
                  <div className="py-3.5 flex items-center gap-3 text-slate-400">
                    <CheckCircle className="text-green-500 shrink-0" size={16} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold line-through">Complete Tax Information</span>
                      <span className="text-[9px] text-green-500 font-bold block mt-0.5">Tax forms filed (W-9)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- SIMULATION MODALS --- */}

      {/* Modal 1: Edit Avatar Seeder */}
      {activeModal === "avatar" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-slate-800 font-bold text-base">Select Avatar Style</h3>
              <p className="text-xs text-slate-400">Type a word to generate a different avatar style seed dynamically:</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Sarah, Jordan, Alex"
                defaultValue={avatarSeed}
                id="avatar-seed-input"
                className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#7a3dbf]"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("avatar-seed-input") as HTMLInputElement;
                  if (input) handleAvatarChangeSubmit(input.value.trim() || "Sarah");
                }}
                className="bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold px-4 rounded-xl active:scale-95 transition-all shadow-sm"
              >
                Generate
              </button>
            </div>

            <div className="flex justify-around items-center pt-4">
              {["Sarah", "Jordan", "Grace", "Liam"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleAvatarChangeSubmit(s)}
                  className="flex flex-col items-center gap-1 p-2 hover:bg-purple-50 rounded-xl transition-colors"
                >
                  <Image
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`}
                    alt={s}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border border-slate-100 bg-slate-50"
                  />
                  <span className="text-[10px] font-bold text-slate-500">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Device Login Verification */}
      {activeModal === "verify" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-1.5">
                <AlertTriangle className="text-yellow-500" size={18} />
                <span>Verify Device Login Request</span>
              </h3>
              <p className="text-xs text-slate-400">A new login was requested from an unverified browser. Please authorize it.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100 text-xs text-slate-600 font-semibold leading-relaxed">
              <div className="flex justify-between">
                <span>Location:</span>
                <strong className="text-slate-800">Lagos, Nigeria (IP: 197.210.8.44)</strong>
              </div>
              <div className="flex justify-between">
                <span>Device/OS:</span>
                <strong className="text-slate-800">Mozilla/5.0 (Macintosh; Intel Mac OS X)</strong>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <strong className="text-slate-800">Jul 10, 2023, 11:32 AM</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enter 6-digit confirmation PIN sent to phone</label>
              <input
                type="text"
                placeholder="e.g. 882901"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-center text-sm font-bold tracking-[0.5em] text-[#7a3dbf] focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Deny
              </button>
              <button
                type="button"
                onClick={() => {
                  if (verifyCode.length < 6) {
                    triggerToast("Verification code must be 6 digits.");
                    return;
                  }
                  setIsDeviceVerified(true);
                  setActiveModal(null);
                  triggerToast("Login request authorized successfully.");
                }}
                className="flex-1 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                Approve Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Two Factor Authentication (2FA) setup wizard */}
      {activeModal === "2fa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-1.5">
                <Smartphone className="text-[#7a3dbf]" size={18} />
                <span>Set Up Two-Factor Authentication</span>
              </h3>
              <p className="text-xs text-slate-400">Scan this bar/QR code in Google Authenticator or Duo to secure your account.</p>
            </div>

            {/* Fake QR Code */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl border border-slate-100 gap-2">
              <div className="h-28 w-28 bg-white border border-slate-200 p-2 flex flex-wrap gap-1 items-center justify-center select-none shadow-sm">
                {/* Visual mock QR grids */}
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 w-3 rounded-sm",
                      (i % 3 === 0 || i % 7 === 1 || i % 5 === 0) && i > 4 ? "bg-slate-800" : "bg-transparent"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[#7a3dbf] tracking-wide uppercase">Key: HYD7-22KS-OP91-KL99</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verify Authenticator Code</label>
              <input
                type="text"
                placeholder="6-digit pin"
                maxLength={6}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-center text-xs font-bold tracking-[0.25em]"
                id="authenticator-input"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const val = (document.getElementById("authenticator-input") as HTMLInputElement)?.value;
                if (!val || val.length < 6) {
                  triggerToast("Please enter the 6-digit confirmation code.");
                  return;
                }
                setIs2faEnabled(true);
                setIs2faAlertSolved(true);
                setActiveModal(null);
                triggerToast("2FA setup successfully finalized!");
              }}
              className="w-full bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Verify & Activate
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: Complete Tax Information Form (W-9) */}
      {activeModal === "tax" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!taxId || !taxName) {
                triggerToast("Please provide tax details.");
                return;
              }
              setIsTaxAlertSolved(true);
              setActiveModal(null);
              triggerToast("Tax status verified. W-9 Form submitted.");
            }}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4"
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-1.5">
                <Building className="text-[#7a3dbf]" size={18} />
                <span>Taxpayer Identification (Form W-9)</span>
              </h3>
              <p className="text-xs text-slate-400">Submit your business tax identification number to avoid payout withholding holds.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Business / Individual Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. FastLink Stores Inc."
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Taxpayer ID Number (TIN / SSN / EIN)</label>
                <input
                  type="text"
                  placeholder="e.g. 12-3456789"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3 text-[10px] font-semibold leading-relaxed flex gap-2">
                <Info size={14} className="shrink-0 text-yellow-600 mt-0.5" />
                <span>
                  By clicking submit, you certify that the taxpayer ID number provided is correct and you are not subject to backup withholding.
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
