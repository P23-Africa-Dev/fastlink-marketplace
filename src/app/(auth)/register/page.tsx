"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import signUpBg from "@/assets/sign-up-bg.png";
import { authApi, apiErrorMessage } from "@/lib/api";
import { safePostLoginPath } from "@/lib/auth-session";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const requestedSeller = searchParams.get("role") === "seller";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    sellOnFastlink: requestedSeller,
    referralCode: searchParams.get("ref") ?? "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const role = form.sellOnFastlink ? "seller" : "buyer";
      const { data } = await authApi.register(form.name, form.email, form.password, {
        passwordConfirmation: form.confirmPassword,
        role,
        referralCode: form.referralCode.trim() || undefined,
      });
      setUser(data.user, data.token);
      queryClient.setQueryData(QUERY_KEYS.auth.user(), data.user);
      const next = searchParams.get("next");
      if (role === "seller") {
        router.push(next?.startsWith("/vendor") ? next : "/vendor/register");
        return;
      }
      router.push(safePostLoginPath(next, data.user.role));
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col font-sans relative">
      {/* Background & Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 sm:p-10 min-h-[700px]">
        {/* Background Image */}
        <Image
          src={signUpBg}
          fill
          className="object-cover"
          alt="Register background"
          priority
        />
        {/* Subtle purple tint overlay */}
        <div className="absolute inset-0 bg-purple-900/10 z-0" />

        {/* Back to Menu */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <Link href="/" className="flex items-center text-[#9355d9] font-bold text-lg hover:text-[#7a3dbf] transition-colors">
            <span className="bg-[#9355d9] text-white rounded p-1 mr-3 flex items-center justify-center shadow-sm">
              <ChevronLeft size={18} strokeWidth={3} />
            </span>
            Back to Menu
          </Link>
        </div>

        {/* Center Registration Card */}
        <div className="w-full max-w-md rounded-[2.5rem] bg-[#9e67e3]/85 backdrop-blur-md p-8 sm:p-12 shadow-2xl z-10">
          
          {/* Logo & Brand Name */}
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="flex items-center gap-1.5 justify-center">
              {/* Official Fastlink Arrow Icon */}
              <svg width="32" height="28" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 11L10 3L18 11L10 19" stroke="#5FD0C8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11H24" stroke="#5FD0C8" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M2 6H12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              </svg>
              <span className="text-white font-display font-extrabold text-3xl tracking-wide">
                ASTLINK
              </span>
            </div>
            <div className="text-[#5FD0C8] text-[9px] font-bold tracking-[0.25em] -mt-0.5 ml-8">
              MARKETPLACE
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold text-center mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded border border-white/50 bg-white/10 px-4 py-3 text-sm text-white font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Username"
                required
                className="w-full bg-transparent border border-white rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
              />
            </div>

            <div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                required
                className="w-full bg-transparent border border-white rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
              />
            </div>

            <div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Password"
                required
                className="w-full bg-transparent border border-white rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
              />
            </div>

            <div>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                required
                className="w-full bg-transparent border border-white rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
              />
            </div>

            <div>
              <input
                type="text"
                value={form.referralCode}
                onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                placeholder="Referral code (optional)"
                className="w-full bg-transparent border border-white rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
              />
            </div>

            <label className="flex items-center justify-center gap-2 text-white text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.sellOnFastlink}
                onChange={(e) => setForm((p) => ({ ...p, sellOnFastlink: e.target.checked }))}
                className="h-4 w-4 accent-white"
              />
              Sell on Fastlink
            </label>

            <div className="text-center pt-1">
              <Link href="/forgot-password" className="text-white text-sm font-medium hover:underline">
                Forgotten Password?
              </Link>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="border-2 border-white rounded-[1.5rem] text-white px-12 py-2 font-bold text-lg hover:bg-white hover:text-[#9e67e3] transition-colors flex items-center justify-center disabled:opacity-70 min-w-[140px]"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign Up"}
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-white text-sm font-medium">Already have account? </span>
              <Link href="/login" className="text-white text-sm font-bold hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="w-full bg-[#3a1b66] text-[#e5dcf5] px-6 py-5 text-[13px] flex flex-col md:flex-row justify-between items-center z-20">
        <div className="mb-2 md:mb-0">2026 Fastlink market place alright reserved</div>
        <div className="text-center md:text-right">
          Powered: Rabiu SM (Aljauromanee), A Software Engineer and Visual Brand Designer
        </div>
      </div>
    </div>
  );
}
