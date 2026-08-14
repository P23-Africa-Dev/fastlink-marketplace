"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

const KYC_ROUTES = ["/vendor/register", "/vendor/pending", "/rider/register"];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isKycPage = KYC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isKycPage) {
    return <main className="min-h-screen bg-[#faf6ff] font-sans">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
