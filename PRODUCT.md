# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: individual customers 27+ buying hookahs, tobacco, and accessories for personal use, occasionally as gift boxes. A secondary audience exists — lounge/venue buyers who purchase larger quantities — but for Stage 1 they are served by the same catalog and checkout with no dedicated wholesale flow (no minimum-quantity logic, no separate pricing tier).

## Product Purpose

An e-commerce storefront for the Contrast hookah brand (client: Алуа) that replaces informal WhatsApp-based ordering with a real online catalog: browse by category, search, filter, see live stock per branch, and check out — with orders landing directly in the branch's Poster POS account and status/cashback synced back to the customer.

## Positioning

Premium hookah retail presented with the restraint of a product-led lifestyle brand (client's explicit reference: aesop.com) rather than the "dark club" maximalism of Contrast's offline brandbook. The differentiating mechanism versus a generic online shop: real per-branch stock visibility sourced live from the POS (not a static "in stock" flag), and a WhatsApp-first path to a human for customers who still want to order that way.

## Operating Context

- CRM/inventory: Poster POS (joinposter.com), 4 accounts — one Connect account (`connect-contrast-centre`, central catalog/loyalty) plus 3 branch accounts (`contrast-left`, `contrast-al-farabi`, `contrast-centre`), each with its own stock.
- Catalog is authored centrally in the Connect account; branch accounts hold their own stock levels — out-of-stock items must auto-hide per branch.
- Delivery via Yandex Delivery API.
- Orders are created directly in the relevant branch's own Poster account (not via Connect, which is catalog/loyalty only); the branch manager is pinged on WhatsApp/Telegram when an order lands.
- Auth for the customer's personal cabinet: phone number + OTP, no passwords/email — matches how Poster already identifies clients.
- Product photos come from suppliers' official product pages, not original photography by the client.
- Stack: Next.js on Vercel, GitHub, `.env` for Poster API tokens (per account) and Yandex Delivery token, built in Claude Code. (Existing codebase; not an open decision.)

## Capabilities and Constraints

- Product attributes (brand, strength, flavor, packaging) are NOT structured fields in Poster — they live as free text inside the product title/description. Stage 2 catalog filters require a parse-at-sync step (dictionary + regex, own DB) plus a manual-fix admin panel for the fraction that won't parse cleanly (estimated 5–15%).
- Whether the loyalty/cashback program is unified across all 4 accounts or calculated per-branch is unconfirmed — this blocks correct cashback display in the future personal cabinet (Stage 2) until verified.
- Whether Poster webhooks are available on the client's tariff (for order-status/cashback sync) is unconfirmed; polling is the fallback.
- Stage 1 scope (from the signed КП): catalog + product cards with live per-branch stock (auto-hide when out of stock), Yandex Delivery integration, SEO basics (URLs, meta tags, speed, sitemap), migration to the client's domain (domain not yet named).
- Stage 2 (pending CRM audit numbers): brand/price/strength/flavor/packaging filters, personal cabinet with order history + cashback, PDPA (RK personal-data law) consent form.
- Stage 3 (pending logic decision with client): cross-sell recommendations on the order/product card; matching logic (by category, by brand, or manually curated) not yet decided.
- Currently shipping with mock data (`app/src/lib/data.ts`) and stand-in Unsplash stock photography (`app/src/lib/category-images.ts`) — both must be replaced (real Poster catalog sync; real supplier product photos) before this is a real storefront.

## Brand Commitments

- Brand: Contrast (hookah retail chain), offline brandbook = monogram + CONTRAST wordmark, black + gold/bronze gradient palette, wide-tracking type — applied everywhere physical (cards, packaging, signage, vehicle branding).
- Binding resolution of a confirmed brandbook/brief conflict (agreed with the client, not open for silent revision): the offline brandbook's dark+gold system does NOT carry over to the whole site. Dark/atmospheric treatment with the monogram and gold accent is reserved for the hero/first screen only. From there down, the site runs on a light, neutral background; premiumness is carried by typography, photography, and space — gold/monogram appear only as small accents (icons, buttons, dividers, hover states), never as block fills. Reference for the light sections: aesop.com. Changing this principle requires the client's (Алуа's) sign-off, not a unilateral design pass.
- First-screen element priority (client-specified, do not reorder without confirming): 1) WhatsApp button, 2) promo/banner, 3) search/top categories.

## Evidence on Hand

- `docs/PROJECT_SPEC.md` — signed brief/ТЗ with the client's direct answers (audience, design-conflict resolution, functional scope, stack, backlog). Treat as source of truth over conversation memory.
- `docs/Poster_CRM_Audit_Report.pdf` — completed CRM audit: API tokens live for all 4 accounts, loyalty/cashback centralized via the Connect account, order history available via API, no tariff upgrade needed for API access.
- No real product photography yet (stand-in Unsplash images in use); no real testimonials, pricing benchmarks, or case studies — none should be fabricated.

## Product Principles

1. Catalog usability over decoration: clear categories, search, filters, and honest per-branch stock — this was the client's explicit top functional priority, ahead of visual flourish.
2. Premium reads through typography, photography, and whitespace, not through dark/gold fills outside the hero — the resolved brand conflict above governs every screen after the first.
3. WhatsApp stays a first-class path to purchase, not a fallback — it's the client's #1 priority element on the first screen, reflecting how customers order today.
4. Don't invent structure the CRM doesn't have: attribute filters, loyalty display, and cross-sell logic all wait on confirmed CRM facts (Stage 2/3) rather than guessed data shapes.

## Accessibility & Inclusion

WCAG AA is the working standard for text contrast and similar checks (already applied once: the ported UI's muted-text color was darkened from #847968 to #6d6355 because the original failed AA at body-text size).
