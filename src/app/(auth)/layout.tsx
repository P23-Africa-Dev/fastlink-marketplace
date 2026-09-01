import { Suspense } from "react";

import { GuestOnly } from "@/components/auth/guest-only";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-brand-50/30">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#f4ebfc] text-[#6D349F] font-semibold text-sm">
            Loading…
          </div>
        }
      >
        <GuestOnly>{children}</GuestOnly>
      </Suspense>
    </div>
  );
}
