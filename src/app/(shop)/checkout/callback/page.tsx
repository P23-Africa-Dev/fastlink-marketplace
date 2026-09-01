"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";

import { checkoutApi, apiErrorMessage } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";
import type { ApiOrder } from "@/types/order";

function CheckoutCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const clearCart = useCartStore((s) => s.clearCart);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<ApiOrder | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setError("Missing payment reference.");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      const next = `/checkout/callback?${searchParams.toString()}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    let cancelled = false;
    checkoutApi
      .verify(reference)
      .then((result) => {
        if (cancelled) return;
        const first = result.data.orders[0] ?? null;
        setOrder(first);
        sessionStorage.removeItem("fastlink_checkout_group");
        clearCart();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err, "We could not confirm this payment yet."));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [reference, clearCart, router, searchParams]);

  const trackingHref = order?.trackingNumber
    ? `/order-tracking/${encodeURIComponent(order.trackingNumber)}?email=${encodeURIComponent(order.buyer.email)}`
    : "/account/orders";

  return (
    <div className="bg-[#EADBF8] min-h-screen py-16 font-montserrat">
      <div className="container-narrow text-center py-12">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-[#6D349F]" />
            <h1 className="text-3xl font-extrabold text-[#6D349F] mb-3">Confirming payment…</h1>
            <p className="text-[#8A79A5] font-medium">Please wait while we verify your Paystack payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2E7FC] border border-white/80 shadow-md">
              <Check size={36} className="text-[#6D349F]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6D349F] mb-3">Payment confirmed</h1>
            <p className="mb-2 text-[#8A79A5] font-medium">
              Your order is paid. The seller can now start fulfilment.
            </p>
            {order?.reference && (
              <p className="mb-8 text-xs font-bold text-[#6D349F] bg-white/60 inline-block px-4 py-2 rounded-xl border border-white/80">
                Order Reference: #{order.reference}
              </p>
            )}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/account/orders"
                className="w-full sm:w-auto rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-8 py-3.5 shadow-md transition-all"
              >
                View My Orders
              </Link>
              <Link
                href={trackingHref}
                className="w-full sm:w-auto rounded-xl bg-white text-[#6D349F] font-bold px-8 py-3.5 border border-[#D8C2EF] shadow-sm"
              >
                Track order
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 border border-rose-100 shadow-md">
              <AlertCircle size={36} className="text-rose-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#6D349F] mb-3">Payment not confirmed</h1>
            <p className="mb-8 text-[#8A79A5] font-medium">{error}</p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/checkout"
                className="w-full sm:w-auto rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-8 py-3.5 shadow-md"
              >
                Return to checkout
              </Link>
              <Link href="/account/orders" className="text-sm font-bold text-[#6D349F] underline">
                Check my orders
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#EADBF8] min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#6D349F]" />
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}
