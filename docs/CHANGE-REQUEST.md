# Fastlink Marketplace — Change Request (CR-1)

**Document ID:** CR-1  
**Status:** Shipped (Tier 0 — 13 August 2026) · Tier 1 complete (13 August 2026) · Tier 2 largely shipped (zones, inventory, checkout quote, KYC — 13 August 2026)  
**Audience:** Product, engineering, design  
**Last updated:** 13 August 2026  
**Related docs:** [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md) · [`API-CATALOG.md`](./API-CATALOG.md) · [`BACKLOG.md`](./BACKLOG.md)

---

## 1. Purpose

Phases **0–11** of the API integration plan delivered a working commerce loop: auth, catalog, seller products, checkout, payments, payouts, admin console, reviews, messages, support, analytics, wishlist, riders, returns, and notifications.

This change request captures **what is still missing** to operate Fastlink as a **real multi-sided marketplace** — not only transactionally, but as a platform an admin can run (malls, verification, trust) and buyers/sellers can trust at scale.

It merges:

1. **Platform Operations gaps** — mall-centric admin, onboarding, verification, role-specific UX (operator workflow).
2. **Marketplace maturity gaps** — trust & safety, disputes, ledger, inventory, growth, and intelligence systems (scale workflow).

**This document does not replace Phases 0–11.** It defines **CR-Tier 0 onward** work after that foundation.

---

## 2. Problem statement

### 2.1 Operator experience

The platform admin (`role: admin`, `/admin`) has backend APIs and minimal table UIs, but:

- There is **no mall-first control tower** (dashboard → mall → stores).
- **Seller and rider verification** is not a first-class workflow (no queue, no KYC review screen, no publish gate).
- **Onboarding** does not ask store type or mall assignment; local dev **auto-approves** applicants.
- Admin UI uses a **different design system** (dark “Control” theme) from the shop/seller experience and feels disconnected.

### 2.2 Buyer experience

Logged-in buyers have orders, messages, notifications, and returns, but lack:

- A unified **`/account` hub**
- **Saved addresses** management (API exists; UI does not)
- **Invoice / receipt** download

### 2.3 Marketplace maturity

The integration plan correctly scoped MVP to transactional features and deferred trust, disputes, ledger, promotions, personalization, and AI. As seller count and GMV grow, these become **production blockers**, not nice-to-haves.

---

## 3. Domain model (canonical terms)

| Term | Definition | Created by |
|------|------------|------------|
| **Platform admin** | Fastlink staff (`role: admin`). No separate `super_admin` in v1. | Seeded only |
| **Mall** | Shopping center container (e.g. Ado Bayero Mall). Holds **mall stores**. | Admin |
| **Store / vendor** | Seller’s shop. One seller user typically owns one store. | Seller via `/vendor/register` |
| **Store type** | `mall_store`, `independent`, `nationwide`, `emerging` (in DB) | Set at onboard or admin assign |
| **Buyer / customer** | Shopper (`role: buyer`) | Self-register |
| **Rider** | Delivery partner (`role: rider`) | Self-register via `/rider/register` |

**Clarification:** A seller is **not** a mall. A seller owns a **store**, which may be linked to a **mall** (`stores.mall_id`).

---

## 4. Current state inventory (post Phase 11)

### 4.1 Shipped and working

| Area | Status | Notes |
|------|--------|-------|
| Auth + RBAC | ✅ | buyer, seller, admin, rider; Sanctum |
| Public catalog | ✅ | Malls, stores, brands, categories, products, search |
| Seller dashboard | ✅ | Products, orders, payouts, analytics, messages, etc. |
| Checkout | ✅ | Server re-pricing; **multi-store split** via `group_id` in `CheckoutService` |
| Payments | ✅ | Paystack + demo mode; webhooks |
| Admin APIs | ✅ | Users, stores, products, orders, payments, payouts, catalog, audit |
| Returns | ✅ | Thin: request → approve/reject → refund record |
| Notifications | ✅ | In-app + hooks on order events |
| Riders | ✅ | Register, admin approve, assign to order |
| Database | ✅ | Supabase Postgres (local `.env`); PHPUnit stays SQLite |

### 4.2 Partially built

| Area | Built | Gap |
|------|-------|-----|
| Seller onboarding | Form + API | No store type/mall picker; auto-approve in `local`; no KYC docs |
| Store approval | API (`mall_id` on approve) | Admin UI: one-click approve, no mall picker or detail view |
| Admin console | 14 flat pages | No mall drill-down; no verification queue |
| Product lifecycle | `draft` / `active` / `archived` | No review pipeline; **no gate on store approval** |
| Seller reputation | Product rating from reviews | No seller health score or badges |
| Events | `page_views` | Not a general event bus |
| Financial records | `payments` fees/net | No immutable ledger |
| Cart coupons | UI placeholder | No promotion engine |
| Buyer account | Sub-pages only | No hub, addresses UI, invoices |

### 4.3 Explicitly deferred (integration plan §6.3)

Wallets, loyalty, gift cards, affiliates, auctions, subscriptions, B2B/RFQ, AI assistants, autocomplete/semantic search, product comparison, multi-carrier logistics, fraud ML, per-category commission engine.

---

## 5. Requirements — Tier 0: Platform Operations

**Goal:** An admin can **create malls, verify sellers/riders, and organize the catalog**; applicants see clear pending states; buyers have a complete account shell.

**Priority:** **P0 — implement before scaling seller acquisition.**

### 5.1 Mall-centric admin

| ID | Requirement | Acceptance criteria |
|----|-------------|-------------------|
| CR-0.1 | Admin **Malls** list (`/admin/malls`) | Grid/list of all malls with store count, status, GMV summary |
| CR-0.2 | Admin **Mall detail** (`/admin/malls/[id]`) | Shows mall metadata + all stores in mall; pending count; link to public mall page |
| CR-0.3 | Rich mall CRUD | Create/edit: name, slug, location, banner, active/inactive (not name-only) |
| CR-0.4 | Assign store to mall on approve | Admin picks mall when approving pending store; persists `mall_id` |

### 5.2 Verification & onboarding

| ID | Requirement | Acceptance criteria |
|----|-------------|-------------------|
| CR-0.5 | **Verification queue** (`/admin/verification`) | Single inbox: pending stores + pending riders with badge count |
| CR-0.6 | **Store detail / KYC review** | View owner, bank details, application data; approve/reject with reason; audit logged |
| CR-0.7 | Seller onboard **wizard** | Steps: store type → mall (if mall store) → business info → KYC → submit → `pending` |
| CR-0.8 | Rider onboard **enhancement** | Application fields + pending state; admin reject/suspend |
| CR-0.9 | **Pending applicant UX** | Pending seller/rider sees holding page; cannot publish products or take deliveries |
| CR-0.10 | **Publish gate** | `ProductPolicy` / API rejects create/publish unless `store.status === approved` |
| CR-0.11 | Production pending mode | No auto-approve for stores/riders outside `testing` env |
| CR-0.12 | Application notifications | Admin notified on new application; applicant notified on approve/reject |

### 5.3 Admin information architecture & UX

| ID | Requirement | Acceptance criteria |
|----|-------------|-------------------|
| CR-0.13 | Reorganized admin nav | Overview · Malls · Verification · Vendors · Customers · Riders · Orders · Returns · Finance · Support · Analytics · Catalog · Settings · Audit |
| CR-0.14 | **Vendors** view | Stores-first list (not mixed users table) with status, mall, owner |
| CR-0.15 | **Customers** view | Buyers only: orders count, status, suspend |
| CR-0.16 | Admin design alignment | Shared Fastlink tokens (purple primary, card patterns) while keeping distinct “Control” layout |
| CR-0.17 | Detail pages / drawers | Replace bare tables for store, rider, order review where applicable |

### 5.4 Buyer account completeness

| ID | Requirement | Acceptance criteria |
|----|-------------|-------------------|
| CR-0.18 | **`/account` hub** | Sidebar layout linking orders, addresses, wishlist, messages, notifications, profile |
| CR-0.19 | **Saved addresses** (`/account/addresses`) | CRUD wired to existing `addressesApi` |
| CR-0.20 | **Invoice / receipt** | `GET /orders/{id}/invoice` (HTML/PDF) + download on order detail |
| CR-0.21 | **Profile** (`/account/profile`) | Wire `/auth/profile`; password change |

### 5.5 Seller dashboard fixes

| ID | Requirement | Acceptance criteria |
|----|-------------|-------------------|
| CR-0.22 | Returns in seller nav | `/returns` added to seller route guards and sidebar |
| CR-0.23 | Pending store banner | Dashboard shows approval status when store not approved |

---

## 6. Requirements — Tier 1: Trust & Money

**Goal:** Marketplace is **auditable and defensible** when disputes and fraud appear.

**Priority:** **P1 — before high GMV or public marketing push.**

| ID | Requirement | Summary |
|----|-------------|---------|
| CR-1.1 | Trust & Safety MVP | Report product/seller; admin investigation queue; notes; basic verified badges |
| CR-1.2 | **Dispute engine** | Beyond returns: buyer opens → seller responds → evidence → admin decision → refund/replacement/reject |
| CR-1.3 | **Financial ledger** | Immutable log of every money movement (pay, fee, refund, payout) |
| CR-1.4 | Payment reconciliation | Webhook ops dashboard: received, processed, failed, duplicate, invalid signature |
| CR-1.5 | Seller reputation score | Computed: rating, fulfillment %, cancellation %, response rate; “Trusted Seller” badge |
| CR-1.6 | Product moderation pipeline | `draft → submitted → under_review → approved → published`; admin queue |
| CR-1.7 | **Marketplace config center** | Admin UI: commission, return window, min order, delivery defaults, approval toggles, maintenance mode |
| CR-1.8 | Chargeback workflow | Record reversals; partial refund; link to ledger |

---

## 7. Requirements — Tier 2: Commerce depth

**Priority:** **P2**

| ID | Requirement | Summary |
|----|-------------|---------|
| CR-2.1 | Inventory engine | Reservations, movements, low-stock alerts, return/damaged stock, audit trail |
| CR-2.2 | Delivery zones & pricing | Zone-based fees; foundation for rider/platform delivery |
| CR-2.3 | Multi-store checkout UX | Buyer sees one checkout summary → N store orders (backend `group_id` already exists) |
| CR-2.4 | KYC document storage | `store_documents`, `rider_documents` tables + secure upload |

---

## 8. Requirements — Tier 3: Growth

**Priority:** **P3 — post product-market fit**

| ID | Requirement | Summary |
|----|-------------|---------|
| CR-3.1 | Promotions engine | Coupons, promo codes, seller/platform campaigns applied at checkout |
| CR-3.2 | Referral system | Links, codes, tracking, fraud checks |
| CR-3.3 | Loyalty / rewards | Points, redemption (optional wallet) |
| CR-3.4 | Abandoned cart recovery | Server-side cart events + notification automation |
| CR-3.5 | Advanced search | Meilisearch/Algolia: autocomplete, typo tolerance, ranking |
| CR-3.6 | Personalization | Recommendations from views, purchases, wishlist |
| CR-3.7 | Seller growth center | Actionable insights (“restock X”, “reduce price 5%”) |
| CR-3.8 | Seller team permissions | Store staff roles: inventory, orders, finance, support |

---

## 9. Requirements — Tier 4: Intelligence

**Priority:** **P4 — differentiator layer**

| ID | Requirement | Summary |
|----|-------------|---------|
| CR-4.1 | Event / activity system | General event bus (`product_viewed`, `checkout_started`, …) powering analytics, fraud, AI |
| CR-4.2 | Feature flags | Admin toggles for gradual rollout |
| CR-4.3 | AI shopping assistant | Catalog-grounded Q&A, compare, recommend (no hallucinated product data) |
| CR-4.4 | AI seller assistant | Insights from store analytics; content suggestions |
| CR-4.5 | Fraud ML | Risk scoring from events + payments |

---

## 10. Feature matrix (25-area comparison)

Status as of Phase 11:

| # | Capability | Status |
|---|------------|--------|
| 1 | Trust & Safety | Partial |
| 2 | Dispute resolution | Missing |
| 3 | Seller reputation system | Partial |
| 4 | Product catalog governance | Partial |
| 5 | Inventory management | Partial |
| 6 | Delivery architecture | Partial |
| 7 | Multi-store cart / order group | Partial (backend built) |
| 8 | Promotions engine | Missing |
| 9 | Personalization | Missing |
| 10 | Modern search | Partial |
| 11 | AI shopping assistant | Missing (deferred) |
| 12 | Seller AI assistant | Missing (deferred) |
| 13 | Seller growth tools | Partial |
| 14 | Seller subscriptions | Missing |
| 15 | Seller team management | Missing |
| 16 | Buyer wallet / credits | Missing (deferred) |
| 17 | Loyalty & rewards | Missing (deferred) |
| 18 | Referral system | Missing |
| 19 | Abandoned cart recovery | Missing |
| 20 | Event / activity system | Partial (`page_views` only) |
| 21 | Feature flags | Missing |
| 22 | Marketplace config center | Partial (commission only) |
| 23 | Financial ledger | Partial |
| 24 | Chargebacks | Partial |
| 25 | Observability & operations | Partial (health + audit) |

**Tier 0 items (§5) are not in the matrix above** — they address operator UX gaps the matrix does not cover.

---

## 11. Unified priority order (top 15)

| Rank | Item | Tier |
|------|------|------|
| 1 | Mall-first admin + store drill-down | 0 |
| 2 | Verification queue + KYC review + publish gate | 0 |
| 3 | Seller onboard wizard (type, mall, pending state) | 0 |
| 4 | Trust & Safety MVP | 1 |
| 5 | Financial ledger | 1 |
| 6 | Dispute resolution | 1 |
| 7 | Marketplace config center | 1 |
| 8 | Seller reputation score + badges | 1 |
| 9 | Product moderation lifecycle | 1 |
| 10 | Inventory reservations + history | 2 |
| 11 | General event system | 4 (design early) |
| 12 | Admin UI redesign | 0 |
| 13 | Buyer account hub + invoices | 0 |
| 14 | Delivery zones + pricing | 2 |
| 15 | Advanced search (Meilisearch) | 3 |

---

## 12. Recommended implementation sequence

```text
CR-Tier 0  Platform Operations     ← START HERE (operator + onboarding + buyer account)
CR-Tier 1  Trust & Money           ← Before scaling GMV
CR-Tier 2  Commerce depth           ← Inventory, delivery, checkout UX
CR-Tier 3  Growth                   ← Promotions, search, personalization
CR-Tier 4  Intelligence             ← Events, AI, fraud ML
```

**Do not skip Tier 0** if the goal is a mall-based Nigerian marketplace with verified vendors.

**Do not jump to Tier 4 (AI)** before Tier 1 (ledger + disputes + trust) — AI without trustworthy data and audit trails increases risk.

---

## 13. Out of scope for CR-1

The following remain **explicitly out of scope** unless product reopens MVP:

- Social login
- Multi-currency / multi-country
- B2B / RFQ / auctions / subscriptions
- Full logistics partner integrations
- Seller subscription billing (Tier 3+)
- Native mobile apps

---

## 14. Success metrics

| Tier | Metric |
|------|--------|
| 0 | 100% of new sellers pass through pending → admin approve before first published product |
| 0 | Admin can list all malls and drill into stores per mall in &lt; 3 clicks |
| 0 | Buyers can download receipt for any paid order |
| 1 | Every payment/refund/payout has a ledger entry; disputes resolvable without ad-hoc DB edits |
| 1 | Reported listings reviewed within configurable SLA |
| 2 | Zero oversells on concurrent checkout (reservation-backed stock) |
| 3 | Measurable lift in conversion from search autocomplete + recommendations |

---

## 15. Approvals

| Role | Name | Date | Decision |
|------|------|------|----------|
| Product | | | ☐ Approved ☐ Revised ☐ Rejected |
| Engineering | | | ☐ Approved ☐ Revised ☐ Rejected |
| Design | | | ☐ Approved ☐ Revised ☐ Rejected |

---

## 16. Revision history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 13 Aug 2026 | Engineering | Initial CR-1 from gap analysis + marketplace maturity review |
| 1.1 | 13 Aug 2026 | Engineering | Tier 0 shipped — Phase 12 platform operations |

---

## 17. How to use this document

1. **Product:** Prioritize Tier 0 stories for the next sprint; Tier 1 for the following quarter.
2. **Engineering:** Each CR-ID maps to epics/tickets; backend-first for gates (CR-0.10, CR-0.11) before UI polish.
3. **Design:** Tier 0.16 admin redesign + onboard wizards + `/account` hub are the primary design deliverables.
4. **QA:** Acceptance criteria in §5 are test scenarios for Tier 0 sign-off.

When Tier 0 ships, add **Phase 12 — Platform Operations** to [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md) and mark shipped with date.
