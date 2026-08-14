"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import signUpBg from "@/assets/sign-up-bg.png";
import { FastlinkLogo } from "@/components/brand/fastlink-logo";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
      const { data } = await authApi.register(form.name, form.email, form.password);
      setUser(data.user, data.token);
      router.push("/products");
    } catch {
      setError("Something went wrong. Please try again.");
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
          
          <div className="mb-6 flex justify-center">
            <FastlinkLogo linked={false} className="h-10" />
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
                placeholder="Forgotten password"
                required
                className="w-full bg-transparent border border-white rounded font-medium text-white placeholder:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center"
              />
            </div>

            <div className="text-center pt-1">
              <Link href="#" className="text-white text-sm font-medium hover:underline">
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
