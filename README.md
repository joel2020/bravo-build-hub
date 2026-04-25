# Bravo Build Hub

## Static prerendering for SEO pages

This project remains a Vite + React + React Router SPA, and now adds a prerender phase after `vite build`.

### How prerendering works

1. `npm run build` runs `vite build`.
2. `postbuild` automatically runs `node scripts/prerender.mjs`.
3. `scripts/prerender.mjs` reads `public/sitemap.xml`, keeps only `https://bravomechanicalny.com/*` URLs, and converts them to route pathnames.
4. It excludes private/admin routes:
   - `/auth`
   - `/admin/comments`
   - `/admin/crm`
5. It starts a local static server for `dist`, opens routes in Playwright Chromium, waits for rendered content + SEO tags, then writes static HTML files to:
   - `dist/index.html` for `/`
   - `dist/<route>/index.html` for other routes

This makes service pages, city pages, blog posts, homepage, reviews, contact, emergency HVAC, and company facts crawlable with rendered HTML before client-side navigation runs.

## Commands

- Build + prerender:

```bash
npm run build
```

- Validate generated prerender output:

```bash
npm run validate:prerender
```

## Post-deploy checks

After deploying, spot check a few SEO pages in “View Source”:

- `/services/ac-repair-westchester-county-ny`
- `/services/boiler-repair-westchester-county-ny`
- `/services/emergency-hvac-repair-westchester-county-ny`
- `/contact`
- `/company-facts`

Confirm each has:

- Route-specific `<title>`
- Meta description
- Canonical link
- JSON-LD (`application/ld+json`)
- Visible page HTML content
