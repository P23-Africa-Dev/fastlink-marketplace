import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Clock, Building2 } from "lucide-react";

import { ContactForm } from "@/features/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach out to our dedicated FastLink support team. We're here to help you with any questions or concerns.",
};

// ── Data ───────────────────────────────────────────────────────

const SUPPORT_CHANNELS = [
  {
    id: "email",
    title: "Email Support",
    description: (
      <>
        Email us at{" "}
        <a href="mailto:support@fastlink.com.ng" className="font-semibold text-brand-700 hover:underline">
          support@fastlink.com.ng
        </a>{" "}
        for general inquiries.
      </>
    ),
    icon: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#380469" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    id: "livechat",
    title: "Live Chat",
    description: "Chat with a support agent instantly on our website.",
    icon: () => (
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#380469" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1" fill="#380469"/><circle cx="12" cy="10" r="1" fill="#380469"/><circle cx="15" cy="10" r="1" fill="#380469"/>
        </svg>
        {/* "Live" badge */}
        <span className="absolute -right-2 -top-2 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
          Live
        </span>
      </div>
    ),
  },
  {
    id: "phone",
    title: "Phone Support",
    description: (
      <>
        Call our customer service hotline:{" "}
        <a href="tel:+2348003278546" className="font-semibold text-brand-700 hover:underline">
          +234 800-FASTLINK.
        </a>
      </>
    ),
    icon: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#380469" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    id: "technical",
    title: "Technical Support",
    description: (
      <>
        For technical and account issues:{" "}
        <a href="mailto:tech.support@fastlink.com.ng" className="font-semibold text-brand-700 hover:underline">
          tech.support@fastlink.com.ng
        </a>
      </>
    ),
    icon: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#380469" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    id: "social",
    title: "Social Media",
    description: "Connect with us on social media for quick updates and help.",
    icon: () => (
      <div className="flex items-center gap-1">
        {/* Facebook */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#380469"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        {/* X/Twitter */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#380469"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        {/* Instagram */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#380469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      </div>
    ),
  },
];

// ── Page ───────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div className="bg-brand-50 min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="py-6">
        <div className="container-wide">
          <div className="relative h-[340px] w-full overflow-hidden rounded-2xl sm:h-[380px] md:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&auto=format&fit=crop&q=80"
              alt="FastLink customer support team"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(238,224,250,0.96) 0%, rgba(238,224,250,0.85) 30%, rgba(238,224,250,0.45) 55%, transparent 75%)",
              }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
              <nav className="mb-5 flex items-center gap-1.5 text-xs text-neutral-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                <ChevronRight size={13} className="text-neutral-400" />
                <span className="font-semibold text-neutral-700">Contact Us</span>
              </nav>
              <h1 className="mb-3 text-3xl font-extrabold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
                We&apos;re Here to Help.
              </h1>
              <p className="mb-7 max-w-xs text-sm font-semibold leading-relaxed text-neutral-700 sm:text-base">
                Reach out to our dedicated FastLink support
                <br className="hidden sm:block" />
                team. Contact Us Now.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#contact-form"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
                  style={{ background: "#380469" }}
                >
                  Get in Touch
                </a>
                <a
                  href="#live-chat"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-white px-6 py-2.5 text-sm font-bold text-neutral-800 transition-all duration-200 hover:bg-brand-50"
                >
                  Live Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Us heading ────────────────────────────────── */}
      <section className="pt-10 pb-2">
        <div className="container-wide flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-[80px] rounded-full" style={{ background: "#834AB9" }} />
          <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Contact Us</h2>
          <div className="h-px flex-1 max-w-[80px] rounded-full" style={{ background: "#834AB9" }} />
        </div>
      </section>

      {/* ── What We Offer ─────────────────────────────────────── */}
      <section className="py-6">
        <div className="container-wide">
          <div
            className="rounded-2xl bg-white px-8 pb-10 pt-8"
            style={{ border: "1px solid rgba(131,74,185,0.18)" }}
          >
            {/* Sub-heading */}
            <div className="mb-7 flex items-center justify-center gap-4">
              <div className="h-px w-8 rounded-full" style={{ background: "#834AB9" }} />
              <h3 className="text-xl font-bold text-brand-900">What We Offer</h3>
              <div className="h-px w-8 rounded-full" style={{ background: "#834AB9" }} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {SUPPORT_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div
                    key={ch.id}
                    className="flex flex-col items-center gap-4 rounded-xl px-4 py-6 text-center"
                    style={{ border: "1px solid rgba(131,74,185,0.14)" }}
                  >
                    {/* Circle icon */}
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full"
                      style={{ background: "rgba(131,74,185,0.10)" }}
                    >
                      <Icon />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900">{ch.title}</h4>
                    <p className="text-xs leading-relaxed text-neutral-500 text-center">
                      {ch.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form + Map ────────────────────────────────── */}
      <section id="contact-form" className="py-6 pb-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Left — Contact Form */}
            <div
              className="rounded-2xl p-7"
              style={{ background: "#380469" }}
            >
              <h3 className="mb-5 text-xl font-bold text-white">Contact Form</h3>
              <ContactForm />
            </div>

            {/* Right — Map + Info */}
            <div className="grid grid-cols-2 border rounded-2xl p-4" style={{ borderColor: "rgba(131,74,185,0.14)" }}>
              {/* Embedded map */}
              <div className="relative overflow-hidden rounded-2xl">
                <iframe
                  title="FastLink HQ location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126093.0198!2d3.3280027!3d6.5243793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full"
                />
              </div>

              {/* Info card */}
              <div
                className="flex-1 rounded-2xl px-6"
              >
                <div className="flex flex-col gap-5">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "rgba(131,74,185,0.10)" }}
                    >
                      <MapPin size={16} style={{ color: "#834AB9" }} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Address</p>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        123 FastLink Plaza,<br />Lagos, Nigeria
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "rgba(131,74,185,0.10)" }}
                    >
                      <Clock size={16} style={{ color: "#834AB9" }} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Hours</p>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        Mon–Fri 8am–8pm<br />Sat 9am–5pm
                      </p>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "rgba(131,74,185,0.10)" }}
                    >
                      <Building2 size={16} style={{ color: "#834AB9" }} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Office</p>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        Departments<br />
                        Summary Lines<br />
                        Services &amp; Connections
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
