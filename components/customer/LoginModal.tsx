"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success("Successfully logged in!");
    onClose();
    setEmail("");
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fixed Full Screen Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal Container - Absolute under Profile Icon on desktop, Fixed Centered on mobile */}
      <div className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-6 top-[12%] md:top-full mt-0 md:mt-4 w-auto md:w-[420px] max-w-[420px] md:max-w-none mx-auto md:mx-0 bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl z-[9999] border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 text-left">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mt-2">
          <h2 className="text-[26px] font-semibold text-gray-800 tracking-tight">
            Sign in to your account
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 text-left">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all h-[50px]"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => toast.info("Password reset request simulated.")}
                className="text-sm font-medium text-[#00AEEF] hover:underline"
              >
                Forget Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all h-[50px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-primary-dark hover:bg-primary-dark/95 text-white font-bold text-sm h-[54px] rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-98 shadow-md tracking-wider"
          >
            <span>LOGIN &rarr;</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 my-1">
          <div className="h-[1px] bg-gray-200 flex-1" />
          <span>Don't have account</span>
          <div className="h-[1px] bg-gray-200 flex-1" />
        </div>

        {/* Create Account Button */}
        <button
          onClick={() => toast.info("Registration is simulated.")}
          className="w-full bg-white border border-orange-200/80 hover:bg-orange-50/10 text-primary-dark font-bold text-sm h-[54px] rounded-xl transition-all active:scale-98 tracking-wider"
        >
          CREATE ACCOUNT
        </button>
      </div>
    </>
  );
}
