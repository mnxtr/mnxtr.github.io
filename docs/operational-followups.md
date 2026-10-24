# Operational checks outside automated validation

- **Contact delivery:** verify FormSubmit recipient activation and a single owner-controlled inquiry, including spam filtering, replies, and the native fallback. Browser tests mock responses and do not establish inbox delivery. The form presents acceptance as provider acceptance, preserves failures, and leaves direct email available.
- **Newsletter:** keep signup disabled until consent, confirmation, delivery, unsubscribe, retention, and deletion are implemented and tested. No Supabase production policy changes are included. Inspect actual policies before changing the historical anonymous insert grants.
- **Public claims:** case studies reference reviewed source snapshots from October 24, 2026. Re-review implementation and evidence when updating those claims. Numeric model benchmarks and production/business-impact claims are intentionally absent.
- **Education:** confirm current degree status with the portfolio owner before adding a graduation date or claiming degree completion. The site and regenerated PDF use neutral study wording.
- **Production release:** merge the dependency, release-validation, and feature changes in dependency order. The release workflow validates the artifact before deployment. After deployment, inspect the homepage, nested case-study search, contact page, 404 route, résumé PDF, and `/tanvora/`.
