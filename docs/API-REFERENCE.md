# Fastlink Marketplace — Complete API Reference

**Document ID:** API-REF-1  
**Source of truth:** `backend/routes/api.php` + `backend/app/Http/Controllers/Api/*`  
**Last updated:** 14 August 2026  
**Endpoint count:** **191** routes under `/api`  
**Related:** [`API-CATALOG.md`](./API-CATALOG.md) (summary) · [`QA-TEST-PLAN.md`](./QA-TEST-PLAN.md) · [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md)

This document describes **every backend API endpoint currently implemented**, including auth, parameters, response shapes, and error behaviour.

---

## Contents

1. [Conventions](#1-conventions)
2. [Shared resource schemas](#2-shared-resource-schemas)
3. [Health & webhooks](#3-health--webhooks)
4. [Auth](#4-auth)
5. [Public catalog](#5-public-catalog)
6. [Public products & search](#6-public-products--search)
7. [Buyer — addresses](#7-buyer--addresses)
8. [Buyer — checkout & payments](#8-buyer--checkout--payments)
9. [Buyer — orders, returns, disputes](#9-buyer--orders-returns-disputes)
10. [Buyer — notifications](#10-buyer--notifications)
11. [Buyer — reviews, trust, messages, wishlist](#11-buyer--reviews-trust-messages-wishlist)
12. [Buyer — growth (promo, cart, referrals, loyalty)](#12-buyer--growth-promo-cart-referrals-loyalty)
13. [Rider](#13-rider)
14. [Seller — onboard & core](#14-seller--onboard--core)
15. [Seller — inventory permission](#15-seller--inventory-permission)
16. [Seller — orders permission](#16-seller--orders-permission)
17. [Seller — finance permission](#17-seller--finance-permission)
18. [Seller — support permission](#18-seller--support-permission)
19. [Seller — manage permission](#19-seller--manage-permission)
20. [Admin](#20-admin)
21. [Full endpoint index](#21-full-endpoint-index)

---

## 1. Conventions

### 1.1 Base URL

| Environment | Base |
|-------------|------|
| Local API | `http://localhost:8000/api` |
| Frontend env | `NEXT_PUBLIC_API_URL` (default `/api` via Next rewrite) |

All paths in this document are relative to that base (shown as `/auth/login`, not `/api/auth/login`). When calling the Laravel server directly, prefix with `/api`.

### 1.2 Authentication

| Mode | How |
|------|-----|
| **Public** | No token |
| **Sanctum** | Header `Authorization: Bearer {token}` from login/register |
| **Role** | Middleware `role:buyer\|seller\|admin\|rider` (comma = OR) |
| **Seller permission** | Middleware `seller.perm:{inventory\|orders\|finance\|support\|manage}` on top of `role:seller,admin` |

Owners and admins receive all seller permissions. Staff members receive one of: `inventory`, `orders`, `finance`, `support`.

### 1.3 Response envelope

Every JSON response (except raw webhook ack / health-style payloads that still follow the same keys) uses:

**Success**

```json
{
  "success": true,
  "message": "Optional human message",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": { "field": ["Validation message"] }
}
```

| HTTP | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `401` | Unauthenticated |
| `403` | Forbidden (role / permission / ownership) |
| `404` | Not found |
| `422` | Validation failed |

### 1.4 Pagination

Most list endpoints return:

```json
{
  "success": true,
  "data": {
    "data": [ /* items */ ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Query params: `page` (default 1), `limit` (endpoint-specific default).  
Some admin queues use a flatter `{ data, total, page, limit, …Count }` inside `data`.

### 1.5 Content types

| Type | When |
|------|------|
| `application/json` | Default |
| `multipart/form-data` | Product images, KYC documents, rider documents |

### 1.6 IDs and identifiers

- Resource IDs are returned as **strings** even when stored as integers.
- Public product/mall/store/brand URLs may use **slugs**.
- Order routes accept numeric `id`, `reference`, or (track only) `tracking_number`; leading `#` is stripped.

### 1.7 Roles

| Role | Notes |
|------|-------|
| `buyer` | Default register role |
| `seller` | Store owner or invited staff |
| `admin` | Seeded only; cannot self-register |
| `rider` | After `/rider/register` |

---

## 2. Shared resource schemas

### 2.1 User (`UserResource`)

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | |
| `name` | string | |
| `email` | string | |
| `avatar` | string\|null | `avatar_path` |
| `role` | string | `buyer` \| `seller` \| `admin` \| `rider` |
| `status` | string | `active` \| `pending` \| `suspended` |
| `phone` | string\|null | |
| `loyaltyPoints` | number | |
| `sellerAccess` | object\|null | Only for `seller` / `admin` |
| `createdAt` | ISO-8601 | |

**`sellerAccess`**

```json
{
  "isOwner": true,
  "staffRole": "owner",
  "permissions": ["inventory", "orders", "finance", "support", "manage"]
}
```

Staff example: `{ "isOwner": false, "staffRole": "inventory", "permissions": ["inventory"] }`.

### 2.2 Product (`ProductResource`)

| Field | Type |
|-------|------|
| `id`, `slug`, `name`, `description`, `longDescription` | string |
| `price`, `compareAtPrice`, `discountPercentage` | number |
| `sku`, `stock`, `category`, `subcategory`, `brand` | mixed |
| `images[]` | `{ id, url, alt, isPrimary }` |
| `variants` | grouped by name |
| `store` | `{ id, name, slug }` |
| `storeId` | string |
| `seller` | `{ id, name, avatar?, rating, totalSales }` |
| `tags`, `isFeatured`, `isNew`, `isBestseller` | |
| `rating`, `reviewCount`, `status` | |
| `costPrice` | seller/admin only |
| `createdAt`, `updatedAt` | ISO-8601 |

Public statuses: typically `active` / `published`. Moderation: `draft`, `submitted`, `under_review`, `rejected`, `archived`.

### 2.3 Order (`OrderResource`)

| Field | Type |
|-------|------|
| `id`, `reference`, `groupId` | string |
| `status` | `pending` \| `confirmed` \| `shipped` \| `delivered` \| `cancelled` |
| `displayStatus` | UI label |
| `paymentStatus`, `paymentMethod`, `deliveryMethod`, `trackingNumber` | |
| `subtotal`, `shipping`, `tax`, `discount`, `total` | number |
| `promoCode`, `loyaltyPoints`, `loyaltyDiscount` | |
| `buyer` | `{ id, name, email, phone }` |
| `store`, `rider` | when loaded |
| `shippingAddress` | street/city/state/postalCode/country/phone |
| `items[]` | `{ id, productId, productName, productImage, sku, quantity, price, variants }` |
| `events[]` | timeline |
| `createdAt`, `updatedAt`, `paidAt`, `estimatedDelivery` | |

**Allowed transitions**

| From | To |
|------|-----|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `shipped`, `cancelled` |
| `shipped` | `delivered` |
| `delivered` / `cancelled` | (none) |

### 2.4 Promo code (serialized)

| Field | Type |
|-------|------|
| `id`, `code`, `type` | `percent` \| `fixed` |
| `value`, `minSubtotal`, `maxDiscount` | number |
| `usageLimit`, `usedCount`, `perUserLimit` | number |
| `isActive`, `storeId`, `startsAt`, `endsAt` | |

**Create/update body rules** (`PromotionService::rules`)

| Field | Rules |
|-------|--------|
| `code` | required (create), string, max 40 |
| `type` | `percent` \| `fixed` |
| `value` | numeric, min 0 |
| `min_subtotal` | optional numeric |
| `max_discount` | nullable numeric |
| `usage_limit` | nullable integer ≥ 1 |
| `per_user_limit` | optional integer ≥ 1 |
| `is_active` | boolean |
| `starts_at`, `ends_at` | dates; `ends_at` ≥ `starts_at` |
| `store_id` | admin only; nullable (null = platform code) |

Seeded platform code: **`FASTLINK10`** (10% off, max ₦5,000, 5 uses per user).

---

## 3. Health & webhooks

### `GET /health`

| | |
|--|--|
| **Auth** | Public |
| **Purpose** | API liveness |
| **Response `data`** | `status`, `service`, `environment`, `database`, `queue`, `webhookFailures24h`, `timestamp` |

---

### `POST /webhooks/paystack`

| | |
|--|--|
| **Auth** | Public + HMAC signature |
| **Header** | `X-Paystack-Signature` = HMAC-SHA512 of raw body with `PAYSTACK_SECRET_KEY` |
| **Purpose** | Process `charge.success`; mark orders paid; log event |
| **Success** | `{ received: true, duplicate?: true }` |
| **Errors** | `401` invalid signature (logged as `invalid_signature`) |

CSRF is exempt for this route.

---

## 4. Auth

### `POST /auth/register`

| | |
|--|--|
| **Auth** | Public |
| **Body** | |

| Field | Rules |
|-------|--------|
| `name` | required, string, max 255 |
| `email` | required, email, unique |
| `password` | required, confirmed, min 8 |
| `password_confirmation` | required with password |
| `role` | optional: `buyer` \| `seller` (never `admin` or `rider`) |
| `referral_code` | optional, max 32 |

| **Success** | `201` — `{ token, user }` |
| **Errors** | `422` duplicate / invalid role |

---

### `POST /auth/login`

| Field | Rules |
|-------|--------|
| `email` | required, email |
| `password` | required |

| **Success** | `200` — `{ token, user }` (previous tokens revoked) |
| **Errors** | `401` bad credentials; `403` suspended |

---

### `POST /auth/forgot-password`

| Field | Rules |
|-------|--------|
| `email` | required, email |

Always returns success message (does not reveal whether email exists). Mail uses configured mailer (`log` locally).

---

### `POST /auth/reset-password`

| Field | Rules |
|-------|--------|
| `email`, `token` | required |
| `password` | required, confirmed, min 8 |

Revokes all tokens on success.

---

### `POST /auth/logout`

| **Auth** | Sanctum |
| **Success** | Revokes current token |

---

### `GET /auth/me`

| **Auth** | Sanctum |
| **Success** | `UserResource` including `sellerAccess`, `storeStatus`, `kycStatus`, `kycRejectionReason`, `canSell` when the user has a store |

---

### `PATCH /auth/profile`

| Field | Rules |
|-------|--------|
| `name` | sometimes, string |
| `phone` | sometimes, nullable, max 40 |
| `avatar` | sometimes, nullable, URL/path max 2048 |

---

## 5. Public catalog

### `GET /malls`

| Query | Notes |
|-------|--------|
| `q`, `city` | filters |
| `page`, `limit` | default limit ~16 |

Paginated mall list.

### `GET /malls/{slug}`

Mall detail. **404** if missing.

### `GET /malls/{slug}/stores`

| Query | Notes |
|-------|--------|
| `category` | slug/name; `all` = no filter |

Returns **approved** stores in the mall.

### `GET /categories`

Root categories with product counts.

### `GET /brands`

Official brand partners.

### `GET /brands/{slug}`

Brand profile. **404** if missing.

### `GET /brands/{slug}/categories`

Categories that have products for this brand.

### `GET /deals`

Up to 16 deal cards: `id`, `name`, `category`, `discount`, `image`, `href`, `rating`, `reviews`.

### `GET /vendors/emerging`

Approved stores with `type=emerging`: `id`, `name`, `category`, `image`, `href`.

### `GET /stores/nationwide`

Approved nationwide stores: `id`, `name`, `tagline`, `href`.

### `GET /stores/{slug}`

Approved store profile + reputation. May record page view when authenticated. **404** if not approved.

### `GET /stores/{slug}/products`

Store-scoped product list. Same filters as `/products` (`q`, `category`, `brand`, `min_price`/`max_price`, `featured`, `sort`, `page`, `limit` default 24).

---

## 6. Public products & search

### `GET /products`

| Query | Notes |
|-------|--------|
| `q` | search |
| `category`, `store`, `brand` | filters |
| `min_price` / `minPrice`, `max_price` | prices |
| `featured` | boolean-ish |
| `sort` | price/newest/etc. |
| `page`, `limit` | default limit 12 |

Paginated `ProductResource[]` (public statuses only).

### `GET /products/{idOrSlug}`

Product detail. May include `storeReputation` (metrics now include `responseRate`). Product objects also expose moderation fields (`submittedAt`, `moderatedAt`, `moderatedBy`, `moderationNote`) for dashboard/admin workflows. **404** if draft/archived/private.

### `GET /products/{idOrSlug}/reviews`

Approved reviews for the product.

### `GET /search`

Same as product list with required `q` or `query` (also matches store/brand names). If strict `LIKE` search returns no products, backend applies typo-tolerant fallback and sets `typoToleranceApplied: true`.

### `GET /search/suggest`

| Query | Notes |
|-------|--------|
| `q` or `query` | if length &lt; 2 → empty lists |

**Response**

```json
{
  "products": [{ "id", "name", "slug", "image" }],
  "brands": [{ "name", "slug" }],
  "stores": [{ "name", "slug" }],
  "didYouMean": "..."
}
```

Prefix/`LIKE` matching (not Meilisearch).

### `GET /recommendations`

| Auth | Optional Sanctum (personalized if logged in) |
| Query | `limit` clamped 4–16 (default 8) |

Returns `forYou` / `recentlyViewed` style feeds from views, wishlist, purchases.

### `GET /orders/{order}/track`

| Auth | Public |
| Query | `email` — must match buyer email unless caller is buyer/admin/store owner |

Returns `OrderResource`. **404** if not allowed.

---

## 7. Buyer — addresses

**Auth:** Sanctum (any role; addresses belong to the user).

### `GET /addresses`

List user's addresses.

### `POST /addresses`

| Field | Rules |
|-------|--------|
| `label` | nullable |
| `street`, `city`, `state` | required |
| `postal_code`, `country`, `phone` | nullable |
| `is_default` | boolean |

`201` AddressResource. Setting default clears other defaults.

### `PATCH /addresses/{address}`

Partial update. **403** if not owner.

### `DELETE /addresses/{address}`

**403** if not owner.

### `PATCH /addresses/{address}/default`

Makes this address the default.

---

## 8. Buyer — checkout & payments

**Auth:** Sanctum. Blocked when platform `maintenanceMode` is on (`422`).

### `POST /checkout/quote`

Preview pricing **without** placing an order.

| Field | Rules |
|-------|--------|
| `address_id` | required, exists |
| `items` | required array min 1 |
| `items.*.product_id` | required |
| `items.*.quantity` | integer ≥ 1 |
| `items.*.variants` | optional |
| `coupon_code` | optional |
| `redeem_points` | optional integer ≥ 0 |

**Response `data`**

| Field | Meaning |
|-------|---------|
| `groupPreview` / `orderCount` / `stores` | multi-store split |
| `subtotal`, `shipping`, `tax`, `discount` | money |
| `promoCode`, `loyaltyPoints`, `loyaltyDiscount` | discounts |
| `availablePoints`, `total` | |
| `deliveryZone` | resolved zone |
| `deliveryEstimate` | ETA window `{ minDays, maxDays, label }` |

Address must belong to the user. Shipping comes from **delivery zones** (city overrides state). Promo applies before tax/free-shipping thresholds. Loyalty: 1 pt = ₦1, max 50% of cart after promo.

### `POST /checkout`

Place order(s). Same body as quote + optional `delivery_method`, `payment_method`.

| **Success** | `201` — `{ groupId, orders: OrderResource[] }` |
| **Side effects** | Stock decremented; inventory movement `sale`; cart coupons / points applied |

Server **re-prices** from DB (client prices ignored). Multi-store carts create multiple orders sharing `groupId`.

### `POST /checkout/initialize`

| Field | Rules |
|-------|--------|
| `group_id` | required |

**Response:** `{ alreadyPaid, groupId, reference, authorizationUrl, accessCode, mode }`  
`mode` is Paystack or demo when secret key empty. Redirect buyer to `authorizationUrl`.

### `POST /checkout/verify`

| Field | Rules |
|-------|--------|
| `reference` | required |

Confirms Paystack (or demo) payment; marks orders paid; earns loyalty; writes ledger.

### `POST /checkout/confirm`

| Field | Rules |
|-------|--------|
| `group_id` | required |

**Demo-only convenience** path to mark the group paid without Paystack.

---

## 9. Buyer — orders, returns, disputes

### `GET /orders`

Buyer's orders. Query: `status`, `page`, `limit`.

### `GET /orders/{order}`

Own order detail. **404** if not buyer’s.

### `GET /orders/{order}/invoice`

`{ reference, html }` — HTML receipt for download.

### `GET /orders/{order}/returns`

Existing return or `null`.

### `POST /orders/{order}/returns`

| Field | Rules |
|-------|--------|
| `reason` | required, max 2000 |

`201` ReturnResource. Eligibility enforced in service.

### `GET /disputes`

Buyer's disputes (paginated).

### `POST /orders/{order}/disputes`

| Field | Rules |
|-------|--------|
| `reason` | required |
| `type` | `refund` \| `replacement` \| `other` |
| `buyer_evidence` | optional |

Requires **paid** order; one dispute per order; blocked if an open return exists.

### `GET /disputes/{dispute}`

Own dispute. **403** otherwise.

### `GET /orders/{order}/disputes`

Dispute for that order or `null`.

---

## 10. Buyer — notifications

### `GET /notifications`

| Query | Notes |
|-------|--------|
| `unread` | filter unread |
| `page`, `limit` | |

`{ items, unreadCount, total, page, limit }`.

### `PATCH /notifications/{notification}/read`

Mark one read. **403** if not owner.

### `POST /notifications/read-all`

Mark all read.

### `GET /notification-preferences`

`{ notifications: { sale, order, stock: { email, push } } }`.

### `PATCH /notification-preferences`

| Field | Rules |
|-------|--------|
| `notifications` | required object with channel toggles |

Transactional emails use branded Blade templates (`PlatformMail`). Channels: `order` (buyer orders, returns, disputes, riders, messages), `sale` (seller sales, store, products, payouts), `stock` (inventory). Welcome / KYC / password / suspend / staff-invite always email (`forceEmail`). Configure `MAIL_*` and `FRONTEND_URL` for links.

---

## 11. Buyer — reviews, trust, messages, wishlist

### `POST /reviews`

| Field | Rules |
|-------|--------|
| `product_id` | required |
| `order_item_id` | optional |
| `rating` | 1–5 |
| `body` | optional, max 2000 |

Must have purchased; one review per product. Recalculates product rating.

### `POST /trust-reports`

| Field | Rules |
|-------|--------|
| `subject_type` | `product` \| `store` |
| `subject_id` | required |
| `reason` | max 120 |
| `details` | optional |

`201` for admin `/admin/trust-reports` queue. Duplicate open/investigating reports by the same user for the same subject are rejected with `422`.

### Conversations

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/conversations` | Buyer threads **or** seller threads (needs support permission). Query: `status`, `q` |
| `POST` | `/conversations` | Body: `store_id`, `body` required; optional `order_id`, `product_id` |
| `GET` | `/conversations/{id}` | Detail + messages |
| `POST` | `/conversations/{id}/messages` | Body: `body` |
| `PATCH` | `/conversations/{id}/read` | Mark read |
| `PATCH` | `/conversations/{id}` | Seller-only status update |
| `DELETE` | `/conversations/{id}` | Seller-only |

### Wishlist

| Method | Path | Body |
|--------|------|------|
| `GET` | `/wishlist` | — → ProductResource[] |
| `POST` | `/wishlist` | `product_id` → full wishlist |
| `DELETE` | `/wishlist/{productId}` | → full wishlist |

---

## 12. Buyer — growth (promo, cart, referrals, loyalty)

### `POST /promo/preview`

| Field | Rules |
|-------|--------|
| `coupon_code` | required |
| `items[]` | product_id + quantity |

`{ code, discount, allocations: [{ storeId, discount }] }`.

### `POST /cart/sync`

Persists cart snapshot for abandoned-cart reminders (does not replace client cart).

| Field | Rules |
|-------|--------|
| `items` | array of `{ product_id, quantity }` |
| `coupon_code` | optional |

`{ itemCount, couponCode }`.

Scheduled: `php artisan cart:remind-stale --hours=2`.

### `GET /referrals/me`

`{ code, signups }`.

### `GET /loyalty/me`

`{ points, nairaValue, earnPerNaira, pointValue }`.  
Earn: **1 point per ₦100 paid**. Redeem: **1 point = ₦1**.

---

## 13. Rider

### `POST /rider/register`

**Auth:** Sanctum (any user without a rider profile).

| Field | Rules |
|-------|--------|
| `phone` | required |
| `vehicle_type`, `city` | optional |

`201` — `{ rider, user: { id, role } }`. Sets role to `rider`. Status usually `pending` outside testing.

Note: public register does not accept `role=rider`; rider onboarding is a second step after account creation.

### Rider-only (`role:rider`)

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/rider/me` | RiderResource |
| `GET` | `/rider/orders` | Assigned orders |
| `GET` | `/rider/documents` | KYC list |
| `POST` | `/rider/documents` | `type`: `id_card` \| `license` \| `vehicle_registration` \| `other`; file pdf/jpg/png max 8MB |

---

## 14. Seller — onboard & core

### `POST /seller/onboard`

**Auth:** Sanctum (buyer becoming seller). No `role:seller` required yet.

| Field | Rules |
|-------|--------|
| `business_name`, `phone` | required |
| `bank_name`, `bank_account_number`, `bank_account_name` | optional (required when `submit_kyc=true`) |
| `submit_kyc` | optional boolean — defaults to true when bank details are present |
| `type` | `mall_store` \| `independent` \| `nationwide` \| `emerging` |
| `mall_id` | required when `mall_store` |
| `category_id`, `location`, `description` | optional |

Creates store immediately. KYC can be skipped (`submit_kyc=false` → `kyc_status: not_started`) so the seller can use a **limited dashboard** before verification. Outside `testing`, submitted KYC sets `status: pending` + `kyc_status: under_review` and notifies admins.

`201` — `{ store: { id, name, slug, status, kycStatus, type, canSell }, user: { id, role } }`.

### `POST /seller/kyc/submit`

**Auth:** Sanctum (seller with an existing store).

| Field | Rules |
|-------|--------|
| `bank_name`, `bank_account_number`, `bank_account_name` | optional if already on store; all three required to submit |
| `phone` | optional |

Marks KYC submitted (`under_review`, or auto-approved in `testing`). Used when the vendor skipped KYC at onboard.

### `GET /seller/dashboard`

**Auth:** `role:seller,admin`  
**Query:** `range` = `7d` \| `30d` \| `1y`

Revenue, orders, customers, products, revenue `chart`, order-count `orderChart`, recent orders, top products (paid orders).

Also includes:

- `pendingOrders`, `averageOrderValue`
- `activitySummary` (`pageViews7d`, `checkoutStarts7d`, `reviews7d`)
- `recentActivity` feed (typed events from activity pipeline)

### `GET /seller/store`

Current store profile (owner store or first staffed store).

---

## 15. Seller — inventory permission

**Middleware:** `role:seller,admin` + `seller.perm:inventory`

### Products

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/seller/products` | Query: `q`, `status`, page |
| `POST` | `/seller/products` | **Drafts** allowed before KYC; `active`/`submitted` require `canSell` or `403` + `KYC_REQUIRED` |
| `GET` | `/seller/products/{product}` | Detail |
| `PUT` / `PATCH` | `/seller/products/{product}` | Update (publishing gated by KYC) |
| `DELETE` | `/seller/products/{product}` | Soft-archive |
| `POST` | `/seller/products/{product}/images` | Multipart `images[]` |
| `PATCH` | `/seller/products/{product}/stock` | See below |
| `POST` | `/seller/products/{product}/submit` | Submit for moderation |

**Create/update fields (selected)**

| Field | Rules |
|-------|--------|
| `name` | required on create |
| `price` | required on create, numeric |
| `sku`, `description`, `long_description` | optional |
| `compare_at_price`, `cost_price`, `stock` | optional |
| `status` | `draft` \| `submitted` \| `active` \| `archived` |
| `category` / `category_id`, `brand` / `brand_id` | |
| `tags[]`, `image_urls[]`, `variants[]` | |
| `store_id` | admin only |

**Stock patch**

| Field | Rules |
|-------|--------|
| `stock` | absolute set |
| `quantity_delta` | relative change |
| `type` | `adjustment` \| `restock` \| `damaged` \| `write_off` |
| `note` | optional |

One of `stock` or `quantity_delta` required. Writes inventory movement; may notify low stock (≤ 5).

### `GET /seller/inventory/movements`

Query: `product_id`, `page`, `limit`. Audit trail of stock changes.

### `GET /seller/inventory/summary`

Returns inventory health:

- `totalProducts`
- `outOfStockCount`
- `lowStockCount` (stock 1..5)
- `movementCount7d`
- `lastMovementAt`
- `lowStockProducts[]` (`id`, `name`, `sku`, `stock`)

---

## 16. Seller — orders permission

**Middleware:** `seller.perm:orders`

| Method | Path | Body / query | Notes |
|--------|------|--------------|--------|
| `GET` | `/seller/orders` | `status`, `q` | Store-scoped |
| `GET` | `/seller/orders/{order}` | — | |
| `PATCH` | `/seller/orders/{order}/status` | `{ "status": "confirmed" }` | Enforces transitions; cancel restores stock |
| `GET` | `/seller/returns` | `status` | |
| `PATCH` | `/seller/returns/{return}` | `{ "action": "approve\|reject", "note"? }` | |
| `GET` | `/seller/disputes` | `status` | |
| `POST` | `/seller/disputes/{dispute}/respond` | `{ "response": "..." }` max 5000 | |
| `GET` | `/seller/customers` | `q` | Aggregated from orders |
| `GET` | `/seller/customers/{customer}` | — | Detail + orders |

---

## 17. Seller — finance permission

**Middleware:** `seller.perm:finance`

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/seller/payments` | List + `summary` + chart |
| `GET` | `/seller/payouts` | List + available/pending/transferred |
| `POST` | `/seller/payouts` | Body `{ "amount": number }` — requires `canSell` (`KYC_REQUIRED` otherwise); stays **pending** until admin |
| `GET` | `/seller/analytics` | Query `range`: `today` \| `7days` \| `30days` \| `1year` |

Finance staff **cannot** change payout bank accounts (that is `manage`).

---

## 18. Seller — support permission

**Middleware:** `seller.perm:support`

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/seller/reviews` | `status`, `q` |
| `POST` | `/seller/reviews/{review}/reply` | `{ "body" }` |
| `PATCH` | `/seller/reviews/{review}` | `{ "status" }` approve/flag/hide |
| `GET` | `/seller/support/tickets` | Own tickets |
| `POST` | `/seller/support/tickets` | `subject`, `body`; optional `category`, `priority` |
| `GET` | `/seller/support/tickets/{ticket}` | |
| `POST` | `/seller/support/tickets/{ticket}/messages` | `{ "body" }` |

Also gates store-side **conversations** listing/replying.

---

## 19. Seller — manage permission

**Middleware:** `seller.perm:manage` (owners / admins)

| Method | Path | Notes |
|--------|------|--------|
| `PATCH` | `/seller/store` | name, description, logo, banner, location, headline, delivery_tag, phone |
| `GET` / `PATCH` | `/seller/settings` | bank fields + notification prefs |
| `GET` / `POST` | `/seller/documents` | KYC: type `cac` \| `id_card` \| `bank_statement` \| `other` + file |
| `GET` / `POST` / `PATCH` | `/seller/promo-codes` | Store-scoped coupons |
| `GET` | `/seller/growth` | Restock / promote insights |
| `GET` / `POST` / `PATCH` | `/seller/marketing/campaigns` | Internal campaigns |
| `GET` / `POST` | `/seller/payout-accounts` | Bank account for payouts |
| `GET` / `POST` / `PATCH` / `DELETE` | `/seller/staff` | Team management |

### Staff invite — `POST /seller/staff`

| Field | Rules |
|-------|--------|
| `email` | required — user must already exist |
| `role` | `inventory` \| `orders` \| `finance` \| `support` |

Upgrades buyer → seller. Rejects admin/rider/owner/duplicates. Notifies invitee.

### Staff update — `PATCH /seller/staff/{staff}`

`role` and/or `status` (`active` \| `revoked`).

### Staff remove — `DELETE /seller/staff/{staff}`

Deletes membership; demotes to `buyer` if they own no store and have no other staff roles.

---

## 20. Admin

**Auth:** Sanctum + `role:admin`  
**Prefix:** `/admin`

### 20.1 Overview & verification

| Method | Path | Response highlights |
|--------|------|---------------------|
| `GET` | `/admin/dashboard` | gmv, take, users, pendingStores/Riders, pendingPayouts, products |
| `GET` | `/admin/verification` | pending stores (+ docs/bank) and pending riders (+ uploaded rider docs + `hasRequiredIdCard`) |

### 20.2 Users

| Method | Path | Body / query |
|--------|------|--------------|
| `GET` | `/admin/users` | `role`, `status`, `q` |
| `GET` | `/admin/users/{user}` | |
| `PATCH` | `/admin/users/{user}` | `status`: active\|pending\|suspended; `role`: buyer\|seller\|admin — suspend clears tokens |

### 20.3 Stores

| Method | Path | Body |
|--------|------|------|
| `GET` | `/admin/stores` | `status`, `q` |
| `GET` | `/admin/stores/{store}` | owner + bank |
| `POST` | `/admin/stores/{store}/approve` | optional `mall_id` |
| `POST` | `/admin/stores/{store}/reject` | optional `reason` |
| `POST` | `/admin/stores/{store}/suspend` | |

Approving notifies the seller; enables product publish.

### 20.4 Products & moderation

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/admin/products` | all statuses |
| `GET` | `/admin/products/moderation` | submitted / under_review + `pendingCount` |
| `GET` | `/admin/products/{product}` | |
| `PATCH` | `/admin/products/{product}/unpublish` | archives |
| `POST` | `/admin/products/{product}/approve` | → published/active; optional `note` persisted as `moderationNote` |
| `POST` | `/admin/products/{product}/reject` | optional `note` |

### 20.5 Orders & riders

| Method | Path | Body |
|--------|------|------|
| `GET` | `/admin/orders` | `status`, `q` |
| `GET` | `/admin/orders/{order}` | |
| `PATCH` | `/admin/orders/{order}/status` | `status` enum |
| `PATCH` | `/admin/orders/{order}/assign-rider` | `rider_id` (must be approved) |
| `GET` | `/admin/riders` | `status` |
| `POST` | `/admin/riders/{rider}/approve` | requires at least one uploaded rider document with `type=id_card` |
| `POST` | `/admin/riders/{rider}/reject` | optional `reason` |

### 20.6 Finance, ledger, settings

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/admin/payments` | fees/net |
| `GET` | `/admin/payouts` | |
| `POST` | `/admin/payouts/{payout}/approve` | ledger write |
| `POST` | `/admin/payouts/{payout}/reject` | optional `reason` |
| `GET` / `PATCH` | `/admin/settings/commission` | `{ rate }` 0–50 |
| `GET` / `PATCH` | `/admin/settings` | commissionRate, returnWindowDays, minOrderAmount, defaultShippingFee, maintenanceMode |
| `GET` | `/admin/ledger` | Query `type`, `store_id` — immutable money log |

### 20.7 Trust, disputes, chargebacks, webhooks

| Method | Path | Body |
|--------|------|------|
| `GET` | `/admin/trust-reports` | `status`, `subject_type` (`product|store`), `reason` (contains) |
| `PATCH` | `/admin/trust-reports/{id}` | `status` open\|investigating\|resolved\|dismissed; `admin_note` |
| `GET` | `/admin/disputes` | `status` |
| `PATCH` | `/admin/disputes/{id}` | `action` review\|resolve; if resolve: `resolution` refund\|replacement\|rejected; `refund_amount`; `admin_note` |
| `GET` | `/admin/chargebacks` | |
| `POST` | `/admin/chargebacks` | `payment_id`, `amount`, `reason`, `provider_reference` |
| `PATCH` | `/admin/chargebacks/{id}` | `status` won\|lost; `admin_note` |
| `GET` | `/admin/webhooks/paystack` | logged webhook events (`matchedPayments`, `paidPayments`) |
| `GET` | `/admin/webhooks/paystack/reconciliation` | 24h reconciliation summary (`events`, failures, orphan refs, pending/paid payments) |

### 20.8 Delivery zones & promos

| Method | Path | Body |
|--------|------|------|
| `GET` | `/admin/delivery-zones` | seeded Lagos, Abuja FCT, Kano, national + ETA windows |
| `POST` | `/admin/delivery-zones` | `name`, `fee` required; `state`, `city`, `free_above`, `eta_min_days`, `eta_max_days`, `is_active`, `sort_order` |
| `PATCH` | `/admin/delivery-zones/{zone}` | partial |
| `GET` / `POST` / `PATCH` | `/admin/promo-codes` | platform (or store-scoped) codes |

### 20.9 Catalog CMS

| Resource | List | Create | Update | Delete | Extra |
|----------|------|--------|--------|--------|-------|
| Malls | `GET /admin/malls` | `POST` name (+ image, location, city, slug) | `PATCH /admin/malls/{mall}` | `DELETE` | `GET /admin/malls/{mall}` → mall + gmv + stores |
| Categories | `GET /admin/categories` | `POST` name (+ parent_id, image, slug) | `PATCH` | `DELETE` | |
| Brands | `GET /admin/brands` | `POST` name (+ product_brand, logo_style, slug) | `PATCH` | `DELETE` | |

### 20.10 Support, returns, analytics, audit

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/admin/support/tickets` | all tickets |
| `GET` | `/admin/support/tickets/{ticket}` | |
| `POST` | `/admin/support/tickets/{ticket}/messages` | reply |
| `PATCH` | `/admin/support/tickets/{ticket}` | `status`, `assigned_to` |
| `GET` | `/admin/returns` | |
| `PATCH` | `/admin/returns/{return}` | `action` approve\|reject; `refund_amount` for partial |
| `GET` | `/admin/analytics` | platform GMV / take / growth |
| `GET` | `/admin/audit-logs` | `action`, `q` |

---

## 21. Full endpoint index

Alphabetical by path (191 routes). Auth key: **P** public · **S** sanctum · **R** rider · **Sel** seller(+perm) · **A** admin.

| Method | Path | Auth |
|--------|------|------|
| GET | `/addresses` | S |
| POST | `/addresses` | S |
| PATCH | `/addresses/{address}` | S |
| DELETE | `/addresses/{address}` | S |
| PATCH | `/addresses/{address}/default` | S |
| GET | `/admin/analytics` | A |
| GET | `/admin/audit-logs` | A |
| GET/POST | `/admin/brands` | A |
| PATCH/DELETE | `/admin/brands/{brand}` | A |
| GET/POST | `/admin/categories` | A |
| PATCH/DELETE | `/admin/categories/{category}` | A |
| GET/POST | `/admin/chargebacks` | A |
| PATCH | `/admin/chargebacks/{chargeback}` | A |
| GET | `/admin/dashboard` | A |
| GET/POST | `/admin/delivery-zones` | A |
| PATCH | `/admin/delivery-zones/{zone}` | A |
| GET | `/admin/disputes` | A |
| PATCH | `/admin/disputes/{dispute}` | A |
| GET | `/admin/ledger` | A |
| GET/POST | `/admin/malls` | A |
| GET/PATCH/DELETE | `/admin/malls/{mall}` | A |
| GET | `/admin/orders` | A |
| GET | `/admin/orders/{order}` | A |
| PATCH | `/admin/orders/{order}/assign-rider` | A |
| PATCH | `/admin/orders/{order}/status` | A |
| GET | `/admin/payments` | A |
| GET | `/admin/payouts` | A |
| POST | `/admin/payouts/{payout}/approve` | A |
| POST | `/admin/payouts/{payout}/reject` | A |
| GET | `/admin/products` | A |
| GET | `/admin/products/moderation` | A |
| GET | `/admin/products/{product}` | A |
| POST | `/admin/products/{product}/approve` | A |
| POST | `/admin/products/{product}/reject` | A |
| PATCH | `/admin/products/{product}/unpublish` | A |
| GET/POST | `/admin/promo-codes` | A |
| PATCH | `/admin/promo-codes/{promoCode}` | A |
| GET | `/admin/returns` | A |
| PATCH | `/admin/returns/{return}` | A |
| GET | `/admin/riders` | A |
| POST | `/admin/riders/{rider}/approve` | A |
| POST | `/admin/riders/{rider}/reject` | A |
| GET/PATCH | `/admin/settings` | A |
| GET/PATCH | `/admin/settings/commission` | A |
| GET | `/admin/stores` | A |
| GET | `/admin/stores/{store}` | A |
| POST | `/admin/stores/{store}/approve` | A |
| POST | `/admin/stores/{store}/reject` | A |
| POST | `/admin/stores/{store}/suspend` | A |
| GET | `/admin/support/tickets` | A |
| GET/PATCH | `/admin/support/tickets/{ticket}` | A |
| POST | `/admin/support/tickets/{ticket}/messages` | A |
| GET | `/admin/trust-reports` | A |
| PATCH | `/admin/trust-reports/{trustReport}` | A |
| GET | `/admin/users` | A |
| GET/PATCH | `/admin/users/{user}` | A |
| GET | `/admin/verification` | A |
| GET | `/admin/webhooks/paystack` | A |
| POST | `/auth/forgot-password` | P |
| POST | `/auth/login` | P |
| POST | `/auth/logout` | S |
| GET | `/auth/me` | S |
| PATCH | `/auth/profile` | S |
| POST | `/auth/register` | P |
| POST | `/auth/reset-password` | P |
| GET | `/brands` | P |
| GET | `/brands/{slug}` | P |
| GET | `/brands/{slug}/categories` | P |
| POST | `/cart/sync` | S |
| GET | `/categories` | P |
| POST | `/checkout` | S |
| POST | `/checkout/confirm` | S |
| POST | `/checkout/initialize` | S |
| POST | `/checkout/quote` | S |
| POST | `/checkout/verify` | S |
| GET/POST | `/conversations` | S |
| GET/PATCH/DELETE | `/conversations/{conversation}` | S |
| POST | `/conversations/{conversation}/messages` | S |
| PATCH | `/conversations/{conversation}/read` | S |
| GET | `/deals` | P |
| GET | `/disputes` | S |
| GET | `/disputes/{dispute}` | S |
| GET | `/health` | P |
| GET | `/loyalty/me` | S |
| GET | `/malls` | P |
| GET | `/malls/{slug}` | P |
| GET | `/malls/{slug}/stores` | P |
| GET/PATCH | `/notification-preferences` | S |
| GET | `/notifications` | S |
| POST | `/notifications/read-all` | S |
| PATCH | `/notifications/{notification}/read` | S |
| GET | `/orders` | S |
| GET | `/orders/{order}` | S |
| GET/POST | `/orders/{order}/disputes` | S |
| GET | `/orders/{order}/invoice` | S |
| GET/POST | `/orders/{order}/returns` | S |
| GET | `/orders/{order}/track` | P |
| GET | `/products` | P |
| GET | `/products/{idOrSlug}` | P |
| GET | `/products/{idOrSlug}/reviews` | P |
| POST | `/promo/preview` | S |
| GET | `/recommendations` | P* |
| GET | `/referrals/me` | S |
| POST | `/reviews` | S |
| GET/POST | `/rider/documents` | R |
| GET | `/rider/me` | R |
| GET | `/rider/orders` | R |
| POST | `/rider/register` | S |
| GET | `/search` | P |
| GET | `/search/suggest` | P |
| GET | `/seller/analytics` | Sel:finance |
| GET | `/seller/customers` | Sel:orders |
| GET | `/seller/customers/{customer}` | Sel:orders |
| GET | `/seller/dashboard` | Sel |
| GET | `/seller/disputes` | Sel:orders |
| POST | `/seller/disputes/{dispute}/respond` | Sel:orders |
| GET/POST | `/seller/documents` | Sel:manage |
| GET | `/seller/growth` | Sel:manage |
| GET | `/seller/inventory/movements` | Sel:inventory |
| GET/POST | `/seller/marketing/campaigns` | Sel:manage |
| PATCH | `/seller/marketing/campaigns/{campaign}` | Sel:manage |
| POST | `/seller/onboard` | S |
| POST | `/seller/kyc/submit` | S |
| GET | `/seller/orders` | Sel:orders |
| GET | `/seller/orders/{order}` | Sel:orders |
| PATCH | `/seller/orders/{order}/status` | Sel:orders |
| GET | `/seller/payments` | Sel:finance |
| GET/POST | `/seller/payout-accounts` | Sel:manage |
| GET/POST | `/seller/payouts` | Sel:finance |
| GET/POST | `/seller/products` | Sel:inventory |
| GET/PUT/PATCH/DELETE | `/seller/products/{product}` | Sel:inventory |
| POST | `/seller/products/{product}/images` | Sel:inventory |
| PATCH | `/seller/products/{product}/stock` | Sel:inventory |
| POST | `/seller/products/{product}/submit` | Sel:inventory |
| GET/POST | `/seller/promo-codes` | Sel:manage |
| PATCH | `/seller/promo-codes/{promoCode}` | Sel:manage |
| GET | `/seller/returns` | Sel:orders |
| PATCH | `/seller/returns/{return}` | Sel:orders |
| GET | `/seller/reviews` | Sel:support |
| PATCH | `/seller/reviews/{review}` | Sel:support |
| POST | `/seller/reviews/{review}/reply` | Sel:support |
| GET/PATCH | `/seller/settings` | Sel:manage |
| GET/POST | `/seller/staff` | Sel:manage |
| PATCH/DELETE | `/seller/staff/{staff}` | Sel:manage |
| GET | `/seller/store` | Sel |
| PATCH | `/seller/store` | Sel:manage |
| GET/POST | `/seller/support/tickets` | Sel:support |
| GET | `/seller/support/tickets/{ticket}` | Sel:support |
| POST | `/seller/support/tickets/{ticket}/messages` | Sel:support |
| GET | `/stores/nationwide` | P |
| GET | `/stores/{slug}` | P |
| GET | `/stores/{slug}/products` | P |
| POST | `/trust-reports` | S |
| GET | `/vendors/emerging` | P |
| POST | `/webhooks/paystack` | P |
| GET/POST | `/wishlist` | S |
| DELETE | `/wishlist/{productId}` | S |

\* `/recommendations` is public; personalizes when a Sanctum token is present.

---

## Quick start examples

### Register + login

```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"buyer@fastlink.test","password":"password"}'
```

### Authenticated request

```bash
curl -s http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Checkout quote

```bash
curl -s -X POST http://localhost:8000/api/checkout/quote \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "address_id": 1,
    "coupon_code": "FASTLINK10",
    "items": [{ "product_id": 1, "quantity": 1 }]
  }'
```

---

## Seeded demo accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@fastlink.test` | `password` | admin |
| `seller@fastlink.test` | `password` | seller (approved store) |
| `buyer@fastlink.test` | `password` | buyer |

---

## Revision

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 14 Aug 2026 | Full reference for all 191 `/api` routes through CR-Tier 3 |
