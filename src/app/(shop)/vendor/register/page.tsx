"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Store, ChevronLeft, ChevronRight, ShieldCheck, ArrowLeft, HelpCircle } from "lucide-react";

import logoSvg from "@/assets/logo.svg";
import { useMalls, useCategories } from "@/hooks/use-catalog";
import { useSellerStore } from "@/hooks/use-dashboard";
import { apiErrorMessage, sellerApi, sellerDocumentsApi } from "@/lib/api";
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
  const { data: storeRes, isLoading: storeLoading, isFetched } = useSellerStore();
  const existingStore = storeRes?.data;
  const completingExisting =
    Boolean(existingStore) && !existingStore?.canSell && existingStore?.status !== undefined;
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
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [postCreate, setPostCreate] = useState<"choose" | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/register?role=seller&next=/vendor/register");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!existingStore) return;
    setForm((prev) => ({
      ...prev,
      business_name: existingStore.name || prev.business_name,
      phone: existingStore.phone || prev.phone,
      bank_name: existingStore.bankName || prev.bank_name,
      bank_account_number: existingStore.bankAccountNumber || prev.bank_account_number,
      bank_account_name: existingStore.bankAccountName || prev.bank_account_name,
    }));
    if (completingExisting && postCreate === null) setStep(2);
  }, [existingStore, completingExisting, postCreate]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function canAdvance(): boolean {
    if (completingExisting) return true;
    if (step === 0) return Boolean(form.type) && (form.type !== "mall_store" || Boolean(form.mall_id));
    if (step === 1) return Boolean(form.business_name && form.phone);
    if (step === 2) return true;
    return true;
  }

  async function uploadDocs() {
    try {
      if (cacFile) await sellerDocumentsApi.upload("cac", cacFile);
      if (idFile) await sellerDocumentsApi.upload("id_card", idFile);
    } catch {
      // Documents can be uploaded later from settings.
    }
  }

  async function handleCreateStore(submitKyc: boolean) {
    setError("");
    setIsLoading(true);
    try {
      if (completingExisting || postCreate === "choose") {
        if (submitKyc) {
          await sellerApi.submitKyc({
            bank_name: form.bank_name || undefined,
            bank_account_number: form.bank_account_number || undefined,
            bank_account_name: form.bank_account_name || undefined,
            phone: form.phone || undefined,
          });
          await uploadDocs();
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.store() });
          router.push("/vendor/pending");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      const { data } = await sellerApi.onboard({
        business_name: form.business_name,
        phone: form.phone,
        bank_name: form.bank_name || undefined,
        bank_account_number: form.bank_account_number || undefined,
        bank_account_name: form.bank_account_name || undefined,
        type: form.type as StoreType,
        mall_id: form.mall_id ? Number(form.mall_id) : undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        submit_kyc: submitKyc,
      });
      if (user && token) {
        const nextUser = {
          ...user,
          role: "seller" as const,
          phone: form.phone,
          storeStatus: data.store.status,
          kycStatus: (data.store.kycStatus as typeof user.kycStatus) ?? null,
          canSell: data.store.canSell ?? false,
        };
        setUser(nextUser, token);
        queryClient.setQueryData(QUERY_KEYS.auth.user(), nextUser);
      }
      await uploadDocs();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.store() });

      if (submitKyc) {
        router.push(data.store.canSell ? "/dashboard" : "/vendor/pending");
      } else {
        setPostCreate("choose");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit your store. Try again."));
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated || (storeLoading && !isFetched)) {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
        <p className="text-xs font-bold text-slate-400">
          {storeLoading ? "Loading vendor details…" : "Redirecting to sign up…"}
        </p>
      </div>
    );
  }

  if (existingStore?.canSell) {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between p-6">
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
          <Link href="/" className="inline-block">
            <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-[#7a3dbf] hover:underline">
            Go to Dashboard
          </Link>
        </header>

        <div className="rounded-3xl bg-white border border-[#ebd7fa] shadow-sm p-8 max-w-md w-full mx-auto text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-bold text-lg text-slate-800">Your store is already verified!</h2>
          <p className="text-xs text-slate-500">You have full seller permissions enabled to list products and fulfill orders.</p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 hover:bg-[#682fad] transition">
            Open dashboard
          </Link>
        </div>

        <footer className="text-center text-xs text-slate-400 py-4">
          &copy; {new Date().getFullYear()} Fastlink Marketplace. All rights reserved.
        </footer>
      </div>
    );
  }

  if (postCreate === "choose") {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between p-6">
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
          <Link href="/" className="inline-block">
            <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-[#7a3dbf] hover:underline">
            Skip to Dashboard
          </Link>
        </header>

        <div className="rounded-[2rem] bg-white border border-[#ebd7fa] shadow-sm p-8 sm:p-10 max-w-lg w-full mx-auto space-y-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Complete your verification</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Your store account has been created. Complete your business KYC verification to start selling
              on the marketplace — or head to your dashboard and finish later.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (form.bank_name && form.bank_account_number && form.bank_account_name) {
                  void handleCreateStore(true);
                } else {
                  setPostCreate(null);
                  setStep(2);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 disabled:opacity-70 transition"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              <span>Complete KYC Now</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[#ebd7fa] bg-[#faf6ff] hover:bg-[#f3eafb] px-5 py-2.5 text-xs font-bold text-[#7a3dbf] transition"
            >
              Go to dashboard
            </Link>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 py-4">
          &copy; {new Date().getFullYear()} Fastlink Marketplace. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-[#faf6ff] min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* ── Top Clean Brand Bar ──────────────────────────────────── */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-3 mb-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7a3dbf] transition"
          >
            <ArrowLeft size={14} />
            <span>Marketplace</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-[#7a3dbf] bg-white border border-[#ebd7fa] px-3.5 py-1.5 rounded-xl hover:bg-[#f3eafb] transition shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </header>

      {/* ── Main Onboarding Form Container ──────────────────────── */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="rounded-[2rem] bg-white border border-[#ebd7fa] shadow-sm p-6 sm:p-10 space-y-8">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {completingExisting ? "Complete KYC Verification" : "Sell on Fastlink"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {completingExisting
                  ? "Finish verification to unlock selling. You can skip and return later."
                  : "Create your store, then verify when you’re ready — KYC is not required to access the dashboard."}
              </p>
            </div>
          </div>

          {!completingExisting && (
            <div className="flex gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1">
                  <div className={cn("h-1.5 rounded-full transition-all", i <= step ? "bg-[#7a3dbf]" : "bg-[#ebd7fa]")} />
                  <p className={cn("text-[10px] font-bold mt-1.5 uppercase tracking-wider", i === step ? "text-[#7a3dbf]" : "text-slate-400")}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {!completingExisting && step === 0 && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-700">What kind of store are you opening?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {STORE_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("type", value)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                      form.type === value
                        ? "border-[#7a3dbf] bg-[#f3eafb]/70 ring-1 ring-[#7a3dbf]"
                        : "border-[#ebd7fa] bg-white hover:bg-[#faf6ff]"
                    )}
                  >
                    <p className="font-bold text-sm text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
              {form.type === "mall_store" && (
                <label className="block space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-700">Select Shopping Mall *</span>
                  <select
                    required
                    value={form.mall_id}
                    onChange={(e) => update("mall_id", e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
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

          {!completingExisting && step === 1 && (
            <div className="space-y-4">
              {(
                [
                  ["business_name", "Business / Store Name *"],
                  ["phone", "Business Phone Number *"],
                  ["location", "Store Address / Location (Optional)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                  <input
                    required={key !== "location"}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                  />
                </label>
              ))}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Product Category (Optional)</span>
                <select
                  value={form.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                >
                  <option value="">Select primary category…</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700">About your store (Optional)</span>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                />
              </label>
            </div>
          )}

          {(completingExisting || step === 2) && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 bg-[#faf6ff] p-3 rounded-xl border border-[#ebd7fa]">
                Bank settlement details are required to verify KYC. You can skip and complete this later from your seller dashboard.
              </p>
              {(
                [
                  ["bank_name", "Settlement Bank Name"],
                  ["bank_account_number", "10-digit NUBAN Account Number"],
                  ["bank_account_name", "Beneficiary Account Name"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                  <input
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                  />
                </label>
              ))}
              <div className="pt-2 space-y-3">
                <p className="text-xs font-bold text-slate-700">Optional KYC Documents (PDF or image, max 8MB)</p>
                <label className="block space-y-1">
                  <span className="text-xs text-slate-600">CAC Certificate</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setCacFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f3eafb] file:text-[#7a3dbf] hover:file:bg-[#ebd7fa]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-slate-600">Government Valid ID</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f3eafb] file:text-[#7a3dbf] hover:file:bg-[#ebd7fa]"
                  />
                </label>
              </div>
            </div>
          )}

          {!completingExisting && step === 3 && (
            <div className="space-y-3 text-xs text-slate-600 bg-[#faf6ff] p-5 rounded-2xl border border-[#ebd7fa]">
              <p>
                <span className="font-bold text-slate-900">Store Type:</span>{" "}
                {STORE_TYPES.find((t) => t.value === form.type)?.label}
              </p>
              <p>
                <span className="font-bold text-slate-900">Business Name:</span> {form.business_name}
              </p>
              <p>
                <span className="font-bold text-slate-900">Contact Phone:</span> {form.phone}
              </p>
              {form.location && (
                <p>
                  <span className="font-bold text-slate-900">Location:</span> {form.location}
                </p>
              )}
              {(cacFile || idFile) && (
                <p className="text-xs font-bold text-[#7a3dbf] pt-1">
                  Documents attached: {[cacFile && "CAC Certificate", idFile && "Government ID"].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="text-[11px] text-slate-400 pt-2 border-t border-[#ebd7fa]">
                You can submit KYC now for verification, or save the store draft and start uploading products.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            {!completingExisting ? (
              <>
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#ebd7fa] px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#faf6ff] disabled:opacity-40 transition"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                {step < STEPS.length - 1 ? (
                  <div className="flex gap-2 ml-auto">
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#ebd7fa] px-4 py-2.5 text-xs font-bold text-[#7a3dbf] hover:bg-[#f3eafb] transition"
                      >
                        Skip KYC
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!canAdvance()}
                      onClick={() => setStep((s) => s + 1)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 shadow-sm shadow-purple-600/20 transition active:scale-95"
                    >
                      <span>Next</span> <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleCreateStore(false)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#ebd7fa] px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#faf6ff] disabled:opacity-70 transition"
                    >
                      {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                      <span>Create Store Draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={isLoading || !(form.bank_name && form.bank_account_number && form.bank_account_name)}
                      onClick={() => handleCreateStore(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 shadow-sm shadow-purple-600/20 transition active:scale-95"
                    >
                      {isLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                      <span>Submit KYC for Verification</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-2 w-full justify-end">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-xl border border-[#ebd7fa] px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#faf6ff] transition"
                >
                  Go to dashboard
                </Link>
                <button
                  type="button"
                  disabled={isLoading || !(form.bank_name && form.bank_account_number && form.bank_account_name)}
                  onClick={() => handleCreateStore(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 shadow-sm shadow-purple-600/20 transition active:scale-95"
                >
                  {isLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  <span>Submit KYC</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-slate-400 pt-2">
            Already set up?{" "}
            <Link href="/dashboard" className="font-bold text-[#7a3dbf] hover:underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-slate-400 py-4">
        &copy; {new Date().getFullYear()} Fastlink Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
