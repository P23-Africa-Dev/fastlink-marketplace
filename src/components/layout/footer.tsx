import Link from "next/link";
import Image from "next/image";
import logoSvg from "@/assets/logo.svg";

// ── Data ───────────────────────────────────────────────────────

const SHOP_LINKS = [
  { href: "/products", label: "All Categories" },
  { href: "/products?category=Electronics", label: "Electronic" },
  { href: "/products?category=Fashion", label: "Fashion" },
  { href: "/products?category=Groceries", label: "Groceries" },
  { href: "/products?type=malls", label: "Malls" },
];

const CUSTOMER_SERVICE_LINKS = [
  { href: "/help", label: "Help Center" },
  { href: "/how-to-buy", label: "How to Buy" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Return & Refunds" },
  { href: "/contact", label: "Contact Us" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

const SOCIAL_LINKS: { href: string; label: string; iconKey: "facebook" | "x" | "instagram" | "linkedin" }[] = [
  { href: "https://facebook.com",  label: "Facebook",    iconKey: "facebook"  },
  { href: "https://x.com",         label: "X (Twitter)", iconKey: "x"         },
  { href: "https://instagram.com", label: "Instagram",   iconKey: "instagram" },
  { href: "https://linkedin.com",  label: "LinkedIn",    iconKey: "linkedin"  },
];

// ── Social icons ───────────────────────────────────────────────

function SocialIcon({ iconKey }: { iconKey: "facebook" | "x" | "instagram" | "linkedin" }) {
  if (iconKey === "facebook") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
  if (iconKey === "x") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (iconKey === "instagram") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
  // linkedin
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

// ── App store badge ────────────────────────────────────────────

function AppStoreBadge({
  store,
  href,
}: {
  store: "apple" | "google";
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 transition-opacity hover:opacity-80"
      aria-label={store === "apple" ? "Download on App Store" : "Get it on Google Play"}
    >
      {store === "apple" ? (
        /* Apple icon */
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ) : (
        /* Google Play icon */
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3.18 23.76c.3.17.65.19.97.08L14.88 12 11.1 8.22 3.18 23.76z" fill="#EA4335"/>
          <path d="M20.96 10.27 17.6 8.37l-3.56 3.56 3.56 3.56 3.38-1.91a1.88 1.88 0 0 0 0-3.31z" fill="#FBBC04"/>
          <path d="M3.18.24A1.87 1.87 0 0 0 2.5 1.66v20.68c0 .53.22 1 .68 1.42L14.88 12 3.18.24z" fill="#4285F4"/>
          <path d="M14.88 12 3.18 23.76c.32.11.68.09.97-.08l12.45-7.05L14.88 12z" fill="#34A853"/>
        </svg>
      )}
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] font-normal text-white/80">
          Click and Download here
        </span>
        <span className="text-sm font-bold text-white">
          {store === "apple" ? "App Store" : "Google Play"}
        </span>
      </div>
    </a>
  );
}

// ── Footer ─────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-[#834AB9] text-white">

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="container-wide pt-14 pb-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4">

          {/* Col 1 — Brand + tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="Fastlink Marketplace">
              <Image
                src={logoSvg}
                alt="Fastlink Marketplace Logo"
                className="h-10 w-auto"
              />
            </Link>

            <p className="max-w-xs text-sm font-medium leading-snug text-white/90">
              Your one Shop online Marketplace for everything you need.
            </p>
          </div>

          {/* Col 2 — Shop */}
          <div>
            <h4 className="mb-5 text-xl font-bold text-white">Shop</h4>
            <ul className="space-y-3.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-normal text-white/90 transition-opacity hover:opacity-80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Customer Service */}
          <div>
            <h4 className="mb-5 text-xl font-bold text-white">Customer Service</h4>
            <ul className="space-y-3.5">
              {CUSTOMER_SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-normal text-white/90 transition-opacity hover:opacity-80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Company */}
          <div>
            <h4 className="mb-5 text-xl font-bold text-white">Company</h4>
            <ul className="space-y-3.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-normal text-white/90 transition-opacity hover:opacity-80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Middle row: OUR MEDIA + DOWNLOAD OUR APP ─────────── */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 items-center">

          {/* OUR MEDIA */}
          <div>
            <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-white">
              OUR MEDIA
            </h4>
            <div className="flex items-center gap-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-white transition-opacity hover:opacity-80"
                >
                  <SocialIcon iconKey={s.iconKey} />
                </a>
              ))}
            </div>
          </div>

          {/* DOWNLOAD OUR APP */}
          <div>
            <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-white">
              DOWNLOAD OUR APP
            </h4>
            <div className="flex flex-wrap items-center gap-4">
              <AppStoreBadge store="apple" href="#" />
              <AppStoreBadge store="google" href="#" />
            </div>
          </div>

        </div>

        {/* ── Bottom row: Copyright & Credits ───────────────────── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 text-xs font-medium text-white/90 sm:flex-row">
          <p>2026 Fastlink market place alright reserved</p>
          <p className="text-center sm:text-right">
            Powered: Rabiu SM (Aljauromanee), A Software Engineer and Visual Brand Designer
          </p>
        </div>
      </div>

    </footer>
  );
}

