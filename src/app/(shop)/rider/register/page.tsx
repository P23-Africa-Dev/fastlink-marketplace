"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bike, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import logoSvg from "@/assets/logo.svg";
import { apiErrorMessage, riderApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";

export default function RiderRegisterPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, setUser } = useAuthStore();
  const [form, setForm] = useState({ phone: "", vehicle_type: "bike", city: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/register?role=rider&next=/rider/register");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === "rider") {
      router.replace("/rider");
    }
  }, [user?.role, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { data } = await riderApi.register(form);
      if (user && token) {
        const nextUser = { ...user, role: "rider" as const, phone: form.phone };
        setUser(nextUser, token);
        queryClient.setQueryData(QUERY_KEYS.auth.user(), nextUser);
      }
      setDone(true);
      if (data.rider.status === "approved") {
        setTimeout(() => router.push("/rider"), 800);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit your rider profile."));
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex items-center justify-center text-[#7a3dbf] font-bold text-xs">
        Redirecting to sign up…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between py-6 px-4 sm:px-6 font-sans">
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-3 mb-4">
        <Link href="/" className="inline-block">
          <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#7a3dbf] transition"
        >
          <ArrowLeft size={14} />
          <span>Marketplace</span>
        </Link>
      </header>

      <div className="max-w-xl mx-auto w-full">
        <div className="rounded-[2rem] bg-white border border-[#ebd7fa] shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0">
              <Bike size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ride with Fastlink</h1>
              <p className="text-xs text-slate-500 mt-0.5">Register as an official dispatch courier partner.</p>
            </div>
          </div>

          {done ? (
            <div className="space-y-4 text-center py-6">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Rider profile submitted!</h3>
              <p className="text-xs text-slate-500">Your courier credentials have been saved. You can now access your rider portal.</p>
              <Link
                href="/rider"
                className="inline-block px-5 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Go to Rider Portal
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Phone Number *</span>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. 08012345678"
                  className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Vehicle Type *</span>
                <select
                  value={form.vehicle_type}
                  onChange={(e) => setForm((p) => ({ ...p, vehicle_type: e.target.value }))}
                  className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
                >
                  <option value="bike">Motorcycle / Bike</option>
                  <option value="car">Car / Sedan</option>
                  <option value="van">Delivery Van / Truck</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Operating City *</span>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Lagos, Abuja, Port Harcourt"
                  className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold py-3 text-xs flex items-center justify-center gap-2 shadow-sm shadow-purple-600/20 disabled:opacity-70 transition active:scale-95"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Submit Courier Profile"}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 py-4">
        &copy; {new Date().getFullYear()} Fastlink Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
