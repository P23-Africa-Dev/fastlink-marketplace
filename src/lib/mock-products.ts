export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  options: { [key: string]: string };
}

export interface ProductImage {
  id: string;
  url: string;
  name: string;
  size?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  condition: string;
  description: string;
  category: string;
  categoryPath: string[];
  stock: number;
  basePrice: number;
  costPrice: number;
  comparePrice: number;
  price: number; // for backward compatibility with the table
  image: string; // main cover image, for backward compatibility
  images: ProductImage[];
  tags: string[];
  weight: number;
  length: number;
  width: number;
  height: number;
  shippingClass: string;
  specialHandling: boolean;
  hasVariants: boolean;
  variantTypes: { name: string; values: string[] }[];
  variants: ProductVariant[];
  status: "Active" | "Low Stock" | "Out of Stock" | "Draft";
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "FL-SKU-0001",
    sku: "FL-SKU-0001",
    name: "Apple iPhone 15 Pro, Dual SIM, 256GB - Titanium Blue",
    brand: "Apple",
    condition: "New",
    description: "<p>The ultimate iPhone. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.</p><ul><li><strong>Display:</strong> 6.1-inch Super Retina XDR display with ProMotion.</li><li><strong>Camera:</strong> 48MP Main | Ultra Wide | Telephoto</li><li><strong>Battery:</strong> Up to 23 hours video playback</li></ul>",
    category: "Smartphones",
    categoryPath: ["Electronics", "Smartphones"],
    stock: 50,
    basePrice: 1100000,
    costPrice: 850000,
    comparePrice: 1250000,
    price: 1100000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format",
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format", name: "front_view.jpg" },
      { id: "img-2", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format", name: "side_profile.jpg" }
    ],
    tags: ["Apple", "Premium", "Smartphone", "iOS"],
    weight: 0.187,
    length: 14.66,
    width: 7.06,
    height: 0.83,
    shippingClass: "Express",
    specialHandling: true,
    hasVariants: true,
    variantTypes: [
      { name: "Color", values: ["Titanium Blue", "Natural Titanium"] },
      { name: "Storage", values: ["256GB", "512GB"] }
    ],
    variants: [
      { sku: "FL-SKU-0001-B256", price: 1100000, stock: 30, options: { Color: "Titanium Blue", Storage: "256GB" } },
      { sku: "FL-SKU-0001-B512", price: 1300000, stock: 15, options: { Color: "Titanium Blue", Storage: "512GB" } },
      { sku: "FL-SKU-0001-N256", price: 1100000, stock: 5, options: { Color: "Natural Titanium", Storage: "256GB" } },
    ],
    status: "Active"
  },
  {
    id: "FL-SKU-0002",
    sku: "FL-SKU-0002",
    name: "Samsung Odyssey G7 32\" Curved Gaming Monitor",
    brand: "Samsung",
    condition: "New",
    description: "<p>Unmatched immersion. 1000R curved screen technology matches the contours of the human eye for unimaginable realism.</p><ul><li><strong>Resolution:</strong> WQHD (2560 x 1440)</li><li><strong>Refresh Rate:</strong> 240Hz</li><li><strong>Response Time:</strong> 1ms</li></ul>",
    category: "Monitors",
    categoryPath: ["Electronics", "Monitors"],
    stock: 5,
    basePrice: 350000,
    costPrice: 280000,
    comparePrice: 400000,
    price: 350000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format",
    images: [
      { id: "img-3", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format", name: "monitor_front.jpg" }
    ],
    tags: ["Samsung", "Gaming", "Monitor", "1440p"],
    weight: 8.2,
    length: 71,
    width: 30,
    height: 60,
    shippingClass: "Heavy/Bulky",
    specialHandling: true,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Low Stock"
  },
  {
    id: "FL-SKU-0004",
    sku: "FL-SKU-0004",
    name: "Nike Air Max 270 React Sneakers",
    brand: "Nike",
    condition: "New",
    description: "<p>The Nike Air Max 270 React delivers unparalleled, all-day comfort. Its lightweight, woven fabric provides breathability, while the Max Air 270 unit delivers lightweight cushioning.</p>",
    category: "Shoes",
    categoryPath: ["Clothing & Shoes", "Men's Sneakers"],
    stock: 100,
    basePrice: 120000,
    costPrice: 70000,
    comparePrice: 140000,
    price: 120000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format",
    images: [
      { id: "img-5", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format", name: "shoes_side.jpg" }
    ],
    tags: ["Nike", "Sneakers", "Fashion", "Sportswear"],
    weight: 0.8,
    length: 35,
    width: 25,
    height: 12,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: true,
    variantTypes: [
      { name: "Size", values: ["40", "41", "42", "43", "44"] },
      { name: "Color", values: ["Red/Black", "White/Blue"] }
    ],
    variants: [
      { sku: "FL-SKU-0004-42R", price: 120000, stock: 50, options: { Size: "42", Color: "Red/Black" } },
      { sku: "FL-SKU-0004-43R", price: 120000, stock: 30, options: { Size: "43", Color: "Red/Black" } },
      { sku: "FL-SKU-0004-42W", price: 120000, stock: 20, options: { Size: "42", Color: "White/Blue" } }
    ],
    status: "Active"
  }
];
