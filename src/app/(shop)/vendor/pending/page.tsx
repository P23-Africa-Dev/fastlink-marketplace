"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ShieldCheck, Store, ArrowLeft, AlertCircle } from "lucide-react";

import logoSvg from "@/assets/logo.svg";
import { useSellerStore } from "@/hooks/use-dashboard";

export default function VendorPendingPage() {
  const { data, isLoading } = useSellerStore();
  const store = data?.data;
  const status = store?.status;
  const kycStatus = store?.kycStatus;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex items-center justify-center text-[#7a3dbf] font-bold text-xs">
        Loading verification state…
      </div>
    );
  }

  if (store?.canSell || (status === "approved" && kycStatus === "approved")) {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between p-6 font-sans">
        <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
          <Link href="/" className="inline-block">
            <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-[#7a3dbf] hover:underline">
            Dashboard
          </Link>
        </header>

        <div className="rounded-[2rem] bg-white border border-[#ebd7fa] shadow-sm p-8 max-w-md w-full mx-auto text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-bold text-xl text-slate-900">Your store is verified!</h2>
          <p className="text-xs text-slate-500">Your account is fully approved. You can now sell and publish listings.</p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-[#7a3dbf] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 hover:bg-[#682fad] transition">
            Open seller dashboard
          </Link>
        </div>

        <footer className="text-center text-xs text-slate-400 py-4">
          &copy; {new Date().getFullYear()} Fastlink Marketplace. All rights reserved.
        </footer>
      </div>
    );
  }

  if (kycStatus === "rejected" || status === "rejected") {
    return (
      <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between p-6 font-sans">
        <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
          <Link href="/" className="inline-block">
            <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-[#7a3dbf] hover:underline">
            Dashboard
          </Link>
        </header>

        <div className="rounded-[2rem] bg-white border border-rose-200 shadow-sm p-8 max-w-md w-full mx-auto text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-bold text-xl text-rose-800">Verification not approved</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {store?.kycRejectionReason ||
              "Your KYC was rejected. Update your details and resubmit, or contact support for help."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/vendor/register"
              className="inline-block rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 transition"
            >
              Fix KYC details
            </Link>
            <Link href="/dashboard" className="text-xs font-bold text-[#7a3dbf] hover:underline self-center">
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

  const underReview = kycStatus === "under_review" || kycStatus === "submitted";

  return (
    <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between p-6 font-sans">
      <header className="max-w-lg mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="inline-block">
          <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#7a3dbf] transition"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </header>

      <div className="rounded-[2rem] bg-white border border-[#ebd7fa] shadow-sm p-8 sm:p-10 max-w-lg w-full mx-auto space-y-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
          <Clock size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {underReview ? "Verification Under Review" : "Complete Your Verification"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            {underReview ? (
              store?.name ? (
                <>
                  Store <strong className="text-slate-800 font-semibold">{store.name}</strong> is currently undergoing admin review. You can still access your dashboard to create draft listings.
                </>
              ) : (
                "Your seller verification documents are currently pending admin review."
              )
            ) : (
              "Your account is ready. Complete business verification to start selling — or continue to your dashboard and finish later."
            )}
          </p>
        </div>
        <div className="rounded-2xl bg-[#faf6ff] border border-[#ebd7fa] p-4 text-left text-xs text-slate-600 space-y-2">
          <p className="flex items-center gap-2 font-bold text-[#7a3dbf]">
            <Store size={15} /> While KYC is under review
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>You can configure store settings & product drafts</li>
            <li>Live buyer checkouts and payouts remain locked</li>
            <li>Verification updates will be posted to your notification center</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!underReview && (
            <Link
              href="/vendor/register"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 transition"
            >
              <ShieldCheck size={15} /> Complete KYC
            </Link>
          )}
          <Link
            href="/dashboard"
            className={
              underReview
                ? "inline-flex items-center justify-center rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 transition"
                : "inline-flex items-center justify-center rounded-xl border border-[#ebd7fa] bg-[#faf6ff] hover:bg-[#f3eafb] px-5 py-2.5 text-xs font-bold text-[#7a3dbf] transition"
            }
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
