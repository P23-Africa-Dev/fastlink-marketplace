import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  Award,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  HeartPulse,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { ALL_SHOP_CATEGORIES } from "@/mocks/stores-data";

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
      {/* ── 1. Full-Width Hero Banner Section ───────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#8836DB] via-[#7E37C9] to-[#60259E] py-10 sm:py-14 text-white shadow-md">
        {/* Background overlay graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="container-wide relative z-10">
          {/* Back to Homepage button */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to Homepage</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
                This is the Kano Mall
              </h1>
              <p className="text-sm sm:text-base text-purple-100 font-medium mb-6">
                Faster access and easiest way to shop E &amp; bay in
              </p>

              {/* Action Filter Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/30">
                  <LayoutGrid size={16} />
                  <span>Write Subea</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/30">
                  <Award size={16} />
                  <span>35 Days</span>
                </div>
              </div>
            </div>

            {/* Banner Right Image */}
            <div className="relative aspect-[16/9] md:aspect-[4/3] w-full max-w-md mx-auto md:ml-auto overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop"
                alt="Kano Mall showcase"
                fill
                priority
                className="object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

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
