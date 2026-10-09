# TANVORA

A React + TypeScript design prototype for a premium leather goods catalogue. The default mode uses **illustrative products, generated imagery, and sample prices**, labelled throughout the interface. No orders are accepted.

## Run locally

```bash
npm ci
npm run dev
npm run build
```

Copy `.env.example` to `.env.local` only when connecting a dedicated TANVORA Supabase project. The unconfigured prototype works without it.

## Stack and structure

- Vite, React, TypeScript, React Router
- Supabase product data with RLS policies in `supabase/migrations/`
- Vercel SPA routing in `vercel.json`; optional serverless enquiry endpoint in `api/enquiries.ts`
- Brand tokens in `src/styles/tokens.css`, base rules in `base.css`, layout in `layout.css`, components in `components/components.css`
- Generated **prototype** product visuals in `public/images/`; replace with real photography and the approved Canva stamp before public launch.

## Connect Supabase

1. Create or designate a **dedicated** project. Do not apply the schema to an unrelated database.
2. Review and apply the SQL migration. The four catalogue tables have anonymous read grants and published-row RLS; enquiries have no public access.
3. Add approved product, variant, and image records. Images use public HTTPS URLs. Products are hidden until `is_published = true`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the frontend in Vercel. Never use a secret or service-role key in `VITE_` variables.
5. Verify anonymous queries see published products and cannot read unpublished products or enquiries. Verify the site routes and product variants against real records.

## Enquiries

Set `VITE_WHATSAPP_NUMBER` to a confirmed business number in international digits to enable product-specific WhatsApp drafts. Without it, product pages route to Contact.

The form is off by default. To enable it, configure `VITE_ENQUIRY_FORM_ENABLED=true` and `SUPABASE_SECRET_KEY` on Vercel only, test `/api/enquiries`, and add production rate limiting or challenge protection before public launch. The Vercel function validates inputs and writes to the private `enquiries` table; no secret is shipped to the browser. Publish a real privacy notice and response process first.

## Release checks

- Replace all sample products, prices, generated imagery, provisional logo rendering, and placeholder policies with approved business content.
- Confirm delivery, returns, contact details, product material and dimensions.
- Test mobile and keyboard navigation, filters, product variants, deep links, and enquiry success/failure.
- Connect the GitHub repository to Vercel with build command `npm run build` and output `dist`.

## Vercel preview without GitHub

Vercel supports direct deployment without a GitHub sign-in. Upload this source folder or its ZIP to [Vercel Drop](https://vercel.com/drop), select the intended team, name the project `tanvora`, and let Vercel build the Vite app. Keep it as a labelled design preview until verified inventory and policies are supplied. A GitHub connection can be added later for automatic deployments. The contact form remains disabled by default.

## GitHub Pages preview

The portfolio Pages workflow can build this app from `tanvora-app/` with `VITE_BASE_PATH=/tanvora/` and copy its `dist/` into the portfolio artifact's `dist/tanvora/`. The app switches to hash routing at that base, so direct links such as `/tanvora/#/products/the-atelier-tote` work on static Pages. GitHub Pages cannot run `api/enquiries.ts`; keep the form off and use a confirmed WhatsApp destination before accepting real enquiries. Keep Tanvora out of the portfolio's root Vite HTML scan and sitemap generator.

See [plan.md](./plan.md) for the design and release specification.
