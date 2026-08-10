import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export interface DynamicHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  backgroundImage: string | any;
  backLink?: string;
  backLabel?: string;
  children?: ReactNode;
  customOverlay?: string; // Optional custom overlay, defaults to black/60
}

export function DynamicHero({
  title,
  subtitle,
  backgroundImage,
  backLink,
  backLabel = "Back",
  children,
  customOverlay = "bg-black/60",
}: DynamicHeroProps) {
  return (
    <section className="relative w-full min-h-[380px] sm:min-h-[460px] flex items-center overflow-hidden">
      {/* Background Image */}
      <Image
        src={backgroundImage}
        alt="Hero Background"
        fill
        priority
        className="object-cover object-center"
      />
      {/* Overlay to ensure text readability */}
      <div className={`absolute inset-0 ${customOverlay}`} />

      <div className="mx-auto max-w-7xl px-4 w-full relative z-10 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl space-y-5">
          {backLink && (
            <div className="mb-6">
              <Link
                href={backLink}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md"
              >
                <ArrowLeft size={14} />
                <span>{backLabel}</span>
              </Link>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight font-montserrat tracking-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-medium max-w-2xl sm:max-w-3xl">
              {subtitle}
            </p>
          )}

          {children && (
            <div className="flex flex-wrap items-center gap-4 pt-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
