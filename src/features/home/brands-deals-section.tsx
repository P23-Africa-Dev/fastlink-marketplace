import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShoppingCart } from "lucide-react";

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
  category: string;
  discount: number;
  image: string;
  href: string;
  rating: number;
  reviews: string;
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
    category: "Fashion Bakery",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop",
    href: "/stores/najamart",
  },
  {
    id: "ev-4",
    name: "Urban Wear",
    category: "Designs & Streetwear",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop",
    href: "/stores/urban-wear",
  },
];

const DEALS: DealProduct[] = [
  {
    id: "deal-1",
    name: "PlayStation 5 Console",
    category: "Gaming",
    discount: 32,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop",
    href: "/products/playstation-5",
    rating: 5.0,
    reviews: "1.3k",
  },
  {
    id: "deal-2",
    name: "Amazon Echo Dot",
    category: "Home & Wellness",
    discount: 32,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop",
    href: "/products/amazon-echo",
    rating: 5.0,
    reviews: "1.3k",
  },
  {
    id: "deal-3",
    name: "JBL Bluetooth Speaker",
    category: "Audio",
    discount: 40,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop",
    href: "/products/jbl-bluetooth-speaker",
    rating: 4.8,
    reviews: "850",
  },
  {
    id: "deal-4",
    name: "Binatone Standing Fan",
    category: "Appliances",
    discount: 25,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop",
    href: "/products/binatone-fan",
    rating: 4.5,
    reviews: "420",
  },
  {
    id: "deal-5",
    name: "Binatone Tower Fan",
    category: "Appliances",
    discount: 35,
    image: "https://images.unsplash.com/photo-1558618047-3c5de1be0b6e?w=500&auto=format&fit=crop",
    href: "/products/binatone-tower-fan",
    rating: 4.6,
    reviews: "315",
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
    <div className="mb-6 flex items-center gap-4">
      <h2 className="shrink-0 text-xl font-bold text-[#6D349F] md:text-2xl">
        {title}
      </h2>
      <div className="h-[1px] flex-1 bg-white/70"></div>
      <Link
        href={seeMoreHref}
        className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#6D349F] transition-colors hover:text-[#5a2a83]"
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
        {/* Xiaomi "mi" badge */}
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF6900] text-sm font-black text-white">
          mi
        </span>
        <span className={`text-base ${cls}`}>{brand.name}</span>
      </div>
    );
  }

  if (brand.name === "Unilever") {
    return (
      <div className="flex items-center gap-2">
        {/* Unilever "U" badge */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-800 text-sm font-black text-blue-800">
          U
        </span>
        <span className={`text-base font-semibold text-blue-800`}>{brand.name}</span>
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

// ── Main component ─────────────────────────────────────────────

export function BrandsDealsSection() {
  return (
    <div className="bg-[#EADBF8] pb-12">
      <div className="container-wide space-y-12 py-8">

        {/* ① Official Retail & Brand Partners ──────────────────── */}
        <div>
          <SectionHeader
            title="Official Retail & Brand Partners"
            seeMoreHref="/brands"
          />

          {/* Brand logos row */}
          <div className="overflow-hidden rounded-xl bg-[#F6EFFD] shadow-sm">
            <div className="flex items-center divide-x divide-[#ECD7F8] overflow-x-auto scrollbar-none">
              {BRAND_PARTNERS.map((brand) => (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className="flex min-w-[140px] flex-1 items-center justify-center px-6 py-5 transition-colors hover:bg-gray-50"
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

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {NATIONWIDE_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                href={brand.href}
                className="group flex flex-col justify-center rounded-xl bg-[#F6EFFD] p-5 shadow-sm transition-transform hover:-translate-y-1"
              >
                <span className="text-lg font-extrabold text-[#6D349F]">
                  {brand.name}
                </span>
                <span className="mt-1 text-sm text-gray-500">{brand.tagline}</span>
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

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {EMERGING_VENDORS.map((vendor) => (
              <Link
                key={vendor.id}
                href={vendor.href}
                className="group overflow-hidden rounded-xl bg-[#F6EFFD] shadow-sm transition-transform hover:-translate-y-1"
              >
                {/* Vendor image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Vendor info */}
                <div className="p-4">
                  <p className="font-bold text-[#6D349F] truncate">{vendor.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500 truncate">{vendor.category}</p>
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {DEALS.map((deal) => (
              <Link
                key={deal.id}
                href={deal.href}
                className="group flex flex-col overflow-hidden rounded-xl shadow-sm transition-transform hover:-translate-y-1"
              >
                {/* Product image */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Top Right Pill */}
                  <div className="absolute right-2 top-2 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-[#6D349F] shadow-sm">
                    {deal.category}
                  </div>
                </div>
                
                {/* Product info */}
                <div className="flex flex-1 flex-col p-3">
                  <p className="truncate text-sm font-bold text-[#6D349F]">
                    {deal.name}
                  </p>
                  
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-[11px] font-semibold text-gray-700">{deal.rating}</span>
                      <span className="text-[10px] text-gray-400">({deal.reviews} Reviews)</span>
                    </div>
                    <span className="text-xs font-bold text-[#6D349F]">
                      {deal.discount}% Off
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="mt-3 flex gap-1.5">
                    <button className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#6D349F] px-1 py-1.5 text-[9px] sm:text-[10px] font-bold text-[#6D349F] transition-colors hover:bg-purple-50">
                      ADD TO CARD
                      <ShoppingCart size={10} className="hidden sm:block" />
                    </button>
                    <button className="flex flex-1 items-center justify-center rounded-full bg-[#6D349F] px-1 py-1.5 text-[9px] sm:text-[10px] font-bold text-white transition-colors hover:bg-[#5a2a83]">
                      VIEW NOW
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
