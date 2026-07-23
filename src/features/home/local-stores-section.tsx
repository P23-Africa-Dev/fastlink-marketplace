import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  ChevronRight,
  MapPin,
  ShoppingBag,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface LocalStore {
  id: string;
  name: string;
  city: string;
  image: string;
  slug: string;
  /** small icon variant for the badge */
  iconVariant: "mall" | "supermarket" | "fashion" | "electronics";
}

interface ShopCategory {
  id: string;
  label: string;
  href: string;
  image: string;
}

// ── Mock data ─────────────────────────────────────────────────

const LOCAL_STORES: LocalStore[] = [
  {
    id: "store-001",
    name: "Kano Mall",
    city: "Lagos",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=600&auto=format&fit=crop",
    slug: "kano-mall",
    iconVariant: "mall",
  },
  {
    id: "store-002",
    name: "Ikeja City Mall",
    city: "Lagos",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&auto=format&fit=crop",
    slug: "ikeja-city-mall",
    iconVariant: "mall",
  },
  {
    id: "store-003",
    name: "Jabi Lake Mall",
    city: "Lagos",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop",
    slug: "jabi-lake-mall",
    iconVariant: "mall",
  },
  {
    id: "store-004",
    name: "FreshMart Supermarket",
    city: "Lagos",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop",
    slug: "freshmart-supermarket",
    iconVariant: "supermarket",
  },
];

const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "cat-electronics",
    label: "Electronics",
    href: "/products?category=Electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&auto=format&fit=crop",
  },
  {
    id: "cat-fashion",
    label: "Fashion",
    href: "/products?category=Fashion",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop",
  },
  {
    id: "cat-home",
    label: "Home & Living",
    href: "/products?category=Home+%26+Living",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&auto=format&fit=crop",
  },
  {
    id: "cat-beauty",
    label: "Beauty",
    href: "/products?category=Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop",
  },
  {
    id: "cat-health",
    label: "Health",
    href: "/products?category=Health",
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=400&auto=format&fit=crop",
  },
];

// ── Store icon badge ──────────────────────────────────────────

function StoreBadge({ store }: { store: LocalStore }) {
  let icon = <MapPin size={12} className="text-white" strokeWidth={2.5} />;
  let bgColor = "#834AB9"; // Purple default

  if (store.name === "Kano Mall") {
    icon = <ShoppingBag size={12} className="text-white" strokeWidth={2.5} />;
  } else if (store.name === "Ikeja City Mall" || store.name === "Jabi Lake Mall") {
    // Card/ticket icon
    icon = (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v14" strokeDasharray="4 4" />
      </svg>
    );
  } else if (store.name.includes("Supermarket") || store.name.includes("FreshMart")) {
    bgColor = "#0D9488"; // Teal `#0D9488`
    icon = (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="m5 10 7-7 7 7" />
        <path d="M2 10h20" />
        <path d="M4 10v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10" />
        <path d="M9 14v4" />
        <path d="M15 14v4" />
      </svg>
    );
  }

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

// ── Section header ────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  seeMoreHref,
}: {
  icon: React.ReactNode;
  title: string;
  seeMoreHref: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#6B3A99] md:text-2xl">
        {icon}
        {title}
      </h2>
      <Link
        href={seeMoreHref}
        className="flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
      >
        See More
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

// ── Category Icon Renderer ────────────────────────────────────

function renderCategoryIcon(id: string) {
  if (id === "cat-electronics") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  if (id === "cat-fashion") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M12 2a3 3 0 0 0-3 3" />
        <path d="M2 17h20L12 7Z" />
      </svg>
    );
  }
  if (id === "cat-home") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#834AB9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (id === "cat-beauty") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M9 11V6a3 3 0 0 1 6 0v5" />
        <rect x="6" y="11" width="12" height="10" rx="2" />
        <line x1="12" y1="11" x2="12" y2="21" />
      </svg>
    );
  }
  // cat-health
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────

export function LocalStoresSection() {
  return (
    <div className="bg-brand-50 py-8">
      <div className="container-wide space-y-10">

        {/* ── Local Stores & Malls ─────────────────────────────── */}
        <div>
          <SectionHeader
            icon={
              <Bookmark size={22} className="fill-[#834AB9] stroke-[#834AB9] shrink-0" />
            }
            title="Local Stores & Malls in Kano"
            seeMoreHref="/products?type=local-stores"
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {LOCAL_STORES.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="group overflow-hidden rounded-xl border border-brand-100/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md hover:border-brand-200"
              >
                {/* Store image */}
                <div className="relative aspect-[5/3] w-full overflow-hidden bg-brand-100">
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Purple Overlay */}
                  <div className="absolute inset-0 bg-brand-600/10 mix-blend-color pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Store info */}
                <div className="flex items-center justify-between bg-[#E7D2F4] px-3 py-3 border-t border-brand-100/40">
                  <div className="flex items-center gap-2 min-w-0">
                    <StoreBadge store={store} />
                    <span className="truncate text-sm font-bold text-brand-900 group-hover:text-brand-700 transition-colors">
                      {store.name}
                    </span>
                  </div>
                  {store.name !== "FreshMart Supermarket" && (
                    <span className="ml-2 shrink-0 text-xs font-semibold text-neutral-400">
                      {store.city}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Shop by Category ─────────────────────────────────── */}
        <div>
          <SectionHeader
            icon={
              <Bookmark size={22} className="fill-[#834AB9] stroke-[#834AB9] shrink-0" />
            }
            title="Shop by Category"
            seeMoreHref="/products"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {SHOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group overflow-hidden rounded-xl border border-brand-100/60 bg-[#F2E1FA] p-2 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md hover:border-brand-200"
              >
                {/* Category image */}
                <div className="relative aspect-[5/3] w-full overflow-hidden bg-brand-100">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Purple Overlay */}
                  <div className="absolute inset-0 bg-brand-600/10 mix-blend-color pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Category label */}
                <div className="flex items-center gap-2.5 bg-[#F2E1FA] px-3 py-3.5 border-t border-brand-100/40">
                  {renderCategoryIcon(cat.id)}
                  <span className="text-sm font-bold text-brand-900 group-hover:text-brand-700 transition-colors">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
