import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, Award, ArrowLeft, Store } from "lucide-react";
import { KANO_MALLS, ALL_SHOP_CATEGORIES } from "@/mocks/stores-data";
import { MOCK_PRODUCTS } from "@/mocks/data";
import { ShopProductCard } from "@/components/product/shop-product-card";

function TargetIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6D349F"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

interface PageProps {
  params: { slug: string };
  searchParams: { category?: string };
}

export default function MallDetailPage({ params, searchParams }: PageProps) {
  const slug = params.slug;
  const selectedCategory = searchParams?.category;

  // Find store/mall from mock data or fallback
  const mall = KANO_MALLS.find((m) => m.slug === slug) || {
    id: "mall-default",
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug: slug,
    image:
      "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop",
    location: "Kano Municipal",
  };

  // Filter products if a category is selected inside this mall
  const filteredProducts = selectedCategory
    ? MOCK_PRODUCTS.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : MOCK_PRODUCTS;

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      {/* ── 1. Full-Width Hero Section (Matching User Screenshot) ──────────────── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#8836DB] via-[#7E37C9] to-[#60259E] py-10 sm:py-14 text-white shadow-md">
        {/* Background overlay graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="container-wide relative z-10">
          <div className="mb-4">
            <Link
              href="/local-stores"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to Local Stores &amp; Malls</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
                This is the {mall.name}
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

            {/* Hero Image */}
            <div className="relative aspect-[16/9] md:aspect-[4/3] w-full max-w-md mx-auto md:ml-auto overflow-hidden rounded-xl">
              <Image
                src={mall.image}
                alt={mall.name}
                fill
                priority
                className="object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Content Section ─────────────────────────────────────────────────── */}
      <div className="container-wide py-10">
        {!selectedCategory ? (
          /* Category/Department Grid inside this Mall (Matching exact Malls card design from /local-stores) */
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3">
              <Store size={22} className="text-[#6D349F] shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                Explore Departments in {mall.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
              {ALL_SHOP_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/stores/${slug}?category=${encodeURIComponent(cat.name)}`}
                  className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Department image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Info bar matching Malls card design on /local-stores */}
                  <div className="flex items-center justify-between bg-[#F2E7FC] px-3.5 py-3 border-t border-[#E4D1F7]">
                    <div className="flex items-center gap-2 min-w-0">
                      <TargetIcon />
                      <span className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
                        {cat.name}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 text-[10px] font-medium text-[#A093B5]">
                      {mall.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          /* Products Grid for selected Department/Category inside this Mall */
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8C2EF] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8A79A5] mb-1">
                  <Link href={`/stores/${slug}`} className="hover:underline">
                    {mall.name}
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-[#6D349F]">{selectedCategory}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                  Products in {selectedCategory}
                </h2>
              </div>

              <Link
                href={`/stores/${slug}`}
                className="text-xs font-semibold text-[#6D349F] hover:underline"
              >
                View All Departments
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredProducts.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
