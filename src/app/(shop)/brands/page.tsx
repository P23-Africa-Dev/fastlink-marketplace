import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { ALL_BRAND_PARTNERS, BrandPartner } from "@/mocks/stores-data";

function BrandWordmark({ brand }: { brand: BrandPartner }) {
  const colorMap: Record<NonNullable<BrandPartner["style"]>, string> = {
    "blue-bold": "font-extrabold text-blue-700",
    black: "font-extrabold text-neutral-900",
    orange: "font-bold text-neutral-800",
    default: "font-semibold text-neutral-700",
  };
  const cls = colorMap[brand.style ?? "default"];

  if (brand.style === "orange") {
    return (
      <div className="flex items-center gap-2">
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

export default function BrandsPage() {
  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      {/* ── 1. Full-Width Hero Section ───────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#6D349F] via-[#7E37C9] to-[#52237A] py-10 sm:py-14 text-white shadow-md">
        <div className="container-wide relative z-10">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to Homepage</span>
            </Link>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
              Official Retail &amp; Brand Partners
            </h1>
            <p className="text-sm sm:text-base text-purple-100 font-medium">
              Shop authentic products directly from verified global and national brand partners.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Brands Grid (Matching Homepage Card Design) ──────────────────── */}
      <section className="container-wide py-10">
        <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3 mb-6">
          <Store size={22} className="text-[#6D349F] shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
            All Brand Partners
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {ALL_BRAND_PARTNERS.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="flex items-center justify-center rounded-2xl bg-[#F6EFFD] p-6 shadow-sm border border-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white"
            >
              <BrandWordmark brand={brand} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
