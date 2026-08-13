import { Suspense } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-brand-50/30">
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}
