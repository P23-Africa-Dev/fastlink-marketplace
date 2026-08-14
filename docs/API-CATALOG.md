# Fastlink Marketplace — API Catalog

**Companion to:** [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md)  
**Full endpoint docs:** [`API-REFERENCE.md`](./API-REFERENCE.md) (request/response detail for every live route)  
**Base URL:** `http://localhost:8000/api` (frontend: `NEXT_PUBLIC_API_URL`)  
**Auth:** `Authorization: Bearer {token}` unless marked **public**  
**Response shape:** `{ success, message?, data }` — paginated lists also return `total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`  
**Frontend:** Axios in `src/lib/api.ts` → React Query hooks → pages. Zustand is not used for these GET caches.

Legend: **MVP** = required for first ship · **Post-MVP** = do not build until MVP is live · **Optional** = listed in the plan but not required for MVP

---

## Contents

1. [Conventions](#1-conventions)
2. [Health](#2-health)
3. [Auth](#3-auth)
4. [Seller onboarding](#4-seller-onboarding)
5. [Catalog (public)](#5-catalog-public)
6. [Products (public)](#6-products-public)
7. [Products (seller)](#7-products-seller)
8. [Addresses](#8-addresses)
9. [Checkout, orders, tracking](#9-checkout-orders-tracking)
10. [Returns](#10-returns)
11. [Seller dashboard](#11-seller-dashboard)
12. [Reviews](#12-reviews)
13. [Payments and payouts](#13-payments-and-payouts)
14. [Notifications](#14-notifications)
15. [Admin](#15-admin)
16. [Post-MVP](#16-post-mvp)
17. [Index by role](#17-index-by-role)
18. [React Query hook map](#18-react-query-hook-map)

---

## 1. Conventions

| Item | Rule |
|------|------|
| Prefix | All paths below are under `/api` |
| IDs | UUID strings |
| Slugs | Used on public mall / store / brand / product URLs |
| Roles | `buyer`, `seller`, `admin` (`rider` post-MVP) |
| Seller routes | `auth:sanctum` + `role:seller,admin` |
| Admin routes | `auth:sanctum` + `role:admin` |
| Errors | `{ success: false, message, errors? }` — 401 / 403 / 422 / 404 |

---

## 2. Health

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `GET` | `/health` | public | MVP | Liveness; already implemented |

---

## 3. Auth

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `POST` | `/auth/register` | public | MVP | Create user. Body: `name`, `email`, `password`, `password_confirmation`, optional `role` (`buyer` \| `seller`). Never accept `admin`. Returns `{ token, user }`. |
| `POST` | `/auth/login` | public | MVP | Body: `email`, `password`. Returns `{ token, user }`. Reject `status=suspended`. |
| `POST` | `/auth/logout` | auth | MVP | Revoke current Sanctum token. |
| `GET` | `/auth/me` | auth | MVP | Current user (hydrate session). |
| `PATCH` | `/auth/profile` | auth | MVP | Name, phone, avatar. |
| `POST` | `/auth/forgot-password` | public | MVP | Email reset link (log mail locally). |
| `POST` | `/auth/reset-password` | public | MVP | Body: `email`, `token`, `password`, `password_confirmation`. |

---

## 4. Seller onboarding

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `POST` | `/seller/onboard` | auth (`buyer` or new seller) | MVP | Light KYC: business name, phone, bank account. Creates `stores` row with `status=pending`. Used by `/vendor/register`. |

---

## 5. Catalog (public)

Homepage, malls, stores, brands, categories, deals.

| Method | Path | Auth | Scope | Query / notes |
|--------|------|------|-------|----------------|
| `GET` | `/malls` | public | MVP | `q`, `city`, `page`, `limit` |
| `GET` | `/malls/{slug}` | public | MVP | Mall + store count |
| `GET` | `/malls/{slug}/stores` | public | MVP | `category` (tab filter, `all` or slug) |
| `GET` | `/stores/{slug}` | public | MVP | Store profile (redirect mall slugs on frontend, not here) |
| `GET` | `/stores/{slug}/products` | public | MVP | Store-scoped product list; same filters as `/products` |
| `GET` | `/stores/nationwide` | public | MVP | Nationwide brand stores |
| `GET` | `/vendors/emerging` | public | MVP | Independent / emerging vendors |
| `GET` | `/categories` | public | MVP | Shop-by-category grid |
| `GET` | `/brands` | public | MVP | Official retail partners |
| `GET` | `/brands/{slug}` | public | MVP | Brand profile |
| `GET` | `/brands/{slug}/categories` | public | MVP | Categories that have products for this brand |
| `GET` | `/deals` | public | MVP | Discounted / deal-of-the-day products |

---

## 6. Products (public)

| Method | Path | Auth | Scope | Query / notes |
|--------|------|------|-------|----------------|
| `GET` | `/products` | public | MVP | `category`, `store`, `brand`, `featured`, `q`, `minPrice`, `maxPrice`, `inStock`, `sortBy`, `page`, `limit` |
| `GET` | `/products/{idOrSlug}` | public | MVP | Detail + images + variants + store embed |
| `GET` | `/search` | public | MVP | `q`, `page`, `limit` — alias of product search |

`sortBy`: `price_asc` \| `price_desc` \| `rating` \| `newest` \| `bestseller`

---

## 7. Products (seller)

All require seller (or admin). Scoped to the seller’s store.

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `GET` | `/seller/products` | seller | MVP | Inventory for `/all-products` |
| `POST` | `/seller/products` | seller | MVP | Create (draft or active) |
| `GET` | `/seller/products/{id}` | seller | MVP | Edit payload |
| `PUT` | `/seller/products/{id}` | seller | MVP | Full update |
| `PATCH` | `/seller/products/{id}` | seller | MVP | Partial update |
| `DELETE` | `/seller/products/{id}` | seller | MVP | Archive / delete |
| `POST` | `/seller/products/{id}/images` | seller | MVP | Upload image(s) |
| `PATCH` | `/seller/products/{id}/stock` | seller | MVP | Inventory adjust |

---

## 8. Addresses

Buyer saved addresses for checkout (MVP should-have).

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `GET` | `/addresses` | auth | MVP | List current user’s addresses |
| `POST` | `/addresses` | auth | MVP | Create |
| `PATCH` | `/addresses/{id}` | auth | MVP | Update |
| `DELETE` | `/addresses/{id}` | auth | MVP | Delete |
| `PATCH` | `/addresses/{id}/default` | auth | MVP | Set default shipping address |

---

## 9. Checkout, orders, tracking

Cart stays in **Zustand**. Checkout POST sends a line-item snapshot; server re-prices from DB and decrements stock. Multiple stores → one order per store.

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `POST` | `/checkout` | auth buyer | MVP | Create order(s). Body: `items[]`, `address_id`, `delivery_method`. Ignore client prices. |
| `POST` | `/checkout/confirm` | auth buyer | Optional (pre-Paystack) | Stub mark-paid before Phase 7. Drop once Paystack is live. |
| `POST` | `/checkout/initialize` | auth buyer | MVP | Paystack initialize; returns `authorization_url` |
| `GET` | `/orders` | auth buyer | MVP | **My Orders** list (`status`, `page`) |
| `GET` | `/orders/{id}` | auth buyer | MVP | Order detail (must own) |
| `GET` | `/orders/{id}/track` | public* | MVP | Tracking timeline. `*email` query required if unauthenticated |
| `GET` | `/seller/orders` | seller | MVP | Dashboard list (`status`, `q`, `page`) |
| `GET` | `/seller/orders/{id}` | seller | MVP | Seller order detail |
| `PATCH` | `/seller/orders/{id}/status` | seller | MVP | `pending` → `confirmed` → `shipped` → `delivered` / `cancelled` |

Delivery (MVP simple): flat fee or free-over-X, computed server-side on checkout. No carrier APIs.

---

## 10. Returns

Thin MVP: buyer requests; seller or admin approves; full refund or none.

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `POST` | `/orders/{id}/returns` | auth buyer | MVP | Request return (`reason`) |
| `GET` | `/orders/{id}/returns` | auth | MVP | Return status for that order |
| `GET` | `/seller/returns` | seller | MVP | Returns against this store |
| `PATCH` | `/seller/returns/{id}` | seller | MVP | `approve` \| `reject` |
| `GET` | `/admin/returns` | admin | MVP | All return requests |
| `PATCH` | `/admin/returns/{id}` | admin | MVP | Override approve / reject + refund |

---

## 11. Seller dashboard

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `GET` | `/seller/dashboard` | seller | MVP | Revenue, orders, products, customers, recent orders, top products |
| `GET` | `/seller/customers` | seller | MVP | Buyers who ordered from this store |
| `GET` | `/seller/customers/{id}` | seller | MVP | Customer + order history with this store |
| `GET` | `/seller/store` | seller | MVP | Store profile |
| `PATCH` | `/seller/store` | seller | MVP | Update store (name, description, logo, location) |
| `GET` | `/seller/settings` | seller | MVP | Notification prefs, bank draft |
| `PATCH` | `/seller/settings` | seller | MVP | Persist settings |

---

## 12. Reviews

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `GET` | `/products/{id}/reviews` | public | MVP | Approved reviews |
| `POST` | `/reviews` | auth buyer | MVP | Create; must have purchased (`order_item_id`, `rating`, `body`) |
| `GET` | `/seller/reviews` | seller | MVP | Dashboard list (`status`: approved / pending / flagged) |
| `POST` | `/seller/reviews/{id}/reply` | seller | MVP | Seller reply |
| `PATCH` | `/seller/reviews/{id}` | seller | MVP | Hide / flag |

---

## 13. Payments and payouts

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `POST` | `/webhooks/paystack` | public (signature) | MVP | Paystack webhook; CSRF-exempt; verify HMAC |
| `GET` | `/seller/payments` | seller | MVP | Payment records (fees, net, status) |
| `GET` | `/seller/payouts` | seller | MVP | Payout history + balances |
| `POST` | `/seller/payouts` | seller | MVP | Request payout |
| `GET` | `/seller/payout-accounts` | seller | MVP | Linked bank accounts |
| `POST` | `/seller/payout-accounts` | seller | MVP | Add bank account |

Commission: single platform `%` stored in config / `platform_settings`. Applied when an order is paid. No per-category engine on MVP.

---

## 14. Notifications

In-app list + email for: order placed, paid, shipped, delivered, cancelled.

| Method | Path | Auth | Scope | Purpose |
|--------|------|------|-------|---------|
| `GET` | `/notifications` | auth | MVP | In-app inbox (`unread`, `page`) |
| `PATCH` | `/notifications/{id}/read` | auth | MVP | Mark one read |
| `POST` | `/notifications/read-all` | auth | MVP | Mark all read |
| `GET` | `/notification-preferences` | auth | MVP | Email / in-app toggles (settings UI exists) |
| `PATCH` | `/notification-preferences` | auth | MVP | Update toggles |

---

## 15. Admin

All `role:admin`. New `/admin` UI.

### Overview and users

| Method | Path | Scope | Purpose |
|--------|------|-------|---------|
| `GET` | `/admin/dashboard` | MVP | GMV, orders, active buyers/sellers, pending sellers, refunds, pending payouts |
| `GET` | `/admin/users` | MVP | `role`, `status`, `q`, `page` |
| `GET` | `/admin/users/{id}` | MVP | User detail + activity |
| `PATCH` | `/admin/users/{id}` | MVP | Suspend / activate / delete (soft) |

### Sellers / stores

| Method | Path | Scope | Purpose |
|--------|------|-------|---------|
| `GET` | `/admin/stores` | MVP | `status` (`pending` \| `approved` \| `suspended`) |
| `GET` | `/admin/stores/{id}` | MVP | Store + owner KYC |
| `POST` | `/admin/stores/{id}/approve` | MVP | Approve seller; store appears in catalog |
| `POST` | `/admin/stores/{id}/reject` | MVP | Reject with `reason` |
| `POST` | `/admin/stores/{id}/suspend` | MVP | Suspend store |

### Catalog CMS

| Method | Path | Scope | Purpose |
|--------|------|-------|---------|
| `GET` | `/admin/malls` | MVP | List malls |
| `POST` | `/admin/malls` | MVP | Create mall |
| `PATCH` | `/admin/malls/{id}` | MVP | Update mall |
| `DELETE` | `/admin/malls/{id}` | MVP | Delete mall |
| `GET` | `/admin/categories` | MVP | List |
| `POST` | `/admin/categories` | MVP | Create |
| `PATCH` | `/admin/categories/{id}` | MVP | Update |
| `DELETE` | `/admin/categories/{id}` | MVP | Delete |
| `GET` | `/admin/brands` | MVP | List |
| `POST` | `/admin/brands` | MVP | Create |
| `PATCH` | `/admin/brands/{id}` | MVP | Update |
| `DELETE` | `/admin/brands/{id}` | MVP | Delete |

### Products, orders, money

| Method | Path | Scope | Purpose |
|--------|------|-------|---------|
| `GET` | `/admin/products` | MVP | All listings (`status`, `q`) |
| `GET` | `/admin/products/{id}` | MVP | Detail |
| `PATCH` | `/admin/products/{id}/unpublish` | MVP | Take down listing |
| `GET` | `/admin/orders` | MVP | All orders |
| `GET` | `/admin/orders/{id}` | MVP | Any order detail |
| `PATCH` | `/admin/orders/{id}/status` | MVP | Admin override status |
| `GET` | `/admin/payments` | MVP | All payment records |
| `GET` | `/admin/payouts` | MVP | All payout requests |
| `POST` | `/admin/payouts/{id}/approve` | MVP | Approve payout |
| `POST` | `/admin/payouts/{id}/reject` | MVP | Reject payout |
| `GET` | `/admin/settings/commission` | MVP | Current platform % |
| `PATCH` | `/admin/settings/commission` | MVP | Update single commission rate |
| `GET` | `/admin/audit-logs` | MVP | Who approved a seller / unpublished a product (`actor`, `action`, `page`) |

---

## 16. Post-MVP

Do not implement until MVP is shipped ([plan §6.3](./API-INTEGRATION-PLAN.md#63-do-not-put-on-mvp)).

### Cart sync (optional even later)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/cart` | Logged-in cart |
| `PUT` | `/cart` | Replace cart from Zustand |

### Messages (buyer ↔ seller)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/conversations` | Inbox |
| `POST` | `/conversations` | Start (`store_id`, optional `order_id`, `product_id`) |
| `GET` | `/conversations/{id}` | Thread |
| `POST` | `/conversations/{id}/messages` | Send message |
| `PATCH` | `/conversations/{id}/read` | Mark read |

### Support tickets

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/seller/support/tickets` | Seller tickets |
| `POST` | `/seller/support/tickets` | Create |
| `GET` | `/seller/support/tickets/{id}` | Thread |
| `POST` | `/seller/support/tickets/{id}/messages` | Reply |
| `GET` | `/admin/support/tickets` | Admin queue |
| `POST` | `/admin/support/tickets/{id}/messages` | Admin reply |
| `PATCH` | `/admin/support/tickets/{id}` | Status / assign |

### Analytics and marketing

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/seller/analytics` | Time ranges: `today` \| `7days` \| `30days` \| `1year` |
| `GET` | `/seller/marketing/campaigns` | Campaign list |
| `POST` | `/seller/marketing/campaigns` | Create campaign |
| `PATCH` | `/seller/marketing/campaigns/{id}` | Update |
| `GET` | `/admin/analytics` | Platform GMV, take rate, growth |

### Wishlist

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/wishlist` | Logged-in wishlist |
| `POST` | `/wishlist` | Add `product_id` |
| `DELETE` | `/wishlist/{productId}` | Remove |

### Riders

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/rider/register` | Rider onboarding |
| `GET` | `/admin/riders` | List / approve |
| `PATCH` | `/admin/orders/{id}/assign-rider` | Assign delivery |

---

## 17. Index by role

### Public (no token)

`GET /health`  
`POST /auth/register` `POST /auth/login` `POST /auth/forgot-password` `POST /auth/reset-password`  
`GET /malls` `GET /malls/{slug}` `GET /malls/{slug}/stores`  
`GET /stores/{slug}` `GET /stores/{slug}/products` `GET /stores/nationwide` `GET /vendors/emerging`  
`GET /categories` `GET /brands` `GET /brands/{slug}` `GET /brands/{slug}/categories` `GET /deals`  
`GET /products` `GET /products/{idOrSlug}` `GET /search` `GET /products/{id}/reviews`  
`GET /orders/{id}/track`  
`POST /webhooks/paystack`

### Any authenticated user

`POST /auth/logout` `GET /auth/me` `PATCH /auth/profile`  
`GET|POST|PATCH|DELETE /addresses…`  
`GET /notifications…` `GET|PATCH /notification-preferences`

### Buyer

`POST /seller/onboard`  
`POST /checkout` `POST /checkout/initialize`  
`GET /orders` `GET /orders/{id}`  
`POST /orders/{id}/returns` `POST /reviews`

### Seller

All `/seller/*` product, order, dashboard, customer, store, settings, review, payment, payout, return endpoints.

### Admin

All `/admin/*` endpoints.

---

## 18. React Query hook map

| API group | Hook(s) | `QUERY_KEYS` |
|-----------|---------|--------------|
| Auth me | `useMe` | `auth.user()` |
| Malls | `useMalls`, `useMall`, `useMallStores` | `malls.*` |
| Stores | `useStore`, `useStoreProducts` | `stores.*` |
| Categories / brands / deals | `useCategories`, `useBrands`, `useBrand`, `useDeals` | `categories` / `brands` / `deals` |
| Products | `useProducts`, `useProduct`, `useProductSearch`, `useFeaturedProducts` | `products.*` (exists) |
| Seller products | `useSellerProducts`, `useCreateProduct`, `useUpdateProduct` | `seller.products()` |
| Addresses | `useAddresses` | `addresses` |
| Checkout | `useCheckout` (mutation), `useInitializePayment` | — |
| Buyer orders | `useMyOrders`, `useOrder`, `useOrderTracking` | `orders.*` (exists) |
| Seller orders | `useSellerOrders`, `useUpdateOrderStatus` | `seller.orders()` |
| Dashboard | `useDashboardStats` | `seller.dashboard()` |
| Customers | `useSellerCustomers` | `seller.customers` |
| Reviews | `useProductReviews`, `useCreateReview`, `useSellerReviews` | `reviews.*` |
| Payments / payouts | `useSellerPayments`, `useSellerPayouts` | `seller.payments` / `payouts` |
| Notifications | `useNotifications` | `notifications` |
| Returns | `useCreateReturn`, `useSellerReturns` | `returns` |
| Admin | `useAdminOverview`, `useAdminUsers`, `useAdminStores`, … | `admin.*` |

---

## Counts (approximate)

| Scope | Endpoints |
|-------|-----------|
| **MVP** | ~95 |
| Post-MVP | ~30 |
| **Already implemented** | 1 (`GET /health`) |

Build order follows [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md) phases 0–8. Do not implement §16 of this catalog until MVP is done.
)
