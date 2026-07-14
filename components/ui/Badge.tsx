import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "outline" | "orange";
}

export const Badge = ({ className = "", variant = "default", children, ...props }: BadgeProps) => {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

  const variants = {
    default: "bg-surface-light text-primary hover:bg-primary hover:text-white",
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    error: "bg-red-100 text-red-800 hover:bg-red-200",
    outline: "text-primary border border-secondary hover:bg-surface-light",
    orange: "bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
