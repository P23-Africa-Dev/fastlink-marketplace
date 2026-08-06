export interface Mall {
  id: string;
  name: string;
  slug: string;
  image: string;
  location?: string;
  storeCount?: number;
}

export interface LocalStoreItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string;
  deliveryTag: string;
  image: string;
}

export interface ShopCategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount?: string;
}

export interface BrandPartner {
  id: string;
  name: string;
  logo?: string;
  href: string;
  style?: "blue-bold" | "black" | "orange" | "default";
}

export interface NationwideBrand {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  href: string;
}

export interface EmergingVendor {
  id: string;
  name: string;
  category: string;
  image: string;
  href: string;
}

export interface DealProduct {
  id: string;
  name: string;
  category: string;
  discount: number;
  image: string;
  href: string;
  rating: number;
  reviews: string;
}

export const KANO_MALLS: Mall[] = [
  {
    id: "mall-001",
    name: "Kano Malls",
    slug: "kano-malls",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop",
    location: "Kano Municipal",
    storeCount: 45,
  },
  {
    id: "mall-002",
    name: "Ikeja City Mall",
    slug: "ikeja-city-mall",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop",
    location: "Lagos State",
    storeCount: 120,
  },
  {
    id: "mall-003",
    name: "Jabi Lake Mall",
    slug: "jabi-lake-mall",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop",
    location: "Abuja",
    storeCount: 85,
  },
  {
    id: "mall-004",
    name: "FreshMart SuperMarket",
    slug: "freshmart-supermarket",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
    location: "Nassarawa, Kano",
    storeCount: 30,
  },
  {
    id: "mall-005",
    name: "Sahad Stores Kano",
    slug: "sahad-stores-kano",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop",
    location: "Kano Municipal",
    storeCount: 50,
  },
  {
    id: "mall-006",
    name: "Ado Bayero Mall",
    slug: "ado-bayero-mall",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop",
    location: "Zoo Road, Kano",
    storeCount: 75,
  },
  {
    id: "mall-007",
    name: "Grand Central Plaza",
    slug: "grand-central-plaza",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop",
    location: "Fagge, Kano",
    storeCount: 40,
  },
  {
    id: "mall-008",
    name: "Kano Trade Fair Complex",
    slug: "kano-trade-fair-complex",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop",
    location: "Kumbotso, Kano",
    storeCount: 110,
  },
  {
    id: "mall-009",
    name: "Galaxy Mall Kano",
    slug: "galaxy-mall-kano",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop",
    location: "Tarauni, Kano",
    storeCount: 35,
  },
  {
    id: "mall-010",
    name: "Oasis Shopping Plaza",
    slug: "oasis-shopping-plaza",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop",
    location: "Sabon Gari, Kano",
    storeCount: 60,
  },
  {
    id: "mall-011",
    name: "Kano Heritage Mall",
    slug: "kano-heritage-mall",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop",
    location: "Dala, Kano",
    storeCount: 28,
  },
  {
    id: "mall-012",
    name: "Golden Supermall Kano",
    slug: "golden-supermall-kano",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
    location: "Sharada, Kano",
    storeCount: 42,
  },
  {
    id: "mall-013",
    name: "Horizon Commercial Center",
    slug: "horizon-commercial-center",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop",
    location: "Gwale, Kano",
    storeCount: 55,
  },
  {
    id: "mall-014",
    name: "Silverbird Mall & Cinema",
    slug: "silverbird-mall-cinema",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop",
    location: "Hotoro, Kano",
    storeCount: 90,
  },
  {
    id: "mall-015",
    name: "Metro Plaza Kano",
    slug: "metro-plaza-kano",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop",
    location: "Bompai, Kano",
    storeCount: 38,
  },
  {
    id: "mall-016",
    name: "Royal Crown Shopping Complex",
    slug: "royal-crown-shopping-complex",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop",
    location: "Kofar Ruwa, Kano",
    storeCount: 48,
  },
];

export const LOCAL_STORES_NEAR_YOU: LocalStoreItem[] = [
  {
    id: "store-001",
    name: "Electronic Hub",
    slug: "electronic-hub",
    category: "Electronics",
    location: "Sabon Gari, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop",
  },
  {
    id: "store-002",
    name: "HealthPlus Pharmacy",
    slug: "healthplus-pharmacy",
    category: "Health & Beauty",
    location: "Tarauni, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop",
  },
  {
    id: "store-003",
    name: "NewMart",
    slug: "newmart",
    category: "Groceries",
    location: "Kano Municipal",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop",
  },
  {
    id: "store-004",
    name: "Fashion Studio",
    slug: "fashion-studio",
    category: "Fashion",
    location: "Nassarawa, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop",
  },
  {
    id: "store-005",
    name: "Kano Tech Emporium",
    slug: "kano-tech-emporium",
    category: "Electronics",
    location: "Fagge, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop",
  },
  {
    id: "store-006",
    name: "Organic Grocery Market",
    slug: "organic-grocery-market",
    category: "Groceries",
    location: "Dala, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop",
  },
  {
    id: "store-007",
    name: "Royal Footwear & Bags",
    slug: "royal-footwear-bags",
    category: "Fashion",
    location: "Kumbotso, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
  },
  {
    id: "store-008",
    name: "City Supermarket",
    slug: "city-supermarket",
    category: "Groceries",
    location: "Gwale, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop",
  },
  {
    id: "store-009",
    name: "Smart Gadgets & Accessories",
    slug: "smart-gadgets-accessories",
    category: "Electronics",
    location: "Sharada, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop",
  },
  {
    id: "store-010",
    name: "Glow & Charm Cosmetics",
    slug: "glow-charm-cosmetics",
    category: "Health & Beauty",
    location: "Hotoro, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop",
  },
  {
    id: "store-011",
    name: "Bompai Home & Kitchen",
    slug: "bompai-home-kitchen",
    category: "Home Living",
    location: "Bompai, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop",
  },
  {
    id: "store-012",
    name: "Kano Bookshop & Stationery",
    slug: "kano-bookshop-stationery",
    category: "Books & Stationeries",
    location: "Goron Dutse, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
  },
  {
    id: "store-013",
    name: "Apex Mobile World",
    slug: "apex-mobile-world",
    category: "Electronics",
    location: "Wapa, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop",
  },
  {
    id: "store-014",
    name: "Fresh Catch Fish & Meat",
    slug: "fresh-catch-fish-meat",
    category: "Groceries",
    location: "Kofar Ruwa, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop",
  },
  {
    id: "store-015",
    name: "Vogue Tailors & Apparel",
    slug: "vogue-tailors-apparel",
    category: "Fashion",
    location: "Sabon Gari, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
  },
  {
    id: "store-016",
    name: "GreenLeaf Organic Store",
    slug: "greenleaf-organic-store",
    category: "Groceries",
    location: "Tarauni, Kano",
    deliveryTag: "Same Day",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop",
  },
];

export const ALL_SHOP_CATEGORIES: ShopCategoryItem[] = [
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop",
  },
  {
    id: "cat-home",
    name: "Home & Living",
    slug: "home-living",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop",
  },
  {
    id: "cat-fashion",
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop",
  },
  {
    id: "cat-beauty",
    name: "Beauty",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop",
  },
  {
    id: "cat-health",
    name: "Health",
    slug: "health",
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop",
  },
  {
    id: "cat-groceries",
    name: "Groceries",
    slug: "groceries",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop",
  },
];

export const ALL_BRAND_PARTNERS: BrandPartner[] = [
  { id: "bp-1", name: "SAMSUNG",  href: "/brands/samsung",  style: "blue-bold" },
  { id: "bp-2", name: "NIKE",     href: "/brands/nike",     style: "black" },
  { id: "bp-3", name: "Xiaomi",   href: "/brands/xiaomi",   style: "orange" },
  { id: "bp-4", name: "Unilever", href: "/brands/unilever", style: "default" },
  { id: "bp-5", name: "TECNO",    href: "/brands/tecno",    style: "blue-bold" },
  { id: "bp-6", name: "SONY",     href: "/brands/sony",     style: "black" },
  { id: "bp-7", name: "LG",       href: "/brands/lg",       style: "blue-bold" },
  { id: "bp-8", name: "Apple",    href: "/brands/apple",    style: "black" },
  { id: "bp-9", name: "Adidas",   href: "/brands/adidas",   style: "black" },
  { id: "bp-10", name: "Puma",    href: "/brands/puma",     style: "black" },
  { id: "bp-11", name: "Philips", href: "/brands/philips",  style: "blue-bold" },
  { id: "bp-12", name: "HP",      href: "/brands/hp",       style: "blue-bold" },
];

export const ALL_NATIONWIDE_BRANDS: NationwideBrand[] = [
  { id: "nb-1", name: "Brand X",    tagline: "Ships Nationwide",   href: "/stores/brand-x" },
  { id: "nb-2", name: "Zara HOME",  tagline: "3-5 Days",           href: "/stores/zara-home" },
  { id: "nb-3", name: "Sara Home",  tagline: "3-5 Days Delivery",  href: "/stores/sara-home" },
  { id: "nb-4", name: "StyleHub",   tagline: "3-5 Days Delivery",  href: "/stores/stylehub" },
  { id: "nb-5", name: "Ikea Direct", tagline: "3-5 Days Delivery", href: "/stores/ikea-direct" },
  { id: "nb-6", name: "Urban Living", tagline: "Ships Nationwide", href: "/stores/urban-living" },
  { id: "nb-7", name: "Konga Express", tagline: "24-48 Hours Delivery", href: "/stores/konga-express" },
  { id: "nb-8", name: "Jumia Official", tagline: "Nationwide Shipping", href: "/stores/jumia-official" },
];

export const ALL_EMERGING_VENDORS: EmergingVendor[] = [
  {
    id: "ev-1",
    name: "Zuri Fashion Hub",
    category: "Fashion store",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop",
    href: "/stores/zuri-fashion-hub",
  },
  {
    id: "ev-2",
    name: "Trendy Gadgets",
    category: "Electronics store",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop",
    href: "/stores/trendy-gadgets",
  },
  {
    id: "ev-3",
    name: "NajaMart",
    category: "Fashion Bakery",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop",
    href: "/stores/najamart",
  },
  {
    id: "ev-4",
    name: "Urban Wear",
    category: "Designs & Streetwear",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop",
    href: "/stores/urban-wear",
  },
  {
    id: "ev-5",
    name: "Artisan Leather Crafts",
    category: "Handmade Goods",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop",
    href: "/stores/artisan-leather-crafts",
  },
  {
    id: "ev-6",
    name: "Eco Home Essentials",
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop",
    href: "/stores/eco-home-essentials",
  },
  {
    id: "ev-7",
    name: "Glow & Beauty Studio",
    category: "Beauty & Cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    href: "/stores/glow-beauty-studio",
  },
  {
    id: "ev-8",
    name: "Pure Harvest Organics",
    category: "Fresh Grocery",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop",
    href: "/stores/pure-harvest-organics",
  },
];

export const ALL_DEALS: DealProduct[] = [
  {
    id: "deal-1",
    name: "PlayStation 5 Console",
    category: "Gaming",
    discount: 32,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop",
    href: "/products/playstation-5",
    rating: 5.0,
    reviews: "1.3k",
  },
  {
    id: "deal-2",
    name: "Amazon Echo Dot",
    category: "Home & Wellness",
    discount: 32,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop",
    href: "/products/amazon-echo",
    rating: 5.0,
    reviews: "1.3k",
  },
  {
    id: "deal-3",
    name: "JBL Bluetooth Speaker",
    category: "Audio",
    discount: 40,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop",
    href: "/products/jbl-bluetooth-speaker",
    rating: 4.8,
    reviews: "850",
  },
  {
    id: "deal-4",
    name: "Binatone Standing Fan",
    category: "Appliances",
    discount: 25,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop",
    href: "/products/binatone-fan",
    rating: 4.5,
    reviews: "420",
  },
  {
    id: "deal-5",
    name: "Binatone Tower Fan",
    category: "Appliances",
    discount: 35,
    image: "https://images.unsplash.com/photo-1558618047-3c5de1be0b6e?w=500&auto=format&fit=crop",
    href: "/products/binatone-tower-fan",
    rating: 4.6,
    reviews: "315",
  },
  {
    id: "deal-6",
    name: "Samsung 4K Smart TV",
    category: "Electronics",
    discount: 20,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop",
    href: "/products/samsung-smart-tv",
    rating: 4.9,
    reviews: "950",
  },
  {
    id: "deal-7",
    name: "Apple iPad Air",
    category: "Electronics",
    discount: 15,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop",
    href: "/products/ipad-air",
    rating: 4.8,
    reviews: "1.1k",
  },
  {
    id: "deal-8",
    name: "Sony Wireless Headphones",
    category: "Audio",
    discount: 28,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
    href: "/products/sony-headphones",
    rating: 4.9,
    reviews: "2.4k",
  },
];
