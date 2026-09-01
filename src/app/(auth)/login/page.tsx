"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import loginFrame from "@/assets/login-frame.jpg";
import { FastlinkLogo } from "@/components/brand/fastlink-logo";
import { PasswordInput } from "@/components/ui/password-input";
import { authApi, apiErrorMessage } from "@/lib/api";
import { safePostLoginPath } from "@/lib/auth-session";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await authApi.login(form.email, form.password);
      setUser(data.user, data.token);
      queryClient.setQueryData(QUERY_KEYS.auth.user(), data.user);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(safePostLoginPath(next, data.user.role));
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid email or password."));
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
            alt="Login background"
            priority
          />
          <div className="absolute inset-0 bg-[#3B1C5A]/10 mix-blend-multiply" />
        </div>

        {/* Right Side - Form Container */}
        <div className="flex flex-col w-full md:w-[55%] lg:w-1/2 relative bg-white">
          
          {/* Back to Menu */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
            <Link href="/" className="flex items-center text-[#7a3dbf] font-semibold text-sm hover:text-[#682fad] transition-colors bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
              <ChevronLeft size={16} strokeWidth={2.5} className="mr-1" />
              Back to Menu
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center p-6 sm:p-12 md:p-16 mt-12 md:mt-0">
            {/* The Form Content (No Card Border) */}
            <div className="w-full max-w-[400px]">
              <div className="flex justify-center mb-10">
                <FastlinkLogo linked={false} className="h-10" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 text-sm mt-1.5">Please sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 font-semibold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Email / Username
                  </label>
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Password
                  </label>
                  <PasswordInput
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) => setForm(p => ({ ...p, remember: e.target.checked }))}
                      className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer bg-white"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
                  </label>
                  
                  <Link href="/forgot-password" className="text-sm font-semibold text-[#7a3dbf] hover:text-[#682fad] transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-sm font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Log In"}
                </button>

                <div className="text-center pt-4">
                  <span className="text-slate-500 text-sm font-medium">Don&apos;t have an account? </span>
                  <Link href="/register" className="text-[#7a3dbf] text-sm font-bold hover:underline">
                    Sign up
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
