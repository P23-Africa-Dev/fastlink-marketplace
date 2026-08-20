import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { LocalStoreItem } from "@/types/catalog";

interface StoreCardProps {
  store: LocalStoreItem;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-purple-100 mb-3">
          <Image
            src={store.image}
            alt={store.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="space-y-1 px-1">
          <h3 className="text-base font-bold text-[#6D349F] truncate font-montserrat">
            {store.name}
          </h3>
          <p className="text-xs text-[#8A79A5] font-medium">{store.category}</p>
          <div className="flex items-center gap-1 text-xs text-[#8A79A5] pt-1">
            <MapPin size={13} className="text-[#6D349F] shrink-0" />
            <span className="truncate">{store.location}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#E4D1F7]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E4D1F7] px-3 py-1 text-[11px] font-bold text-[#6D349F]">
          <Clock size={12} className="text-[#6D349F]" />
          <span>{store.deliveryTag}</span>
        </div>
      </div>
    </Link>
  );
}
