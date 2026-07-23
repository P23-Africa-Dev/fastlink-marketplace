import Link from "next/link";

export function FAQStrip() {
  return (
    <div className="w-full bg-[#D4BAF0] py-12">
      <div
        className="container-wide grid grid-cols-1 items-center gap-6 rounded-2xl px-10 py-10 sm:grid-cols-3"
        style={{ background: "#834AB9" }}
      >
        {/* Left FAQ questions */}
        <div className="flex flex-col gap-4">
          <Link
            href="/faq#track-order"
            className="text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            How do I track my Order?
          </Link>
          <Link
            href="/faq#return-policy"
            className="text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            What is your return policy?
          </Link>
        </div>

        {/* Centre FAQ question */}
        <div className="flex items-center justify-center sm:justify-start lg:justify-center">
          <Link
            href="/faq#nationwide-delivery"
            className="text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            Do you Deliver to Nationwide?
          </Link>
        </div>

        {/* Right CTA button */}
        <div className="flex justify-end">
          <Link
            href="/faq"
            className="inline-flex items-center justify-center h-[52px] rounded-xl bg-brand-100 px-7 text-sm font-bold text-[#834AB9] shadow-sm transition-all duration-200 hover:bg-brand-200 active:scale-[0.98]"
          >
            Visit our FAQs Center
          </Link>
        </div>
      </div>
    </div>
  );
}
