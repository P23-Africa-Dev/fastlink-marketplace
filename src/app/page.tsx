import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeroBanner } from "@/features/home/hero-banner";
import { LocalStoresSection } from "@/features/home/local-stores-section";
import { BrandsDealsSection } from "@/features/home/brands-deals-section";
import { HotDealBanner } from "@/features/home/hot-deal-banner";
import { FAQStrip } from "@/features/home/faq-strip";
import BecomeVendorRiderCta from "@/components/become-vendor-rider-cta";

export default function HomePage() {
  return (
    <>
      <Header />
      <CartDrawer />

      <main className="overflow-x-hidden w-full max-w-full">
        {/* Hero Section with fade-in */}
        <div className="animate-fade-in">
          <HeroBanner />
        </div>

        {/* Local Stores with fade-up */}
        <div className="animate-fade-up transition-all duration-700">
          <LocalStoresSection />
        </div>

        {/* Brands & Deals with fade-up */}
        <div className="animate-fade-up transition-all duration-700">
          <BrandsDealsSection />
        </div>

        {/* Bottom CTA Card: Become a Vendor or Rider */}
        <div className="animate-fade-up transition-all duration-700 bg-[#E3D1F6]">
          <BecomeVendorRiderCta />
        </div>

        {/* Hot Deal Banner with fade-up */}
        {/* <div className="animate-fade-up transition-all duration-700">
          <HotDealBanner />
        </div> */}

        {/* FAQ Strip */}
        <div className="animate-fade-up transition-all duration-700">
          <FAQStrip />
        </div>
      </main>

      <Footer />
    </>
  );
}
