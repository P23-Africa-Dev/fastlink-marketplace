import Link from "next/link";
import Image from "next/image";
import { Bookmark, ChevronRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────

interface BrandPartner {
  id: string;
  name: string;
  /** optional logo url; falls back to styled text */
  logo?: string;
  href: string;
  /** text styling variant */
  style?: "blue-bold" | "black" | "orange" | "default";
}

interface NationwideBrand {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  href: string;
}

interface EmergingVendor {
  id: string;
  name: string;
  category: string;
  image: string;
  href: string;
}

interface DealProduct {
  id: string;
  name: string;
  discount: number;
  image: string;
  href: string;
}

// ── Mock data ──────────────────────────────────────────────────

const BRAND_PARTNERS: BrandPartner[] = [
  { id: "bp-1", name: "SAMSUNG",  href: "/brands/samsung",  style: "blue-bold" },
  { id: "bp-2", name: "NIKE",     href: "/brands/nike",     style: "black" },
  { id: "bp-3", name: "Xiaomi",   href: "/brands/xiaomi",   style: "orange" },
  { id: "bp-4", name: "Unilever", href: "/brands/unilever", style: "default" },
  { id: "bp-5", name: "TECNO",    href: "/brands/tecno",    style: "blue-bold" },
  { id: "bp-6", name: "SONY",     href: "/brands/sony",     style: "black" },
];

const NATIONWIDE_BRANDS: NationwideBrand[] = [
  { id: "nb-1", name: "Brand X",    tagline: "Ships Nationwide",   href: "/stores/brand-x" },
  { id: "nb-2", name: "Zara HOME",  tagline: "3-5 Days",           href: "/stores/zara-home" },
  { id: "nb-3", name: "Sara Home",  tagline: "3-5 Days Delivery",  href: "/stores/sara-home" },
  { id: "nb-4", name: "StyleHub",   tagline: "3-5 Days Delivery",  href: "/stores/stylehub" },
];

const EMERGING_VENDORS: EmergingVendor[] = [
  {
    id: "ev-1",
    name: "Zuri Fashion Hub",
    category: "Fashion store",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop",
    href: "/stores/zuri-fashion-hub",
  },
  {
    id: "ev-2",
    name: "Trendy Gadgets",
    category: "Electronics store",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop",
    href: "/stores/trendy-gadgets",
  },
  {
    id: "ev-3",
    name: "NajaMart",
    category: "Fashion Beakery",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop",
    href: "/stores/najamart",
  },
  {
    id: "ev-4",
    name: "Urban Wear",
    category: "Gasigns & Streetwear",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop",
    href: "/stores/urban-wear",
  },
];

const DEALS: DealProduct[] = [
  {
    id: "deal-1",
    name: "Samsung 4K Smart TV",
    discount: 32,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop",
    href: "/products/samsung-4k-smart-tv",
  },
  {
    id: "deal-2",
    name: "Highlander Men's Chronograph",
    discount: 32,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop",
    href: "/products/highlander-chronograph",
  },
  {
    id: "deal-3",
    name: "JBL Bluetooth Speaker",
    discount: 40,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop",
    href: "/products/jbl-bluetooth-speaker",
  },
  {
    id: "deal-4",
    name: "Binatone Standing Fan",
    discount: 25,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop",
    href: "/products/binatone-fan",
  },
  {
    id: "deal-5",
    name: "Binatone Standing",
    discount: 35,
    image: "https://images.unsplash.com/photo-1558618047-3c5de1be0b6e?w=500&auto=format&fit=crop",
    href: "/products/binatone-tower-fan",
  },
];

// ── Shared: section header ─────────────────────────────────────

function SectionHeader({
  title,
  seeMoreHref,
}: {
  title: string;
  seeMoreHref: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#6B3A99] md:text-2xl">
        <Bookmark size={22} className="fill-[#834AB9] stroke-[#834AB9] shrink-0" />
        {title}
      </h2>
      <Link
        href={seeMoreHref}
        className="flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
      >
        See More <ChevronRight size={16} />
      </Link>
    </div>
  );
}

// ── Brand logo / wordmark ──────────────────────────────────────

function BrandWordmark({ brand }: { brand: BrandPartner }) {
  const colorMap: Record<NonNullable<BrandPartner["style"]>, string> = {
    "blue-bold": "font-extrabold text-blue-700",
    black:       "font-extrabold text-neutral-900",
    orange:      "font-bold text-neutral-800",
    default:     "font-semibold text-neutral-700",
  };
  const cls = colorMap[brand.style ?? "default"];

  if (brand.style === "orange") {
    return (
      <div className="flex items-center gap-2">
        {/* Xiaomi "m" badge */}
        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-orange-500 text-xs font-black text-white">
          m
        </span>
        <span className={`text-base ${cls}`}>{brand.name}</span>
      </div>
    );
  }

  if (brand.name === "Unilever") {
    return (
      <div className="flex items-center gap-2">
        {/* Unilever "U" badge */}
        <span className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-blue-600 text-xs font-black text-blue-600">
          U
        </span>
        <span className={`text-base font-semibold text-neutral-700`}>{brand.name}</span>
      </div>
    );
  }

  if (brand.name === "NIKE") {
    return (
      <svg viewBox="0 0 100 36" className="h-7 w-auto text-neutral-900" aria-label="Nike" fill="currentColor">
        <path d="M96.49,4.43C93.67,7.37,88.54,10,83.86,11.13L16.46,31.57C11.2,33.13,6.44,33.75,3.31,32.92A8.31,8.31,0,0,1,.13,30.8a6.07,6.07,0,0,1-.1-6.31c1.34-2.5,4-4.71,7.84-6.38l.07.1c-2.93,1.93-4.7,4.08-4.91,6a3.81,3.81,0,0,0,1.56,3.42c2.43,1.91,7.24,1.81,13.25.15L81.94,7.58a32.5,32.5,0,0,0,8.31-4A9.48,9.48,0,0,0,93.8,0l.12,0A8.09,8.09,0,0,1,96.49,4.43Z"/>
      </svg>
    );
  }

  return <span className={`text-base ${cls}`}>{brand.name}</span>;
}

// ── Deal Product Discount Badges Renderer ───────────────────────

function renderDiscountBadges(deal: DealProduct) {
  const badgeStyle = "absolute flex px-2 py-0.5 rounded-md text-[11px] font-bold text-white bg-brand-900/60 backdrop-blur-sm shadow-sm";
  
  if (deal.id === "deal-1") {
    return (
      <span className={`${badgeStyle} right-2 top-2`}>
        {deal.discount}%
      </span>
    );
  }
  if (deal.id === "deal-2" || deal.id === "deal-4" || deal.id === "deal-5") {
    return (
      <span className={`${badgeStyle} left-2 top-2`}>
        {deal.discount}%
      </span>
    );
  }
  if (deal.id === "deal-3") {
    return (
      <>
        <span className={`${badgeStyle} left-2 top-2`}>
          {deal.discount}%
        </span>
        <span className={`${badgeStyle} right-2 top-2`}>
          {deal.discount}%
        </span>
      </>
    );
  }
  return null;
}

// ── Main component ─────────────────────────────────────────────

export function BrandsDealsSection() {
  return (
    <div className="bg-brand-50 pb-2">
      <div className="container-wide space-y-10 py-8">

        {/* ① Official Retail & Brand Partners ──────────────────── */}
        <div>
          <SectionHeader
            title="Official Retail & Brand Partners"
            seeMoreHref="/brands"
          />

          {/* Brand logos row */}
          <div className="overflow-hidden rounded-xl border border-brand-200 bg-[#E7D2F4]">
            <div className="flex items-center divide-x divide-brand-200/40 overflow-x-auto scrollbar-none">
              {BRAND_PARTNERS.map((brand) => (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className="flex min-w-[140px] flex-1 items-center justify-center px-6 py-5 transition-colors hover:bg-brand-100/50"
                >
                  <BrandWordmark brand={brand} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ② Nationwide Brand Stores ───────────────────────────── */}
        <div>
          <SectionHeader
            title="Nationwide Brand Stores"
            seeMoreHref="/stores?type=nationwide"
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {NATIONWIDE_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                href={brand.href}
                className={`group flex flex-col justify-between rounded-xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md ${
                  brand.name === "Brand X"
                    ? "border-2 border-blue-500 bg-[#E7D2F4]"
                    : "border border-brand-100/60 bg-[#E7D2F4]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {brand.name === "Zara HOME" && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#834AB9]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-brand-900 transition-colors group-hover:text-brand-700">
                    {brand.name}
                  </span>
                </div>
                <span className="mt-2 text-sm text-neutral-500">{brand.tagline}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ③ Verified Emerging Vendors ─────────────────────────── */}
        <div>
          <SectionHeader
            title="Verified Emerging Vendors"
            seeMoreHref="/stores?type=emerging"
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {EMERGING_VENDORS.map((vendor) => (
              <Link
                key={vendor.id}
                href={vendor.href}
                className="group overflow-hidden rounded-xl border border-brand-100/60 bg-[#E7D2F4] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md"
              >
                {/* Vendor image */}
                <div className="relative aspect-[5/3] w-full overflow-hidden bg-brand-100">
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Purple Overlay */}
                  <div className="absolute inset-0 bg-brand-600/10 mix-blend-color pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Vendor info */}
                <div className="px-3 py-3 border-t border-brand-100/40">
                  <p className="font-bold text-brand-900 group-hover:text-brand-700 transition-colors">{vendor.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{vendor.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ④ Deals of the Day ──────────────────────────────────── */}
        <div>
          <SectionHeader
            title="Deals of the Day"
            seeMoreHref="/products?deals=true"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {DEALS.map((deal) => (
              <Link
                key={deal.id}
                href={deal.href}
                className="group overflow-hidden rounded-xl border border-brand-100/60 bg-[#E7D2F4] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md"
              >
                {/* Product image + discount badge */}
                <div className="relative aspect-square w-full overflow-hidden bg-brand-100">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Purple Overlay */}
                  <div className="absolute inset-0 bg-brand-600/10 mix-blend-color pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-transparent pointer-events-none" />
                  {/* Discount badge */}
                  {renderDiscountBadges(deal)}
                </div>
                {/* Product name */}
                <div className="px-3 py-2.5 border-t border-brand-100/40">
                  <p className="truncate text-sm font-bold text-brand-900 group-hover:text-brand-700 transition-colors">
                    {deal.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
