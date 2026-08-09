---
name: design-taste-frontend
description: Repo-scoped frontend design skill for the MNXTR portfolio. Use for landing-page, portfolio, visual redesign, UI polish, layout, typography, motion, responsive design, and frontend aesthetic work. Do not use for backend-only tasks or data-heavy application dashboards.
---

# Design Taste — MNXTR Portfolio

This is a repo-scoped adaptation inspired by the open-source Taste Skill by Leonxlnx. Apply it to frontend work in this repository while preserving the existing MNXTR brand, copy, accessibility commitments, and technical constraints.

Upstream reference: https://github.com/Leonxlnx/taste-skill

## 1. Read the project before designing

Before changing UI:

1. Read `DESIGN_DIRECTION.md`.
2. Read `package.json` before importing or proposing dependencies.
3. Inspect the actual component/page/CSS files involved in the request.
4. Preserve existing copy, information architecture, and brand unless the user explicitly asks to change them.
5. For redesigns, audit what already works before replacing it.

For this repository, treat the current design direction as the default source of truth:

- technical field-manual character rather than generic SaaS styling;
- dark, restrained visual foundation;
- signal accents used intentionally rather than everywhere;
- strong technical typography and compact interface labels;
- measured, purposeful motion;
- recruiter/product-team readability over decorative complexity.

## 2. Avoid generic AI-looking frontend output

Do not fall back to common generated-layout clichés without a clear project reason. In particular, avoid:

- random purple/blue glow palettes;
- generic centered hero + three equal feature cards;
- glass effects on every surface;
- excessive gradients, floating blobs, or decorative noise;
- arbitrary serif display text simply to look premium;
- identical card grids when the content hierarchy is not identical;
- animation that exists only to make the page feel busy;
- replacing established MNXTR visual language with a fashionable template.

Every visual decision should support hierarchy, readability, credibility, or navigation.

## 3. Design read

Before substantial frontend implementation, infer and briefly state internally or in the work summary:

- page type;
- primary audience;
- intended visual tone;
- what must be preserved;
- the strongest visual hierarchy on the page.

For this portfolio, default toward a developer/engineering portfolio for hiring managers and product teams unless the task clearly indicates otherwise.

## 4. Layout and hierarchy

Prefer clear visual hierarchy over symmetrical filler.

- Use asymmetry only when it improves emphasis or rhythm.
- Keep major content inside a controlled maximum width.
- Use CSS Grid for structured multi-column layouts instead of fragile percentage math.
- Build mobile-first and verify intermediate widths, not only desktop and phone extremes.
- Avoid fixed viewport-height sections that jump on mobile browser chrome.
- Keep interactive targets comfortably usable on touch devices.
- Let spacing communicate grouping; do not use borders and cards as the only grouping mechanism.

## 5. Typography

Typography must feel engineered and intentional.

- Preserve the project’s established font choices when available.
- Use a strong display hierarchy, readable body measure, and monospace only where it reinforces technical meaning.
- Keep paragraph width comfortable for scanning.
- Avoid mixing unrelated type families for decorative emphasis.
- Check line height, wrapping, and clipping at mobile widths.
- Do not introduce a new font unless it solves a real design problem and the project can load it responsibly.

## 6. Color

Use color as signal, not decoration.

- Preserve the existing brand palette unless explicitly asked to redesign it.
- Maintain strong contrast for text and controls.
- Reserve high-saturation accents for actions, state, or meaningful emphasis.
- Avoid multiple competing accent colors in the same local hierarchy.
- Do not rely on color alone to communicate state.

## 7. Motion and interaction

Motion should clarify structure or improve feedback.

Good uses include:

- restrained section reveal;
- navigation orientation;
- hover/focus feedback;
- progress or calibration-style indicators;
- deliberate transitions between interface states.

Avoid constant motion, cursor gimmicks that interfere with control, and scroll hijacking.

Always respect `prefers-reduced-motion`. Interactive effects must not block keyboard use or touch behavior.

## 8. Accessibility and resilience

Accessibility is a design constraint, not a cleanup pass.

- Use semantic HTML.
- Preserve visible keyboard focus.
- Ensure controls have accessible names.
- Check contrast and state clarity.
- Ensure animations have reduced-motion behavior.
- Keep content usable without hover.
- Avoid layout shifts caused by late-loading assets.
- Treat mobile performance as part of usability.

If aesthetic ambition conflicts with accessibility, preserve accessibility.

## 9. Dependencies

Do not assume a package exists.

Before importing any third-party library:

1. check `package.json`;
2. prefer the existing stack where practical;
3. add a dependency only when it provides clear value over native CSS/JS;
4. avoid introducing a second overlapping UI/icon/animation system without a strong reason.

This repository currently uses Vite, Tailwind CSS 3, Three.js, and vanilla/module JavaScript patterns. Do not silently rewrite the project into React, Next.js, or another framework.

## 10. Implementation discipline

When editing existing UI:

- make the smallest coherent change that achieves the requested design goal;
- keep the current copy unless copy changes are requested;
- reuse existing tokens, utilities, and patterns before inventing parallel systems;
- delete obsolete styling created by the change rather than leaving conflicting rules behind;
- preserve SEO, accessibility, and responsive behavior;
- do not fake testimonials, metrics, clients, awards, or project outcomes.

## 11. Pre-flight review

Before considering a frontend task complete, check:

- Does it still look unmistakably like MNXTR rather than a generic template?
- Is the page hierarchy obvious within a few seconds?
- Is the most important action visually clear without shouting?
- Does mobile preserve the same narrative and functionality?
- Are focus, reduced motion, contrast, and touch interactions sound?
- Did the change introduce unnecessary dependencies or visual systems?
- Is motion purposeful?
- Is every decorative element earning its space?
- Did existing content or functionality change unintentionally?

If any answer is no, refine before shipping.
