"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";

import { apiErrorMessage, sellerApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";

export default function VendorRegisterPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, setUser } = useAuthStore();
  const [form, setForm] = useState({
    business_name: "",
    phone: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/register?role=seller&next=/vendor/register");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { data } = await sellerApi.onboard(form);
      if (user && token) {
        const nextUser = { ...user, role: "seller" as const, phone: form.phone };
        setUser(nextUser, token);
        queryClient.setQueryData(QUERY_KEYS.auth.user(), nextUser);
      }
      setDone(true);
      if (data.store.status === "approved") {
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit your store. Try again."));
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
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#6D349F] font-montserrat">
                Sell on Fastlink
              </h1>
              <p className="text-sm text-[#8A79A5]">
                Light KYC — business name, phone, and bank account. Admin approval comes next in production.
              </p>
            </div>
          </div>

          {done ? (
            <div className="space-y-4 text-sm text-[#6D349F]">
              <p className="font-semibold">Store submitted.</p>
              <p>
                Locally it is auto-approved so you can open the dashboard. In production an admin will review it.
              </p>
              <Link href="/dashboard" className="inline-flex font-bold underline">
                Go to dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {(
                [
                  ["business_name", "Business name"],
                  ["phone", "Phone"],
                  ["bank_name", "Bank name"],
                  ["bank_account_number", "Account number"],
                  ["bank_account_name", "Account name"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block space-y-1">
                  <span className="text-xs font-bold text-[#6D349F]">{label}</span>
                  <input
                    required
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </label>
              ))}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold py-3 flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Submit store"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
