"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight, Lock } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";

type Step = "contact" | "shipping" | "payment" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { items, subtotal, shipping, tax, total, clearCart } = useCartStore();

  const [form, setForm] = useState({
    email: "",
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
  }

  function placeOrder() {
    clearCart();
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <div className="container-narrow section-padding text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Check size={36} className="text-primary" />
        </div>
        <h1 className="font-display mb-3 text-4xl font-light text-foreground">
          Order Confirmed
        </h1>
        <p className="mb-2 text-muted-foreground">
          Thank you for your purchase. You&apos;ll receive an email shortly.
        </p>
        <p className="mb-10 text-sm text-muted-foreground">
          Order #PRV-{Math.random().toString(36).slice(2, 8).toUpperCase()}
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/products" className="btn-gold">
            Continue Shopping
          </Link>
          <Link href="/dashboard" className="btn-outline-gold">
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-light tracking-[0.12em] text-foreground"
        >
          PROVENANCE
        </Link>
        <div className="flex items-center gap-1">
          <Lock size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Secure Checkout</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-10 flex items-center justify-center gap-0">
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
                  isDone && "cursor-pointer hover:text-primary",
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] uppercase tracking-widest sm:block",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px w-12 transition-colors sm:w-20",
                    i < STEPS.findIndex((s) => s.id === currentStep)
                      ? "bg-primary"
                      : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="rounded bg-card p-6 md:p-8">
          {currentStep === "contact" && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-light text-foreground">
                Contact Information
              </h2>
              <FormField
                label="Full Name"
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="Jordan Avery"
              />
              <FormField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="jordan@example.com"
              />
              <button onClick={nextStep} className="btn-gold w-full mt-2">
                Continue to Shipping
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {currentStep === "shipping" && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-light text-foreground">
                Shipping Address
              </h2>
              <FormField
                label="Street Address"
                value={form.street}
                onChange={(v) => update("street", v)}
                placeholder="42 Bleecker Street, Apt 3B"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="City"
                  value={form.city}
                  onChange={(v) => update("city", v)}
                  placeholder="New York"
                />
                <FormField
                  label="State"
                  value={form.state}
                  onChange={(v) => update("state", v)}
                  placeholder="NY"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={(v) => update("postalCode", v)}
                  placeholder="10012"
                />
                <FormField
                  label="Country"
                  value={form.country}
                  onChange={(v) => update("country", v)}
                  placeholder="US"
                />
              </div>
              <button onClick={nextStep} className="btn-gold w-full mt-2">
                Continue to Payment
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {currentStep === "payment" && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-light text-foreground">
                Payment Details
              </h2>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock size={11} />
                Your card information is encrypted and secure
              </p>
              <FormField
                label="Card Number"
                value={form.cardNumber}
                onChange={(v) => update("cardNumber", v)}
                placeholder="4242 4242 4242 4242"
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
              <button onClick={nextStep} className="btn-gold w-full mt-2">
                Review Order
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-light text-foreground">
                Review Your Order
              </h2>
              <div className="rounded border border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground">{form.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{form.email || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ship to</span>
                  <span className="text-right text-foreground">
                    {[form.street, form.city, form.state].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-foreground">
                    {form.cardNumber ? `•••• ${form.cardNumber.slice(-4)}` : "—"}
                  </span>
                </div>
              </div>
              <button onClick={placeOrder} className="btn-gold w-full mt-2 animate-pulse-gold">
                Place Order · {formatPrice(total)}
                <Lock size={14} />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                By placing your order you agree to our Terms & Privacy Policy.
              </p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded bg-card p-6">
          <h3 className="font-display mb-4 text-xl font-light text-foreground">
            Order Summary
          </h3>
          <ul className="mb-5 divide-y divide-border">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-muted">
                  <Image
                    src={item.product.images[0]?.url ?? ""}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground text-[10px] text-background">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.product.seller.name}</p>
                </div>
                <p className="text-sm text-primary">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="rule-gold my-2" />
            <div className="flex justify-between">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-lg text-primary">{formatPrice(total)}</span>
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
      <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  );
}
