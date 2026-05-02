# Bravo Build Hub

## Production deploys (Vercel)

Use the standard Vite build for production deployments:

```bash
npm run build
```

`npm run build` runs only `vite build`, so production deploys do **not** depend on Playwright browser binaries.

## Optional static prerendering for SEO pages

Prerendering is available when you intentionally want static rendered HTML output for SEO verification/workflows.

### SEO prerender workflow

1. Install Playwright Chromium:

```bash
npm run prerender:install
```

2. Run SEO build (build + prerender + validation):

```bash
npm run build:seo
```

Equivalent command sequence:

```bash
npm run prerender:install && npm run build:seo
```

### What prerendering does

- `scripts/prerender.mjs` reads `public/sitemap.xml`, keeps only `https://bravomechanicalny.com/*` URLs, and converts them to route pathnames.
- It excludes private/admin routes like `/auth`, `/admin/comments`, and `/admin/crm`.
- It serves `dist`, renders target routes in Playwright Chromium, and writes static HTML files to `dist/index.html` and `dist/<route>/index.html`.

## Additional commands

- Run prerender only:

```bash
npm run prerender
```

- Validate existing prerender output:

```bash
npm run validate:prerender
```
