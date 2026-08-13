"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Lock, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice, cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api";
import { useMe } from "@/hooks/use-auth";
import { useCheckout, useConfirmCheckout, useCreateAddress } from "@/hooks/use-orders";

type Step = "contact" | "shipping" | "payment" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { data: me } = useMe();
  const createAddress = useCreateAddress();
  const checkout = useCheckout();
  const confirmCheckout = useConfirmCheckout();

  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const { items, subtotal, shipping, tax, total, clearCart } = useCartStore();

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  useEffect(() => {
    if (!token) {
      router.replace("/login?next=/checkout");
    }
  }, [token, router]);

  useEffect(() => {
    if (!me) return;
    setForm((prev) => ({
      ...prev,
      email: prev.email || me.email,
      name: prev.name || me.name,
      phone: prev.phone || me.phone || "",
    }));
  }, [me]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
  }

  async function placeOrder() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      let groupId = pendingGroupId;

      if (!groupId) {
        const address = await createAddress.mutateAsync({
          label: "Shipping",
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone,
          isDefault: true,
        });

        const placed = await checkout.mutateAsync({
          address_id: Number(address.data.id),
          delivery_method: "standard",
          payment_method: "demo",
          items: items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            variants: item.selectedVariants,
          })),
        });

        groupId = placed.data.groupId;
        setPendingGroupId(groupId);
      }

      const confirmed = await confirmCheckout.mutateAsync(groupId);
      const first = confirmed.data.orders[0];
      setOrderRef(first?.reference ?? "");
      setTrackingNumber(first?.trackingNumber ?? "");
      setPendingGroupId(null);
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      setSubmitError(apiErrorMessage(error, "Could not place your order. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderPlaced) {
    const displayRef = orderRef.startsWith("#") ? orderRef : `#${orderRef}`;
    const trackHref = trackingNumber
      ? `/order-tracking/${encodeURIComponent(trackingNumber)}?email=${encodeURIComponent(form.email)}`
      : `/account/orders`;

    return (
      <div className="bg-[#EADBF8] min-h-screen py-16 font-montserrat">
        <div className="container-narrow text-center py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2E7FC] border border-white/80 shadow-md">
            <Check size={36} className="text-[#6D349F]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6D349F] mb-3 font-montserrat">
            Order Confirmed!
          </h1>
          <p className="mb-2 text-[#8A79A5] font-medium">
            Demo payment recorded. Your order is confirmed and the seller can fulfil it.
          </p>
          <p className="mb-8 text-xs font-bold text-[#6D349F] bg-white/60 inline-block px-4 py-2 rounded-xl border border-white/80">
            Order Reference: {displayRef}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/account/orders"
              className="w-full sm:w-auto rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-8 py-3.5 shadow-md transition-all"
            >
              View My Orders
            </Link>
            <Link
              href={trackHref}
              className="w-full sm:w-auto rounded-xl border border-[#6D349F] text-[#6D349F] font-bold px-8 py-3.5 hover:bg-purple-100/50 transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#EADBF8] min-h-screen py-16 font-montserrat">
        <div className="container-narrow text-center py-12">
          <h1 className="text-2xl font-extrabold text-[#6D349F] mb-3">Your cart is empty</h1>
          <p className="text-[#8A79A5] mb-8">Add products before checking out.</p>
          <Link
            href="/products"
            className="inline-flex rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-8 py-3.5 shadow-md"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EADBF8] min-h-screen py-10 font-montserrat">
      <div className="container-wide space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#D8C2EF] pb-5">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D349F] hover:text-[#52237A] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Cart</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#6D349F] font-montserrat">
            Fastlink Checkout
          </h1>

          <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-white/80 shadow-xs">
            <Lock size={13} className="text-[#6D349F]" />
            <span className="text-xs font-bold text-[#6D349F]">Secure Payment</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center py-2">
          {STEPS.map((step, i) => {
            const stepIdx = STEPS.findIndex((s) => s.id === currentStep);
            const isDone = i < stepIdx;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isDone && setCurrentStep(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-colors",
                    isDone && "cursor-pointer hover:opacity-80"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-extrabold transition-all shadow-xs",
                      isActive
                        ? "border-[#6D349F] bg-[#6D349F] text-white ring-4 ring-[#6D349F]/20"
                        : isDone
                        ? "border-[#7E37C9] bg-[#7E37C9] text-white"
                        : "border-[#D8C2EF] bg-white text-[#8A79A5]"
                    )}
                  >
                    {isDone ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden text-[11px] font-bold uppercase tracking-wider sm:block",
                      isActive ? "text-[#6D349F]" : "text-[#8A79A5]"
                    )}
                  >
                    {step.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-3 h-0.5 w-12 transition-colors sm:w-20 rounded-full",
                      i < STEPS.findIndex((s) => s.id === currentStep)
                        ? "bg-[#7E37C9]"
                        : "bg-[#D8C2EF]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Form Box */}
          <div className="rounded-2xl bg-[#F6EFFD] p-6 md:p-8 border border-white/60 shadow-sm">
            {currentStep === "contact" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#6D349F] font-montserrat border-b border-[#D8C2EF] pb-3">
                  Contact Information
                </h2>
                <FormField
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  placeholder="Amina Bello"
                />
                <FormField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  placeholder="amina@example.com"
                />
                <FormField
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="+234 800 000 0000"
                />
                <button
                  onClick={nextStep}
                  disabled={!form.name.trim() || !form.email.trim()}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] disabled:opacity-50 text-white font-bold py-3.5 px-6 shadow-md transition-all mt-4"
                >
                  <span>Continue to Shipping</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {currentStep === "shipping" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#6D349F] font-montserrat border-b border-[#D8C2EF] pb-3">
                  Shipping Address
                </h2>
                <FormField
                  label="Street Address"
                  value={form.street}
                  onChange={(v) => update("street", v)}
                  placeholder="15 Zoo Road, Kano Municipal"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="City"
                    value={form.city}
                    onChange={(v) => update("city", v)}
                    placeholder="Kano"
                  />
                  <FormField
                    label="State"
                    value={form.state}
                    onChange={(v) => update("state", v)}
                    placeholder="Kano State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Postal Code"
                    value={form.postalCode}
                    onChange={(v) => update("postalCode", v)}
                    placeholder="700213"
                  />
                  <FormField
                    label="Country"
                    value={form.country}
                    onChange={(v) => update("country", v)}
                    placeholder="Nigeria"
                  />
                </div>
                <button
                  onClick={nextStep}
                  disabled={!form.street.trim() || !form.city.trim() || !form.state.trim()}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] disabled:opacity-50 text-white font-bold py-3.5 px-6 shadow-md transition-all mt-4"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {currentStep === "payment" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#6D349F] font-montserrat border-b border-[#D8C2EF] pb-3">
                  Payment Details
                </h2>
                <p className="flex items-center gap-2 text-xs text-[#8A79A5] bg-white/70 p-3 rounded-xl border border-white/80 font-medium">
                  <ShieldCheck size={16} className="text-[#6D349F] shrink-0" />
                  <span>
                    Demo payment — no real charge. Card details stay in your browser and are not sent to the server.
                  </span>
                </p>
                <FormField
                  label="Card Number"
                  value={form.cardNumber}
                  onChange={(v) => update("cardNumber", v)}
                  placeholder="5399 4242 4242 4242"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Expiry Date"
                    value={form.cardExpiry}
                    onChange={(v) => update("cardExpiry", v)}
                    placeholder="MM / YY"
                  />
                  <FormField
                    label="CVC"
                    value={form.cardCvc}
                    onChange={(v) => update("cardCvc", v)}
                    placeholder="•••"
                  />
                </div>
                <button
                  onClick={nextStep}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold py-3.5 px-6 shadow-md transition-all mt-4"
                >
                  <span>Review Order</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {currentStep === "review" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#6D349F] font-montserrat border-b border-[#D8C2EF] pb-3">
                  Review Your Order
                </h2>
                <div className="rounded-xl border border-[#D8C2EF] bg-white p-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8A79A5] font-semibold">Name</span>
                    <span className="text-[#3B1C5A] font-bold">{form.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A79A5] font-semibold">Email</span>
                    <span className="text-[#3B1C5A] font-bold">{form.email || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A79A5] font-semibold">Shipping Address</span>
                    <span className="text-[#3B1C5A] font-bold text-right">
                      {[form.street, form.city, form.state].filter(Boolean).join(", ") || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A79A5] font-semibold">Payment</span>
                    <span className="text-[#3B1C5A] font-bold">
                      Demo payment{form.cardNumber ? ` · •••• ${form.cardNumber.slice(-4)}` : ""}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                    {submitError}
                  </p>
                )}

                <button
                  onClick={placeOrder}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#6D349F] hover:bg-[#52237A] disabled:opacity-60 text-white font-extrabold py-4 px-6 shadow-lg transition-all mt-4 font-montserrat text-base"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  <span>{isSubmitting ? "Placing order…" : `Place Order · ${formatPrice(total)}`}</span>
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="h-fit rounded-2xl bg-[#F6EFFD] p-6 border border-white/60 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-[#6D349F] font-montserrat border-b border-[#D8C2EF] pb-3">
              Order Summary
            </h3>
            <ul className="divide-y divide-[#E4D1F7]/60">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-purple-100">
                    <Image
                      src={item.product.images[0]?.url ?? ""}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6D349F] text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#6D349F] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-[#8A79A5] truncate">
                      {item.product.seller.name}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-[#6D349F]">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2 text-xs pt-2 border-t border-[#D8C2EF]">
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-[#6D349F]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Estimated Tax</span>
                <span className="font-bold text-[#6D349F]">{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-[#D8C2EF] my-2 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-[#6D349F]">Total</span>
                <span className="text-xl font-extrabold text-[#6D349F] font-montserrat">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#8A79A5]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D8C2EF] bg-white px-4 py-3 text-xs text-[#3B1C5A] placeholder:text-[#8A79A5] focus:border-[#7E37C9] focus:outline-none transition-colors font-montserrat"
      />
    </div>
  );
}
