"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import signUpBg from "@/assets/sign-up-bg.png";
import logoSvg from "@/assets/logo.svg";
import { authApi, apiErrorMessage } from "@/lib/api";
import { safePostLoginPath } from "@/lib/auth-session";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const requestedRole = searchParams.get("role");
  const requestedOnboardingRole =
    requestedRole === "seller" || requestedRole === "rider" ? requestedRole : null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    onboardingRole: requestedOnboardingRole as "seller" | "rider" | null,
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
      const role = form.onboardingRole === "seller" ? "seller" : "buyer";
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
      if (form.onboardingRole === "rider") {
        router.push(next?.startsWith("/rider") ? next : "/rider/register");
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
    <div className="flex min-h-screen w-full flex-col font-sans">
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-white border-r border-slate-100 overflow-hidden">
          <Image
            src={signUpBg}
            fill
            className="object-cover"
            alt="Register background"
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
            <div className="w-full max-w-[440px]">
              
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
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h2>
                <p className="text-slate-500 text-sm mt-1.5">Join Fastlink to buy, sell, or deliver with ease</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 font-semibold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="E.g. RabiuSM"
                    required
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                      Confirm
                    </label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.referralCode}
                    onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 focus:border-[#7a3dbf] transition-all"
                    placeholder="e.g. FASTLINK100"
                  />
                </div>

                <div className="space-y-2 pb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                    Join as
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.onboardingRole === "seller"}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            onboardingRole: e.target.checked ? "seller" : null,
                          }))
                        }
                        className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer bg-white"
                      />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                        I want to sell on Fastlink (Merchant)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.onboardingRole === "rider"}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            onboardingRole: e.target.checked ? "rider" : null,
                          }))
                        }
                        className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer bg-white"
                      />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                        I want to ride with Fastlink (Courier)
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-sm font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign Up"}
                </button>

                <div className="text-center pt-4">
                  <span className="text-slate-500 text-sm font-medium">Already have an account? </span>
                  <Link href="/login" className="text-[#7a3dbf] text-sm font-bold hover:underline">
                    Log In
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
