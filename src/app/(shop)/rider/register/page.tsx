"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bike, Loader2 } from "lucide-react";

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
      <div className="container-wide py-20 text-center text-[#6D349F] font-semibold">
        Redirecting to sign up…
      </div>
    );
  }

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      <div className="container-narrow py-12">
        <div className="rounded-3xl bg-white/80 border border-white/80 shadow-md p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#7a3dbf] text-white flex items-center justify-center">
              <Bike size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#6D349F] font-montserrat">Ride with Fastlink</h1>
              <p className="text-sm text-[#8A79A5]">Phone, vehicle type, and city. Admin approval comes next in production.</p>
            </div>
          </div>

          {done ? (
            <div className="space-y-4 text-sm text-[#6D349F]">
              <p className="font-semibold">Rider profile submitted.</p>
              <p>Locally it is auto-approved so you can open assigned deliveries. In production an admin will review it.</p>
              <Link href="/rider" className="inline-flex font-bold underline">Go to rider home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">Phone</span>
                <input required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">Vehicle</span>
                <select value={form.vehicle_type} onChange={(e) => setForm((p) => ({ ...p, vehicle_type: e.target.value }))} className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm">
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">City</span>
                <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm" />
              </label>
              <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold py-3 flex items-center justify-center disabled:opacity-70">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Submit rider profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
