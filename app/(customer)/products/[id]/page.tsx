"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Star, 
  Home, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Heart, 
  Share2, 
  Copy, 
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  Award,
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import { Footer } from "@/components/customer/Footer";
import { Navbar } from "@/components/customer/Navbar";
import { RelatedProducts } from "@/components/customer/RelatedProducts";
import { BecomeVendorSection } from "@/components/customer/BecomeVendorSection";
export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedMemory, setSelectedMemory] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [visibleThumbsCount, setVisibleThumbsCount] = useState(4);
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'specification' | 'review'>('description');
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleThumbsCount(4);
      } else {
        setVisibleThumbsCount(6);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  useEffect(() => {
    // In a real app, this would be an API fetch
    const foundProduct = MOCK_PRODUCTS.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setActiveImage(foundProduct.imageUrl);
      
      // Select defaults
      const colors = foundProduct.colors?.length ? foundProduct.colors : [
        { name: "Space Gray", hex: "#7d7e80" },
        { name: "Silver", hex: "#e3e4e5" }
      ];
      const sizes = foundProduct.sizes?.length ? foundProduct.sizes : ["14-inch Liquid Retina XDR display", "16-inch Liquid Retina XDR display"];
      const memory = foundProduct.memoryOptions?.length ? foundProduct.memoryOptions : ["16GB unified memory", "32GB unified memory", "64GB unified memory"];
      const storage = foundProduct.storageOptions?.length ? foundProduct.storageOptions : ["1TV SSD Storage", "2TV SSD Storage", "4TV SSD Storage"];

      setSelectedColor(colors[0].name);
      setSelectedSize(sizes[0]);
      setSelectedMemory(memory[0]);
      setSelectedStorage(storage[0]);
    }
  }, [id]);

  const displayColors = product?.colors?.length ? product.colors : [
    { name: "Space Gray", hex: "#7d7e80" },
    { name: "Silver", hex: "#e3e4e5" }
  ];
  const displaySizes = product?.sizes?.length ? product.sizes : ["14-inch Liquid Retina XDR display", "16-inch Liquid Retina XDR display"];
  const displayMemory = product?.memoryOptions?.length ? product.memoryOptions : ["16GB unified memory", "32GB unified memory", "64GB unified memory"];
  const displayStorage = product?.storageOptions?.length ? product.storageOptions : ["1TV SSD Storage", "2TV SSD Storage", "4TV SSD Storage"];

  const displayFeatures = product?.features?.length ? product.features : [
    "Free 1 Year Warranty",
    "Free Shipping & Fasted Delivery",
    "100% Money-back guarantee",
    "24/7 Customer support",
    "Secure payment method"
  ];

  const displayShippingInfo = product?.shippingInfo?.length ? product.shippingInfo : [
    { label: "Courier", value: "2 - 4 days, free shipping" },
    { label: "Local Shipping", value: "up to one week, $19.00" },
    { label: "UPS Ground Shipping", value: "4 - 6 days, $29.00" },
    { label: "Unishop Global Export", value: "3 - 4 days, $39.00" }
  ];

  const displaySpecification = product?.specification?.length ? product.specification : [
    { label: "Brand", value: product?.brand || "Generic" },
    { label: "Category", value: product?.category || "General" },
    { label: "Stock Available", value: product?.stock ? `${product.stock} items` : "In Stock" },
    { label: "Sku", value: product?.sku || "N/A" }
  ];

  const getFeatureIcon = (feature: string) => {
    const f = feature.toLowerCase();
    if (f.includes('warranty') || f.includes('year')) return <Award className="w-5 h-5 text-[#F6A400] flex-shrink-0" />;
    if (f.includes('shipping') || f.includes('delivery')) return <Truck className="w-5 h-5 text-[#F6A400] flex-shrink-0" />;
    if (f.includes('guarantee') || f.includes('money-back')) return <ShieldCheck className="w-5 h-5 text-[#F6A400] flex-shrink-0" />;
    if (f.includes('support') || f.includes('customer')) return <Headphones className="w-5 h-5 text-[#F6A400] flex-shrink-0" />;
    return <CreditCard className="w-5 h-5 text-[#F6A400] flex-shrink-0" />;
  };

  const allImages = React.useMemo(() => {
    if (!product) return [];
    if (product.thumbnails && product.thumbnails.length > 0) {
      return [product.imageUrl, ...product.thumbnails];
    }
    
    // Fallback: generate 8 variants so the slider is always populated
    const categoryLower = product.category.toLowerCase();
    if (categoryLower.includes("electronics") || categoryLower.includes("gadget")) {
      return [
        product.imageUrl,
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=400&auto=format&fit=crop",
      ];
    } else if (categoryLower.includes("fashion") || categoryLower.includes("apparel")) {
      return [
        product.imageUrl,
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop",
      ];
    } else if (categoryLower.includes("home") || categoryLower.includes("living")) {
      return [
        product.imageUrl,
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop",
      ];
    } else if (categoryLower.includes("food") || categoryLower.includes("beverage")) {
      return [
        product.imageUrl,
        "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop",
      ];
    } else {
      return [
        product.imageUrl,
        `${product.imageUrl}&sig=1`,
        `${product.imageUrl}&sig=2`,
        `${product.imageUrl}&sig=3`,
        `${product.imageUrl}&sig=4`,
        `${product.imageUrl}&sig=5`,
        `${product.imageUrl}&sig=6`,
        `${product.imageUrl}&sig=7`,
      ];
    }
  }, [product]);

  useEffect(() => {
    if (product && allImages.length > 0 && thumbStartIndex + visibleThumbsCount > allImages.length) {
      setThumbStartIndex(Math.max(0, allImages.length - visibleThumbsCount));
    }
  }, [visibleThumbsCount, allImages.length, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // In a real app we'd pass the variants (color, size, etc.) along with the product
    for (let i = 0; i < quantity; i++) {
        addItem(product);
    }
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toast.success(`Processing purchase for ${product.name}!`);
  };



  const canScrollLeft = thumbStartIndex > 0;
  const canScrollRight = thumbStartIndex + visibleThumbsCount < allImages.length;
  const visibleThumbs = allImages.slice(thumbStartIndex, thumbStartIndex + visibleThumbsCount);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Breadcrumbs */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center flex-wrap text-sm font-medium text-gray-500 gap-2">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#shop-section" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-primary transition-colors cursor-pointer">
            Category
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-primary transition-colors cursor-pointer">
            All Product
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-dark font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20 mt-4 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-12 xl:gap-16">
          
          {/* Left Column - Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl border border-gray-100 overflow-hidden bg-white p-4">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            
            {/* Thumbnail Slider */}
            {allImages.length > 1 && (
              <div className="relative flex items-center w-full mt-2">
                {/* Left Arrow */}
                <button
                  onClick={() => setThumbStartIndex(Math.max(0, thumbStartIndex - 1))}
                  disabled={!canScrollLeft}
                  className={`absolute -left-5 sm:-left-6 top-1/2 -translate-y-1/2 z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2
                    ${canScrollLeft 
                      ? 'bg-primary-dark text-white border-primary-dark hover:bg-primary shadow-lg cursor-pointer active:scale-90' 
                      : 'bg-primary-dark text-white border-primary-dark opacity-50 cursor-not-allowed'}`}
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Thumbnails */}
                <div className="flex-1 flex gap-3 overflow-hidden px-1 py-2">
                  {visibleThumbs.map((img, index) => {
                    const realIndex = thumbStartIndex + index;
                    return (
                      <button
                        key={realIndex}
                        onClick={() => setActiveImage(img)}
                        className={`relative flex-1 min-w-0 aspect-square rounded-2xl border-2 overflow-hidden transition-all duration-300 bg-white p-2
                          ${activeImage === img 
                            ? 'border-primary-dark shadow-md scale-105 z-0' 
                            : 'border-gray-200 hover:border-primary/40'}`}
                      >
                        <Image 
                          src={img} 
                          alt={`Thumbnail ${realIndex + 1}`} 
                          fill 
                          className="object-contain p-2" 
                          sizes="100px"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setThumbStartIndex(Math.min(allImages.length - visibleThumbsCount, thumbStartIndex + 1))}
                  disabled={!canScrollRight}
                  className={`absolute -right-5 sm:-right-6 top-1/2 -translate-y-1/2 z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2
                    ${canScrollRight 
                      ? 'bg-primary-dark text-white border-primary-dark hover:bg-primary shadow-lg cursor-pointer active:scale-90' 
                      : 'bg-primary-dark text-white border-primary-dark opacity-50 cursor-not-allowed'}`}
                >
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            
            {/* Rating and Title */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex text-primary-dark">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= Math.round(product.rating || 5) ? 'fill-primary-dark text-primary-dark' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">{product.rating?.toFixed(1) || "5.0"} Star Rating</span>
                <span className="text-sm text-gray-400 font-medium">(21,671 User feedback)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal text-gray-800 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm pt-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Sku:</span>
                <span className="font-bold text-gray-900">{product.sku || product.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Availability:</span>
                <span className="font-bold text-green-500">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Brand:</span>
                <span className="font-bold text-gray-900">{product.brand || "Generic"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Category:</span>
                <span className="font-bold text-gray-900">{product.category}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-end gap-3 pt-2">
              <span className="text-3xl font-extrabold text-[#00AEEF]">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 font-medium line-through mb-1">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && (
                <span className="bg-[#F6A400] text-gray-900 text-xs font-bold px-2 py-1 rounded mb-2">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Variants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Colors */}
              {displayColors.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-700 font-medium">Color</span>
                  <div className="flex items-center gap-3">
                    {displayColors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-8 h-8 rounded-full border border-gray-300 transition-all ${selectedColor === color.name ? 'ring-2 ring-offset-4 ring-primary-dark border-transparent scale-105' : 'border-gray-300 hover:scale-105'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {displaySizes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-700 font-medium">Size</span>
                  <div className="relative">
                    <select 
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-600 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 outline-none appearance-none cursor-pointer"
                    >
                      {displaySizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Memory */}
              {displayMemory.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-700 font-medium">Memory</span>
                  <div className="relative">
                    <select 
                      value={selectedMemory}
                      onChange={(e) => setSelectedMemory(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-600 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 outline-none appearance-none cursor-pointer"
                    >
                      {displayMemory.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage */}
              {displayStorage.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-700 font-medium">Storage</span>
                  <div className="relative">
                    <select 
                      value={selectedStorage}
                      onChange={(e) => setSelectedStorage(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-600 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 outline-none appearance-none cursor-pointer"
                    >
                      {displayStorage.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Quantity */}
              <div className="flex items-center justify-between border-2 border-gray-100 rounded-lg p-2 w-full sm:w-[140px] bg-white h-[54px]">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-800 hover:text-primary transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-base font-normal text-gray-700 w-8 text-center">
                  {quantity < 10 ? `0${quantity}` : quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-800 hover:text-primary transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Buttons Container - Side by Side on Mobile, Inline on Desktop */}
              <div className="flex flex-row gap-3 sm:gap-4 flex-1">
                {/* Add to Cart */}
                <button 
                  onClick={handleAddToCart}
                  className="relative flex-1 bg-primary-dark hover:bg-primary-dark/90 text-white font-bold text-xs sm:text-sm rounded-lg h-[54px] flex items-center justify-center transition-colors active:scale-95 px-3 sm:px-6"
                >
                  <span>ADD TO CARD</span>
                  <ShoppingCart className="absolute right-3 sm:right-6 w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Buy Now */}
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-white border-2 border-primary-dark text-primary-dark hover:bg-gray-50 font-bold text-xs sm:text-sm rounded-lg h-[54px] flex items-center justify-center transition-colors active:scale-95 px-3 sm:px-6"
                >
                  BUY NOW
                </button>
              </div>
            </div>

            {/* Wishlist, Compare, Share */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-primary-dark transition-colors">
                  <Heart className="w-5 h-5" />
                  Add to Wishlist
                </button>
                <button className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-primary-dark transition-colors">
                  <RefreshCw className="w-5 h-5" />
                  Add to Compare
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-gray-500">Share product:</span>
                <button className="text-gray-600 hover:text-primary-dark transition-colors"><Copy className="w-5 h-5" /></button>
                <button className="text-gray-600 hover:text-primary-dark transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button className="text-gray-600 hover:text-primary-dark transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </button>
                <button className="text-gray-600 hover:text-primary-dark transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/></svg>
                </button>
              </div>
            </div>

            {/* Safe Checkout */}
            <div className="mt-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <p className="text-sm font-medium text-gray-600 mb-3">100% Guarantee Safe Checkout</p>
              <div className="flex gap-2 items-center flex-wrap">
                {/* Mocking payment icons with small colored divs for now since we don't have images */}
                <div className="h-6 w-10 bg-blue-600 rounded text-[8px] text-white flex items-center justify-center font-bold">VISA</div>
                <div className="h-6 w-10 bg-orange-500 rounded text-[8px] text-white flex items-center justify-center font-bold">MC</div>
                <div className="h-6 w-10 bg-blue-400 rounded text-[8px] text-white flex items-center justify-center font-bold">AMEX</div>
                <div className="h-6 w-10 bg-blue-800 rounded text-[8px] text-white flex items-center justify-center font-bold">PAYPAL</div>
                <div className="h-6 w-10 bg-gray-800 rounded text-[8px] text-white flex items-center justify-center font-bold">APPLE</div>
              </div>
            </div>

        </div>
      </div>
    </main>

      {/* Product Info Tabs - Full Width Background */}
      {product && (
        <div className="w-full bg-[#EEE4F5] border-y border-gray-100/80 py-12 md:py-16 mt-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Tab Headers - Horizontal Scrollable on Mobile */}
            <div className="flex flex-nowrap overflow-x-auto border-b border-gray-200/60 justify-start sm:justify-center gap-6 sm:gap-8 mb-8 pb-4 scrollbar-none">
              {(['description', 'additional', 'specification', 'review'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[13px] sm:text-sm font-semibold tracking-wider uppercase pb-2 transition-all relative flex-shrink-0
                    ${activeTab === tab 
                      ? 'text-gray-800 border-b-2 border-[#F37321]' 
                      : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {tab === 'description' && 'Description'}
                  {tab === 'additional' && 'Additional Information'}
                  {tab === 'specification' && 'Specification'}
                  {tab === 'review' && 'Review'}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === 'description' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                  {/* Left Column: Description */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-gray-800 font-medium">Description</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-light">
                      {product.description}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed font-light">
                      Even the most ambitious projects are easily handled with up to 10 CPU cores, up to 16 GPU cores, a 16-core Neural Engine, and dedicated encode and decode media engines that support H.264, HEVC, and ProRes codecs.
                    </p>
                  </div>

                  {/* Middle Column: Features */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-gray-800 font-medium">Feature</h3>
                    <ul className="flex flex-col gap-4">
                      {displayFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 font-light">
                          {getFeatureIcon(feat)}
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Shipping Info */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-gray-800 font-medium">Shipping Information</h3>
                    <ul className="flex flex-col gap-3">
                      {displayShippingInfo.map((ship, idx) => (
                        <li key={idx} className="text-sm text-gray-600 font-light">
                          <span className="font-semibold text-gray-800">{ship.label}:</span> {ship.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'additional' && (
                <div className="text-sm text-gray-500 leading-relaxed font-light">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Information</h3>
                  <p>Additional details about this product, warranty terms, safety guidelines, and user manual information can be requested from the vendor directly.</p>
                </div>
              )}

              {activeTab === 'specification' && (
                <div className="flex flex-col gap-4 max-w-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Technical Specifications</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    {displaySpecification.map((spec, idx) => (
                      <div key={idx} className={`grid grid-cols-2 p-3 text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100 last:border-0`}>
                        <span className="font-semibold text-gray-700">{spec.label}</span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-bold text-gray-800 font-medium">Customer Reviews</h3>
                  <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-gray-800">{product.rating || "5.0"}</div>
                      <div className="text-sm text-gray-500">out of 5.0</div>
                    </div>
                    <div className="flex-1 border-l border-gray-100 pl-6 flex flex-col gap-1">
                      <div className="flex text-primary-dark">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className="w-4 h-4 fill-primary-dark text-primary-dark" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Based on 21,671 ratings and user feedback.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related Products Grid */}
      <RelatedProducts />

      {/* Become a Vendor or Rider Component */}
      <BecomeVendorSection />

      <Footer />
    </div>
  );
}
