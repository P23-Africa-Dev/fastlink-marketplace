"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { authApi, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";

export default function AccountProfilePage() {
  const { user, setUser, token } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await authApi.updateProfile({ name, phone });
      setUser(res.data, token);
      queryClient.setQueryData(QUERY_KEYS.auth.user(), res.data);
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(apiErrorMessage(err, "Could not update profile."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A]">Profile</h1>
        <p className="text-sm text-[#8A79A5] mt-1">{user?.email}</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#EBD7FA] bg-white p-5 space-y-4">
        <label className="block text-sm">
          <span className="text-xs font-bold text-[#6D349F]">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#EBD7FA] px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-bold text-[#6D349F]">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#EBD7FA] px-3 py-2"
          />
        </label>
        {message && <p className="text-sm text-[#6D349F]">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#7a3dbf] text-white font-bold px-4 py-2 text-sm inline-flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  );
}
