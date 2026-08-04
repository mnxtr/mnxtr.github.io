# Supabase setup

Supabase powers the blog newsletter signup. The contact page currently sends
messages directly through FormSubmit at
`https://formsubmit.co/mohammad.newaz1@northsouth.edu`.

## Create the newsletter database

1. Create a Supabase project.
2. Open **SQL Editor** and run
   `supabase/migrations/20260805000000_initial_portfolio.sql`.
3. Copy `.env.example` to `.env.local` and fill in:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Restart Vite and submit the newsletter form locally.

The migration enables RLS and grants browser roles insert-only access. There
are no public read, update, or delete policies.

## GitHub Pages deployment

Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The Pages workflow injects them during the Vite build. Never use a Supabase
service-role or secret key in `.env.local`, Vercel, or any `VITE_*` variable.

## Vercel deployment

Vercel is optional. If used, add the same two variables for Preview and
Production environments. `vercel.json` already points Vercel to `npm run build`
and `dist`.

## Recommended before public launch

- Keep FormSubmit CAPTCHA enabled unless you intentionally disable it.
- Add a rate limit or CAPTCHA to the newsletter signup to reduce spam.
- Add an email notification workflow only if contact delivery should move from
  FormSubmit to a first-party backend.
