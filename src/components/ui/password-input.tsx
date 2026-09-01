"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  toggleClassName?: string;
};

export function PasswordInput({
  className,
  toggleClassName,
  disabled,
  readOnly,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(className, "pr-11")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50",
          toggleClassName,
        )}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
