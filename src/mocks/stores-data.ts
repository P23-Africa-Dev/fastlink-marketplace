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
    location: "Ikeja, Lagos",
    storeCount: 120,
  },
  {
    id: "mall-003",
    name: "Jabi Lake Mall",
    slug: "jabi-lake-mall",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop",
    location: "Jabi, Abuja",
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
