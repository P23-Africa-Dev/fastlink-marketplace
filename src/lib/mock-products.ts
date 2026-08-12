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
    description: "<p>The ultimate iPhone. Forged in titanium and featuring the A17 Pro chip.</p>",
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
      { sku: "FL-SKU-0001-B512", price: 1300000, stock: 15, options: { Color: "Titanium Blue", Storage: "512GB" } }
    ],
    status: "Active"
  },
  {
    id: "FL-SKU-0002",
    sku: "FL-SKU-0002",
    name: "Samsung Odyssey G7 32\" Curved Gaming Monitor",
    brand: "Samsung",
    condition: "New",
    description: "<p>Unmatched immersion. 1000R curved screen technology.</p>",
    category: "Monitors",
    categoryPath: ["Electronics", "Monitors"],
    stock: 4,
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
    id: "FL-SKU-0003",
    sku: "FL-SKU-0003",
    name: "Apple MacBook Pro 16\" M3 Max - Space Black",
    brand: "Apple",
    condition: "New",
    description: "<p>Mind-blowing M3 Max chip with 16-core CPU and 40-core GPU.</p>",
    category: "Laptops",
    categoryPath: ["Electronics", "Laptops"],
    stock: 0,
    basePrice: 3850000,
    costPrice: 3100000,
    comparePrice: 4100000,
    price: 3850000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format",
    images: [
      { id: "img-4", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format", name: "macbook_top.jpg" }
    ],
    tags: ["Apple", "MacBook", "M3 Max", "Laptop"],
    weight: 2.14,
    length: 35.5,
    width: 24.8,
    height: 1.68,
    shippingClass: "Express",
    specialHandling: true,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Out of Stock"
  },
  {
    id: "FL-SKU-0004",
    sku: "FL-SKU-0004",
    name: "Nike Air Max 270 React Sneakers",
    brand: "Nike",
    condition: "New",
    description: "<p>Unparalleled all-day comfort with Max Air 270 cushioning.</p>",
    category: "Fashion",
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
      { name: "Size", values: ["40", "41", "42", "43"] }
    ],
    variants: [
      { sku: "FL-SKU-0004-42", price: 120000, stock: 50, options: { Size: "42" } }
    ],
    status: "Active"
  },
  {
    id: "FL-SKU-0005",
    sku: "FL-SKU-0005",
    name: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    condition: "New",
    description: "<p>Industry-leading noise canceling with Auto NC Optimizer.</p>",
    category: "Electronics",
    categoryPath: ["Electronics", "Audio"],
    stock: 22,
    basePrice: 280000,
    costPrice: 200000,
    comparePrice: 320000,
    price: 280000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format",
    images: [
      { id: "img-6", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format", name: "headphones.jpg" }
    ],
    tags: ["Sony", "Headphones", "Audio", "ANC"],
    weight: 0.25,
    length: 22,
    width: 18,
    height: 8,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0006",
    sku: "FL-SKU-0006",
    name: "Highlander Men's Chronograph Stainless Watch",
    brand: "Highlander",
    condition: "New",
    description: "<p>Classic chronograph watch crafted with sapphire glass.</p>",
    category: "Jewelry",
    categoryPath: ["Fashion", "Watches"],
    stock: 3,
    basePrice: 65000,
    costPrice: 40000,
    comparePrice: 85000,
    price: 65000,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&auto=format",
    images: [
      { id: "img-7", url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format", name: "watch.jpg" }
    ],
    tags: ["Watch", "Luxury", "Jewelry"],
    weight: 0.35,
    length: 12,
    width: 12,
    height: 8,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Low Stock"
  },
  {
    id: "FL-SKU-0007",
    sku: "FL-SKU-0007",
    name: "Ergonomic High-Back Leather Executive Chair",
    brand: "FlexiSpot",
    condition: "New",
    description: "<p>Premium lumbar support office chair with breathable leather finish.</p>",
    category: "Home & Kitchen",
    categoryPath: ["Furniture", "Office"],
    stock: 18,
    basePrice: 195000,
    costPrice: 130000,
    comparePrice: 230000,
    price: 195000,
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=300&auto=format",
    images: [
      { id: "img-8", url: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=500&auto=format", name: "chair.jpg" }
    ],
    tags: ["Chair", "Office", "Furniture"],
    weight: 16.5,
    length: 65,
    width: 65,
    height: 120,
    shippingClass: "Heavy/Bulky",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0008",
    sku: "FL-SKU-0008",
    name: "De'Longhi Magnifica Automatic Espresso Machine",
    brand: "De'Longhi",
    condition: "New",
    description: "<p>Barista-quality espresso at home with integrated coffee grinder.</p>",
    category: "Home & Kitchen",
    categoryPath: ["Home & Kitchen", "Appliances"],
    stock: 2,
    basePrice: 420000,
    costPrice: 320000,
    comparePrice: 480000,
    price: 420000,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&auto=format",
    images: [
      { id: "img-9", url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format", name: "coffee_machine.jpg" }
    ],
    tags: ["Coffee", "Kitchen", "Espresso"],
    weight: 9.5,
    length: 40,
    width: 30,
    height: 45,
    shippingClass: "Express",
    specialHandling: true,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Low Stock"
  },
  {
    id: "FL-SKU-0009",
    sku: "FL-SKU-0009",
    name: "PlayStation 5 DualSense Wireless Controller",
    brand: "Sony",
    condition: "New",
    description: "<p>Haptic feedback and adaptive triggers for immersive gaming.</p>",
    category: "Electronics",
    categoryPath: ["Electronics", "Gaming"],
    stock: 65,
    basePrice: 75000,
    costPrice: 50000,
    comparePrice: 85000,
    price: 75000,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format",
    images: [
      { id: "img-10", url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format", name: "controller.jpg" }
    ],
    tags: ["PS5", "Controller", "Gaming"],
    weight: 0.45,
    length: 18,
    width: 18,
    height: 8,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0010",
    sku: "FL-SKU-0010",
    name: "Luxury Genuine Italian Leather Tote Bag",
    brand: "Gucci",
    condition: "New",
    description: "<p>Handcrafted Italian leather tote bag with gold-tone hardware.</p>",
    category: "Fashion",
    categoryPath: ["Fashion", "Handbags"],
    stock: 0,
    basePrice: 320000,
    costPrice: 220000,
    comparePrice: 380000,
    price: 320000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format",
    images: [
      { id: "img-11", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format", name: "bag.jpg" }
    ],
    tags: ["Bag", "Fashion", "Luxury"],
    weight: 1.1,
    length: 40,
    width: 15,
    height: 30,
    shippingClass: "Express",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Out of Stock"
  },
  {
    id: "FL-SKU-0011",
    sku: "FL-SKU-0011",
    name: "Mechanical Gaming Keyboard RGB Backlit",
    brand: "Logitech",
    condition: "New",
    description: "<p>Tactile mechanical switches with customizable RGB backlighting.</p>",
    category: "Electronics",
    categoryPath: ["Electronics", "Accessories"],
    stock: 45,
    basePrice: 85000,
    costPrice: 55000,
    comparePrice: 95000,
    price: 85000,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&auto=format",
    images: [
      { id: "img-12", url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format", name: "keyboard.jpg" }
    ],
    tags: ["Keyboard", "RGB", "Gaming"],
    weight: 1.2,
    length: 45,
    width: 15,
    height: 4,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0012",
    sku: "FL-SKU-0012",
    name: "Smart Watch Series 9 GPS 45mm",
    brand: "Apple",
    condition: "New",
    description: "<p>Powerful health tracking and brighter Always-On Retina display.</p>",
    category: "Smartphones",
    categoryPath: ["Electronics", "Smartwatches"],
    stock: 35,
    basePrice: 450000,
    costPrice: 350000,
    comparePrice: 490000,
    price: 450000,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&auto=format",
    images: [
      { id: "img-13", url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format", name: "apple_watch.jpg" }
    ],
    tags: ["Apple", "Watch", "Smartwatch"],
    weight: 0.15,
    length: 10,
    width: 10,
    height: 8,
    shippingClass: "Express",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0013",
    sku: "FL-SKU-0013",
    name: "Minimalist Wooden Desk Organizer Set",
    brand: "Oakywood",
    condition: "New",
    description: "<p>Solid walnut wood desk organizer for pens, cards, and phone.</p>",
    category: "Stationery",
    categoryPath: ["Office", "Stationery"],
    stock: 28,
    basePrice: 38000,
    costPrice: 20000,
    comparePrice: 45000,
    price: 38000,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format",
    images: [
      { id: "img-14", url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format", name: "organizer.jpg" }
    ],
    tags: ["Wood", "Desk", "Stationery"],
    weight: 0.6,
    length: 25,
    width: 12,
    height: 8,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0014",
    sku: "FL-SKU-0014",
    name: "Framed Canvas Wall Art - African Heritage Print",
    brand: "Artisan Co",
    condition: "New",
    description: "<p>Abstract cultural canvas artwork with gold foil trim.</p>",
    category: "Art & Prints",
    categoryPath: ["Home & Kitchen", "Decor"],
    stock: 12,
    basePrice: 75000,
    costPrice: 40000,
    comparePrice: 90000,
    price: 75000,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format",
    images: [
      { id: "img-15", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format", name: "art_print.jpg" }
    ],
    tags: ["Art", "Canvas", "Home Decor"],
    weight: 2.5,
    length: 80,
    width: 60,
    height: 5,
    shippingClass: "Standard",
    specialHandling: true,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0015",
    sku: "FL-SKU-0015",
    name: "Organic Single-Origin Whole Coffee Beans (1kg)",
    brand: "Starbucks",
    condition: "New",
    description: "<p>Rich dark roast coffee beans sourced directly from Ethiopian highland farms.</p>",
    category: "Groceries",
    categoryPath: ["Food & Beverage", "Coffee"],
    stock: 80,
    basePrice: 28000,
    costPrice: 15000,
    comparePrice: 32000,
    price: 28000,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&auto=format",
    images: [
      { id: "img-16", url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format", name: "coffee_beans.jpg" }
    ],
    tags: ["Coffee", "Groceries", "Organic"],
    weight: 1.0,
    length: 20,
    width: 12,
    height: 8,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0016",
    sku: "FL-SKU-0016",
    name: "Pro Studio Condenser Podcast Microphone",
    brand: "Shure",
    condition: "New",
    description: "<p>Broadcast quality USB/XLR microphone for streaming and recording.</p>",
    category: "Electronics",
    categoryPath: ["Electronics", "Audio"],
    stock: 14,
    basePrice: 185000,
    costPrice: 125000,
    comparePrice: 210000,
    price: 185000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format",
    images: [
      { id: "img-17", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format", name: "microphone.jpg" }
    ],
    tags: ["Shure", "Microphone", "Podcast"],
    weight: 0.9,
    length: 25,
    width: 15,
    height: 10,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0017",
    sku: "FL-SKU-0017",
    name: "4K Action Waterproof Sports Camera",
    brand: "GoPro",
    condition: "New",
    description: "<p>Ultra HD 4K video recording with HyperSmooth 6.0 stabilization.</p>",
    category: "Electronics",
    categoryPath: ["Electronics", "Cameras"],
    stock: 2,
    basePrice: 240000,
    costPrice: 170000,
    comparePrice: 270000,
    price: 240000,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format",
    images: [
      { id: "img-18", url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format", name: "camera.jpg" }
    ],
    tags: ["GoPro", "Camera", "Action"],
    weight: 0.3,
    length: 10,
    width: 8,
    height: 6,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Low Stock"
  },
  {
    id: "FL-SKU-0018",
    sku: "FL-SKU-0018",
    name: "Automatic Robotic Vacuum Cleaner with Mop",
    brand: "Roborock",
    condition: "New",
    description: "<p>Smart LiDAR navigation with intense 5000Pa suction power.</p>",
    category: "Home & Kitchen",
    categoryPath: ["Home & Kitchen", "Appliances"],
    stock: 9,
    basePrice: 380000,
    costPrice: 270000,
    comparePrice: 420000,
    price: 380000,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&auto=format",
    images: [
      { id: "img-19", url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format", name: "robot_vacuum.jpg" }
    ],
    tags: ["Roborock", "Vacuum", "Smart Home"],
    weight: 4.8,
    length: 38,
    width: 38,
    height: 12,
    shippingClass: "Express",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0019",
    sku: "FL-SKU-0019",
    name: "18K Gold Plated Diamond Stud Earrings",
    brand: "Swarovski",
    condition: "New",
    description: "<p>Elegant cubic zirconia diamond stud earrings with 18k gold plating.</p>",
    category: "Jewelry",
    categoryPath: ["Fashion", "Jewelry"],
    stock: 55,
    basePrice: 48000,
    costPrice: 22000,
    comparePrice: 60000,
    price: 48000,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format",
    images: [
      { id: "img-20", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format", name: "earrings.jpg" }
    ],
    tags: ["Jewelry", "Earrings", "Gold"],
    weight: 0.05,
    length: 5,
    width: 5,
    height: 3,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  },
  {
    id: "FL-SKU-0020",
    sku: "FL-SKU-0020",
    name: "Stainless Steel Insulated Smart Water Bottle",
    brand: "Hydro Flask",
    condition: "New",
    description: "<p>Double-wall vacuum insulation keeps drinks cold for up to 24 hours.</p>",
    category: "Home & Kitchen",
    categoryPath: ["Sports & Outdoors", "Bottles"],
    stock: 75,
    basePrice: 22000,
    costPrice: 11000,
    comparePrice: 28000,
    price: 22000,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format",
    images: [
      { id: "img-21", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format", name: "water_bottle.jpg" }
    ],
    tags: ["Bottle", "Hydro Flask", "Fitness"],
    weight: 0.4,
    length: 25,
    width: 8,
    height: 8,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Active"
  }
];
