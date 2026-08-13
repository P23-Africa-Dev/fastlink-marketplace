"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Store, ChevronLeft, ChevronRight } from "lucide-react";

import { useMalls, useCategories } from "@/hooks/use-catalog";
import { apiErrorMessage, sellerApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";

const STORE_TYPES = [
  { value: "mall_store", label: "Mall store", desc: "Shop inside a shopping center" },
  { value: "independent", label: "Independent", desc: "Standalone local shop" },
  { value: "nationwide", label: "Nationwide", desc: "Ships across the country" },
  { value: "emerging", label: "Emerging brand", desc: "New or growing brand" },
] as const;

type StoreType = (typeof STORE_TYPES)[number]["value"];

const STEPS = ["Store type", "Details", "KYC", "Review"];

export default function VendorRegisterPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, setUser } = useAuthStore();
  const { data: mallsRes } = useMalls({ limit: 50 });
  const { data: categoriesRes } = useCategories();
  const malls = mallsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: "" as StoreType | "",
    mall_id: "",
    category_id: "",
    business_name: "",
    phone: "",
    location: "",
    description: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/register?role=seller&next=/vendor/register");
    }
  }, [isAuthenticated, router]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return Boolean(form.type) && (form.type !== "mall_store" || Boolean(form.mall_id));
    if (step === 1) return Boolean(form.business_name && form.phone);
    if (step === 2) return Boolean(form.bank_name && form.bank_account_number && form.bank_account_name);
    return true;
  }

  async function handleSubmit() {
    setError("");
    setIsLoading(true);
    try {
      const { data } = await sellerApi.onboard({
        business_name: form.business_name,
        phone: form.phone,
        bank_name: form.bank_name,
        bank_account_number: form.bank_account_number,
        bank_account_name: form.bank_account_name,
        type: form.type as StoreType,
        mall_id: form.mall_id ? Number(form.mall_id) : undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        location: form.location || undefined,
        description: form.description || undefined,
      });
      if (user && token) {
        const nextUser = { ...user, role: "seller" as const, phone: form.phone };
        setUser(nextUser, token);
        queryClient.setQueryData(QUERY_KEYS.auth.user(), nextUser);
      }
      if (data.store.status === "approved") {
        router.push("/dashboard");
      } else {
        router.push("/vendor/pending");
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
        <div className="rounded-3xl bg-white/80 border border-white/80 shadow-md p-8 sm:p-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#7a3dbf] text-white flex items-center justify-center">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#6D349F] font-montserrat">Sell on Fastlink</h1>
              <p className="text-sm text-[#8A79A5]">Complete your seller application — admin review required.</p>
            </div>
          </div>

          <div className="flex gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={cn(
                    "h-1 rounded-full",
                    i <= step ? "bg-[#7a3dbf]" : "bg-[#EBD7FA]",
                  )}
                />
                <p className={cn("text-[10px] font-bold mt-1", i === step ? "text-[#7a3dbf]" : "text-[#8A79A5]")}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#3B1C5A]">What kind of store are you opening?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {STORE_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("type", value)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      form.type === value
                        ? "border-[#7a3dbf] bg-[#FAF8FC]"
                        : "border-[#EBD7FA] hover:border-[#7a3dbf]/50",
                    )}
                  >
                    <p className="font-bold text-[#3B1C5A]">{label}</p>
                    <p className="text-xs text-[#8A79A5] mt-1">{desc}</p>
                  </button>
                ))}
              </div>
              {form.type === "mall_store" && (
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-[#6D349F]">Select mall</span>
                  <select
                    required
                    value={form.mall_id}
                    onChange={(e) => update("mall_id", e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="">Choose a mall…</option>
                    {malls.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {(
                [
                  ["business_name", "Business name"],
                  ["phone", "Phone"],
                  ["location", "Location (optional)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block space-y-1">
                  <span className="text-xs font-bold text-[#6D349F]">{label}</span>
                  <input
                    required={key !== "location"}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm"
                  />
                </label>
              ))}
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">Category (optional)</span>
                <select
                  value={form.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">Select category…</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">About your store (optional)</span>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#8A79A5]">Bank details for payouts after you start selling.</p>
              {(
                [
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
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm"
                  />
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm text-[#5F6C72]">
              <p>
                <span className="font-bold text-[#3B1C5A]">Type:</span>{" "}
                {STORE_TYPES.find((t) => t.value === form.type)?.label}
              </p>
              <p>
                <span className="font-bold text-[#3B1C5A]">Business:</span> {form.business_name}
              </p>
              <p>
                <span className="font-bold text-[#3B1C5A]">Phone:</span> {form.phone}
              </p>
              {form.location && (
                <p>
                  <span className="font-bold text-[#3B1C5A]">Location:</span> {form.location}
                </p>
              )}
              <p className="text-xs text-[#8A79A5] pt-2">
                After submission your store will be <strong>pending</strong> until an admin approves it. You cannot
                publish products until then.
              </p>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#EBD7FA] px-4 py-2.5 text-xs font-bold text-[#6D349F] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#7a3dbf] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7a3dbf] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Submit application"}
              </button>
            )}
          </div>

          <p className="text-xs text-center text-[#8A79A5]">
            Already have a store?{" "}
            <Link href="/dashboard" className="font-bold text-[#7a3dbf] hover:underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
