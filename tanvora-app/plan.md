# TANVORA — Website Design and Build Plan

**Status:** Working specification · 9 October 2026  
**Product:** Premium leather bags and wallets for customers in Bangladesh  
**Stack:** React + TypeScript, Supabase, Vercel, GitHub  
**Launch model:** Product catalogue with WhatsApp and website enquiries; direct checkout is a later option.

## 1. Product goal and decisions

Build a responsive brand showroom that makes it easy to discover a bag or wallet, understand its material and dimensions, see a clear price in taka, and ask about that exact variant. The site should feel distinctive and calm while keeping shopping tasks obvious.

The first release includes men's bags, women's bags, wallets, an all-products view, editorial brand content, a leather-care page, and a contact route. These are *working categories*, not a claim about current inventory. Do not publish products, prices, stock status, shipping promises, origin claims, or return terms until the business confirms them.

The approved identity is the **TANVORA circular stamp**. Use the existing approved Canva asset as the source of truth. The site may use a simplified wordmark or T only at sizes where the stamp's small text becomes unreadable; verify any derivative against the approved artwork.

## 2. Design thesis: The Modern Atelier

The visual language pairs the tactile character of leather with a restrained fashion editorial layout. One product photograph should carry each major section. Fine rules, spacious margins, asymmetrical image crops, a small collection index, and occasional circular-stamp placements create a recognizable rhythm. Product cards and controls remain straightforward.

**Homepage first viewport:** on desktop, a left editorial panel with a two-line headline and one primary action, balanced by a dominant bag photograph on the right. On mobile, the photograph leads, followed immediately by the headline and `Explore collection`; a visible collection link must fit without an excessively tall hero. Use an actual TANVORA photograph for production. A licensed placeholder is acceptable only for the prototype and must be labelled in development data.

### Brand tokens

| Role | Proposed token | Use |
| --- | --- | --- |
| Canvas | `#F6F0E6` | Main background |
| Ink | `#2C1D17` | Main copy and dark surfaces |
| Paper | `#FFFDF8` | Product detail panels |
| Cognac | `#A4673C` | Small accents and image captions; avoid small text until contrast is checked |
| Line | `#D6C8B8` | Fine rules and card dividers |

Set colours, font families, spacing, radii, shadows, and breakpoints in `src/styles/tokens.css`. Keep global resets and typography in `src/styles/base.css`, layout in `src/styles/layout.css`, and component styles in `src/styles/components/`. Avoid inline styling for the core interface. Validate every foreground/background pair used in the final UI.

### Typography

- **Display:** Instrument Serif as a proposed editorial face for large headings; normal or italic emphasis on one short word, never long italic paragraphs.
- **Utility:** Manrope as a proposed clear sans serif for navigation, product facts, buttons, and forms.
- **Logo:** The approved stamp artwork, not a recreation in a web font. Any text-only header version should be separately approved.
- **Rhythm:** Display headings about 40–76 px desktop and 36–48 px mobile, based on available width; body 16–18 px; labels 14–16 px. Use readable line height and responsive `clamp()` rather than fixed oversized text.
- **Language:** English at launch; plan font fallback and layout space for Bangla copy and Bangladeshi addresses. Show prices as `৳` plus numerals consistently.

Check font licensing, final font files, loading behavior, and Bangla coverage before shipping. Host chosen files locally where permitted, subset weights, and use sensible fallbacks to limit layout shift.

### Photography and graphic system

Commission or capture one clean hero, consistent front/back/interior/scale photos per product, and close-ups of stitching, leather grain, hardware, and lining. Keep colour true to the item. Use restrained tonal backgrounds rather than simulated leather textures in interface chrome. A small collection number such as `01 / BAGS` can anchor editorial sections, but never substitute for a real category label.

## 3. Pages and hierarchy

| Route | Purpose | Essential content / action |
| --- | --- | --- |
| `/` | Brand introduction and collection entry | Hero, category choices, a few featured products, verified craft/material story, service summary |
| `/collections` | All products | Search, category and colour filters, sort, product count, grid, empty state |
| `/collections/mens-bags` | Men's bags | Same catalogue controls scoped to category |
| `/collections/womens-bags` | Women's bags | Same catalogue controls scoped to category |
| `/collections/wallets` | Wallets | Same catalogue controls scoped to category |
| `/products/:slug` | Product evaluation and enquiry | Gallery, name, price, colour, availability, dimensions, material, features, care, delivery summary, enquiry actions |
| `/story` | Brand credibility | Accurate design/manufacturing story and supporting photographs |
| `/care` | Ownership guidance | Material-specific care guidance, reviewed before publishing |
| `/contact` | General enquiry | Contact methods, response hours, accessible form where configured |
| `/policies/:slug` | Purchase clarity | Real shipping, returns, and privacy policies |

Do not add cart, account, wishlist, or checkout UI in the first release. Design product and price data so a later checkout can be integrated without redesigning the catalogue.

### Homepage sequence

1. Compact header: logo, Men, Women, Wallets, All Products, Search, and menu on mobile.
2. Hero: product-led image, `Carry with character`, one short supporting sentence, and `Explore collection`.
3. Three category cards with real item photography and clear labels.
4. Featured products: four curated products with name, price, one material fact, and availability.
5. Craft detail: close crop with a short, verifiable construction/material explanation.
6. Brand story: concise statement with `Our story` link.
7. Delivery and care summary: only confirmed promises, with policy links.
8. Footer: full circular stamp at readable size, links, contact details, social channels, copyright.

### Catalogue and product detail behavior

- Catalogue cards share image ratio, title position, price format, and availability treatment. Show colour swatches only when corresponding variants exist.
- Mobile filters open in a labelled panel with selected-filter count, reset, apply, and close. Preserve filters and scroll when returning from a product.
- Search handles product name, category, and material; a no-results state suggests clearing filters.
- Product gallery supports swipe/tap and keyboard controls, accurate alt text, and an image count.
- The variant selector updates the SKU, images, price if variant-specific, stock status, and enquiry payload. Disable unavailable variants with an explanation.
- Put dimensions in centimetres and practical capacity facts such as laptop fit only when measured and verified.
- Primary action: `Enquire on WhatsApp`, opening a draft with product name, SKU, selected colour, and URL. The visitor sends the message themselves. Secondary action: `Send an enquiry` through a website form if the secure submission endpoint is live.
- Offer loading, empty, error, success, and unavailable states. Never show a working-looking form that silently discards messages.

## 4. Interaction and accessibility rules

- Mobile first at roughly 360 px and up; then tablet and desktop. Avoid horizontal overflow at 200% text zoom.
- Main text and controls meet WCAG 2.2 AA contrast targets; ordinary text at least 4.5:1, with visible focus and clear labels.
- Keyboard navigation must reach menus, filters, swatches, gallery controls, and enquiry actions in a logical order.
- Avoid auto-rotating hero media, interruptive pop-ups, and motion required for understanding. Respect reduced-motion settings.
- Provide meaningful image alternatives, form errors next to their fields, and an announced success or failure message.
- Prioritize optimized real product images and stable image dimensions. Target Core Web Vitals in field data after launch: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile.

## 5. Application structure

```text
tanvora/
  plan.md
  README.md
  .env.example
  src/
    app/                 # routes, providers, page composition
    components/          # header, footer, product card, gallery, filters, forms
    features/catalog/    # queries, filter state, product mapping
    features/enquiries/  # WhatsApp draft and form submission
    lib/supabase.ts       # publishable client configuration
    styles/
      tokens.css
      base.css
      layout.css
      components/
    types/
  public/                # approved brand assets and static media
  supabase/migrations/   # reviewed schema and RLS policies
```

Use React + TypeScript with Vite and client-side routing. Use CSS modules or plain component CSS with the token layer; do not put the visual system in JSX. Add a Vercel route rewrite so deep links resolve to the React app. Keep dependency versions pinned and commit a lockfile.

### Supabase data model, proposed

| Entity | Key fields | Access rule |
| --- | --- | --- |
| `categories` | `id`, `slug`, `name`, `sort_order`, `is_active` | Public read for active records |
| `products` | `id`, `slug`, `name`, `description`, `category_id`, `material`, `dimensions`, `is_featured`, `is_published` | Public read for published records |
| `product_variants` | `id`, `product_id`, `sku`, `colour`, `price_bdt`, `availability`, `is_active` | Public read only for active variants of published products |
| `product_images` | `id`, `product_id`, optional `variant_id`, `path`, `alt`, `sort_order` | Public read only for published products; public media bucket for approved product photos |
| `enquiries` | `id`, `product_id`, `variant_id`, contact fields, message, created time, status | Private to business operators; no public select/update/delete |

Enable RLS on every exposed table. A browser client uses only the Supabase project URL and publishable key; never ship a secret or service-role key. Submit enquiry forms through a controlled server endpoint with validation, abuse protection, and limited database rights; do not grant public table access to read customer enquiries. Add an admin workflow for products and enquiries only once the business process is defined. Use migrations for schema and policies and verify each policy with anonymous and operator test cases before deployment.

## 6. Build and release phases

### Phase 0 — Inputs and identity

- Export approved circular stamp in suitable formats; check small-size legibility.
- Collect actual product list, variant SKUs, dimensions, prices, stock policy, and at least one complete photo set.
- Confirm WhatsApp number, business contact, response hours, shipping, returns, privacy, and brand story claims.
- Verify domain, trademark, and social handle availability before public brand launch.

### Phase 1 — Designed prototype

- Build responsive homepage, catalogue, and product detail with clearly marked sample data.
- Establish typography, colour tokens, components, navigation, search/filter controls, and realistic states.
- Review 360 px mobile, 768 px tablet, and wide desktop layouts. Choose the Modern Atelier composition as the initial direction; compare it with the earlier concepts before freezing photography and spacing.

### Phase 2 — Data and enquiries

- Create Supabase schema, product images, and read policies; import approved real products.
- Connect browse/search/filter/detail views to published records.
- Connect product-specific WhatsApp drafts and a secure enquiry endpoint with confirmation and error states.

### Phase 3 — Release

- Put source, design tokens, approved assets, migration files, and this plan in a GitHub repository.
- Connect GitHub to Vercel for preview and production deployments. Set `VITE_` environment values only for publishable client configuration; keep server secrets out of the client and repository.
- Configure deep-link routing, metadata, sitemap, analytics events, and production domain when available.
- Test keyboard and screen-reader flow, forms, product variants, mobile speed, and policies against real content; publish only after checkout/enquiry and contact details are verified.

## 7. Acceptance criteria for the first release

1. A visitor can reach men's bags, women's bags, or wallets from the homepage in one action.
2. Catalogue search and filters reflect actual published products and survive back navigation.
3. Product detail displays the selected variant's correct image, SKU, price in BDT, dimensions, and availability.
4. WhatsApp opens a draft identifying the exact product and selected variant. A submitted web form yields a confirmed record or a clear error.
5. Empty, loading, unavailable, and failed-network states are understandable and actionable.
6. All routes work from a direct URL on Vercel and on a mobile device.
7. Anonymous users cannot read enquiries or unpublished product records; no secret key appears in client code or GitHub.
8. Approved logo, real photography, and truthful policies replace sample content before public launch.

## 8. Open business inputs

The build can begin with sample products, but public launch requires: approved logo export, real product photos and specifications, confirmed prices and stock handling, WhatsApp/contact destination, delivery and returns terms, privacy text, and the production domain. The site should label unprovided content as sample during development rather than imply it is a live offer.

## Reference notes

- Supabase React quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- Supabase API security and RLS: https://supabase.com/docs/guides/api/securing-your-api
- Vercel Vite framework guide: https://vercel.com/docs/frameworks/frontend/vite
- WCAG 2.2 contrast criterion: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum

These references informed the technical and accessibility planning on 9 October 2026. Recheck their current instructions when implementing and deploying.
