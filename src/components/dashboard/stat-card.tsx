"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  badgeText?: string;
  badgeType?: "success" | "warning" | "danger" | "info" | "neutral";
  badgeIcon?: ReactNode;
  variant?: "purple" | "emerald" | "blue" | "amber" | "rose";
  className?: string;
  subtitle?: string;
}

const VARIANT_STYLES = {
  purple: {
    glow: "bg-[#7a3dbf]/5",
    hoverShadow: "hover:shadow-purple-500/10",
    iconBg: "from-[#f3eafb] to-[#ebd7fa]",
    iconText: "text-[#7a3dbf]",
  },
  emerald: {
    glow: "bg-emerald-500/5",
    hoverShadow: "hover:shadow-emerald-500/10",
    iconBg: "from-emerald-50 to-emerald-100",
    iconText: "text-emerald-700",
  },
  blue: {
    glow: "bg-blue-500/5",
    hoverShadow: "hover:shadow-blue-500/10",
    iconBg: "from-blue-50 to-blue-100",
    iconText: "text-blue-700",
  },
  amber: {
    glow: "bg-amber-500/5",
    hoverShadow: "hover:shadow-amber-500/10",
    iconBg: "from-amber-50 to-amber-100",
    iconText: "text-amber-700",
  },
  rose: {
    glow: "bg-rose-500/5",
    hoverShadow: "hover:shadow-rose-500/10",
    iconBg: "from-rose-50 to-rose-100",
    iconText: "text-rose-700",
  },
};

const BADGE_STYLES = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
  warning: "text-amber-600 bg-amber-50 border-amber-200/60",
  danger: "text-rose-600 bg-rose-50 border-rose-200/60",
  info: "text-blue-600 bg-blue-50 border-blue-200/60",
  neutral: "text-slate-600 bg-slate-100 border-slate-200",
};

export function StatCard({
  title,
  value,
  icon,
  badgeText,
  badgeType = "success",
  badgeIcon,
  variant = "purple",
  className,
  subtitle,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.purple;
  const badgeStyle = BADGE_STYLES[badgeType] || BADGE_STYLES.success;

  return (
    <div
      className={cn(
        "group relative bg-white rounded-[1.4rem] p-3.5 sm:p-4 shadow-sm hover:shadow-lg border border-[#ebd7fa] transition-all duration-300 overflow-hidden",
        styles.hoverShadow,
        className
      )}
    >
      {/* Background Radial Glow Effect */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-all duration-500 pointer-events-none",
          styles.glow
        )}
      />

      {/* Top Header Row: Icon + Badge */}
      <div className="flex items-center justify-between mb-2">
        <div
          className={cn(
            "h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 shrink-0",
            styles.iconBg,
            styles.iconText
          )}
        >
          {icon}
        </div>

        {badgeText && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold border px-2 py-0.5 rounded-full whitespace-nowrap",
              badgeStyle
            )}
          >
            {badgeIcon}
            <span>{badgeText}</span>
          </span>
        )}
      </div>

      {/* Card Content: Title & Value */}
      <div>
        <p className="text-[10px] sm:text-[11px] font-semibold text-[#7a3dbf] uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight mt-0.5">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[10px] font-medium text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
