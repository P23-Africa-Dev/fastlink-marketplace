"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Store, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

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
    // KYC step is optional — bank can be filled later
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
      <div className="container-wide py-20 text-center text-[#6D349F] font-semibold">
        {storeLoading ? "Loading…" : "Redirecting to sign up…"}
      </div>
    );
  }

  if (existingStore?.canSell) {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-8 max-w-md text-center space-y-4">
          <p className="font-bold text-[#3B1C5A]">Your store is already verified.</p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold">
            Open dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (postCreate === "choose") {
    return (
      <div className="min-h-screen bg-[#EADBF8] flex items-center justify-center p-6 font-montserrat">
        <div className="rounded-3xl bg-white border border-[#EBD7FA] shadow-md p-8 sm:p-10 max-w-lg w-full space-y-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#7a3dbf] text-white flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#3B1C5A]">Complete your verification</h1>
            <p className="text-sm text-[#8A79A5] mt-2">
              Your account has been created successfully. Complete your business verification to start selling
              on the marketplace — or go to your dashboard and finish later.
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-sm font-bold disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Complete KYC
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[#EBD7FA] px-5 py-2.5 text-sm font-bold text-[#6D349F]"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
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
              <h1 className="text-2xl font-extrabold text-[#6D349F] font-montserrat">
                {completingExisting ? "Complete KYC" : "Sell on Fastlink"}
              </h1>
              <p className="text-sm text-[#8A79A5]">
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
                  <div className={cn("h-1 rounded-full", i <= step ? "bg-[#7a3dbf]" : "bg-[#EBD7FA]")} />
                  <p className={cn("text-[10px] font-bold mt-1", i === step ? "text-[#7a3dbf]" : "text-[#8A79A5]")}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {!completingExisting && step === 0 && (
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

          {!completingExisting && step === 1 && (
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

          {(completingExisting || step === 2) && (
            <div className="space-y-4">
              <p className="text-sm text-[#8A79A5]">
                Bank details are required to submit KYC for review. You can skip and finish later from the
                dashboard.
              </p>
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
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-xl border border-[#ebd7fa] bg-white px-4 py-2.5 text-sm"
                  />
                </label>
              ))}
              <p className="text-sm text-[#8A79A5] pt-2">Optional KYC files (PDF or image, max 8MB).</p>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">CAC certificate</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setCacFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#6D349F]">Government ID</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs"
                />
              </label>
            </div>
          )}

          {!completingExisting && step === 3 && (
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
                You can submit KYC now, or save the store and use a limited dashboard until verification is
                approved.
              </p>
              {(cacFile || idFile) && (
                <p className="text-xs font-semibold text-[#6D349F]">
                  Documents attached: {[cacFile && "CAC", idFile && "ID"].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            {!completingExisting ? (
              <>
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#EBD7FA] px-4 py-2.5 text-xs font-bold text-[#6D349F] disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                {step < STEPS.length - 1 ? (
                  <div className="flex gap-2 ml-auto">
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#EBD7FA] px-4 py-2.5 text-xs font-bold text-[#6D349F]"
                      >
                        Skip KYC
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!canAdvance()}
                      onClick={() => setStep((s) => s + 1)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#7a3dbf] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleCreateStore(false)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#EBD7FA] px-5 py-2.5 text-xs font-bold text-[#6D349F] disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                      Create store
                    </button>
                    <button
                      type="button"
                      disabled={isLoading || !(form.bank_name && form.bank_account_number && form.bank_account_name)}
                      onClick={() => handleCreateStore(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#7a3dbf] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Submit KYC"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-2 w-full justify-end">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-xl border border-[#EBD7FA] px-5 py-2.5 text-xs font-bold text-[#6D349F]"
                >
                  Go to dashboard
                </Link>
                <button
                  type="button"
                  disabled={isLoading || !(form.bank_name && form.bank_account_number && form.bank_account_name)}
                  onClick={() => handleCreateStore(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7a3dbf] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Submit KYC"}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-[#8A79A5]">
            Already set up?{" "}
            <Link href="/dashboard" className="font-bold text-[#7a3dbf] hover:underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
