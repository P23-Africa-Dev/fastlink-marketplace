import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { ALL_EMERGING_VENDORS } from "@/mocks/stores-data";

export default function EmergingVendorsPage() {
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
              Verified Emerging Vendors
            </h1>
            <p className="text-sm sm:text-base text-purple-100 font-medium">
              Explore hand-picked independent makers, boutiques, and verified local vendors.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Vendors Grid (Matching Homepage Card Design) ──────────────────── */}
      <section className="container-wide py-10">
        <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3 mb-6">
          <Store size={22} className="text-[#6D349F] shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
            All Emerging Vendors
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_EMERGING_VENDORS.map((vendor) => (
            <Link
              key={vendor.id}
              href={vendor.href}
              className="group overflow-hidden rounded-2xl bg-[#F6EFFD] shadow-sm border border-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Vendor image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-purple-100">
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
                <p className="font-bold text-[#6D349F] font-montserrat truncate group-hover:text-[#52237A] transition-colors">
                  {vendor.name}
                </p>
                <p className="mt-0.5 text-xs text-[#8A79A5] font-medium truncate">
                  {vendor.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
