import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeroBanner } from "@/features/home/hero-banner";
import { LocalStoresSection } from "@/features/home/local-stores-section";
import { BrandsDealsSection } from "@/features/home/brands-deals-section";
import { HotDealBanner } from "@/features/home/hot-deal-banner";
import { FAQStrip } from "@/features/home/faq-strip";

export default function HomePage() {
  return (
    <>
      <Header />
      <CartDrawer />

      <main>
        <HeroBanner />
        <LocalStoresSection />
        <BrandsDealsSection />
        <HotDealBanner />
        <FAQStrip />

        {/* Categories strip */}
        {/* <section className="border-y border-border bg-card py-8">
          <div className="container-wide">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              {MOCK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section> */}

        {/* Featured products */}
        {/* <section className="section-padding container-wide">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-primary">New Arrivals</p>
              <h2 className="heading-lg text-foreground">Featured Pieces</h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {FEATURED.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </section> */}

        {/* Editorial banner */}
        {/* <section className="bg-card py-20">
          <div className="container-wide grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-primary">Our Promise</p>
              <h2 className="heading-lg mb-6 text-foreground">
                Every maker,
                <br />
                <em>verified by hand</em>
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                We visit every studio before they join. We check their materials, their process,
                their working conditions. Not because we have to — because you deserve to know
                exactly where your objects come from.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                When something is labelled handmade on Provenance, it means hands actually made it.
              </p>
              <Link
                href="#"
                className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary hover:underline"
              >
                Learn about our standards <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BESTSELLERS.slice(0, 2).map((p) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded bg-muted">
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
              <div className="col-span-2 overflow-hidden rounded bg-muted aspect-video">
                {BESTSELLERS[2] && (
                  <Image
                    src={BESTSELLERS[2].images[0].url}
                    alt={BESTSELLERS[2].images[0].alt}
                    width={800}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                )}
              </div>
            </div>
          </div>
        </section> */}

        {/* Bestsellers */}
        {/* <section className="section-padding container-wide">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-primary">Community Picks</p>
              <h2 className="heading-lg text-foreground">Bestsellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {BESTSELLERS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section> */}

        {/* CTA — Sell */}
        {/* <section className="bg-card py-24 text-center">
          <div className="container-narrow">
            <div className="rule-gold mx-auto mb-10 w-16" />
            <h2 className="heading-lg mb-4 text-foreground">
              Your craft deserves
              <br />
              <em className="shimmer-gold">better distribution</em>
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-muted-foreground">
              Join 600+ independent makers already selling on Provenance. No listing fees.
              No race to the bottom. Just customers who appreciate the real thing.
            </p>
            <Link href="/register?role=seller" className="btn-gold">
              Apply to Sell
            </Link>
          </div>
        </section> */}

        {/* Trust bar */}
        {/* <section className="border-y border-border py-8">
          <div className="container-wide">
            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
              {[
                { label: "Verified Makers", value: "600+" },
                { label: "Products", value: "12,000+" },
                { label: "Happy Customers", value: "85,000+" },
                { label: "Avg Rating", value: "4.8 ★" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-light text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </>
  );
}
