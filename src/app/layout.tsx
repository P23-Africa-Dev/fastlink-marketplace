import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { ScrollToTop } from "@/components/layout/scroll-to-top";

import { Providers } from "./providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fastlink — Structured Digital Commerce",
    template: "%s | Fastlink",
  },
  description:
    "Shop from trusted brands, retail chains, and verified partners powered by Fastlink infrastructure. Local & Nationwide.",
  keywords: ["marketplace", "ecommerce", "local stores", "brands", "nigeria"],
  openGraph: {
    title: "Fastlink — Structured Digital Commerce",
    description:
      "Shop from trusted brands, retail chains, and verified partners powered by Fastlink infrastructure.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} font-montserrat`} suppressHydrationWarning>
      <body className="font-montserrat antialiased">
        <Providers>{children}</Providers>
        <ScrollToTop />
      </body>
    </html>
  );
}

