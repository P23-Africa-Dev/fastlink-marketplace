"use client";

import * as React from "react";
import { HeroBanner } from "@/components/customer/HeroBanner";
import { CategorySidebar } from "@/components/customer/CategorySidebar";
import { ProductCard } from "@/components/customer/ProductCard";
import { Pagination } from "@/components/customer/Pagination";
import { Footer } from "@/components/customer/Footer";
import { Product } from "@/types";
import { Search } from "lucide-react";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Active Smart Watch",
    description: "Feature-packed smartwatch tracking health, activities, and notifications with style.",
    price: 29.90,
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 15,
    vendorId: "vendor-b",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "Premium Wireless Headset",
    description: "Active noise cancellation, 40hr battery runtime, comfortable leather cushions.",
    price: 29.90,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 12,
    vendorId: "vendor-a",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    name: "Retro Classic Camera",
    description: "Capture beautiful moments with manual controls and iconic vintage aesthetics.",
    price: 29.90,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 7,
    vendorId: "vendor-c",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-4",
    name: "Classic Minimalist Watch",
    description: "Elegant stainless steel case with premium brown leather strap design.",
    price: 145.00,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
    category: "Fashion & Apparel",
    stock: 8,
    vendorId: "vendor-b",
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-5",
    name: "Premium Leather Wallet",
    description: "Slim bifold layout crafted from full-grain vegetable-tanned leather.",
    price: 29.90,
    imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=400&auto=format&fit=crop",
    category: "Fashion & Apparel",
    stock: 20,
    vendorId: "vendor-a",
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-6",
    name: "Insulated Thermal Bottle",
    description: "Double-walled vacuum insulation keeps hot drinks hot and cold drinks ice-cold.",
    price: 29.99,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
    category: "Home & Living",
    stock: 45,
    vendorId: "vendor-a",
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-7",
    name: "Organic Matcha Powder",
    description: "Premium ceremonial grade green tea powder stoneground from Japan.",
    price: 29.90,
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=400&auto=format&fit=crop",
    category: "Food & Beverages",
    stock: 30,
    vendorId: "vendor-d",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-8",
    name: "Gourmet Coffee Beans",
    description: "Single-origin medium roast Arabica coffee beans with rich chocolate notes.",
    price: 19.99,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop",
    category: "Food & Beverages",
    stock: 50,
    vendorId: "vendor-d",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-9",
    name: "Smart Fitness Tracker",
    description: "Waterproof health band tracking heart rate, sleep cycles, and daily steps.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=400&auto=format&fit=crop",
    category: "Health & Wellness",
    stock: 25,
    vendorId: "vendor-e",
    rating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-10",
    name: "Aromatherapy Oil Diffuser",
    description: "Ultrasonic cool mist humidifier with 7 LED color light options and quiet operation.",
    price: 29.90,
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400&auto=format&fit=crop",
    category: "Health & Wellness",
    stock: 40,
    vendorId: "vendor-c",
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-11",
    name: "Bluetooth Speaker",
    description: "Portable wireless speaker with rich bass, 360-degree sound, and waterproof design.",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 18,
    vendorId: "vendor-b",
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-12",
    name: "Gaming Keyboard",
    description: "Mechanical key switches, customizable RGB backlighting, and dedicated media keys.",
    price: 89.90,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 10,
    vendorId: "vendor-a",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-13",
    name: "Unisex Cotton Hoodie",
    description: "Ultra-soft cotton blend hoodie with front pouch pocket and adjustable drawstring.",
    price: 39.50,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop",
    category: "Fashion & Apparel",
    stock: 22,
    vendorId: "vendor-c",
    rating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-14",
    name: "Canvas Sneakers",
    description: "Classic low-top lace-up sneakers crafted from durable breathable canvas.",
    price: 45.00,
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
    category: "Fashion & Apparel",
    stock: 15,
    vendorId: "vendor-b",
    rating: 4.4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-15",
    name: "Leather Backpack",
    description: "Handcrafted top-grain leather backpack with padded laptop sleeve compartment.",
    price: 120.00,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop",
    category: "Fashion & Apparel",
    stock: 6,
    vendorId: "vendor-a",
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-16",
    name: "Ceramic Mug Set",
    description: "Set of 4 matte finish ceramic coffee mugs with comfortable ergonomic handles.",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop",
    category: "Home & Living",
    stock: 14,
    vendorId: "vendor-d",
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-17",
    name: "Cotton Throw Blanket",
    description: "Lightweight and breathable handwoven cotton throw, perfect for beds and couches.",
    price: 34.90,
    imageUrl: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=400&auto=format&fit=crop",
    category: "Home & Living",
    stock: 18,
    vendorId: "vendor-b",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-18",
    name: "Soy Wax Candle",
    description: "Slow-burning soy candle infused with natural lavender and vanilla essential oils.",
    price: 15.99,
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400&auto=format&fit=crop",
    category: "Home & Living",
    stock: 35,
    vendorId: "vendor-c",
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-19",
    name: "Modern Desk Organizer",
    description: "Sturdy wooden desktop organizer tray with compartments for files and stationary.",
    price: 19.90,
    imageUrl: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=400&auto=format&fit=crop",
    category: "Home & Living",
    stock: 20,
    vendorId: "vendor-a",
    rating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-20",
    name: "Raw Organic Honey",
    description: "Pure wildflower honey gathered sustainably from local apiaries, uncooked.",
    price: 14.50,
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop",
    category: "Food & Beverages",
    stock: 25,
    vendorId: "vendor-d",
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-21",
    name: "Dark Chocolate Bar",
    description: "Single-origin 72% dark chocolate with notes of wild berries and coffee beans.",
    price: 7.99,
    imageUrl: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?q=80&w=400&auto=format&fit=crop",
    category: "Food & Beverages",
    stock: 60,
    vendorId: "vendor-e",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-22",
    name: "Herbal Tea Sampler",
    description: "Variety pack of 12 distinct caffeine-free herbal tea blends in biodegradable sachets.",
    price: 22.00,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop",
    category: "Food & Beverages",
    stock: 40,
    vendorId: "vendor-d",
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-23",
    name: "Sunscreen SPF 50",
    description: "Broad-spectrum mineral sunscreen formulated with zinc oxide and organic aloe.",
    price: 18.90,
    imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop",
    category: "Health & Wellness",
    stock: 30,
    vendorId: "vendor-e",
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-24",
    name: "Eco Yoga Mat",
    description: "Non-slip alignment yoga mat made from biodegradable natural tree rubber material.",
    price: 35.00,
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400&auto=format&fit=crop",
    category: "Health & Wellness",
    stock: 15,
    vendorId: "vendor-c",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-25",
    name: "Vitamin C Serum",
    description: "Highly stable antioxidant facial serum designed to brighten skin and reduce fine lines.",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop",
    category: "Health & Wellness",
    stock: 20,
    vendorId: "vendor-a",
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-26",
    name: "PlayStation 5 Console",
    description: "Experience lightning-fast loading with an ultra-high speed SSD and immersive 3D Audio.",
    price: 499.99,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 5,
    vendorId: "vendor-b",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-27",
    name: "Smart Voice Assistant Speaker",
    description: "Voice control your music, smart home devices, and get hands-free helper functions.",
    price: 49.90,
    imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400&auto=format&fit=crop",
    category: "Electronics & Gadgets",
    stock: 12,
    vendorId: "vendor-a",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-28",
    name: "Next-Gen Foldable Smartphone",
    description: "Experience the future with a seamless folding display and pro-grade cameras.",
    price: 1299.99,
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351cb315?q=80&w=400&auto=format&fit=crop",
    category: "New Arrival",
    stock: 10,
    vendorId: "vendor-f",
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-29",
    name: "Ultralight Running Shoes",
    description: "Breathable mesh upper with highly responsive foam cushioning for everyday runs.",
    price: 110.00,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop",
    category: "New Arrival",
    stock: 25,
    vendorId: "vendor-g",
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-30",
    name: "Ergonomic Office Chair",
    description: "Adjustable lumbar support and breathable mesh back for all-day comfort.",
    price: 249.00,
    imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=400&auto=format&fit=crop",
    category: "Best Seller",
    stock: 50,
    vendorId: "vendor-h",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-31",
    name: "Noise-Cancelling Earbuds",
    description: "True wireless earbuds with active noise cancellation and spatial audio.",
    price: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400&auto=format&fit=crop",
    category: "Best Seller",
    stock: 120,
    vendorId: "vendor-i",
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-32",
    name: "Luxury Mall Gift Card",
    description: "A premium gift card redeemable at over 50 exclusive mall boutiques.",
    price: 100.00,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop",
    category: "Malls",
    stock: 500,
    vendorId: "vendor-j",
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-33",
    name: "Designer Sunglasses Collection",
    description: "Exclusive aviator style sunglasses available only at our partner malls.",
    price: 185.50,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop",
    category: "Malls",
    stock: 15,
    vendorId: "vendor-k",
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MotorcycleIllustration = () => (
  <svg className="w-40 h-24" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road line */}
    <line x1="10" y1="105" x2="190" y2="105" stroke="#333333" strokeWidth="3" strokeLinecap="round" />

    {/* Front Wheel */}
    <circle cx="50" cy="85" r="22" fill="#121212" stroke="#666" strokeWidth="4" />
    <circle cx="50" cy="85" r="10" fill="#e0e0e0" />

    {/* Rear Wheel */}
    <circle cx="150" cy="85" r="22" fill="#121212" stroke="#666" strokeWidth="4" />
    <circle cx="150" cy="85" r="10" fill="#e0e0e0" />

    {/* Frame and engine lines */}
    <path d="M50 85L80 50H120L150 85" stroke="#a0a0a0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M80 50L95 85H120L110 50" stroke="#808080" strokeWidth="4" strokeLinejoin="round" />

    {/* Exhaust pipe */}
    <path d="M100 90H140L160 75" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />

    {/* Seat / Body (Teal / Blue accents matching the screenshot) */}
    <path d="M75 45C75 45 90 35 115 38C125 39 135 48 135 48L75 45Z" fill="#00acc1" />
    <path d="M110 40H135V48H110V40Z" fill="#121212" />

    {/* Fuel Tank (Silver / White body) */}
    <path d="M75 45C75 45 70 30 90 30H110L115 45H75Z" fill="#e0e0e0" />

    {/* Handlebars & Fork */}
    <path d="M50 85L72 32" stroke="#a0a0a0" strokeWidth="4" />
    <path d="M68 32H80" stroke="#121212" strokeWidth="4" strokeLinecap="round" />

    {/* Windshield (Teal glass highlight) */}
    <path d="M72 32L65 24C65 24 75 20 78 28L72 32Z" fill="#00acc1" opacity="0.8" />

    {/* Decal Block */}
    <rect x="106" y="58" width="16" height="10" rx="3" fill="#ffffff" />
    <text x="114" y="66" fill="#121212" fontSize="8" fontWeight="bold" textAnchor="middle">01</text>
  </svg>
);

export default function CustomerHomePage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All Products");
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 6;

  const filteredProducts = React.useMemo(() => {
    if (selectedCategory === "All Products") return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  }, [filteredProducts]);

  const displayedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const recommendationProducts = React.useMemo(() => {
    return [
      {
        id: "rec-1",
        name: "Product Name",
        description: "Experience lightning-fast loading with an SSD and immersive 3D Audio.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 5,
        vendorId: "vendor-b",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-2",
        name: "Product Name",
        description: "Voice control your music, smart home devices, and get hands-free helper functions.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 12,
        vendorId: "vendor-a",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-3",
        name: "Product Name",
        description: "Experience lightning-fast loading with an SSD and immersive 3D Audio.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 5,
        vendorId: "vendor-b",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-4",
        name: "Product Name",
        description: "Voice control your music, smart home devices, and get hands-free helper functions.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 12,
        vendorId: "vendor-a",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-5",
        name: "Product Name",
        description: "Experience lightning-fast loading with an SSD and immersive 3D Audio.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 5,
        vendorId: "vendor-b",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#efe4f5] flex flex-col">
      {/* Full-bleed hero with navbar inside */}
      <HeroBanner
        onShopNowClick={() => {
          document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        onExploreClick={() => {
          document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 mt-10 flex flex-col gap-10 pb-16">
        {/* Malls Map */}
        <section className="flex flex-col gap-3">
          <div className="bg-secondary rounded-[24px] py-14 px-6 sm:px-12 flex flex-col items-center justify-center text-center gap-6 shadow-sm overflow-hidden">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Malls Around Me!
            </h2>
            <div className="relative flex items-center w-full max-w-xl bg-white rounded-full p-1.5 shadow-md border border-surface-light">
              <div className="pl-3.5 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search for your location"
                className="w-full bg-transparent pl-2 pr-4 py-2 text-sm text-dark placeholder:text-gray-400 focus:outline-none"
              />
              <button className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors flex-shrink-0">
                Search
              </button>
            </div>
          </div>
          {/* <MallMap /> */}
        </section>

        {/* Shop Section */}
        <section id="shop-section" className="flex flex-col md:flex-row gap-10 mt-4">
          <div className="flex-shrink-0">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              totalCount={MOCK_PRODUCTS.length}
            />
          </div>

          <div className="flex-1 flex flex-col">
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="bg-white border border-surface-light rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
                <span className="text-sm font-semibold text-primary">No products in this category.</span>
                <button
                  onClick={() => handleSelectCategory("All Products")}
                  className="text-xs font-bold text-accent-orange hover:underline mt-2"
                >
                  Reset Category
                </button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Explore Our Recommendations */}
      <section className="w-full bg-[#efe4f5] pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pt-10 lg:pb-32 flex flex-col gap-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-['Montserrat'] font-bold text-[32px] sm:text-[40px] lg:text-[48px] leading-[36px] sm:leading-[44px] lg:leading-[53px] tracking-normal text-[#834AB9]">
            Explore Our<br />Recommendations
          </h2>
        </div>
        <div className="w-full overflow-x-auto pb-6 scroll-smooth scrollbar-none">
          <div className="flex gap-8 px-4 sm:px-6 xl:px-[calc((100vw-1232px)/2)]">
            {recommendationProducts.map((product) => (
              <div key={product.id} className="w-[280px] sm:w-[360px] flex-shrink-0">
                <ProductCard product={product} aspectRatio="aspect-[1.35]" />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Become a Vendor or Rider */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-24 mt-5">
        <div className="w-full bg-[#1c1c1c] rounded-[32px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16 shadow-xl border border-white/5">
          {/* Left Column */}
          <div className="flex flex-col gap-6 w-full lg:max-w-xl text-left">
            <h2 className="font-['Montserrat'] font-bold text-[36px] sm:text-[46px] text-white leading-tight tracking-tight">
              Become a Vendor<br />or Rider
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Join thousands of vendors selling on Fastlink, or sign up as a delivery rider and earn on your own schedule.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button className="bg-white hover:bg-gray-100 text-[#834AB9] font-bold text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-md active:scale-95">
                Sell on Fastlink
              </button>
              <button className="bg-transparent hover:bg-white/10 text-white font-bold text-sm px-8 py-4 rounded-full border border-white/40 transition-all duration-300 flex items-center gap-2 active:scale-95">
                <span>Ride with Us</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-[#242424] rounded-[24px] p-8 w-full lg:w-[420px] flex flex-col items-center justify-center text-center gap-8 border border-white/[0.03] shadow-inner">
            {/* Custom Motorcycle SVG */}
            <div className="relative flex items-center justify-center py-2">
              <MotorcycleIllustration />
            </div>

            {/* Statistics */}
            <div className="flex items-center justify-center w-full gap-10 sm:gap-14 border-t border-white/[0.06] pt-6">
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-['Montserrat'] font-extrabold text-[28px] sm:text-[34px] text-[#f9d749] leading-none tracking-tight">
                  2.5K+
                </span>
                <span className="text-[12px] font-medium text-gray-400 tracking-wide uppercase">
                  Active Riders
                </span>
              </div>

              <div className="h-10 w-[1px] bg-white/[0.08]" />

              <div className="flex flex-col items-center gap-1.5">
                <span className="font-['Montserrat'] font-extrabold text-[28px] sm:text-[34px] text-[#f9d749] leading-none tracking-tight">
                  800+
                </span>
                <span className="text-[12px] font-medium text-gray-400 tracking-wide uppercase">
                  Vendors
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
