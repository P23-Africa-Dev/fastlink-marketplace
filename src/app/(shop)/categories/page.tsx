import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  HeartPulse,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { ALL_SHOP_CATEGORIES } from "@/mocks/stores-data";
import { DynamicHero } from "@/components/marketplace/dynamic-hero";

const CATEGORY_ICONS: Record<string, typeof Smartphone> = {
  electronics: Smartphone,
  "home-living": Home,
  fashion: Shirt,
  beauty: Sparkles,
  health: HeartPulse,
  groceries: ShoppingBag,
};

export default function CategoriesPage() {
  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      <DynamicHero
        title="Shop By Category"
        subtitle="Browse products across all brands and stores — no mall navigation required"
        backgroundImage={ALL_SHOP_CATEGORIES[0].image}
        backLink="/"
        backLabel="Back to Homepage"
      />

      {/* ── 2. Category Cards Grid (Matching Homepage Styling) ──────────────────── */}
      <section className="container-wide py-10">
        <div className="mb-6 flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3">
          <LayoutGrid size={22} className="text-[#6D349F] shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
            Shop By Category
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-5">
          {ALL_SHOP_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || LayoutGrid;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F6EFFD] p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Category image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-purple-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Category label matching homepage */}
                <div className="flex items-center gap-2 px-2 pt-3 pb-1">
                  <Icon size={18} className="text-[#6D349F] shrink-0" />
                  <span className="text-sm font-bold text-[#6D349F] font-montserrat">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
