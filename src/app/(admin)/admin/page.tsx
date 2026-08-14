"use client";

import Link from "next/link";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Wallet,
  Building2,
  ArrowUpRight,
  ShoppingBag,
  Store,
  Scale,
  Sparkles,
} from "lucide-react";

import { useAdminOverview } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#7a3dbf]" />
        <p className="text-sm font-bold text-slate-400">Loading marketplace telemetry...</p>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-semibold">
        Could not load platform overview data. Please check your network connection or permissions.
      </div>
    );
  }

  const pendingApps = data.pendingApplications ?? (data.pendingStores + (data.pendingRiders ?? 0));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Welcome & Telemetry Banner ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
              Control Center
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Platform Performance Overview</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Real-time aggregate data for GMV, take rate, pending store verifications, and settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/verification"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <ShieldCheck size={16} />
            Review KYC ({pendingApps})
          </Link>
          <Link
            href="/admin/payouts"
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#faf6ff] text-slate-700 border border-[#ebd7fa] text-xs font-bold rounded-xl transition active:scale-95"
          >
            <Wallet size={16} className="text-[#7a3dbf]" />
            Payouts Queue
          </Link>
        </div>
      </div>

      {/* ── Metric Stat Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link href="/admin/orders" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Gross Merchandise Value (GMV)"
            value={formatPrice(data.gmv)}
            icon={<DollarSign size={20} />}
            variant="purple"
            badgeText="All Paid Orders"
            badgeType="success"
            subtitle="Platform volume settled"
          />
        </Link>

        <Link href="/admin/payments" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Marketplace Take (Fees)"
            value={formatPrice(data.take)}
            icon={<TrendingUp size={20} />}
            variant="emerald"
            badgeText="Net Revenue"
            badgeType="success"
            subtitle="Commission & transaction fees"
          />
        </Link>

        <Link href="/admin/customers" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Registered Users"
            value={data.users.toLocaleString()}
            icon={<Users size={20} />}
            variant="blue"
            badgeText="Active Base"
            badgeType="info"
            subtitle="Buyers, merchants & riders"
          />
        </Link>

        <Link href="/admin/verification" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Pending Applications"
            value={pendingApps}
            icon={<ShieldCheck size={20} />}
            variant={pendingApps > 0 ? "amber" : "purple"}
            badgeText={pendingApps > 0 ? "Action Required" : "Up to Date"}
            badgeType={pendingApps > 0 ? "warning" : "success"}
            subtitle="Store & rider onboarding"
          />
        </Link>

        <Link href="/admin/payouts" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Pending Payouts"
            value={`${data.pendingPayouts} items`}
            icon={<Wallet size={20} />}
            variant="rose"
            badgeText={formatPrice(data.pendingPayoutAmount)}
            badgeType="danger"
            subtitle="Pending bank disbursement"
          />
        </Link>

        <Link href="/admin/malls" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            title="Physical Malls"
            value="Active Malls"
            icon={<Building2 size={20} />}
            variant="purple"
            badgeText="Manage"
            badgeType="neutral"
            subtitle="Explore mall hubs & centers"
          />
        </Link>
      </div>

      {/* ── Quick Operation Modules ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Orders & Fulfillment",
            desc: "Inspect live buyer carts, tracking, and global delivery statuses.",
            href: "/admin/orders",
            icon: ShoppingBag,
            color: "text-purple-700 bg-[#f3eafb]",
          },
          {
            title: "Store Moderation",
            desc: "Audit new product listings, reviews, and catalog violations.",
            href: "/admin/moderation",
            icon: Store,
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            title: "Dispute Resolutions",
            desc: "Arbitrate buyer-vendor conflicts and claim chargebacks.",
            href: "/admin/disputes",
            icon: Scale,
            color: "text-amber-700 bg-amber-50",
          },
          {
            title: "Platform Analytics",
            desc: "Deep-dive into 30-day conversion, GMV trend, and growth.",
            href: "/admin/analytics",
            icon: Sparkles,
            color: "text-blue-700 bg-blue-50",
          },
        ].map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group bg-white p-5 rounded-[1.8rem] border border-[#ebd7fa] hover:border-[#7a3dbf]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-3 ${mod.color}`}>
                <mod.icon size={22} />
              </div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-[#7a3dbf] transition-colors">
                {mod.title}
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{mod.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#7a3dbf]">
              <span>View Section</span>
              <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
