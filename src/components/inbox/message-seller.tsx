"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";

import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useStartConversation } from "@/hooks/use-conversations";

export function MessageSellerButton({
  storeId,
  productId,
  orderId,
  label = "Message seller",
}: {
  storeId?: string | null;
  productId?: string;
  orderId?: number | string;
  label?: string;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const start = useStartConversation();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  if (!storeId || role === "seller" || role === "admin") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setError("");
    try {
      const res = await start.mutateAsync({
        store_id: storeId!,
        product_id: productId,
        order_id: orderId ? Number(orderId) : undefined,
        body,
      });
      setOpen(false);
      setBody("");
      router.push(`/account/messages?thread=${res.data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not send the message."));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 text-[#6D349F] hover:text-[#52237A] font-semibold text-xs sm:text-sm transition-colors"
      >
        <MessageSquare size={16} />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-800">Message the seller</h3>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ask about this product or your order…"
              className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button
                type="submit"
                disabled={start.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-5 py-2.5 disabled:opacity-70"
              >
                {start.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
