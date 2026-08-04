import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Store as StoreIcon,
  LayoutGrid,
  Smartphone,
  Shirt,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface LocalStore {
  id: string;
  name: string;
  cityTag: string;
  image: string;
  slug: string;
}

interface ShopCategory {
  id: string;
  label: string;
  href: string;
  image: string;
  icon: typeof Smartphone;
}

// ── Mock data ─────────────────────────────────────────────────

const LOCAL_STORES: LocalStore[] = [
  {
    id: "store-001",
    name: "Kano Mall",
    cityTag: "Lagos State",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=600&auto=format&fit=crop",
    slug: "kano-mall",
  },
  {
    id: "store-002",
    name: "Ikeja City Mall",
    cityTag: "Lagos State",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&auto=format&fit=crop",
    slug: "ikeja-city-mall",
  },
  {
    id: "store-003",
    name: "Jabi City Mall",
    cityTag: "Lagos State",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop",
    slug: "jabi-city-mall",
  },
  {
    id: "store-004",
    name: "Fresh Supermall",
    cityTag: "Lagos State",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop",
    slug: "fresh-supermall",
  },
];

const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "cat-electronics",
    label: "Electronics",
    href: "/products?category=Electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop",
    icon: Smartphone,
  },
  {
    id: "cat-fashion",
    label: "Fashion",
    href: "/products?category=Fashion",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
    icon: Shirt,
  },
  {
    id: "cat-home",
    label: "Home & Living",
    href: "/products?category=Home+%26+Living",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&auto=format&fit=crop",
    icon: Smartphone,
  },
  {
    id: "cat-beauty",
    label: "Beauty",
    href: "/products?category=Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    icon: Smartphone,
  },
  {
    id: "cat-health",
    label: "Health",
    href: "/products?category=Health",
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=500&auto=format&fit=crop",
    icon: Smartphone,
  },
];

// ── Target/Spiral Icon for Store Cards ─────────────────────────

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D349F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
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
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-bold text-[#6D349F] font-montserrat">
        {icon}
        {title}
      </h2>
      <Link
        href={seeMoreHref}
        className="flex items-center gap-1 text-sm font-medium text-[#8A79A5] transition-colors hover:text-[#6D349F]"
      >
        See More
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function LocalStoresSection() {
  return (
    <div className="bg-[#EADBF8] py-10">
      <div className="container-wide space-y-10">

        {/* ── Local Stores & Malls in Kano ──────────────────────── */}
        <div>
          <SectionHeader
            icon={<StoreIcon size={22} className="text-[#6D349F] shrink-0" />}
            title="Local Stores & Malls in Kano"
            seeMoreHref="/local-stores"
          />

          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {LOCAL_STORES.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Store image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-100">
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Store info */}
                <div className="flex items-center justify-between bg-[#F2E7FC] px-3.5 py-3 border-t border-[#E4D1F7]">
                  <div className="flex items-center gap-2 min-w-0">
                    <TargetIcon />
                    <span className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
                      {store.name}
                    </span>
                  </div>
                  <span className="ml-2 shrink-0 text-[10px] font-medium text-[#A093B5]">
                    {store.cityTag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Shop By Catagory ─────────────────────────────────── */}
        <div>
          <SectionHeader
            icon={<LayoutGrid size={22} className="text-[#6D349F] shrink-0" />}
            title="Shop By Catagory"
            seeMoreHref="/categories"
          />

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-5">
            {SHOP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F6EFFD] p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Category image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-purple-100">
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Category label */}
                  <div className="flex items-center gap-2 px-2 pt-3 pb-1">
                    <Icon size={18} className="text-[#6D349F] shrink-0" />
                    <span className="text-sm font-bold text-[#6D349F] font-montserrat">
                      {cat.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

