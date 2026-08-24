"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import Image from "next/image";

import loginFrame from "@/assets/login-frame.png";
import logoSvg from "@/assets/logo.svg";
import { authApi, apiErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not send reset link."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col font-sans">
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-slate-900 overflow-hidden">
          <Image
            src={loginFrame}
            fill
            className="object-cover"
            alt="Forgot password background"
            priority
          />
          <div className="absolute inset-0 bg-[#3B1C5A]/10 mix-blend-multiply" />
        </div>

        {/* Right Side - Form Container */}
        <div className="flex flex-col w-full md:w-[55%] lg:w-1/2 relative bg-white">
          
          {/* Back to Login */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
            <Link
              href="/login"
              className="flex items-center text-[#7a3dbf] font-semibold text-sm hover:text-[#682fad] transition-colors bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"
            >
              <ChevronLeft size={16} strokeWidth={2.5} className="mr-1" />
              Back to Login
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center p-6 sm:p-12 md:p-16 mt-12 md:mt-0">
            {/* The Form Content */}
            <div className="w-full max-w-[400px]">
              
              {/* Logo */}
              <div className="flex justify-center mb-10">
                <Image
                  src={logoSvg}
                  alt="Fastlink Marketplace"
                  width={180}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Forgot Password?</h2>
                <p className="text-slate-500 text-sm mt-1.5">
                  Enter your email and we&apos;ll send you a password reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {sent && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium text-center">
                    If that email exists, we sent a reset link. Check your inbox.
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 font-semibold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-sm font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
                </button>

                <div className="text-center pt-4">
                  <span className="text-slate-500 text-sm font-medium">Remember your password? </span>
                  <Link href="/login" className="text-[#7a3dbf] text-sm font-bold hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="w-full bg-[#3a1b66] text-[#e5dcf5] px-6 py-4 text-xs flex flex-col md:flex-row justify-between items-center shrink-0">
        <div className="mb-2 md:mb-0 font-medium">© 2026 Fastlink marketplace all rights reserved</div>
        <div className="text-center md:text-right font-medium">
          Powered: Rabiu SM (Aljauromanee), A Software Engineer and Visual Brand Designer
        </div>
      </div>
    </div>
  );
}
