"use client";

import Link from "next/link";
import { Loader2, Building2, ChevronRight } from "lucide-react";

import { useAdminCatalog } from "@/hooks/use-admin";

export default function AdminMallsPage() {
  const { malls } = useAdminCatalog();
  const rows = malls.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Platform</p>
          <h1 className="text-3xl font-black text-[#3B1C5A]">Malls</h1>
          <p className="text-sm text-[#8A79A5] mt-1">Shopping centers and the stores inside them.</p>
        </div>
        <Link
          href="/admin/catalog"
          className="text-xs font-bold text-[#7a3dbf] hover:underline"
        >
          Manage catalog →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {malls.isLoading && (
          <div className="col-span-full flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        )}
        {rows.map((mall) => (
          <Link
            key={mall.id}
            href={`/admin/malls/${mall.id}`}
            className="rounded-2xl bg-white border border-[#EBD7FA] p-5 hover:border-[#7a3dbf] transition group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#7a3dbf]/10 flex items-center justify-center">
                  <Building2 className="text-[#7a3dbf]" size={20} />
                </div>
                <div>
                  <p className="font-bold text-[#3B1C5A]">{mall.name}</p>
                  <p className="text-xs text-[#8A79A5]">{mall.location ?? mall.city ?? "—"}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8A79A5] group-hover:text-[#7a3dbf]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#6D349F]">
              {mall.storeCount ?? 0} store{(mall.storeCount ?? 0) === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
