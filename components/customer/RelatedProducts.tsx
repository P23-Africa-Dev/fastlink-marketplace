"use client";

import Image from "next/image";
import Link from "next/link";

interface MiniProduct {
  name: string;
  price: number;
  imageUrl: string;
  href: string;
}

interface ColumnProps {
  title: string;
  products: MiniProduct[];
}

const ProductListColumn = ({ title, products }: ColumnProps) => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase border-b border-gray-100 pb-3">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {products.map((product, idx) => (
          <Link
            key={idx}
            href={product.href}
            className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100/50 hover:border-primary-dark/30 hover:shadow-sm transition-all bg-white group"
          >
            <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 p-1">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h4 className="text-[13px] font-normal text-gray-800 line-clamp-2 leading-tight group-hover:text-primary-dark transition-colors">
                {product.name}
              </h4>
              <span className="text-[14px] font-semibold text-[#00AEEF]">
                ${product.price.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export function RelatedProducts() {
  // Specially curated mock products matching the screenshot layout
  const relatedProducts: MiniProduct[] = [
    {
      name: "Bose Sport Earbuds - Wireless Earphones - Bluetooth In Ear...",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "Simple Mobile 4G LTE Prepaid Smartphone",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "4K UHD LED Smart TV with Chromecast Built-in",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=300&auto=format&fit=crop",
      href: "#"
    }
  ];

  const accessories: MiniProduct[] = [
    {
      name: "Samsung Electronics Samsung Galaxy S21 5G",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "Simple Mobile 5G LTE Galaxy 12 Mini 512GB Gaming Phone",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e09cdbdb?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "Sony DSCHX8 High Zoom Point & Shoot Camera",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=300&auto=format&fit=crop",
      href: "#"
    }
  ];

  const appleProducts: MiniProduct[] = [
    {
      name: "TOZO T6 True Wireless Earbuds Bluetooth Headpho...",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "JBL FLIP 4 - Waterproof Portable Bluetooth Speaker...",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "Wyze Cam Pan v2 1080p Pan/Tilt/Zoom Wi-Fi Indoor Smar...",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1557324260-b8917e3c3dcb?q=80&w=300&auto=format&fit=crop",
      href: "#"
    }
  ];

  const featuredProducts: MiniProduct[] = [
    {
      name: "Portable Washing Machine, 11lbs capacity Model 18NMF...",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1582730147233-88111468a240?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "Sony DSCHX8 High Zoom Point & Shoot Camera",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=300&auto=format&fit=crop",
      href: "#"
    },
    {
      name: "Dell Optiplex 7000x7480 All-in-One Computer Monitor",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=300&auto=format&fit=crop",
      href: "#"
    }
  ];

  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProductListColumn title="Related Product" products={relatedProducts} />
          <ProductListColumn title="Product Accessories" products={accessories} />
          <ProductListColumn title="Apple Product" products={appleProducts} />
          <ProductListColumn title="Featured Products" products={featuredProducts} />
        </div>
      </div>
    </div>
  );
}
