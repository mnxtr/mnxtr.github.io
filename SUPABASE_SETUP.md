# Supabase status: collection disabled

The portfolio does not currently load Supabase or offer newsletter signup. Historical `js/forms.js`, `js/supabase.js`, and the initial migration are retained as reference only. Do not deploy the migration just to build or preview this portfolio. No Supabase environment values are required for the current site. The separate Tanvora app has its own configuration and documentation.

The old migration enables RLS and blocks public reads, but grants anonymous and authenticated inserts into both `newsletter_subscribers` and `contact_messages`. Its comment calling contact storage “private” does not mean inserts are private. This source review does not establish which policies exist in production; no production database was inspected or changed.

Before reintroducing collection, review actual deployed grants and policies. Keep unused contact storage inaccessible to browser roles, design spam/rate controls, and validate consent, double opt-in, confirmation, delivery, unsubscribe, retention, and deletion. A successful table insert alone is not a working subscription lifecycle. Apply changes in a separate reviewed migration after checking existing consumers.

If a future browser integration is enabled, use only a public/publishable key with appropriate RLS. Secret and service-role keys must remain server-side. Consult current Supabase API and security guidance during that implementation.
