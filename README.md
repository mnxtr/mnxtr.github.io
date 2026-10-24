# Mohammad Mansib Newaz — AI & Automation Portfolio

A static portfolio for freelance AI and automation inquiries. The site presents scoped services, public research and interface work, and a project-brief form. Project status is explicit: the CRM and manufacturing examples are interface prototypes, not deployed backend systems.

[Live site](https://mnxtr.github.io) · [Contributing](CONTRIBUTING.md) · [Design direction](DESIGN_DIRECTION.md)

## Develop and validate

Use Node.js 24 and the committed npm lockfile.

```bash
npm ci
npm run dev
```

Vite serves the site at `http://localhost:3000`. It injects the shared header and footer from `partials/` into each page, so use Vite rather than opening source HTML directly.

```bash
npm run lint
npm run test:coverage -- --runInBand
npm run test:build
npm audit --audit-level=moderate
npm run build
npm run seo:check
npm run check:links
npx playwright install chromium
npm run test:browser
```

The browser suite uses the production build. It covers responsive layouts, both themes, axe accessibility checks, keyboard navigation, no JavaScript, reduced motion, search, and mocked contact states. All contact requests are intercepted; tests never send real messages. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation. Screenshots and traces for failures are local artifacts, not committed output.

## Content and architecture

- `index.html`: services → public evidence → process → FAQ → project brief.
- `project.html` and `projects/`: case studies with pinned source references and limitations. Preserve `/project.html#traffic-sign-detection`.
- `about.html`, `resume.html`, and the résumé PDF: background and public project evidence. Education wording does not assume a confirmed graduation date.
- `contact.html`: required name, email, and workflow description; optional service, tools, and timeframe.
- `blog/`: preserved engineering articles. Newsletter signup is disabled.
- `privacy.html`, `thank-you.html`, `404.html`: privacy and utility routes. The last two are noindex and excluded from the sitemap.
- `security/`: the existing public advisory tool, with shared navigation and isolated application styles.
- `public/data/portfolio-index.json`: the search index copied directly into the build. Search runs locally and does not call an LLM.

The stack remains vanilla JavaScript, Vite 6, and Tailwind CSS 3. Common styles use semantic dark/light tokens. Content is visible before JavaScript. The optional Three.js ornament loads only on desktop, outside reduced-motion and data-saving modes; it pauses offscreen and disposes when the page is left. It does not carry essential content.

Page copy and titles live in the HTML source. Postbuild processing uses an HTML parser to normalize canonical URLs, favicon, social metadata, and structured data without rewriting visible content. Add new root, `projects/`, `blog/`, or `security/` pages to the source; build entry discovery and sitemap generation share the same page list. Mark utility pages `noindex`.

To regenerate the branded social preview, run `npm run social:generate`. To update the PDF after editing the résumé, build the site, run `npm run preview`, then run `npm run resume:export` in a second terminal and rebuild to copy the updated PDF into `dist/`. Review the exported document before committing it.

## Contact and privacy

The existing recipient remains `mohammad.newaz1@northsouth.edu`. JavaScript submits to FormSubmit's AJAX endpoint; without JavaScript the browser uses the native POST action. Pending, acceptance, failure, timeout, and duplicate prevention are handled explicitly. An accepted response is not proof of inbox delivery.

Recipient activation, provider behavior, and end-to-end mail delivery need an owner-controlled production check. Automated validation does not send a real brief. Keep the visible email alternative and privacy notice. No contact payload is logged or saved locally.

The portfolio no longer loads Supabase in the browser. Historical newsletter code and migrations remain for review, not automatic deployment. See [the Supabase status](SUPABASE_SETUP.md) and [operational follow-ups](docs/operational-followups.md) before enabling any collection flow.

## Releases

`quality.yml` is the reusable gate for CI and deployment. It validates lint, unit and build tests, dependency audits, the production build, SEO, links, and browser behavior. It also installs, audits, typechecks, and builds the separate Tanvora app. The validated Tanvora output is copied to `/tanvora/` before the Pages artifact is uploaded. Deployment uses that exact artifact and is restricted to `main`.

For local Tanvora validation:

```bash
cd tanvora-app
npm ci
npm audit --audit-level=moderate
VITE_BASE_PATH=/tanvora/ npm run build
```

Keep dependency repairs, release changes, and portfolio features in separate commits and pull requests. Roll back by reverting the relevant merged change and letting the same gate rebuild; do not edit deployed artifacts.

Licensed under the [MIT License](LICENSE).
