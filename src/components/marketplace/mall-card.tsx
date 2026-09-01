import Image from "next/image";
import Link from "next/link";
import type { Mall } from "@/types/catalog";
import { TargetIcon } from "@/components/marketplace/target-icon";

interface MallCardProps {
  mall: Mall;
  variant?: "compact" | "detailed";
}

export function MallCard({ mall, variant = "compact" }: MallCardProps) {
  if (variant === "detailed") {
    return (
      <Link
        href={`/malls/${mall.slug}`}
        className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-purple-100 mb-3">
          <Image
            src={mall.image}
            alt={mall.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <TargetIcon />
            <span className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
              {mall.name}
            </span>
          </div>
          {mall.location && (
            <span className="ml-2 shrink-0 text-[10px] font-medium text-[#A093B5]">
              {mall.location}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/malls/${mall.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-100">
        <Image
          src={mall.image}
          alt={mall.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between bg-[#F2E7FC] px-3.5 py-3 border-t border-[#E4D1F7]">
        <div className="flex items-center gap-2 min-w-0">
          <TargetIcon />
          <span className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
            {mall.name}
          </span>
        </div>
        {mall.location && (
          <span className="ml-2 shrink-0 text-[10px] font-medium text-[#A093B5]">
            {mall.location}
          </span>
        )}
      </div>
    </Link>
  );
}
