"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import loginFrame from "@/assets/login-frame.png";
import { authApi, apiErrorMessage } from "@/lib/api";

export default function SetNewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("This reset link is missing a token. Request a new one.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        token,
        password: form.password,
        passwordConfirmation: form.confirmPassword,
      });
      router.push("/login");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not reset password. Request a new link."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col font-sans">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 relative bg-slate-900">
          <Image
            src={loginFrame}
            fill
            className="object-cover"
            alt="Set new password background"
            priority
          />
        </div>

        {/* Right Side - Form Container */}
        <div className="flex flex-col w-full md:w-1/2 bg-[#f4ebfc] relative">

          {/* Back to Login */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
            <Link href="/forgot-password" className="flex items-center text-[#9355d9] font-bold text-lg hover:text-[#7a3dbf] transition-colors">
              <span className="bg-[#9355d9] text-white rounded p-1 mr-3 flex items-center justify-center shadow-sm">
                <ChevronLeft size={18} strokeWidth={3} />
              </span>
              Back
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center p-6 sm:p-10 mt-16 md:mt-0">
            {/* The Purple Card */}
            <div className="w-full max-w-md rounded-[2.5rem] bg-[#9e67e3] p-8 sm:p-12 shadow-2xl">

              {/* Logo & Brand Name */}
              <div className="text-center mb-8">
                <div className="text-white font-display font-bold text-3xl flex justify-center items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a4d2ff]">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                  <span>ASTLINK</span>
                </div>
                <div className="text-[#a4d2ff] text-xs font-semibold tracking-[0.2em] mt-1 -ml-4">
                  MARKETPLACE
                </div>
              </div>

              <h2 className="text-white text-2xl font-bold text-center mb-2">Set New Password</h2>
              <p className="text-white/75 text-sm text-center mb-8">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded border border-white/50 bg-white/10 px-4 py-3 text-sm text-white font-medium text-center">
                    {error}
                  </div>
                )}

                <div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="New Password"
                    required
                    className="w-full bg-transparent border border-white/90 rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm Password"
                    required
                    className="w-full bg-transparent border border-white/90 rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="border-2 border-white rounded-[1.5rem] text-white px-12 py-2 font-bold text-lg hover:bg-white hover:text-[#9e67e3] transition-colors flex items-center justify-center disabled:opacity-70 min-w-[180px]"
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-white text-sm font-medium">Back to </span>
                  <Link href="/login" className="text-white text-sm font-bold hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
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
