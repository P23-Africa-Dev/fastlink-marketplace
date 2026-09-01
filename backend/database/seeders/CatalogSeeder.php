<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Mall;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::query()->updateOrCreate(
            ['email' => 'catalog@fastlink.test'],
            [
                'name' => 'Catalog Owner',
                'password' => 'password',
                'role' => 'seller',
                'status' => 'active',
            ]
        );

        $categories = $this->seedCategories();
        $brands = $this->seedBrands();
        $malls = $this->seedMalls();
        $this->seedMallStores($owner, $malls, $categories);
        $this->seedNationwideStores($owner);
        $this->seedEmergingStores($owner, $categories);
        $this->seedProducts($categories, $brands);
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(): array
    {
        $rows = [
            ['electronics', 'Electronics', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&auto=format&fit=crop'],
            ['home-living', 'Home & Living', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop'],
            ['fashion', 'Fashion', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop'],
            ['beauty', 'Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop'],
            ['health', 'Health', 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop'],
            ['groceries', 'Groceries', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop'],
            ['books', 'Books & Stationeries', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop'],
        ];

        $map = [];
        foreach ($rows as [$slug, $name, $image]) {
            $map[$slug] = Category::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'image' => $image]
            );
        }

        return $map;
    }

    /**
     * @return array<string, Brand>
     */
    private function seedBrands(): array
    {
        $rows = [
            ['samsung', 'SAMSUNG', 'Samsung', 'blue-bold'],
            ['nike', 'NIKE', 'Nike', 'black'],
            ['xiaomi', 'Xiaomi', 'Xiaomi', 'orange'],
            ['unilever', 'Unilever', 'Unilever', 'default'],
            ['tecno', 'TECNO', 'TECNO', 'blue-bold'],
            ['sony', 'SONY', 'Sony', 'black'],
            ['lg', 'LG', 'LG', 'blue-bold'],
            ['apple', 'Apple', 'Apple', 'black'],
            ['adidas', 'Adidas', 'Adidas', 'black'],
            ['puma', 'Puma', 'Puma', 'black'],
            ['philips', 'Philips', 'Philips', 'blue-bold'],
            ['hp', 'HP', 'HP', 'blue-bold'],
        ];

        $map = [];
        foreach ($rows as [$slug, $name, $productBrand, $style]) {
            $map[$slug] = Brand::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'product_brand' => $productBrand, 'logo_style' => $style]
            );
        }

        return $map;
    }

    /**
     * @return array<string, Mall>
     */
    private function seedMalls(): array
    {
        $rows = [
            ['kano-malls', 'Kano Malls', 'Kano Municipal', 'https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop'],
            ['ikeja-city-mall', 'Ikeja City Mall', 'Lagos State', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop'],
            ['jabi-lake-mall', 'Jabi Lake Mall', 'Abuja', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop'],
            ['freshmart-supermarket', 'FreshMart SuperMarket', 'Nassarawa, Kano', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop'],
            ['sahad-stores-kano', 'Sahad Stores Kano', 'Kano Municipal', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop'],
            ['ado-bayero-mall', 'Ado Bayero Mall', 'Zoo Road, Kano', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop'],
            ['grand-central-plaza', 'Grand Central Plaza', 'Fagge, Kano', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop'],
            ['kano-trade-fair-complex', 'Kano Trade Fair Complex', 'Kumbotso, Kano', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop'],
            ['galaxy-mall-kano', 'Galaxy Mall Kano', 'Tarauni, Kano', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop'],
            ['oasis-shopping-plaza', 'Oasis Shopping Plaza', 'Sabon Gari, Kano', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop'],
            ['kano-heritage-mall', 'Kano Heritage Mall', 'Dala, Kano', 'https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop'],
            ['golden-supermall-kano', 'Golden Supermall Kano', 'Sharada, Kano', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop'],
            ['horizon-commercial-center', 'Horizon Commercial Center', 'Gwale, Kano', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop'],
            ['silverbird-mall-cinema', 'Silverbird Mall & Cinema', 'Hotoro, Kano', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop'],
            ['metro-plaza-kano', 'Metro Plaza Kano', 'Bompai, Kano', 'https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=800&auto=format&fit=crop'],
            ['royal-crown-shopping-complex', 'Royal Crown Shopping Complex', 'Kofar Ruwa, Kano', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop'],
        ];

        $map = [];
        foreach ($rows as [$slug, $name, $location, $image]) {
            $map[$slug] = Mall::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'location' => $location,
                    'city' => str_contains($location, 'Lagos') ? 'Lagos' : (str_contains($location, 'Abuja') ? 'Abuja' : 'Kano'),
                    'image' => $image,
                ]
            );
        }

        return $map;
    }

    /**
     * @param  array<string, Mall>  $malls
     * @param  array<string, Category>  $categories
     */
    private function seedMallStores(User $owner, array $malls, array $categories): void
    {
        $rows = [
            ['electronic-hub', 'Electronic Hub', 'kano-malls', 'electronics', 'Sabon Gari, Kano', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop'],
            ['healthplus-pharmacy', 'HealthPlus Pharmacy', 'kano-malls', 'beauty', 'Tarauni, Kano', 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop'],
            ['style-avenue', 'Style Avenue', 'kano-malls', 'fashion', 'Kano Municipal', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop'],
            ['comfort-home-store', 'Comfort Home Store', 'kano-malls', 'home-living', 'Kano Municipal', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop'],
            ['wellcare-pharmacy', 'WellCare Pharmacy', 'kano-malls', 'health', 'Kano Municipal', 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop'],
            ['fresh-basket-market', 'Fresh Basket Market', 'kano-malls', 'groceries', 'Kano Municipal', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'],
            ['newmart', 'NewMart', 'ikeja-city-mall', 'groceries', 'Kano Municipal', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop'],
            ['fashion-studio', 'Fashion Studio', 'ikeja-city-mall', 'fashion', 'Nassarawa, Kano', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop'],
            ['kano-tech-emporium', 'Kano Tech Emporium', 'jabi-lake-mall', 'electronics', 'Fagge, Kano', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop'],
            ['organic-grocery-market', 'Organic Grocery Market', 'jabi-lake-mall', 'groceries', 'Dala, Kano', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'],
            ['royal-footwear-bags', 'Royal Footwear & Bags', 'freshmart-supermarket', 'fashion', 'Kumbotso, Kano', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop'],
            ['city-supermarket', 'City Supermarket', 'freshmart-supermarket', 'groceries', 'Gwale, Kano', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop'],
            ['smart-gadgets-accessories', 'Smart Gadgets & Accessories', 'sahad-stores-kano', 'electronics', 'Sharada, Kano', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop'],
            ['glow-charm-cosmetics', 'Glow & Charm Cosmetics', 'sahad-stores-kano', 'beauty', 'Hotoro, Kano', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop'],
            ['bompai-home-kitchen', 'Bompai Home & Kitchen', 'ado-bayero-mall', 'home-living', 'Bompai, Kano', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop'],
            ['kano-bookshop-stationery', 'Kano Bookshop & Stationery', 'ado-bayero-mall', 'books', 'Goron Dutse, Kano', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop'],
            ['apex-mobile-world', 'Apex Mobile World', 'grand-central-plaza', 'electronics', 'Wapa, Kano', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop'],
            ['fresh-catch-fish-meat', 'Fresh Catch Fish & Meat', 'grand-central-plaza', 'groceries', 'Kofar Ruwa, Kano', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'],
            ['vogue-tailors-apparel', 'Vogue Tailors & Apparel', 'kano-trade-fair-complex', 'fashion', 'Sabon Gari, Kano', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'],
            ['greenleaf-organic-store', 'GreenLeaf Organic Store', 'kano-trade-fair-complex', 'groceries', 'Tarauni, Kano', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop'],
        ];

        foreach ($rows as [$slug, $name, $mallSlug, $categorySlug, $location, $image]) {
            Store::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'owner_id' => $owner->id,
                    'mall_id' => $malls[$mallSlug]->id,
                    'category_id' => $categories[$categorySlug]->id,
                    'name' => $name,
                    'location' => $location,
                    'delivery_tag' => 'Same Day',
                    'logo' => $image,
                    'type' => 'mall_store',
                    'status' => 'approved',
                ]
            );
        }
    }

    private function seedNationwideStores(User $owner): void
    {
        $rows = [
            ['brand-x', 'Brand X', 'Ships Nationwide'],
            ['zara-home', 'Zara HOME', '3-5 Days'],
            ['sara-home', 'Sara Home', '3-5 Days Delivery'],
            ['stylehub', 'StyleHub', '3-5 Days Delivery'],
            ['ikea-direct', 'Ikea Direct', '3-5 Days Delivery'],
            ['urban-living', 'Urban Living', 'Ships Nationwide'],
            ['konga-express', 'Konga Express', '24-48 Hours Delivery'],
            ['jumia-official', 'Jumia Official', 'Nationwide Shipping'],
        ];

        foreach ($rows as [$slug, $name, $tagline]) {
            Store::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'owner_id' => $owner->id,
                    'name' => $name,
                    'headline' => $tagline,
                    'delivery_tag' => $tagline,
                    'type' => 'nationwide',
                    'status' => 'approved',
                    'location' => 'Nationwide, Nigeria',
                ]
            );
        }
    }

    /**
     * @param  array<string, Category>  $categories
     */
    private function seedEmergingStores(User $owner, array $categories): void
    {
        $rows = [
            ['zuri-fashion-hub', 'Zuri Fashion Hub', 'Fashion store', 'fashion', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop'],
            ['trendy-gadgets', 'Trendy Gadgets', 'Electronics store', 'electronics', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop'],
            ['najamart', 'NajaMart', 'Fashion Bakery', 'fashion', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop'],
            ['urban-wear', 'Urban Wear', 'Designs & Streetwear', 'fashion', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop'],
            ['artisan-leather-crafts', 'Artisan Leather Crafts', 'Handmade Goods', 'fashion', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop'],
            ['eco-home-essentials', 'Eco Home Essentials', 'Home & Kitchen', 'home-living', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop'],
            ['glow-beauty-studio', 'Glow & Beauty Studio', 'Beauty & Cosmetics', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop'],
            ['pure-harvest-organics', 'Pure Harvest Organics', 'Fresh Grocery', 'groceries', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop'],
        ];

        foreach ($rows as [$slug, $name, $headline, $categorySlug, $image]) {
            Store::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'owner_id' => $owner->id,
                    'category_id' => $categories[$categorySlug]->id,
                    'name' => $name,
                    'headline' => $headline,
                    'logo' => $image,
                    'type' => 'emerging',
                    'status' => 'approved',
                    'location' => 'Kano, Nigeria',
                    'delivery_tag' => 'Same Day',
                ]
            );
        }
    }

    /**
     * @param  array<string, Category>  $categories
     * @param  array<string, Brand>  $brands
     */
    private function seedProducts(array $categories, array $brands): void
    {
        $demoStore = Store::query()->where('slug', 'demo-seller-store')->first();

        $rows = [
            [
                'store' => 'electronic-hub',
                'brand' => 'apple',
                'category' => 'electronics',
                'slug' => '2020-apple-macbook-pro-m1',
                'sku' => 'A264671',
                'name' => '2020 Apple MacBook Pro with Apple M1 Chip (13-inch, 8GB RAM, 256GB SSD Storage) - Space Gray',
                'description' => 'The ultimate pro notebook with Apple M1 chip, Liquid Retina XDR display, and up to 20 hours battery life.',
                'price' => 1699,
                'compare' => 1999,
                'stock' => 24,
                'subcategory' => 'Laptops',
                'featured' => true,
                'rating' => 4.7,
                'reviews' => 21671,
                'tags' => ['apple', 'macbook', 'laptop'],
                'images' => [
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format',
                    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&auto=format',
                ],
            ],
            [
                'store' => 'electronic-hub',
                'brand' => 'samsung',
                'category' => 'electronics',
                'slug' => 'samsung-4k-smart-tv',
                'sku' => 'SAM-55-TV4K',
                'name' => 'Samsung 4K Crystal UHD Smart TV',
                'description' => 'Immersive 4K Crystal UHD picture with smart apps and crystal processor.',
                'price' => 450000,
                'compare' => 560000,
                'stock' => 12,
                'subcategory' => 'Televisions',
                'featured' => true,
                'rating' => 4.9,
                'reviews' => 950,
                'tags' => ['samsung', 'tv', 'electronics'],
                'images' => ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format'],
            ],
            [
                'store' => 'electronic-hub',
                'brand' => 'sony',
                'category' => 'electronics',
                'slug' => 'playstation-5-console',
                'sku' => 'SNY-PS5-DISC',
                'name' => 'Sony PlayStation 5 Console (Disc Edition)',
                'description' => 'Lightning-fast loading, deeper immersion, and an all-new generation of incredible PlayStation games.',
                'price' => 680000,
                'compare' => 999000,
                'stock' => 8,
                'subcategory' => 'Gaming',
                'featured' => true,
                'rating' => 5.0,
                'reviews' => 1300,
                'tags' => ['sony', 'gaming', 'ps5'],
                'images' => ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format'],
            ],
            [
                'store' => 'style-avenue',
                'brand' => 'nike',
                'category' => 'fashion',
                'slug' => 'nike-air-sneakers',
                'sku' => 'NKE-AIR-SNK',
                'name' => 'Nike Air Max Running Sneakers',
                'description' => 'Iconic Air Max cushioning with a breathable mesh upper for all-day comfort.',
                'price' => 85000,
                'compare' => 98000,
                'stock' => 40,
                'subcategory' => 'Footwear',
                'featured' => true,
                'rating' => 4.8,
                'reviews' => 420,
                'tags' => ['nike', 'sneakers', 'fashion'],
                'images' => ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format'],
            ],
            [
                'store' => 'style-avenue',
                'brand' => null,
                'category' => 'fashion',
                'slug' => 'merino-wool-scarf',
                'sku' => 'TTX-005-MERC',
                'name' => 'Extra-Fine Merino Scarf',
                'description' => 'Soft extra-fine merino wool scarf with a clean drape.',
                'price' => 165,
                'compare' => null,
                'stock' => 30,
                'subcategory' => 'Accessories',
                'featured' => false,
                'rating' => 4.6,
                'reviews' => 88,
                'tags' => ['fashion', 'scarf'],
                'images' => ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format'],
            ],
            [
                'store' => 'comfort-home-store',
                'brand' => null,
                'category' => 'home-living',
                'slug' => 'artisan-ceramic-mug',
                'sku' => 'CFM-001-SPKL',
                'name' => 'Artisan Ceramic Mug',
                'description' => 'Hand-thrown stoneware mug with a warm speckled glaze. Each piece is unique.',
                'price' => 48,
                'compare' => 62,
                'stock' => 50,
                'subcategory' => 'Drinkware',
                'featured' => true,
                'rating' => 4.8,
                'reviews' => 210,
                'tags' => ['home', 'mug', 'ceramic'],
                'images' => ['https://images.unsplash.com/photo-1514228742587-6b15571a0490?w=800&auto=format'],
            ],
            [
                'store' => 'comfort-home-store',
                'brand' => null,
                'category' => 'home-living',
                'slug' => 'hand-poured-soy-candle',
                'sku' => 'CFM-006-CAND',
                'name' => 'Hand-Poured Soy Candle',
                'description' => 'Slow-burning soy wax candle with a clean botanical scent.',
                'price' => 52,
                'compare' => 70,
                'stock' => 60,
                'subcategory' => 'Candles & Fragrance',
                'featured' => false,
                'rating' => 4.5,
                'reviews' => 420,
                'tags' => ['home', 'candle'],
                'images' => ['https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&auto=format'],
            ],
            [
                'store' => 'kano-bookshop-stationery',
                'brand' => null,
                'category' => 'books',
                'slug' => 'leather-journal',
                'sku' => 'MGJ-003-TAN',
                'name' => 'Full-Grain Leather Journal',
                'description' => 'Hand-stitched full-grain leather journal with thick cream pages.',
                'price' => 124,
                'compare' => 172,
                'stock' => 22,
                'subcategory' => 'Journals',
                'featured' => false,
                'rating' => 4.9,
                'reviews' => 240,
                'tags' => ['stationery', 'journal'],
                'images' => ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format'],
            ],
            [
                'store' => 'fresh-basket-market',
                'brand' => null,
                'category' => 'groceries',
                'slug' => 'organic-grocery-basket',
                'sku' => 'ORG-BOX-FAM',
                'name' => 'Fresh Organic Grocery Family Box',
                'description' => 'Farm-fresh organic fruits, vegetables, and pantry staples delivered straight to your door.',
                'price' => 32000,
                'compare' => 40000,
                'stock' => 18,
                'subcategory' => 'Pantry',
                'featured' => true,
                'rating' => 4.7,
                'reviews' => 310,
                'tags' => ['groceries', 'organic'],
                'images' => ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format'],
            ],
            [
                'store' => 'glow-charm-cosmetics',
                'brand' => 'unilever',
                'category' => 'beauty',
                'slug' => 'glow-beauty-skincare-set',
                'sku' => 'GLW-SKN-SET',
                'name' => 'Glow & Radiance Skincare Essentials Set',
                'description' => 'Vitamin C serum, hyaluronic hydrating cream, and organic botanical facial cleanser.',
                'price' => 45000,
                'compare' => 58000,
                'stock' => 25,
                'subcategory' => 'Skincare',
                'featured' => true,
                'rating' => 4.8,
                'reviews' => 512,
                'tags' => ['beauty', 'skincare'],
                'images' => ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format'],
            ],
            [
                'store' => 'wellcare-pharmacy',
                'brand' => null,
                'category' => 'health',
                'slug' => 'vitamin-c-immune-support',
                'sku' => 'WCP-VIT-C60',
                'name' => 'Vitamin C Immune Support Pack',
                'description' => '60-day immune support pack with vitamin C, zinc, and botanicals.',
                'price' => 8500,
                'compare' => 11000,
                'stock' => 80,
                'subcategory' => 'Supplements',
                'featured' => false,
                'rating' => 4.4,
                'reviews' => 96,
                'tags' => ['health', 'vitamins'],
                'images' => ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format'],
            ],
        ];

        foreach ($rows as $row) {
            $this->upsertProduct($row, $categories, $brands);
        }

        if ($demoStore) {
            $this->upsertProduct([
                'store' => 'demo-seller-store',
                'brand' => 'apple',
                'category' => 'electronics',
                'slug' => 'demo-wireless-earbuds',
                'sku' => 'DEMO-EAR-001',
                'name' => 'Demo Wireless Earbuds',
                'description' => 'Seller demo listing — noise-isolating wireless earbuds.',
                'price' => 45000,
                'compare' => 52000,
                'stock' => 15,
                'subcategory' => 'Audio',
                'featured' => true,
                'rating' => 4.5,
                'reviews' => 12,
                'tags' => ['demo', 'audio'],
                'images' => ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format'],
            ], $categories, $brands);

            $this->upsertProduct([
                'store' => 'demo-seller-store',
                'brand' => 'nike',
                'category' => 'fashion',
                'slug' => 'demo-cotton-tee',
                'sku' => 'DEMO-TEE-001',
                'name' => 'Demo Cotton Tee',
                'description' => 'Seller demo listing — everyday cotton t-shirt.',
                'price' => 12000,
                'compare' => null,
                'stock' => 40,
                'subcategory' => 'Apparel',
                'featured' => false,
                'rating' => 4.2,
                'reviews' => 8,
                'tags' => ['demo', 'fashion'],
                'images' => ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format'],
            ], $categories, $brands);
        }
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, Category>  $categories
     * @param  array<string, Brand>  $brands
     */
    private function upsertProduct(array $row, array $categories, array $brands): void
    {
        $store = Store::query()->where('slug', $row['store'])->first();
        if (! $store) {
            return;
        }

        $product = Product::query()->updateOrCreate(
            ['slug' => $row['slug']],
            [
                'store_id' => $store->id,
                'brand_id' => $row['brand'] ? $brands[$row['brand']]->id : null,
                'category_id' => $categories[$row['category']]->id,
                'name' => $row['name'],
                'sku' => $row['sku'],
                'description' => $row['description'],
                'subcategory' => $row['subcategory'],
                'price' => $row['price'],
                'compare_at_price' => $row['compare'],
                'stock' => $row['stock'],
                'status' => 'active',
                'is_featured' => $row['featured'],
                'is_new' => true,
                'is_bestseller' => $row['featured'],
                'rating' => $row['rating'],
                'review_count' => $row['reviews'],
                'tags' => $row['tags'],
            ]
        );

        if ($product->images()->doesntExist()) {
            foreach ($row['images'] as $index => $url) {
                $product->images()->create([
                    'url' => $url,
                    'alt' => $row['name'],
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}
