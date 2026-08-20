# Fastlink Marketplace — QA Test Plan

**Document ID:** QA-1  
**Covers:** Everything shipped through 13 August 2026 (Phases 0–15 / CR-Tiers 0–3)  
**Does not cover:** CR-Tier 4 (event bus, feature flags, AI, fraud ML), Meilisearch, pre-payment stock reservations  
**Related:** [`CHANGE-REQUEST.md`](./CHANGE-REQUEST.md) · [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md) · [`API-CATALOG.md`](./API-CATALOG.md)

Use this as a **manual regression pack**. Tick a box only when the expected result is observed. File bugs with the **case ID** (e.g. `B-07`).

---

## 0. How to run this pack

### 0.1 Environments

| Layer | Typical local URL | Notes |
|-------|-------------------|--------|
| Next.js shop / seller / admin | `http://localhost:3000` | `NEXT_PUBLIC_API_URL` must point at the Laravel API |
| Laravel API | `http://localhost:8000/api` | Sanctum bearer tokens |
| Database | Supabase Postgres (app) / SQLite in-memory (PHPUnit) | Run pending migrations before UI tests |

Before UI testing:

```bash
cd backend && php artisan migrate --force
cd backend && php artisan test    # expect 92 passing
```

If catalog/demo users are missing, seed (safe `updateOrCreate` on demo emails):

```bash
cd backend && php artisan db:seed
```

### 0.2 Seeded accounts

Password for all seeded users: **`password`**

| Role | Email | Lands on |
|------|--------|----------|
| Admin | `admin@fastlink.test` | `/admin` |
| Seller (approved store) | `seller@fastlink.test` | `/dashboard` |
| Buyer | `buyer@fastlink.test` | `/` then `/account` |

You will also create throwaway accounts during the pack (pending vendor, staff, referral invitee). Do not reuse the seeded buyer for referral self-tests.

### 0.3 Payments

- If `PAYSTACK_SECRET_KEY` is **empty** on the API, checkout uses **demo mode** (`DEMO-…` references, `/checkout/callback`).
- If a Paystack **test** secret is set, checkout redirects to Paystack; complete with Paystack test cards, then confirm `/checkout/callback` and `/account/orders`.
- Record which mode you used in the sign-off table.

### 0.4 Known gaps (do not fail the pack)

| Gap | Expected today |
|-----|----------------|
| Meilisearch / typo search (CR-3.5 remainder) | Header suggest is prefix/`LIKE` only. `Samsnug` may not match Samsung. |
| Stock reservation (CR-2.1 remainder) | Stock decrements when the order is **placed**, not when payment is authorized. |
| Cart is client-side | Zustand cart; server `POST /cart/sync` is for abandoned-cart reminders only. |
| Messages are REST polling | No WebSockets / SMS / WhatsApp. |
| Staff invite | Invitee **must already have an account**. |

### 0.5 Pass criteria

A **section** passes when every case in it is Pass or N/A (with reason). The pack passes when all sections pass and automated tests are green.

---

## 1. Automated suite

| ID | Action | Expected |
|----|--------|----------|
| A-01 | `cd backend && php artisan test` | **92** tests, **390** assertions, exit 0 |
| A-02 | `GET /api/health` | `{ success: true }` / healthy status |
| A-02b | `GET /api/health` payload | Includes `database`, `queue`, `webhookFailures24h` |
| A-03 | Buyer token on `GET /api/seller/dashboard` | **403** |
| A-04 | Seller token on `GET /api/admin/dashboard` | **403** |
| A-05 | No token on `GET /api/auth/me` | **401** |

- [ ] A-01
- [ ] A-02
- [ ] A-03
- [ ] A-04
- [ ] A-05

---

## 2. Auth, session, and route guards

| ID | Steps | Expected |
|----|--------|----------|
| AU-01 | Open `/login`, sign in as buyer | Token stored; not sent to `/dashboard` or `/admin` |
| AU-02 | Sign in as seller | Redirect `/dashboard` |
| AU-03 | Sign in as admin | Redirect `/admin` |
| AU-04 | Sign in with wrong password | Error, stay on login |
| AU-05 | Register new buyer at `/register` | Account created; lands in shop |
| AU-06 | Register with role seller | Lands in seller onboarding / dashboard flow, not admin |
| AU-06b | Register with rider checkbox selected | Account created and redirected to `/rider/register` |
| AU-06c | Open `/register?role=rider&next=/rider/register` | Rider option preselected; signup continues into rider onboarding |
| AU-07 | Register as `admin` via API `role: admin` | **422** |
| AU-08 | Duplicate email register | **422** |
| AU-09 | Logged-out visit `/checkout`, `/account/orders`, `/dashboard` | Redirect to login |
| AU-10 | Buyer visits `/dashboard` | Redirected away (home) |
| AU-11 | Seller visits `/admin` | Redirected away |
| AU-12 | Logout from seller dashboard | Session cleared; `/login` |
| AU-13 | `/auth/me` after login | User payload includes `id`, `email`, `role`, `loyaltyPoints`; sellers also `sellerAccess` |
| AU-14 | Suspended user (admin suspends a buyer) then login | **403** / cannot sign in |

- [ ] AU-01
- [ ] AU-02
- [ ] AU-03
- [ ] AU-04
- [ ] AU-05
- [ ] AU-06
- [ ] AU-06b
- [ ] AU-06c
- [ ] AU-07
- [ ] AU-08
- [ ] AU-09
- [ ] AU-10
- [ ] AU-11
- [ ] AU-12
- [ ] AU-13
- [ ] AU-14

---

## 3. Public catalog (unauthenticated)

| ID | Steps | Expected |
|----|--------|----------|
| C-01 | Home `/` | Malls / brands / deals / emerging / nationwide sections load from API (not empty mock-only) |
| C-02 | `/malls` then a mall detail | Stores in that mall listed |
| C-03 | `/stores/{slug}` (e.g. `demo-seller-store`) | Store profile + products |
| C-04 | `/products` list, pagination / filters | Only `active` or `published` products |
| C-05 | Product detail PDP | Price, images, store, rating, add to cart |
| C-06 | `/search?q=` a known product name | Product appears |
| C-07 | Header type-ahead (`GET /search/suggest`) | Products, brands, stores with matching **prefix** |
| C-08 | Typo query e.g. `plystation` on `/search?q=` | Returns closest products with `typoToleranceApplied=true` |
| C-08 | `/brands`, `/categories`, `/deals` | Pages render API data |
| C-09 | `/emerging-vendors`, `/nationwide-stores`, `/local-stores` | Lists render |
| C-10 | Draft / archived product URL | Not in public list; direct URL 404 or hidden |
| C-11 | Home “For you” / recommendations | Guest still gets a feed; logged-in uses views/wishlist/purchases |

- [ ] C-01
- [ ] C-02
- [ ] C-03
- [ ] C-04
- [ ] C-05
- [ ] C-06
- [ ] C-07
- [ ] C-08
- [ ] C-09
- [ ] C-10
- [ ] C-11

---

## 4. Buyer account hub (CR-0.18–0.21)

Sign in as **buyer**.

| ID | Steps | Expected |
|----|--------|----------|
| BA-01 | `/account` | Cards for orders, addresses, wishlist, notifications, referrals, rewards |
| BA-02 | `/account/profile` | Name/phone update via `PATCH /auth/profile`; persists after refresh |
| BA-03 | `/account/addresses` | Create address (street, city, **state** used for delivery zones) |
| BA-04 | Edit address, set default, delete extra | CRUD works; one default remains |
| BA-05 | `/account/notifications` | List; mark one read; mark all read |
| BA-06 | Notification preferences | Toggles persist |
| BA-07 | `/wishlist` add from PDP, reload, remove | Synced when logged in |
| BA-08 | Guest wishlist then login | Local items merge into server wishlist |
| BA-09 | `/account/referrals` | Shows a personal code; signup count |
| BA-10 | `/account/rewards` | Points balance (may be 0 until a paid order) |

- [ ] BA-01
- [ ] BA-02
- [ ] BA-03
- [ ] BA-04
- [ ] BA-05
- [ ] BA-06
- [ ] BA-07
- [ ] BA-08
- [ ] BA-09
- [ ] BA-10

---

## 5. Cart, checkout, payments, orders (core loop)

Use two in-stock products if possible, from **two different stores**, so multi-store split is visible.

### 5.1 Quote and place

| ID | Steps | Expected |
|----|--------|----------|
| CK-01 | Add items to cart `/cart` | Client cart totals; coupon field present |
| CK-02 | Apply `FASTLINK10` on cart | Preview discount (10% off, cap ₦5,000) |
| CK-03 | Invalid / expired code | Clear error; total unchanged |
| CK-04 | `/checkout` with saved address | Quote groups by store; “N separate orders” if N>1 |
| CK-05 | Change address to Lagos vs Kano vs unknown state | Shipping fee changes with **delivery zones** |
| CK-05b | Delivery zone with custom ETA min/max | Quote returns `deliveryEstimate` and checkout shows ETA label |
| CK-06 | Place order | Server **re-prices** (ignore any client-only price tampering) |
| CK-07 | Stock after place | Product stock decreased; `inventory_movements` sale row exists (seller `/inventory`) |
| CK-08 | Place with quantity > stock | **422** / cannot place |
| CK-09 | Maintenance mode ON (admin Config) then checkout | Blocked with maintenance message |
| CK-10 | Turn maintenance OFF | Checkout works again |

### 5.2 Pay and confirm

| ID | Steps | Expected |
|----|--------|----------|
| CK-11 | Complete payment (demo or Paystack test) | `payment_status = paid`; order usable by seller |
| CK-12 | `/checkout/callback` success | Confirmation copy; link to orders |
| CK-13 | `/account/orders` | New order(s); same `group_id` if multi-store |
| CK-14 | Order detail | Line items, totals, status, invoice download |
| CK-15 | `GET /orders/{id}/invoice` | HTML receipt; download from UI |
| CK-16 | Public track `/order-tracking` with id + **matching** email | Status shown |
| CK-17 | Track with wrong email | Denied |
| CK-18 | After paid order, `/account/rewards` | Points increased: **1 pt per ₦100 paid** |
| CK-19 | Admin `/admin/ledger` | Entries for payment capture (and fees) |
| CK-20 | Admin `/admin/payments` | Payment row with fee/net |

### 5.3 Promos and loyalty at checkout

| ID | Steps | Expected |
|----|--------|----------|
| CK-21 | Quote with `FASTLINK10` | Discount applied **before** tax / free-shipping thresholds |
| CK-22 | Same user uses code a 6th time (`per_user_limit` 5) | Rejected |
| CK-23 | Checkout with “use points” when buyer has points | Discount **1 pt = ₦1**, cap **50% of cart after promo** |
| CK-24 | After redeem, `/loyalty/me` | Balance reduced |
| CK-25 | Seller-only promo (create on `/promos`) on another store’s items | Does **not** discount those items |

- [ ] CK-01 through CK-25 (tick each row above while executing)

---

## 6. Seller dashboard — owner (approved store)

Sign in as **`seller@fastlink.test`**.

| ID | Page / action | Expected |
|----|----------------|----------|
| S-01 | `/dashboard` | Stats: orders, revenue (paid), customers, products |
| S-01b | `/dashboard` activity fields | `activitySummary` and `recentActivity` present |
| S-02 | Pending banner | **Hidden** (store is approved) |
| S-03 | `/all-products` create product | Listed; public only after status active/published (and moderation if required) |
| S-04 | Edit, stock patch, images | Persist |
| S-05 | Submit for review | Status `submitted`; appears in admin `/admin/moderation` |
| S-06 | `/inventory` | Movements for sales / manual adjust; restock / damaged / write-off |
| S-07 | Low stock (≤ 5) | Notification and `/inventory` summary low-stock cards update |
| S-08 | `/orders` | Store orders only; cannot see other sellers |
| S-09 | Status: pending → confirmed → shipped → delivered | Invalid skip (e.g. pending → delivered) rejected |
| S-10 | Cancel confirmed order | Stock restored; movement recorded |
| S-11 | `/customers` | Buyers derived from orders; spend visible |
| S-12 | `/payments` | Paid captures for this store |
| S-13 | `/payouts` request with bank on file | Status **pending** until admin |
| S-14 | Request more than available | Rejected |
| S-15 | `/analytics` | Charts from paid orders |
| S-16 | `/marketing` | Create/update internal campaign (no Meta/Google) |
| S-17 | `/reviews` | Reply / flag / hide |
| S-18 | `/settings` + store profile | Name, bank, notification prefs persist |
| S-19 | `/growth` | Restock and/or promote suggestions |
| S-20 | `/promos` | Create store code; toggle active |
| S-21 | `/support` | Open ticket; later see admin reply |
| S-22 | `/messages` | Reply to buyer thread |
| S-23 | `/returns` | Approve or reject buyer return |
| S-24 | `/disputes` | Respond to open dispute |
| S-25 | `/team` | Owner listed; can invite by email |

- [ ] S-01
- [ ] S-02
- [ ] S-03
- [ ] S-04
- [ ] S-05
- [ ] S-06
- [ ] S-07
- [ ] S-08
- [ ] S-09
- [ ] S-10
- [ ] S-11
- [ ] S-12
- [ ] S-13
- [ ] S-14
- [ ] S-15
- [ ] S-16
- [ ] S-17
- [ ] S-18
- [ ] S-19
- [ ] S-20
- [ ] S-21
- [ ] S-22
- [ ] S-23
- [ ] S-24
- [ ] S-25

---

## 7. Seller onboarding, pending gate, KYC (CR-0.7–0.12, CR-2.4)

Use a **new** email. `APP_ENV=local` may auto-approve; if the store is approved immediately, still verify the wizard fields persisted, then use admin **reject/suspend** or a non-`testing` env for the pending path.

| ID | Steps | Expected |
|----|--------|----------|
| ON-01 | `/vendor/register` wizard | Store type → mall (if mall store) → business + bank → KYC upload |
| ON-02 | Submit | Store created; KYC files on seller documents + admin verification |
| ON-03 | If pending: `/vendor/pending` | Holding page; cannot publish products |
| ON-04 | Pending seller `POST /seller/products` | **Rejected** (publish gate: store not approved) |
| ON-05 | Dashboard pending banner | Visible while not approved |
| ON-06 | Admin `/admin/verification` | Application in queue with badge |
| ON-07 | Approve **with mall** (mall_store) | `mall_id` set; seller notified; can create products |
| ON-08 | Reject with reason | Seller notified; stays unpublished |
| ON-09 | `/rider/register` | Rider pending; admin queue |
| ON-10 | Admin reject/suspend rider | Cannot take deliveries |
| ON-11 | Rider onboarding ID upload required | Rider form blocks submit until ID card file selected |
| ON-12 | Rider submit (non-testing env) | Redirect/status path to `/rider/pending`; rider can access portal but has no assignments |
| ON-13 | Admin approve rider with no ID card document | **422** and approval blocked by backend |
| ON-14 | Admin verification rider card | Rider documents listed; approve button disabled when required ID is missing |
| ON-15 | `/rider/pending` | Pending/rejected state copy and CTA links render correctly |
| ON-16 | Non-rider opens `/rider` or `/rider/pending` | Redirect to role home (proxy role guard) |
| ON-17 | Buyer and rider logout visibility | `Sign Out` visible from top header and mobile menu when authenticated |

- [ ] ON-01
- [ ] ON-02
- [ ] ON-03
- [ ] ON-04
- [ ] ON-05
- [ ] ON-06
- [ ] ON-07
- [ ] ON-08
- [ ] ON-09
- [ ] ON-10
- [ ] ON-11
- [ ] ON-12
- [ ] ON-13
- [ ] ON-14
- [ ] ON-15
- [ ] ON-16
- [ ] ON-17

---

## 8. Seller team permissions (CR-3.8)

Create a second user (register as buyer). Owner invites them from `/team`.

| Role | Must work | Must **403** / hidden in nav |
|------|-----------|------------------------------|
| **inventory** | Products, stock, `/inventory` | Payouts, staff, store settings PATCH, bank account |
| **orders** | Orders, returns, disputes, customers | Products, payouts, team invite |
| **finance** | Payments, payouts list/request, analytics | Payout **bank** change, store PATCH, team |
| **support** | Messages, reviews, support tickets | Products, orders, payouts, team |

| ID | Steps | Expected |
|----|--------|----------|
| T-01 | Owner invites existing email + role `inventory` | 201; invitee `role` becomes `seller`; notification received |
| T-02 | Invite unknown email | 422 “register first” |
| T-03 | Invite store owner / admin / rider | 422 |
| T-04 | Staff `/auth/me` | `sellerAccess.isOwner = false`, `staffRole` set, `permissions` = that role only |
| T-05 | Inventory staff login | Sidebar: Dashboard + Products + Inventory; **no** Payouts / Team / Settings |
| T-06 | Inventory staff `GET /seller/products` | 200, store’s products |
| T-07 | Inventory staff `GET /seller/payouts` | **403** |
| T-08 | Orders staff `GET /seller/orders` | 200 |
| T-09 | Orders staff `GET /seller/products` | **403** |
| T-10 | Finance staff `GET /seller/payouts` | 200 |
| T-11 | Finance staff `POST /seller/payout-accounts` | **403** |
| T-12 | Support staff sees `/messages`; inventory staff does not | Nav + empty/403 on store threads for inventory |
| T-13 | Any staff `POST /seller/staff` | **403** |
| T-14 | Owner changes role inventory → orders | Permissions update on next `/me` |
| T-15 | Owner removes staff | Row gone; user demoted to **buyer** if they own no store |

- [ ] T-01
- [ ] T-02
- [ ] T-03
- [ ] T-04
- [ ] T-05
- [ ] T-06
- [ ] T-07
- [ ] T-08
- [ ] T-09
- [ ] T-10
- [ ] T-11
- [ ] T-12
- [ ] T-13
- [ ] T-14
- [ ] T-15

---

## 9. Returns, disputes, reviews, trust

Needs a **paid** order.

| ID | Steps | Expected |
|----|--------|----------|
| R-01 | Buyer request return on delivered/eligible order | Pending return; seller `/returns` |
| R-02 | Seller approve | Stock restore movement; refund path recorded |
| R-03 | Seller reject | Buyer sees rejected; no restore |
| R-04 | Admin return + partial `refund_amount` | Ledger `order_refund_partial` |
| R-05 | Buyer open dispute on **paid** order | Status `open`; seller notified |
| R-06 | Second dispute on same order | Rejected |
| R-07 | Dispute while return still open | Rejected (use returns first) |
| R-08 | Seller respond | Status `seller_responded` |
| R-09 | Admin resolve **refund** | Buyer refunded; ledger updated |
| R-10 | Admin resolve **partial refund** | Partial amount; ledger |
| R-11 | Admin resolve **reject** | Closed, no refund |
| R-12 | Buyer review after purchase | Rating on PDP; store rating updates |
| R-13 | Review without purchase | **403**/422 |
| R-14 | PDP “Report listing” | Trust report in `/admin/trust-reports` |
| R-15 | Admin note + resolve report | Status updates; audit trail |
| R-16 | Product detail badges | `verified_seller` / `trusted_seller` when thresholds met (may be absent on new stores — N/A) |

- [ ] R-01
- [ ] R-02
- [ ] R-03
- [ ] R-04
- [ ] R-05
- [ ] R-06
- [ ] R-07
- [ ] R-08
- [ ] R-09
- [ ] R-10
- [ ] R-11
- [ ] R-12
- [ ] R-13
- [ ] R-14
- [ ] R-15
- [ ] R-16

---

## 10. Admin control tower (CR-Tier 0 + 1 + 2 + 3)

Sign in as **admin**. Walk the nav top to bottom.

| ID | Page | Expected |
|----|------|----------|
| AD-01 | `/admin` | GMV, take, users, pending verification, pending payouts |
| AD-02 | `/admin/malls` | Malls with store count / status |
| AD-03 | `/admin/malls/[id]` | Stores in mall, pending count, link to public mall |
| AD-04 | Create/edit mall | Name, slug, location, banner, active/inactive |
| AD-05 | `/admin/verification` | Pending stores + riders |
| AD-06 | Store KYC review | Owner, bank, documents; approve/reject reason; audit |
| AD-07 | `/admin/vendors` | Stores-first list (status, mall, owner) |
| AD-08 | `/admin/customers` | Buyers only; suspend |
| AD-09 | `/admin/users` | Role/status filters; cannot self-escalate via UI |
| AD-10 | `/admin/riders` | Approve / reject / suspend |
| AD-11 | `/admin/orders` | All stores; status update |
| AD-12 | `/admin/returns` | Queue |
| AD-13 | `/admin/payments` | Fees/net |
| AD-14 | `/admin/ledger` | Immutable list; payment/refund/payout/chargeback types |
| AD-15 | `/admin/webhooks` | Paystack events: processed / failed / duplicate / invalid_signature |
| AD-15b | `/admin/webhooks` reconciliation widget | Orphan events count reflects unmatched webhook references |
| AD-16 | `/admin/payouts` | Approve → transferred path; reject; ledger on approve |
| AD-17 | `/admin/delivery-zones` | Lagos / Abuja FCT / Kano + national fallback; city override beats state |
| AD-18 | `/admin/promos` | Platform codes; `FASTLINK10` present; create/disable |
| AD-19 | `/admin/disputes` | Resolve with refund / partial / reject / replacement |
| AD-20 | `/admin/chargebacks` | Record against payment; won/lost; ledger reversals |
| AD-21 | `/admin/trust-reports` | Investigate + notes |
| AD-22 | `/admin/moderation` | Approve → product `published`/`active` in catalog; reject stays off catalog |
| AD-23 | Unpublish product | Removed from public listing |
| AD-24 | `/admin/catalog` | Malls/brands/categories CMS |
| AD-25 | `/admin/settings` | Commission %, return window, min order, shipping default, maintenance |
| AD-26 | Change commission | New **paid** orders use new fee; old payments unchanged |
| AD-27 | `/admin/support` | Reply to seller tickets |
| AD-28 | `/admin/analytics` | Platform totals |
| AD-29 | `/admin/audit` | Approve/reject/suspend actions logged |
| AD-30 | Seller token cannot load these pages/APIs | 403 |

### Webhook signature (API)

| ID | Steps | Expected |
|----|--------|----------|
| AD-31 | `POST /api/webhooks/paystack` with valid HMAC | Processed / duplicate-safe |
| AD-32 | Same payload twice | Duplicate, not double-capture |
| AD-33 | Invalid signature | `invalid_signature`; payment unchanged |

- [ ] AD-01 through AD-33

---

## 11. Growth extras

| ID | Steps | Expected |
|----|--------|----------|
| G-01 | Register with `?ref=` or `referral_code` of buyer A | Attribution created; A’s signup count +1 |
| G-02 | User enters **own** referral code | Rejected |
| G-03 | Logged-in cart changes | `POST /cart/sync` after debounce (Network tab) |
| G-04 | `php artisan cart:remind-stale --hours=0` (or 2 after waiting) | Notification for stale synced cart |
| G-05 | View several PDPs, add wishlist, `/` | For-you / recently viewed reflect activity |
| G-06 | Product with stock ≤ 5, no paid orders in 30d | Seller `/growth` shows restock and/or promote |

- [ ] G-01
- [ ] G-02
- [ ] G-03
- [ ] G-04
- [ ] G-05
- [ ] G-06

---

## 12. Cross-cutting security and tenancy

| ID | Steps | Expected |
|----|--------|----------|
| X-01 | Seller A product update as seller B | **403** |
| X-02 | Seller A order as seller B | Hidden / 403 |
| X-03 | Buyer lists `/seller/orders` | **403** |
| X-04 | IDOR: conversation of another pair | **403** |
| X-05 | Staff of store A cannot see store B | Empty/403 |
| X-06 | Checkout body `price: 1` | Server price used, not ₦1 |
| X-07 | XSS in product name / message body | Rendered escaped in UI |
| X-08 | CSRF: browser cookie-only POST to `/api/*` without bearer | Unauthenticated (API is token-based) |

- [ ] X-01
- [ ] X-02
- [ ] X-03
- [ ] X-04
- [ ] X-05
- [ ] X-06
- [ ] X-07
- [ ] X-08

---

## 13. Suggested golden path (90 minutes)

Run this first if time is short; then fill remaining IDs.

1. `php artisan test` green.
2. Buyer login → catalog → suggest search → add two stores’ products → address → `FASTLINK10` → checkout → pay → invoice.
3. Confirm loyalty points and ledger row.
4. Seller confirm → ship → buyer review → message seller.
5. Buyer return **or** dispute; seller respond; admin resolve; ledger updates.
6. Admin: verification (if any), moderation, payout approve, delivery zone, promo, maintenance toggle off.
7. Owner invites inventory staff; staff can products, cannot payouts; remove staff.
8. New vendor wizard + KYC; pending cannot publish; admin approve.

---

## 14. Role → URL cheat sheet

| Role | Primary URLs |
|------|----------------|
| Guest | `/`, `/products`, `/malls`, `/search`, `/login`, `/register` |
| Buyer | `/account/*`, `/cart`, `/checkout`, `/wishlist`, `/account/referrals`, `/account/rewards` |
| Seller owner | `/dashboard`, `/orders`, `/all-products`, `/inventory`, `/payments`, `/payouts`, `/promos`, `/growth`, `/team`, `/settings`, `/disputes`, `/returns` |
| Seller staff | Subset of the above by role (see §8) |
| Rider | `/rider`, `/rider/register`, `/rider/pending` |
| Admin | `/admin` and children listed in §10 |

---

## 15. Out of scope for this pack (do not test as shipped)

- CR-4.1 Event bus beyond `page_views`
- CR-4.2 Feature flags
- CR-4.3 / 4.4 AI assistants
- CR-4.5 Fraud ML
- Meilisearch typo-tolerance
- Holding stock before payment
- Wallets, gift cards, subscriptions, social login, multi-currency, native apps

---

## 16. Sign-off

| Item | Result | Notes |
|------|--------|--------|
| Date | | |
| Tester | | |
| Git SHA / build | | |
| API env (`local` / staging) | | |
| Payment mode (demo / Paystack test) | | |
| `php artisan test` | Pass / Fail | |
| Automated A-01–A-05 | Pass / Fail | |
| Auth + catalog | Pass / Fail | |
| Buyer account | Pass / Fail | |
| Checkout + money | Pass / Fail | |
| Seller owner | Pass / Fail | |
| Onboarding + KYC | Pass / Fail | |
| Team permissions | Pass / Fail | |
| Returns / disputes / trust | Pass / Fail | |
| Admin tower | Pass / Fail | |
| Growth | Pass / Fail | |
| Security / tenancy | Pass / Fail | |
| Blockers opened | | ticket IDs |
| **Pack verdict** | **Pass / Fail** | |

Open defects with: **case ID**, role, URL, request/response (no secrets), expected vs actual.
