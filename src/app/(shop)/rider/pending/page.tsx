"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Clock3, LogOut, ShieldCheck } from "lucide-react";

import logoSvg from "@/assets/logo.svg";
import { useRiderMe } from "@/hooks/use-rider";
import { useAuthStore } from "@/store/auth-store";

export default function RiderPendingPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const me = useRiderMe();
  const status = me.data?.status ?? "pending";
  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen bg-[#faf6ff] flex flex-col justify-between p-6 font-sans">
      <header className="max-w-lg mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="inline-block">
          <Image src={logoSvg} alt="Fastlink Logo" width={130} height={36} className="h-8 w-auto object-contain" priority />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#7a3dbf] transition"
          >
            <ArrowLeft size={14} />
            <span>Marketplace</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="rounded-[2rem] bg-white border border-[#ebd7fa] shadow-sm p-8 sm:p-10 max-w-lg w-full mx-auto space-y-6 text-center">
        <div
          className={
            isRejected
              ? "mx-auto h-14 w-14 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center"
              : "mx-auto h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center"
          }
        >
          {isRejected ? <AlertTriangle size={28} /> : <Clock3 size={28} />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRejected ? "Rider verification not approved" : "Rider verification under review"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            {isRejected
              ? "Your rider application was not approved. Contact support or resubmit your details from rider onboarding."
              : "Your rider profile is pending admin approval. You can access your rider portal now, but delivery assignments remain locked until verification is approved."}
          </p>
        </div>
        <div className="rounded-2xl bg-[#faf6ff] border border-[#ebd7fa] p-4 text-left text-xs text-slate-600 space-y-2">
          <p className="flex items-center gap-2 font-bold text-[#7a3dbf]">
            <ShieldCheck size={15} /> While waiting for approval
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>You can access your rider dashboard and profile details</li>
            <li>Order assignments remain locked until status changes to approved</li>
            <li>You will receive a notification when review is complete</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/rider"
            className="inline-flex items-center justify-center rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-purple-600/20 transition"
          >
            Go to rider portal
          </Link>
          {isRejected && (
            <Link
              href="/rider/register"
              className="inline-flex items-center justify-center rounded-xl border border-[#ebd7fa] bg-[#faf6ff] hover:bg-[#f3eafb] px-5 py-2.5 text-xs font-bold text-[#7a3dbf] transition"
            >
              Update rider details
            </Link>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 py-4">
        &copy; {new Date().getFullYear()} Fastlink Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
