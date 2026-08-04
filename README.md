# Mohammad Mansib Newaz — AI Engineering Portfolio

[![Live site](https://img.shields.io/badge/Live-mnxtr.github.io-0B0F12?style=for-the-badge&logo=github)](https://mnxtr.github.io)
[![CI](https://github.com/mnxtr/mnxtr.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/mnxtr/mnxtr.github.io/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/mnxtr/mnxtr.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/mnxtr/mnxtr.github.io/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)

Production-focused portfolio covering computer vision, LLM/RAG systems, FastAPI services, modern frontend work, and deployment engineering.

## Live preview

[Open the portfolio](https://mnxtr.github.io)

![Portfolio preview](https://github.com/user-attachments/assets/59e53e2b-7dd1-4952-a67f-c9a4974ed996)

## Stack

| Area | Technologies |
|---|---|
| Frontend | Semantic HTML, CSS, JavaScript, Tailwind CSS |
| Visuals | Three.js, responsive animations, reduced-motion support |
| Build | Vite 6, PostCSS, Autoprefixer |
| Quality | ESLint, Prettier, Jest, Testing Library |
| Deployment | GitHub Actions and GitHub Pages |

## Main pages

- `index.html` — landing page and expertise overview
- `project.html` — selected projects and case studies
- `resume.html` — experience and skills
- `about.html` — background and working approach
- `contact.html` — contact information and working submission form
- `blog/` — technical writing

## Local development

### Requirements

- Node.js 24 or newer
- npm

```bash
git clone https://github.com/mnxtr/mnxtr.github.io.git
cd mnxtr.github.io
npm ci
npm run dev
```

The development server runs at `http://localhost:3000`.

### Quality checks

```bash
npm run lint
npm run test:coverage
npm run build
```

Preview the production build at `http://localhost:4173`:

```bash
npm run preview
```

## Deployment

A push to `main` triggers `.github/workflows/deploy.yml`:

1. Install locked dependencies with Node.js 24.
2. Build the multi-page Vite site into `dist/`.
3. Upload the Pages artifact.
4. Deploy through GitHub Pages.

Do not commit `dist/`; deployment artifacts are produced by GitHub Actions.

## Repository policy

- Keep dependency-only fixes separate from design or feature changes.
- Use focused branches and pull requests.
- CI must pass linting, tests, and production build checks before merge.
- Security audits fail on moderate-or-higher dependency vulnerabilities.
- The canonical public identity is **Mohammad Mansib Newaz**.

Legacy experimental applications are preserved on the `archive/legacy-apps-2026-08-04` branch and excluded from production builds.

## Contact

- Email: [mohammad.newaz1@northsouth.edu](mailto:mohammad.newaz1@northsouth.edu)
- GitHub: [github.com/mnxtr](https://github.com/mnxtr)
- LinkedIn: [linkedin.com/in/mansibnewaz](https://linkedin.com/in/mansibnewaz)

## License

Licensed under the [MIT License](LICENSE).
