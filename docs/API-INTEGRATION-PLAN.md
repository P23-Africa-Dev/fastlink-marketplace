# Fastlink Marketplace — API Integration Plan

**Status:** Proposal (not yet implemented)  
**Audience:** Engineering, product, and anyone reviewing how we connect the Next.js UI to the Laravel API  
**Last updated:** 13 August 2026

This document is the implementation standard for taking Fastlink from a UI-complete prototype to a working marketplace. Read it end to end before writing production code. If this plan is approved, implementation should follow the phases in order — do not skip Phase 0 or Phase 1. Scope for the first shippable product is **§6 MVP add list**.

**Endpoint list:** see [`API-CATALOG.md`](./API-CATALOG.md) for every REST path (MVP + post-MVP), auth, and React Query mapping.  
**Backlog:** see [`BACKLOG.md`](./BACKLOG.md) for deferred local infra (MySQL after health check).

---

## 1. Executive summary

The **frontend is largely done**. Shop pages (homepage, malls, stores, brands, categories, products, cart, checkout) and the seller dashboard (overview, orders, products, customers, messages, payments, payouts, analytics, marketing, reviews, settings, support) exist as polished UI.

The **backend is a Laravel 13 skeleton**. It has CORS, a health check (`GET /api/health`), and a stock `users` table. There are no auth endpoints, no marketplace models, and no domain APIs.

Almost every screen still reads **mock data** (inline arrays, Zustand stores, or `src/lib/api.ts` functions that never call HTTP). Axios, **TanStack Query (React Query)**, and **Zustand** are already in the app — integration work uses those, not a new client-state stack.

**Recommended starting point: authentication (after a short foundation pass).**

Not because login is the most exciting feature, but because:

1. This is a multi-role platform (buyer, seller/vendor, admin, later rider). Identity must exist before anyone can “add products to the store.”
2. The dashboard is currently **public** — there is no `middleware.ts`, no role check, and no redirect to `/login`.
3. Every later endpoint (products, orders, payouts, admin monitoring) needs `auth:sanctum` and policies. Building catalog first would force a rewrite of ownership and permissions.
4. The frontend already has login, register, forgot-password, and an auth store. Wiring those first proves the API contract, tokens, CORS, and role routing with the smallest blast radius.

After auth works, the next real product value is **catalog + seller product CRUD**, then **checkout/orders**, then **admin monitoring**, then money (payments/payouts).

**MVP scope is locked in [§6 MVP add list](#6-mvp-add-list).** Phases 0–8 plus thin returns, buyer My Orders, seller onboarding, and a single commission rate are in MVP. Analytics extras, marketing, riders, messages/support, and the “do not put on MVP” list are post-MVP.

---

## 2. Current state

### 2.1 Frontend (Next.js 14 App Router)

| Area | Location | Reality today |
|------|----------|----------------|
| Shop UI | `src/app/(shop)/`, `src/app/page.tsx` | Complete UI, mock data |
| Seller dashboard UI | `src/app/(dashboard)/` | Complete UI, mock/local state |
| Auth pages | `src/app/(auth)/` | Login/register/forgot/reset exist; mock API |
| HTTP client | `src/lib/api.ts` | Axios ready (`NEXT_PUBLIC_API_URL`), **never used for real calls** |
| Server state | TanStack Query | `QueryClientProvider` in `src/app/providers.tsx`; `QUERY_KEYS` in `src/lib/query-client.ts`; `useProducts` already uses `useQuery` |
| Client / session state | Zustand | Auth, cart, wishlist (persisted); orders/messages stores are in-memory mocks to replace |
| Auth session | `src/store/auth-store.ts` | Zustand + persist → localStorage `marketplace-auth` + `auth_token` |
| Cart / wishlist | Zustand + persist | Client-only until optional server sync |
| Route protection | — | **None.** Dashboard is open without login |
| Admin UI | — | **Does not exist** (role type exists: `buyer \| seller \| admin`) |
| Rider / vendor register | Linked from homepage CTA | **404** (`/vendor/register`, `/rider/register`) |

**Shop routes that must eventually hit the API**

- `/` — malls near you, shop by category, brands, deals, emerging vendors
- `/malls`, `/malls/[slug]` — mall → stores (category tabs) → store
- `/stores/[slug]` — store products
- `/brands`, `/brands/[slug]` — brand → categories → products
- `/categories`, `/products?category=` — category → products (skip mall)
- `/products`, `/products/[id]` — featured/recent products and product detail
- `/search`, `/cart`, `/checkout`, `/wishlist`
- `/order-tracking`, `/order-tracking/[id]`

**Seller dashboard nav (must become real APIs)**

| Nav item | Route | Current data |
|----------|-------|----------------|
| Dashboard | `/dashboard` | Inline charts; `useDashboardStats` exists but unused |
| Orders | `/orders`, `/orders/[id]` | `src/store/orders-store.ts` (in-memory) |
| Products | `/all-products`, add/edit | `src/lib/mock-products.ts` (different Product type than shop) |
| Customers | `/customers` | Inline array |
| Messages | `/messages`, `/messages/[id]` | `src/store/messages-store.ts` |
| Payments | `/payments` | Inline records |
| Payouts | `/payouts` | Inline records (Nigerian banks) |
| Analytics | `/analytics` | Inline telemetry |
| Marketing | `/marketing` | Inline campaigns |
| Reviews | `/reviews` | Inline; not tied to shop reviews |
| Settings | `/settings` | Toasts only |
| Support | `/support` | Inline tickets |

**Known frontend debt (fix during integration, not later)**

1. Two `Product` models: shop (`src/types/product.ts`) vs seller inventory (`src/lib/mock-products.ts`). Unify on one API resource.
2. Two `Order` models: buyer (`src/types/order.ts`) vs seller dashboard store.
3. Login always redirects to `/dashboard` even if the user is a buyer.
4. Register ignores `role` (`RegisterCredentials.role` exists but the form does not send it).
5. `useDashboardStats` / `useMyOrders` are dead hooks — pages should use them (React Query) once APIs exist. Do not recreate the same data in Zustand.
6. No `.env.local`. Default axios base URL is `/api`, which has no Next.js API routes.

### 2.2 Backend (Laravel 13)

| Item | Status |
|------|--------|
| `GET /api/health` | Implemented; JSON shape matches frontend `{ success, data, message }` |
| CORS | Configured for `FRONTEND_URL` (default `http://localhost:3000`) |
| Auth packages | **None.** No Sanctum, Passport, JWT, Fortify |
| Models | Stock `User` only (`name`, `email`, `password`) |
| Migrations | Default Laravel: users, sessions, cache, jobs |
| Marketplace tables | **None** |
| API auth | Frontend expects `Bearer` tokens; backend cannot issue or validate them |
| README | Documents `NEXT_PUBLIC_API_URL=http://localhost:8000/api` |

The backend is a **scaffold**, not a marketplace API.

### 2.3 Intended product (from current UI + this request)

Fastlink is a **multi-sided marketplace**:

| Actor | What they do |
|-------|----------------|
| **Buyer** | Browse malls/stores/brands/categories, add to cart, checkout, track orders, review, message sellers |
| **Seller / vendor** | Register a store, add products, fulfil orders, see customers, receive payouts, reply to reviews/messages |
| **Admin** | Monitor everything: users, stores, products, orders, payments, payouts, disputes, platform settings |
| **Rider** (later) | Delivery partner onboarding — UI CTA exists, do not build in early phases |

Navigation rules already in the UI (do not break these):

1. **Mall:** Mall → Stores (filter by category tabs) → Products
2. **Brand:** Brand → Categories → Products
3. **Homepage category:** straight to products in that category
4. **Homepage product/deal:** straight to product detail (add to cart / buy)

---

## 3. Architecture decisions (lock these before coding)

### 3.1 Auth: Laravel Sanctum (token SPA)

**Use Laravel Sanctum personal access tokens** (Bearer tokens), not session cookies for v1.

Reasons:

- Frontend already attaches `Authorization: Bearer` from `localStorage`.
- Next.js and Laravel run on different origins (`localhost:3000` vs `localhost:8000`). Cookie SPA auth works, but requires extra CSRF plumbing; the current client is already token-based.
- Sanctum is first-party, well supported on Laravel 13, and enough for this product. Passport is overkill. Auth0 is optional later if SSO is required — do **not** introduce it in Phase 1.

**Token rules**

- Login/register return `{ token, user }`.
- Frontend stores token in `auth_token` (already) and user in Zustand.
- Logout deletes the current token server-side.
- Password reset uses signed tokens in `password_reset_tokens` (already migrated).
- Later: refresh tokens or short-lived tokens + rotation. Not required for Phase 1.

### 3.2 Roles and access

Extend `users` with:

```text
role: enum('buyer','seller','admin','rider') default 'buyer'
status: enum('active','pending','suspended') default 'active'
phone: nullable string
avatar_path: nullable string
```

**Authorization**

- Laravel policies + `role` middleware (`role:admin`, `role:seller,admin`).
- Sellers own stores and products. Admins can act on all records.
- Buyers cannot access `/dashboard` seller routes.
- Admins get a **separate** `/admin` app later (Phase 8). Until then, admin can use elevated seller APIs only if we explicitly allow it — prefer a dedicated admin surface.

**Registration**

- Default role: `buyer`.
- Seller onboarding: register as seller **or** convert later (`POST /api/seller/onboard`) and create a `stores` row with `status=pending` until admin approves (configurable; start with auto-approve in local/dev).

### 3.3 API conventions (match existing frontend types)

Every JSON response:

```json
{
  "success": true,
  "message": "Optional human message",
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": ["The email has already been taken."] }
}
```

Pagination (align `PaginatedResponse<T>` in `src/types/api.ts`):

```json
{
  "success": true,
  "data": [ ... ],
  "total": 120,
  "page": 1,
  "limit": 12,
  "totalPages": 10,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

**URL prefix:** `/api`  
**Auth header:** `Authorization: Bearer {token}`  
**IDs:** UUID strings (frontend already uses string ids like `prod-macbook`). Prefer UUID primary keys for public resources so we do not leak sequential IDs.

### 3.4 Money, locale, payments

UI copy and payouts are Nigeria-first (Kano malls, GTBank, Zenith).

- Store money as **integer kobo** (or decimal `decimal(12,2)` NGN — pick one and stick to it). Recommendation: **integer kobo** in DB, format in API as naira for the UI if the frontend currently uses naira numbers.
- **Do not integrate Paystack/Flutterwave in Phase 1–4.** Use `payment_status` and mock/manual “mark paid” until checkout is stable.
- When we do payments: **Paystack** is the default recommendation for NGN. Stripe is secondary.

### 3.5 Files

Product images, avatars, store logos: Laravel filesystem (`public` disk locally, S3 later). Never store only remote Unsplash URLs in production seed if we expect seller uploads.

### 3.6 Frontend data layer: React Query + Zustand

**Locked stack.** Do not introduce Redux, SWR, Context-for-server-cache, or ad-hoc `useEffect` + `fetch` in pages.

| Concern | Library | Lives in |
|---------|---------|----------|
| HTTP | Axios (`apiClient`) | `src/lib/api.ts` |
| **Server state** (API data, cache, loading, refetch, mutations) | **TanStack Query (React Query)** | `src/hooks/*`, `src/lib/query-client.ts` |
| **Client / UI / session state** | **Zustand** | `src/store/*` |

This is already how the app is bootstrapped: `Providers` wraps `QueryClientProvider`; auth/cart/wishlist are Zustand with `persist`.

#### React Query — server state

Use `useQuery` / `useMutation` / `useInfiniteQuery` for anything that comes from Laravel.

**Do**

- One hook per resource (or resource family), e.g. `useProducts`, `useMall`, `useSellerOrders`, `useCheckout`.
- Hooks call `*Api` functions; pages never call `apiClient` directly.
- Register every key in `QUERY_KEYS` (`src/lib/query-client.ts`). Nested factories, same pattern as `products.list(filters)`.
- After mutations, `queryClient.invalidateQueries` (and `setQueryData` when we have the new entity).
- Use `enabled` for dependent queries (e.g. product detail only when `id` is set).
- Use `placeholderData: (prev) => prev` for paginated lists (already used on `useProducts`).

**Do not**

- Store product lists, orders, malls, or dashboard stats in Zustand.
- Keep mock `delay()` API functions after a phase ships — replace the function body with `apiClient`.
- Fetch inside Zustand actions.

**Hook map (target)**

| Domain | Hooks | Query key prefix |
|--------|-------|------------------|
| Auth (optional `getMe` hydrate) | `useMe` | `QUERY_KEYS.auth` |
| Products | `useProducts`, `useProduct`, `useProductSearch`, `useFeaturedProducts` | `QUERY_KEYS.products` |
| Catalog | `useMalls`, `useMall`, `useMallStores`, `useCategories`, `useBrands`, `useBrand` | `QUERY_KEYS.malls` / `categories` / `brands` |
| Stores | `useStore`, `useStoreProducts` | `QUERY_KEYS.stores` |
| Buyer orders | `useMyOrders`, `useOrder`, `useOrderTracking` | `QUERY_KEYS.orders` |
| Checkout | `useCheckout` (mutation), `useAddresses` | `QUERY_KEYS.addresses` |
| Seller | `useDashboardStats`, `useSellerProducts`, `useSellerOrders`, `useSellerCustomers` | `QUERY_KEYS.seller` |
| Reviews | `useProductReviews`, `useCreateReview`, `useSellerReviews` | `QUERY_KEYS.reviews` |
| Admin | `useAdminOverview`, `useAdminUsers`, … | `QUERY_KEYS.admin` |

Expand `QUERY_KEYS` as each phase lands. Existing keys already cover `products`, `auth`, `seller`, `orders`.

**Mutations (create / update / delete)**

```ts
useMutation({
  mutationFn: sellerProductsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.products() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
  },
});
```

**Auth + React Query:** on login, `setUser` in Zustand **and** `queryClient.setQueryData(QUERY_KEYS.auth.user(), user)`. On logout, `queryClient.clear()` so the next account cannot see cached seller data.

**Defaults** (already in `query-client.ts`): `staleTime` 5 min, `retry` 2, `refetchOnWindowFocus: false`. Override per-hook when data must be fresher (orders, checkout).

#### Zustand — client / session / UI state

Use Zustand for state that is **not** a cache of GET responses.

| Store | Persist? | Responsibility |
|-------|----------|----------------|
| `auth-store` | Yes | `user`, `token`, `isAuthenticated`, `setUser`, `logout` |
| `cart-store` | Yes | Line items, drawer open, local totals until checkout POST |
| `wishlist-store` | Yes | Saved product ids (server sync is post-MVP) |
| `ui-store` | No | Mobile menu, filter drawer, toasts, search input |

**Replace these mock Zustand stores with React Query** when their phase ships:

| Today | Becomes |
|-------|---------|
| `orders-store.ts` | `useSellerOrders` / `useMyOrders` |
| `messages-store.ts` | `useConversations` (post-MVP) |

**Rules**

- Persist only with `zustand/middleware` `persist` (already used).
- `auth_token` stays in `localStorage` for the Axios interceptor; keep writing it from `setUser` / `logout`.
- Cart remains Zustand for MVP checkout (snapshot sent to `POST /api/checkout`). Do not put the cart in React Query unless we add a server cart later.
- UI flags (modals, tabs, pagination page number) can be local `useState` in the page; no need for a global store.

#### Wiring pattern per feature

```text
page / component
  → hook (useQuery / useMutation)     src/hooks/use-*.ts
    → api module (productsApi.getAll) src/lib/api.ts
      → apiClient (Axios + Bearer)    src/lib/api.ts
        → Laravel /api/*
```

Pages already on React Query (`/products`, `/products/[id]`, `/search`) light up when `productsApi` stops mocking. Dashboard pages that use inline arrays must be moved onto hooks in the same phase as their API.

#### What not to do

- No fetching in Server Components for authenticated seller/admin data in v1 (token is in `localStorage`). Shop catalog *may* later move to server fetch; not required for MVP.
- No duplicating the same list in Zustand “for convenience.”
- No new global Context for API data.

### 3.7 Database

Start with **MySQL** for anything beyond local experiments. SQLite is fine for first auth tests, but mall/store/product relations and concurrent orders belong on MySQL. Document both in `.env.example`.

**Backlog:** switching local `.env` to MySQL is deferred until `GET /api/health` works on SQLite. Setup steps: [`BACKLOG.md`](./BACKLOG.md#mysql-recommended-once-you-leave-health-check).

---

## 4. Domain model (target schema)

This is the data model the UI already implies. Implement tables **per phase**, not all at once.

```text
users
  id, name, email, password, role, status, phone, avatar_path, timestamps

stores                          # a seller's shop (also used for mall tenants)
  id, owner_id → users, mall_id → malls nullable,
  name, slug, description, logo, banner, category_id,
  location, delivery_tag, type enum('mall_store','independent','nationwide','emerging'),
  status enum('pending','approved','suspended'), timestamps

malls
  id, name, slug, image, location, city, timestamps

categories
  id, name, slug, image, parent_id nullable, timestamps

brands                          # official retail partners (Samsung, Nike, …)
  id, name, slug, product_brand, logo_style, timestamps

products
  id, store_id, brand_id nullable, category_id,
  name, slug, sku, description, price, compare_at_price,
  stock, status enum('draft','active','archived'),
  is_featured, is_new, is_bestseller,
  timestamps

product_images
  id, product_id, url, alt, is_primary, sort_order

product_variants                # size/color/memory as in current Product type
  id, product_id, name, value, stock, price_modifier

orders
  id, buyer_id, store_id, status, subtotal, shipping, tax, total,
  payment_status, payment_method, tracking_number, timestamps

order_items
  id, order_id, product_id, name_snapshot, image_snapshot, qty, unit_price

addresses                       # buyer shipping + seller pickup
  id, user_id, label, street, city, state, postal_code, country, is_default

reviews
  id, product_id, order_item_id, buyer_id, store_id, rating, body, status, timestamps

conversations / messages        # buyer ↔ seller (order-linked)
payments, payouts, support_tickets, marketing_campaigns
  (later phases)
```

**Hierarchy mapping**

| UI flow | Tables |
|---------|--------|
| Mall → stores → products | `malls` → `stores.mall_id` → `products.store_id` |
| Brand → categories → products | `brands` → filter `products` by `brand_id` + `category_id` |
| Homepage category | `categories` → `products.category_id` (any store/brand) |
| Homepage product | `products` where `is_featured` or recent `created_at` |

A **brand is a retailer**, not a mall. Do not model brands as malls.

---

## 5. Phased implementation

Each phase has: goal, backend work, frontend work, API list, acceptance criteria, and what is **out of scope**.

Do not start Phase N+1 until Phase N acceptance criteria pass locally (frontend talking to Laravel, not mocks).

**MVP cap:** implement through Phase 8 plus the should-haves in [§6](#6-mvp-add-list) (My Orders, addresses, thin returns, audit log, notifications). Phases 9–10 are post-MVP.

---

### Phase 0 — Foundations (1–2 days)

**Goal:** Make the two apps able to talk, with a shared contract, before any feature work.

**Backend**

- Confirm `php artisan serve` + `GET /api/health`.
- Install **Laravel Sanctum**.
- Add `HasApiTokens` to `User`.
- Add API exception renderer so validation/401/403 match `{ success, message, errors }`.
- Add `EnsureFrontendRequestsAreStateful` only if we later switch to cookies; for Bearer tokens, leave CORS `supports_credentials` false (current default).
- Create `app/Http/Resources` base and a `ApiResponse` helper.
- Add `role` + `status` columns to `users` (migration).
- Seed: 1 admin, 1 seller, 1 buyer (documented passwords).
- PHPUnit: keep HealthCheckTest; add a feature test that unauthenticated `/api/me` returns 401 once that route exists in Phase 1.

**Frontend**

- Add `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.
- Add `.env.example` at repo root with that variable.
- Confirm axios interceptor still reads `auth_token`.
- Optional: a tiny “API status” check on login page using `/health` (not required).

**Out of scope:** Login UI changes, products, dashboard guards.

**Acceptance**

- Frontend `.env.local` pointed at Laravel.
- Health check succeeds from the browser origin (CORS).
- Users table has `role`.

**Shipped:** 13 August 2026 — Sanctum, `role`/`status` on users, API error envelope, demo seed users.

---

### Phase 1 — Authentication and session (start here)

**Goal:** Real users can register, log in, log out, and land on the correct home for their role. Dashboard is no longer public.

This is the correct first feature phase.

**Backend APIs**

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/register` | public | Create user; optional `role=buyer\|seller` |
| `POST` | `/api/auth/login` | public | Return token + user |
| `POST` | `/api/auth/logout` | auth | Revoke current token |
| `GET` | `/api/auth/me` | auth | Current user |
| `PATCH` | `/api/auth/profile` | auth | Name, phone, avatar |
| `POST` | `/api/auth/forgot-password` | public | Email reset link (log mail locally) |
| `POST` | `/api/auth/reset-password` | public | Set new password |
| `POST` | `/api/seller/onboard` | auth buyer | Upgrade to seller + create pending store |

**Register payload**

```json
{ "name": "", "email": "", "password": "", "password_confirmation": "", "role": "buyer" }
```

Reject `role=admin` from public register. Admin is seeded only.

**Frontend**

- Replace `authApi.login/register/getMe` mocks with real HTTP.
- Login: Zustand `setUser` + `queryClient.setQueryData(QUERY_KEYS.auth.user(), user)`.
- Logout: Zustand `logout` + `queryClient.clear()`.
- Optional `useMe()` React Query hook to revalidate session on app load.
- Login success:
  - `seller` → `/dashboard`
  - `admin` → `/admin` (placeholder redirect until Phase 8; temporarily `/dashboard` with a banner is acceptable if documented)
  - `buyer` → `/` or `/products` (not seller dashboard)
- Register: send role from the form (add a “Sell on Fastlink” toggle or query `?role=seller`).
- **Build `/vendor/register`** (homepage CTA currently 404s): business name, phone, bank account → `POST /api/seller/onboard` with store `status=pending`.
- Forgot/reset pages: call real endpoints; keep existing UI.
- **Add Next.js `middleware.ts`:** protect `/dashboard`, `/orders`, `/all-products`, `/customers`, `/messages`, `/payments`, `/payouts`, `/analytics`, `/marketing`, `/reviews`, `/settings`, `/support`. Unauthenticated → `/login`.
- Dashboard layout: if role is `buyer`, redirect away.
- Header: show login vs account based on `isAuthenticated`; “My Account” for sellers → dashboard, for buyers → a simple account stub or orders list (buyer account can be a thin Phase 4 page).

**Acceptance**

- `hello@example.com` mock login is gone.
- Seeded seller can log in and reach dashboard.
- Seeded buyer cannot open `/orders`.
- Refreshing the app keeps the session (`getMe` on boot).
- Logout clears token and redirects to `/login`.

**Out of scope:** Product CRUD, checkout, admin console.

**Shipped:** 13 August 2026 — register/login/logout/me/profile/password reset, seller onboard, Next.js `proxy` dashboard guard, role redirects, `/vendor/register`. Mock `hello@example.com` login removed.

---

### Phase 2 — Catalog directory (homepage + malls + brands + categories)

**Goal:** Homepage and browse flows read live catalog metadata. Still OK if product *listings* stay thin (few seeded SKUs).

This matches what users see first: **shops near you**, **shop by category**, **official brands**.

**Backend APIs (public)**

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/malls` | List malls (search, city, pagination) |
| `GET` | `/api/malls/{slug}` | Mall + store count |
| `GET` | `/api/malls/{slug}/stores` | Stores in mall; `?category=` tab filter |
| `GET` | `/api/stores/{slug}` | Store profile |
| `GET` | `/api/categories` | Shop-by-category grid |
| `GET` | `/api/brands` | Official retail partners |
| `GET` | `/api/brands/{slug}` | Brand profile |
| `GET` | `/api/brands/{slug}/categories` | Categories that have products for this brand |
| `GET` | `/api/deals` | Featured/discounted products for homepage slider |
| `GET` | `/api/vendors/emerging` | Independent/emerging stores |
| `GET` | `/api/stores/nationwide` | Nationwide brand stores |

**Seed data**

Migrate current mocks (`KANO_MALLS`, `LOCAL_STORES_NEAR_YOU`, `ALL_SHOP_CATEGORIES`, `ALL_BRAND_PARTNERS`) into seeders so the UI does not go empty.

**Frontend**

- `src/lib/marketplace.ts` and `src/lib/brands.ts` become thin wrappers around API hooks (or delete once pages fetch).
- Homepage sections (`local-stores-section`, `brands-deals-section`) fetch via React Query hooks (`useMalls`, `useCategories`, `useBrands`, `useDeals`).
- `/malls`, `/malls/[slug]`, `/stores/[slug]`, `/brands`, `/brands/[slug]`, `/categories` use React Query — not Zustand and not direct mock imports.

**Acceptance**

- Homepage malls and categories come from Laravel.
- Mall page category tabs still work and return stores for each category (seed at least one store per category for `kano-malls`).
- Brand page still: brand → category grid → products (products can be empty until Phase 3, but the category step must exist).

**Out of scope:** Seller creating stores in UI (can seed); product CRUD.

**Shipped:** 13 August 2026 — public mall/store/category/brand/deals/emerging/nationwide APIs; catalog seeded from former homepage mocks; shop pages and homepage sections read Laravel via React Query.

---

### Phase 3 — Products (public catalog + seller CRUD)

**Goal:** Sellers add products to **their** store. Shoppers see them on store, brand, category, and product pages.

This is the core marketplace loop after identity.

**Backend APIs**

Public:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/products` | Filters: `category`, `store`, `brand`, `featured`, `q`, price, sort, page |
| `GET` | `/api/products/{idOrSlug}` | Product detail + images + variants + seller/store embed |
| `GET` | `/api/stores/{slug}/products` | Store-scoped listing |
| `GET` | `/api/search` | Same as products search (or alias) |

Seller (auth, role seller/admin):

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/seller/products` | Inventory table for `/all-products` |
| `POST` | `/api/seller/products` | Create (draft or active) |
| `GET` | `/api/seller/products/{id}` | Edit payload |
| `PUT/PATCH` | `/api/seller/products/{id}` | Update |
| `DELETE` | `/api/seller/products/{id}` | Archive/delete |
| `POST` | `/api/seller/products/{id}/images` | Upload |
| `PATCH` | `/api/seller/products/{id}/stock` | Inventory adjust |

**Policy:** seller can only mutate `products.store_id` they own. Admin can mutate all.

**Unify the Product resource** so shop cards and dashboard inventory share fields:

```text
id, slug, name, description, price, compareAtPrice, sku, stock,
category, subcategory, brand, images[], variants, store { id, name, slug },
isFeatured, isNew, isBestseller, rating, reviewCount, status
```

Dashboard-only fields (cost, dimensions) can be nullable extras on the same resource.

**Frontend**

- Replace `productsApi.*` mocks.
- Wire `/all-products` and add-new-product form to seller APIs.
- Product detail `/products/[id]` loads from API; Add to Cart still local until Phase 4.
- Featured homepage/products page: `GET /api/products?featured=1` (and/or `sort=newest`).

**Acceptance**

- Seller logs in, creates a product with image, sees it on `/all-products`.
- Same product appears on `/stores/{their-slug}` and `/products`.
- Category from homepage lists that product if category matches.
- Buyer cannot call seller product endpoints (403).

**Out of scope:** Payments, reviews write-path (read rating can default 0).

**Shipped:** 13 August 2026 — public product list/detail/search; seller CRUD + image URLs + stock; unified Product resource; `/products`, `/all-products`, and add-new-product wired to Laravel. Buyer 403 on seller endpoints.

---

### Phase 4 — Cart, checkout, orders, tracking

**Goal:** A logged-in buyer can purchase and a seller can see/fulfil the order.

**Cart**

- v1: keep **Zustand** `cart-store` (no server cart required).
- Checkout sends a snapshot of line items; server **re-prices from DB** (never trust client prices).

**Backend APIs**

Buyer:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/addresses` | Saved addresses |
| `POST` | `/api/addresses` | Add address |
| `POST` | `/api/checkout` | Create order(s); validate stock |
| `GET` | `/api/orders` | Buyer order history |
| `GET` | `/api/orders/{id}` | Detail |
| `GET` | `/api/orders/{id}/track` | Public-ish tracking (id + email) |

Seller:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/seller/orders` | Dashboard orders list + filters |
| `GET` | `/api/seller/orders/{id}` | Detail (matches `/orders/[id]` UI) |
| `PATCH` | `/api/seller/orders/{id}/status` | pending → confirmed → shipped → delivered / cancelled |

**Checkout rule:** if the cart contains items from **multiple stores**, create **one order per store** (marketplace standard) and return a group id. The current UI is a single checkout — start with single-store carts if that is simpler, then split.

**Payment in this phase:** `payment_status=pending` or `paid` via a stub `POST /api/checkout/confirm` (no gateway). Document this clearly in the UI (“Demo payment”).

**Frontend**

- Checkout wizard posts to `/api/checkout`.
- Order tracking page calls track API instead of hardcoded timeline.
- Replace `orders-store` with React Query `useSellerOrders` / `useMyOrders`. Do not keep a parallel Zustand orders cache.
- Optional: persist cart to user when logged in (`GET/PUT /api/cart`).

**Acceptance**

- Buyer completes checkout; stock decrements.
- Seller sees the order on `/orders` and can change status.
- Tracking page shows real statuses.
- Guest checkout: **out of scope** unless product requires it; prefer login-at-checkout.

**Shipped:** 13 August 2026 — addresses, checkout (server re-price + stock lock), demo `POST /checkout/confirm`, buyer `/account/orders`, seller order status, public tracking by id+email. Cart stays Zustand. Paystack deferred to Phase 7.

### Phase 5 — Seller dashboard core (stats, customers, settings)

**Goal:** The Overview and CRM screens stop being fake.

**Backend APIs**

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/seller/dashboard` | `DashboardStats`: revenue, orders, products, customers, recent orders, top products |
| `GET` | `/api/seller/customers` | Buyers who ordered from this store (tier can be derived from spend) |
| `GET` | `/api/seller/customers/{id}` | Customer detail + order history with this store |
| `GET` | `/api/seller/store` | Store profile |
| `PATCH` | `/api/seller/store` | Update store (settings + `/dashboard/store`) |
| `PATCH` | `/api/seller/settings` | Notification prefs, bank details draft (payouts later) |

**Frontend**

- `/dashboard` uses `useDashboardStats`.
- `/customers` uses customers API.
- `/settings` save actually persists profile + store.

**Acceptance**

- Stats match seeded/real orders from Phase 4.
- Customer list is derived from orders, not a hardcoded VIP list.

**Out of scope:** Marketing ad platforms, analytics time-series (can show simple aggregates here).

**Shipped:** 13 August 2026 — `GET /seller/dashboard` (revenue/orders/customers/products, chart, recent orders, top products), customers derived from orders with spend tiers, store + notification/bank settings persist. Dashboard, `/customers`, `/settings`, and `/dashboard/store` read Laravel.

---

### Phase 6 — Reviews

**Goal:** Product reviews on the shop and moderation on `/reviews`.

**Backend APIs**

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/products/{id}/reviews` | Public approved reviews |
| `POST` | `/api/reviews` | Buyer, must have purchased |
| `GET` | `/api/seller/reviews` | Dashboard list |
| `POST` | `/api/seller/reviews/{id}/reply` | Seller reply |
| `PATCH` | `/api/seller/reviews/{id}` | Hide/flag (or admin-only approve) |

**Frontend**

- Product detail shows API reviews.
- Dashboard `/reviews` uses seller reviews API.

**Acceptance**

- Rating on product cards updates from approved reviews.
- Seller can reply; buyer sees reply on product page.

**Shipped:** 13 August 2026 — public product reviews, buyer create (must have purchased), seller list/reply/flag/hide; product `rating`/`reviewCount` recalculated from approved reviews.

---

### Phase 7 — Payments and payouts

**Goal:** Real money movement for Nigeria.

**Recommended provider:** Paystack (cards, transfers, NGN). Flutterwave as alternative.

**Backend**

- `payments` table: order_id, provider, reference, amount, fees, net, status, raw webhook payload.
- `payouts` table: store_id, amount, bank_code, account_number, status, provider_reference.
- Webhook endpoint `POST /api/webhooks/paystack` (CSRF-exempt, signature verify).
- Seller bank account on `stores` or `payout_accounts`.

**APIs**

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/checkout/initialize` | Paystack initialize; return authorization_url |
| `GET` | `/api/seller/payments` | `/payments` table |
| `GET` | `/api/seller/payouts` | `/payouts` table |
| `POST` | `/api/seller/payouts` | Request payout (admin or auto weekly later) |
| `POST` | `/api/admin/payouts/{id}/approve` | Admin |

**Frontend**

- Checkout redirects to Paystack then returns to a success page.
- `/payments` and `/payouts` read APIs.

**Acceptance**

- Test-mode Paystack payment marks order paid via webhook (not only client return URL).
- Seller payment list shows fees/net.
- Payout request appears as pending until admin/provider confirms.

**Do not start this phase until orders are trustworthy.**

---

### Phase 8 — Admin platform (“monitor everything”)

**Goal:** A general admin who is not a seller, who can oversee the marketplace.

**This is a new UI.** It does not exist today. Build `/admin` (route group `(admin)`) rather than overloading the seller dashboard.

**Minimum admin screens (match monitoring need)**

| Screen | Purpose |
|--------|---------|
| Overview | Platform GMV, users, pending stores, open disputes |
| Users | List/filter by role; suspend |
| Stores / malls | Approve pending sellers; attach store to mall |
| Products | Unpublish violating listings |
| Orders | Search any order |
| Payments / payouts | Confirm settlements |
| Categories / brands / malls | CMS for homepage directory |
| Support tickets | Escalate from seller support |

**Backend:** `role:admin` middleware on `/api/admin/*`. Never expose these to sellers.

**Frontend:** Next.js middleware: only `role=admin`.

**Acceptance**

- Admin can approve a pending seller store; store then appears on mall page.
- Admin can suspend a user; they cannot log in (`status=suspended`).
- Admin can take down a product; it disappears from public catalog.

---

### Phase 9 — Messages and support (post-MVP)

**Goal:** Dashboard Messages and Support become real.

**Messages (buyer ↔ seller)**

- `conversations` (store_id, buyer_id, order_id nullable)
- `messages` (body, sender_id, read_at)
- REST for v1 (`GET/POST /api/conversations/...`). WebSockets (Laravel Reverb/Pusher) only if polling is too slow.

**Support**

- `support_tickets` + `ticket_messages`
- Seller creates tickets; admin replies (ties to Phase 8)

**Frontend:** replace `messages-store` and support inline data.

**Out of scope for v1:** Email-to-ticket, WhatsApp, SMS.

---

### Phase 10 — Analytics, marketing, polish (post-MVP)

**Analytics (`/analytics`)**

- Aggregate from `orders` and `page_views` (optional simple events table).
- Time ranges: today / 7d / 30d / 1y as the UI already shows.
- Do not bolt on Google Analytics as a substitute for seller-specific numbers.

**Marketing (`/marketing`)**

- Internal campaigns table (title, channel, spend, conversions) is enough for v1.
- Do **not** integrate Meta/Google Ads APIs unless there is a hard requirement.

**Wishlist**

- `wishlist_items` for logged-in users; merge with localStorage on login.

**Search**

- Start with MySQL `LIKE` / fulltext on product name.
- Meilisearch/Algolia only if catalog size demands it.

**Riders**

- After core commerce: `riders` table, `/rider/register`, assign deliveries to orders. Explicitly **last**.

---

## 6. MVP add list

This is the product cut for the first shippable marketplace. Fastlink already has most **buyer browse** and **seller dashboard** screens. MVP is not the full 13-section marketplace catalog — it is the glue that makes those screens real: identity, ownership, money, and an admin.

Ship this list. Do not expand it without an explicit product decision.

### 6.1 Must have (without these it isn’t a marketplace)

| Item | What to build | Notes |
|------|----------------|-------|
| **Auth + RBAC** | Real login/register, Sanctum tokens, role routing (`buyer` / `seller` / `admin`) | Dashboard must not be public. |
| **Seller onboarding** | `/vendor/register` (or register as seller), store profile, `pending` → admin approve | Light KYC: business name, phone, bank account. Skip ID-document OCR for v1. Homepage CTA currently 404s. |
| **Catalog APIs** | Malls, stores, categories, brands, products wired to Laravel | UI exists. |
| **Seller product CRUD** | Create / edit / publish / stock against **their** store | UI exists (`/all-products`, add-new-product). |
| **Checkout that creates real orders** | Server re-prices, stock decrements, one order per store | Never trust client prices. |
| **Buyer orders** | **My Orders** page | Today you only have track-by-ID. Seller order list/status UI already exists. |
| **Payments** | Paystack (or test-mode) card pay + webhook | Fake card form is **not** MVP. |
| **Admin console (new UI)** | `/admin` — see minimum screens below | Largest UI gap. |
| **Payouts** | Seller request + admin approve | `/payouts` UI exists; needs API + commission. |
| **Reviews** | Buyer reviews after purchase; seller can reply | PDP + `/reviews` exist. |
| **Notifications** | Email + in-app for order placed, paid, shipped, delivered, cancelled | Settings toggles already exist. |

**Admin console minimum**

- Overview (GMV, orders, pending sellers)
- Buyers / sellers (suspend)
- Approve / reject sellers
- Products (unpublish)
- Categories / brands / malls
- All orders
- Payments / payouts
- Commissions (a **single platform %** is enough)

### 6.2 Should have on MVP (small, high leverage)

| Item | Why |
|------|-----|
| **Buyer addresses** | Saved addresses at checkout (today is a one-shot form). |
| **Order tracking from My Orders** | Tracking UI exists; attach it to real orders. |
| **Simple delivery** | Flat fee or free-over-X; status shipped/delivered. Not full logistics. |
| **Returns / refunds (thin)** | Buyer “request return”; seller/admin approve; full or no refund. No dispute courtroom. |
| **Audit log (admin)** | Who approved a seller / unpublished a product. |

### 6.3 Do not put on MVP

Social login, wallets, bulk CSV, Buy X Get Y, loyalty, gift cards, affiliates, auctions, subscriptions, B2B/RFQ, AI, autocomplete/typo search, recently viewed, product comparison, rider app, multi-carrier delivery, fraud ML, commission per-category engine.

Also post-MVP unless product reopens them: seller messages, support tickets, marketing campaigns, rich analytics (AOV, abandoned carts), wishlist server sync.

### 6.4 What that means vs current UI

**Build new screens**

- Seller registration / onboarding (`/vendor/register`)
- Buyer account: profile, addresses, **My Orders**
- Admin (`/admin`) — entire area
- Return request (buyer) + refund action (seller/admin)
- Optional: in-app notification bell

**Keep existing screens, wire APIs**

- Homepage, malls, stores, brands, categories, products, search, cart, checkout, deals
- Seller dashboard, products, orders, customers, payouts, reviews, settings

The homepage **Become a Vendor** CTA already points at `/vendor/register`. That route 404s today and **belongs in MVP**.

### 6.5 MVP sequence (maps to phases)

```text
1. Auth + roles                                          → Phase 0–1
2. Catalog + seller products                             → Phase 2–3
3. Checkout + buyer My Orders + seller order status      → Phase 4
   (+ saved addresses, simple delivery, tracking link)
4. Paystack + payouts + 1 platform commission %          → Phase 7
5. Admin (approve sellers, unpublish products, all       → Phase 8
   orders/money, audit log)
6. Reviews + email/in-app order notifications            → Phase 6
7. Thin returns/refunds                                  → add to Phase 4/8 (buyer request + admin/seller approve)
```

Phase 5 (seller stats/customers/settings) stays in MVP because those screens exist and are cheap once orders exist. Phases 9–10 are **out of MVP**.

---

## 7. Suggested build order (one page)

```text
Phase 0  Foundations (Sanctum, env, response shape, roles)
Phase 1  Auth (login, register, me, guards, role routing)     ← START FEATURES HERE
Phase 2  Catalog directory (malls, stores, categories, brands)
Phase 3  Products (public list + seller CRUD)                 ← “add products to the store”
Phase 4  Checkout + orders + tracking
Phase 5  Seller dashboard stats, customers, settings
Phase 6  Reviews
Phase 7  Paystack payments + payouts
Phase 8  Admin console                                        ← “general admin monitors everything”
Phase 9  Messages + support tickets
Phase 10 Analytics, marketing, wishlist sync, search upgrade, riders
```

**Why not start with products?**  
Without auth, “add product” has no owner. You would hard-code a store_id, then rip it out.

**Why not start with admin?**  
Admin monitors data that does not exist yet. Empty tables make a useless admin.

**Why not start with payments?**  
Payments without solid orders create reconciliation nightmares.

MVP stops after Phase 8 plus thin returns and notifications (§6.5). Phases 9–10 are post-MVP.

---

## 8. Frontend file map (what to touch per phase)

All new server data goes through **React Query hooks** + `QUERY_KEYS`. Session/cart/wishlist stay **Zustand**.

| Phase | Primary frontend files |
|-------|------------------------|
| 0 | `.env.local`, `.env.example`, `src/lib/api.ts` (base URL only) |
| 1 | `src/lib/api.ts` (`authApi`), `src/store/auth-store.ts`, `(auth)/*`, new `middleware.ts`, `(dashboard)/layout.tsx`, `header.tsx`, new `/vendor/register` onboarding |
| 2 | `features/home/*`, `(shop)/malls/*`, `stores/[slug]`, `brands/*`, `categories`, `lib/marketplace.ts`, `lib/brands.ts` |
| 3 | `hooks/use-products.ts`, `(shop)/products/*`, `(dashboard)/all-products/*`, `add-new-product` |
| 4 | `(shop)/checkout`, `cart-store.ts`, `(shop)/order-tracking/*`, **new buyer My Orders + addresses**, `(dashboard)/orders/*`, `hooks/use-dashboard.ts`, thin return-request UI |
| 5 | `(dashboard)/dashboard/page.tsx`, `customers`, `settings`, `dashboard/store` |
| 6 | `products/[id]`, `(dashboard)/reviews` |
| 7 | checkout payment step, `(dashboard)/payments`, `payouts` |
| 8 | new `src/app/(admin)/*` (overview, users, sellers, products, catalog CMS, orders, payments, commissions, audit log) |
| 9 | `(dashboard)/messages/*`, `support` — **post-MVP** |
| 10 | `analytics` extras, `marketing`, `wishlist-store.ts`, riders — **post-MVP** |

---

## 9. Backend file map (target layout)

```text
backend/app/
  Http/Controllers/Api/
    AuthController.php
    MallController.php
    StoreController.php
    CategoryController.php
    BrandController.php
    ProductController.php
    CheckoutController.php
    OrderController.php
    ReviewController.php
    Seller/DashboardController.php
    Seller/ProductController.php
    Seller/OrderController.php
    Seller/CustomerController.php
    Admin/...
  Http/Requests/          # validation
  Http/Resources/         # JSON transformers matching frontend types
  Http/Middleware/EnsureRole.php
  Models/
  Policies/
  Services/               # CheckoutService, PaystackService (later)
database/migrations/
database/seeders/         # AdminUserSeeder, CatalogSeeder, DemoOrderSeeder
routes/api.php            # grouped: public, auth, seller, admin
```

Keep `routes/api.php` as the single API map. Prefix groups:

```php
Route::prefix('auth')->group(...);           // public + me
Route::middleware('auth:sanctum')->group(...);
Route::middleware(['auth:sanctum', 'role:seller,admin'])->prefix('seller')->group(...);
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(...);
```

---

## 10. Testing and quality bar

For every phase:

1. **Backend:** PHPUnit feature tests for happy path + 401/403 + validation.
2. **Frontend:** Manual checklist in this doc; later Playwright for login + create product + checkout.
3. **Do not merge** a phase that still reads mocks for the endpoints that phase owns.
4. Seeders must be idempotent enough to reset a demo (`php artisan migrate:fresh --seed`).

**Phase 1 tests (minimum)**

- Register unique email → 201 + token
- Duplicate email → 422
- Login wrong password → 401
- `/api/auth/me` without token → 401
- Seller token cannot be used to hit `/api/admin/*` (once admin exists)

**Phase 3 tests (minimum)**

- Seller creates product → appears in public `GET /api/products`
- Other seller cannot PATCH that product

**Phase 4 tests (minimum)**

- Checkout with stale price is ignored; server price used
- Checkout with stock 0 fails
- Status transition invalid (delivered → pending) fails

---

## 11. Environment and local runbook

**Backend**

```bash
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
php artisan db:seed
php artisan serve   # http://localhost:8000
```

**Frontend**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev         # http://localhost:3000
```

**CORS:** `FRONTEND_URL=http://localhost:3000` in backend `.env`.

**Demo users (after Phase 1 seed)** — choose and document in seeder, for example:

| Email | Role | Password |
|-------|------|----------|
| `admin@fastlink.test` | admin | (in seeder only) |
| `seller@fastlink.test` | seller | (in seeder only) |
| `buyer@fastlink.test` | buyer | (in seeder only) |

Never commit real secrets. Paystack keys belong in `.env` from Phase 7.

---

## 12. Risks and explicit non-goals for early phases

| Risk | Mitigation |
|------|------------|
| Dual product types | Unify in Phase 3 API resource; delete `mock-products.ts` when dashboard is wired |
| Building admin too early | Phase 8, after orders exist |
| Payment before orders | Phase 7 only |
| Auth0 / social login | Not in v1; Sanctum email/password first |
| Rider logistics | Phase 10+ |
| Guest checkout | Login required at checkout in v1 |
| Real-time chat | Polling first |
| Splitting orders across malls incorrectly | Store-scoped orders; mall is just directory |

**Non-goals until after MVP (see §6.3)**

- Full CMS for blog/FAQ (can stay static)
- Multi-currency
- Subscriptions
- Native mobile apps (API should still be mobile-ready: Bearer tokens, JSON)
- Messages, support tickets, marketing, rider app, advanced search
- Social login, wallets, bulk CSV, loyalty, gift cards, AI

---

## 13. First implementation ticket (when this plan is approved)

When you say “proceed,” the first coding slice should be **Phase 0 + Phase 1 only**:

1. Install Sanctum; migrate `role`/`status` on users; seed three users.
2. Implement `register`, `login`, `logout`, `me`, forgot/reset.
3. Point frontend `authApi` at Laravel.
4. Add Next.js middleware to protect the dashboard.
5. Role-based post-login redirect.
6. Remove hardcoded `hello@example.com` mock auth.

Do not implement products, malls, or Paystack in that first slice.

---

## 14. Coverage checklist (UI → phase)

Use this to confirm nothing in the current UI is orphaned.

### Homepage / shop

| UI | Phase |
|----|-------|
| Malls in Kano / See more | 2 |
| Shop by category | 2 + 3 |
| Official retail brands | 2 + 3 |
| Nationwide / emerging vendors | 2 |
| Deals of the day → product detail | 3 |
| Product listing / search / filters | 3 |
| Product detail, add to cart | 3 (read) + 4 (buy) |
| Cart / checkout | 4 |
| **My Orders (new)** | 4 — **MVP** |
| **Saved addresses (new)** | 4 — **MVP** |
| Wishlist | 10 (sync); local OK until then — **post-MVP** |
| Order tracking | 4 (link from My Orders) |
| Become vendor / rider CTAs | **1 `/vendor/register` MVP** / 10 rider **post-MVP** |
| **Return request (new)** | 4 / 8 — **MVP (thin)** |
| **In-app notification bell (optional)** | 6 — **MVP should-have** |

### Seller dashboard

| UI | Phase |
|----|-------|
| Login to dashboard | 1 |
| Dashboard overview | 5 |
| Orders | 4 |
| Products (CRUD) | 3 |
| Customers | 5 |
| Messages | 9 |
| Payments | 7 |
| Payouts | 7 |
| Analytics | 10 |
| Marketing | 10 |
| Reviews | 6 |
| Settings | 5 |
| Support | 9 |

### Admin (not built yet — **MVP**)

| Need | Phase |
|------|-------|
| Overview (GMV, orders, pending sellers) | 8 |
| Buyers / sellers (suspend) | 8 |
| Approve / reject sellers | 8 |
| Products (unpublish) | 8 |
| Categories / brands / malls | 8 |
| All orders | 8 |
| Payments / payouts | 8 |
| Commissions (single %) | 8 |
| Audit log | 8 |

---

## 15. Decision log (proposed defaults)

| Decision | Default | Change only if product insists |
|----------|---------|--------------------------------|
| Auth | Laravel Sanctum Bearer tokens | Auth0 later |
| Roles | `buyer`, `seller`, `admin`, `rider` | — |
| Seller approval | Pending → admin approve in production; auto-approve in local/dev only | — |
| IDs | UUID | — |
| Payments | Paystack, Phase 7 | Flutterwave |
| Cart | Zustand (client) until checkout | Server cart + React Query later |
| Frontend server state | TanStack Query (`src/hooks`, `QUERY_KEYS`) | SWR / Redux |
| Frontend client state | Zustand (`src/store`) | Context / Redux |
| Multi-store cart | Split into one order per store | Single-store only for MVP if needed |
| Admin UI | New `/admin` app | Do not reuse seller sidebar |
| Images | Local public disk → S3 later | — |

---

## 16. How to use this document

1. Treat **§6 MVP add list** as the scope cap. Do not implement §6.3 items in the first ship.
2. Review and mark any decision in §3 (including **§3.6 React Query + Zustand**) and §15 you disagree with.
3. Approve **Phase 0 + Phase 1** as the first implementation prompt (includes seller onboarding route, not products).
4. After auth ships, approve Phase 2–3 (catalog + products) as the second slice — that is when sellers can actually add products.
5. Keep this file updated: when a phase ships, add a short “Shipped” note under that phase with date and PR.

If you want implementation to start, the next prompt should be: **implement Phase 0 and Phase 1 of `docs/API-INTEGRATION-PLAN.md`.**
)
