"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", orderNumber: "", subject: "", message: "",
  });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up real submission
    setSent(true);
  }

  const inputCls =
    "w-full rounded-lg bg-white/95 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-white/60 transition";

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold">Message Sent!</h3>
        <p className="text-sm text-white/70">We&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={() => { setSent(false); setForm({ name: "", email: "", orderNumber: "", subject: "", message: "" }); }}
          className="mt-2 rounded-lg bg-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/30 transition"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className={inputCls}
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className={inputCls}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="orderNumber"
          value={form.orderNumber}
          onChange={handleChange}
          placeholder="Order Number (optional)"
          className={inputCls}
        />
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
          className={inputCls}
        />
      </div>

      {/* Message */}
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Message"
        required
        rows={5}
        className={`${inputCls} resize-none`}
      />

      <button
        type="submit"
        className="mt-1 w-full rounded-lg bg-white py-3 text-sm font-bold transition hover:bg-brand-50"
        style={{ color: "#380469" }}
      >
        Send Message
      </button>
    </form>
  );
}
