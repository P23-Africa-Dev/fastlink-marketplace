"use client";

import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";

export default function BlogDetailPage() {
  return (
    <div className="bg-[#EADBF8] min-h-screen py-16 font-montserrat">
      <div className="container-narrow text-center py-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2E7FC] border border-white/80 shadow-md">
          <Newspaper size={32} className="text-[#6D349F]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#6D349F] mb-3">Article not available</h1>
        <p className="text-sm text-[#8A79A5] font-medium max-w-md mx-auto mb-8">
          This post is not in the API yet. Browse products and stores while we publish blog content.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-8 py-3.5 shadow-md transition-all"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
