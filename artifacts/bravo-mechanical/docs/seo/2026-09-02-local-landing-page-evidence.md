# Local landing-page evidence review - 2026-09-02

## Task 10 rollback and corrective release-candidate verification - 2026-09-02

**Current status: ROLLED BACK — corrective commit verified locally; no corrected preview or production release yet.** The original production promotion passed its immediate route and infrastructure gate, but the final whole-branch semantic/regression review found release-critical content and parity problems outside that gate. Under the approved rollback condition, `vercel rollback dpl_8NZZStt8oGFr5GA7abA4RvApXp4L --yes` restored the exact previous production deployment at `2026-09-02T23:57:24Z`. Production remains on that rollback deployment while corrected commit `a47f6e403bc53711c91c8b0b365588aa5763fd75` awaits a new protected preview and separate promotion decision.

### Rollback trigger and restored production

The final review identified six material issue classes in the promoted candidate:

1. Contradictory service-area claims describing 30 cities, 34 cities, and all-county coverage.
2. Incomplete crawler-visible service links in initial HTML.
3. Unsupported health-outcome copy.
4. Service-city pages linked to parent services with mismatched search intent.
5. Crawler/client drift in H1 and structured-data output.
6. Broken empty-neighborhood copy on 26 blog pages.

The rollback command completed successfully in two seconds and restored READY production `dpl_8NZZStt8oGFr5GA7abA4RvApXp4L` at `https://bravo-build-lz4b5l0cu-joel-carias-projects.vercel.app`, sourced from `5c99146071d9db0b873697a07da6cd3d5c27f70d`. Direct alias-to-deployment checks confirmed that `www.bravomechanicalny.com`, `bravomechanicalny.com`, `app.bravomechanicalny.com`, `bravo-build-hub.vercel.app`, and `bravo-build-hub-joel-carias-projects.vercel.app` all resolved to the restored deployment. The public root returned HTTP 200, retained HTML `index, follow`, had no response-level `noindex`, and passed 3/3 security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: SAMEORIGIN`. The apex host returned HTTP 308 to the exact `www` root. The superseded promoted deployment `dpl_EBQ89q2tekUjitsHLJc3ezxUf4Ad` no longer controlled any production alias.

### Consolidated corrective wave and review

The six findings were addressed in one consolidated corrective wave at commit `a47f6e403bc53711c91c8b0b365588aa5763fd75` (`fix: enforce local landing page release invariants`). The original reviewer re-reviewed that corrective commit and returned **APPROVED**, with no Critical or Important findings.

### Controller final verification on corrective HEAD

| Verification surface | Exact result |
|---|---|
| Workspace type checking | 7/7 scoped projects passed. |
| Unit tests | `PORT=4174` run: 8 test files passed; 92/92 tests passed; 0 failed. |
| Local content audit | 54 records audited; 0 errors. |
| Live authoritative sources | 29/29 unique official sources passed. |
| Mutation suite | Passed. |
| Bravo production build | Passed: 2,285 modules transformed and 141 routes prerendered. |
| Smoke gate | Passed. |
| Static local pages | 54/54 passed. |
| React semantic parity | 3/3 parity boundaries passed across all 54 local routes. |
| Bundle boundaries | `ServiceDetail`: 13,263 raw / 3,615 gzip bytes; compact links: 2,814 raw / 421 gzip bytes; editorial baseline: 217,642 raw / 39,703 gzip bytes and absent from the 10-asset production graph. |
| CI configuration | 10/10 checks passed. |
| Local SEO crawl | 141/141 sitemap URLs passed; 0 failed. |
| Hygiene | Diff check clean; port 4174 stopped after verification. |

The workspace-wide build command completed all type-check phases but did **not** complete green locally: it stopped in the unrelated `bravo-mechanical-deck` and `mockup-sandbox` projects because the local macOS environment lacks `lightningcss.darwin-arm64.node`. The required Bravo Mechanical application production build passed independently. Ubuntu CI remains the canonical environment for the workspace-wide build, so this local workspace build interruption is recorded rather than waived or mislabeled as a pass.

No corrected preview has been deployed, no corrected artifact has been promoted, and production remains rolled back to `dpl_8NZZStt8oGFr5GA7abA4RvApXp4L`. No indexing request, bulk indexing action, or sitemap resubmission was made. A settled Search Console review date must be scheduled from the eventual corrected production release date; the previously provisional 2026-09-30 date is no longer release-derived after rollback.

## Task 10 original production promotion and immediate verification - 2026-09-02 (superseded)

**Historical immediate-gate status: PASSED, later superseded by semantic review and rollback.** The exact fully tested preview `dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF` (`https://bravo-build-pkts1wvph-joel-carias-projects.vercel.app`) was promoted without a new source build. Vercel created production copy `dpl_EBQ89q2tekUjitsHLJc3ezxUf4Ad` at `https://bravo-build-k78jdttca-joel-carias-projects.vercel.app`; its metadata records `action=promote`, `originalDeploymentId=dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF`, and source commit `44b6680f5eeb301a32880d63eddb20b14c46eb1a`. At the time of the immediate gate, the public production and custom-domain aliases resolved to that READY production copy. The later whole-branch findings and rollback are the controlling current status recorded above.

### Production identity and timing

| Field | Exact result |
|---|---|
| Promoted immutable artifact | `dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF`; `https://bravo-build-pkts1wvph-joel-carias-projects.vercel.app`; preview status `READY` |
| Production deployment | `dpl_EBQ89q2tekUjitsHLJc3ezxUf4Ad`; `https://bravo-build-k78jdttca-joel-carias-projects.vercel.app`; target `production`; status `READY` |
| Source | GitHub repository `joel2020/bravo-build-hub`, branch `codex/seo-aeo-phase1`, commit `44b6680f5eeb301a32880d63eddb20b14c46eb1a` |
| Promotion timing | Created `2026-09-02T23:26:21.312Z` (`2026-09-02 19:26:21.312 EDT`); building `2026-09-02T23:26:22.557Z`; READY `2026-09-02T23:26:40.071Z` (`2026-09-02 19:26:40.071 EDT`). Created-to-ready was 18.759 seconds and building-to-ready was 17.514 seconds. |
| Production aliases during the immediate gate | `https://www.bravomechanicalny.com`, `https://bravomechanicalny.com`, `https://app.bravomechanicalny.com`, `https://bravo-build-hub.vercel.app`, and `https://bravo-build-hub-joel-carias-projects.vercel.app` |
| Rollback target retained | `dpl_8NZZStt8oGFr5GA7abA4RvApXp4L`; source `5c99146071d9db0b873697a07da6cd3d5c27f70d` |
| Rollback status | Invoked after the later semantic/regression review; restored `dpl_8NZZStt8oGFr5GA7abA4RvApXp4L` at `2026-09-02T23:57:24Z`. |

Before promotion, the candidate was still READY at the approved SHA, `www.bravomechanicalny.com` still resolved to rollback target `dpl_8NZZStt8oGFr5GA7abA4RvApXp4L`, and both the clean worktree HEAD and `origin/codex/seo-aeo-phase1` were `cb6063009ca8942ec9d0a5cef0b51b78ab3216b4`. The only tracked difference from source commit `44b6680f5eeb301a32880d63eddb20b14c46eb1a` was this evidence document. `vercel promote dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF --yes` was the only promotion command; no rebuild, different deployment, source commit, production setting, or protection setting was used.

### Immediate public production gate

| Verification surface | Exact outcome |
|---|---|
| Deployment and alias identity | `www.bravomechanicalny.com` resolved to READY production `dpl_EBQ89q2tekUjitsHLJc3ezxUf4Ad`; Vercel metadata tied it to the approved original deployment and source SHA. |
| Normal production crawler gate | `pnpm run audit:seo` exited 0: 141 sitemap URLs audited; 141 passed; 0 failed against `https://www.bravomechanicalny.com`. |
| Sitemap inventory | 141/141 unique canonical URLs; 0 duplicates or noncanonical origins. |
| Local inventory and membership | 54/54 local routes in the sitemap and live: 34 city routes and 20 service-city routes. |
| Public HTTP and live-build integrity | 141/141 sitemap URLs returned HTTP 200. All 141 production bodies were byte-identical to the same path on the immutable approved preview after removing only Vercel's preview-only feedback-toolbar trailer; that platform trailer appeared on the protected preview homepage and is correctly absent from production. |
| Canonicals and indexability | 141/141 exact self-referencing `https://www.bravomechanicalny.com` canonicals; 141/141 HTML `index, follow`; 141/141 public responses had no preview-level or other `noindex` header. |
| Metadata and H1 | 141/141 had exactly one H1, a nonempty title of at most 65 decoded characters, and a nonempty description of at most 160 decoded characters. |
| Structured data | 610 JSON-LD scripts parsed; 141 `HVACBusiness` nodes and 70 `FAQPage` nodes; 0 parse failures, duplicate `HVACBusiness`, duplicate `FAQPage`, or self-serving `aggregateRating` findings. |
| Local rendered content and FAQ equality | 54/54 local routes contained the reviewed copy, verified contact and phone links, no visible editorial source notes, and exactly one visible copy of each reviewed FAQ; visible/source FAQs equaled `FAQPage` schema on 54/54. |
| Internal links | 344/344 asserted local relationship links, 80/80 same-service cross-city links, and 20/20 parent-to-service-city links passed. Across the full crawl, 2,376 internal-link occurrences resolved to 122/122 unique sitemap targets; 0 extra or broken targets. |
| Redirects | 8/8 configured path redirects returned HTTP 308 with the expected destination; the apex-host redirect functionally returned HTTP 308 from `bravomechanicalny.com` to the exact `www` path. Total: 9/9 configured redirect boundaries. |
| Security and private-route headers | 423/423 global security-header assertions passed across the 141 sitemap responses. `/auth`, `/admin/crm`, and `/proposal/preview-gate` passed 3/3 HTTP 200 plus 3/3 `noindex, nofollow` response-header checks. |
| Cache policies | 1/1 fingerprinted asset returned `Cache-Control: public, max-age=31536000, immutable`; 1/1 sitemap returned `Cache-Control: public, max-age=86400`. |
| Analytics privacy | 6/6 passed: private-path rejection, query/hash rejection, automatic page views disabled, referrer redaction, `ignore_referrer`, and dynamic-only GA loading. |
| Robots and local-content audit | `robots.txt` passed 3/3 allow/canonical-sitemap/no-root-block checks. `pnpm run audit:local-content` exited 0: 54 records audited; 0 errors. |
| Immediate route/infrastructure failures | 0. The later whole-branch semantic/regression review found the six release-critical issue classes above and triggered rollback. |

Vercel CLI `59.11.2` labels `vercel curl` beta. Read-only runner development produced several non-release false positives before the final assertions: raw HTML-entity length versus decoded title length; a report counter that added the separately reported 80 cross-city and 20 parent links to the 344 core relationships; an absolute-only `Location` expectation for valid relative path redirects; a source-text matcher that did not match the shipped private-path regular expression; and the expected Vercel preview feedback-toolbar trailer. Each was narrowed to runner bookkeeping or platform-only preview markup, not an application or production boundary failure. The final corrected checks above passed. No token, bypass secret, or credential was printed or persisted, and no material observability gap remains.

### Superseded Search Console follow-up

The original promotion provisionally set 2026-09-30 as a four-week Search Console review point. Because that release was rolled back, this is no longer the settled review date for the corrected work. A new date must be calculated from the eventual corrected production release. No indexing request, bulk indexing action, or sitemap resubmission was made; the existing production sitemap remains available at `https://www.bravomechanicalny.com/sitemap.xml`.

## Task 9 protected-preview verification - 2026-09-02

**Status: PASSED — protected preview verified; production unchanged.** Git integration built exact release-candidate commit `44b6680f5eeb301a32880d63eddb20b14c46eb1a` from remote branch `codex/seo-aeo-phase1` as protected Vercel preview `dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF` at `https://bravo-build-pkts1wvph-joel-carias-projects.vercel.app`. The deployment was ready at `2026-09-02T22:02:00.287Z` (`2026-09-02 18:02:00.287 EDT`) and the authenticated gate completed with zero failures. No production deployment, promotion, production or custom-domain alias, protection setting, or application setting was changed. Vercel's managed Git branch-preview alias is intentionally moving: it advances automatically to the latest preview after every push to `codex/seo-aeo-phase1`, including documentation-only evidence pushes.

### Deployment identity and build evidence

| Field | Exact result |
|---|---|
| Vercel project | `bravo-build-hub` (`prj_PMkYLTbm4bRZmXPjnP4a7ENqNfbG`), team `joel-carias-projects` (`team_EMDpI0zAemC52GgIiDU4bmE9`) |
| Authenticated CLI identity | `joelcarias23-9817`; local CLI `59.11.2` |
| Fully tested immutable preview | `dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF`; `https://bravo-build-pkts1wvph-joel-carias-projects.vercel.app` |
| Target and status | `preview`; `READY` |
| Source | GitHub repository `joel2020/bravo-build-hub`, branch `codex/seo-aeo-phase1`, commit `44b6680f5eeb301a32880d63eddb20b14c46eb1a` |
| Framework and output | Vite; `dist/public`; Node `24.x`; pnpm `10.28.1` |
| Timing | Created `2026-09-02T22:01:39.347Z`; building `2026-09-02T22:01:42.325Z`; ready `2026-09-02T22:02:00.287Z`. Building-to-ready was 17.962 seconds and created-to-ready was 20.940 seconds. Vercel's build log reported `Build Completed in /vercel/output [14s]` and `Deployment completed` at `2026-09-02T22:02:00.579Z`. |
| Build output | 2,283 modules transformed; 141 sitemap URLs written; 141 route HTML files injected. No build warning or error was reported. |

`vercel ls bravo-build-hub --meta githubCommitSha=44b6680f5eeb301a32880d63eddb20b14c46eb1a --json --limit 2`, `vercel inspect dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF --json`, and `vercel inspect dpl_8BHWXRPhZCe1zhZwXcZXyMbGDjYF --logs` independently tied the READY preview, build log, Git branch, and exact source SHA together. The fully tested immutable preview remains the build of `44b6680f5eeb301a32880d63eddb20b14c46eb1a`; later documentation-only previews are not substitutes for that crawled artifact.

After the initial evidence-only push of commit `5c78ad217d8b7a67d8bc58c16609957197a10898`, Vercel created READY documentation-only preview `dpl_9AvaYNw1aq4q1Nz43Q7Mp3YWms16` at `https://bravo-build-nx9a2u710-joel-carias-projects.vercel.app` and automatically advanced `https://bravo-build-hub-git-codex-seo-aeo-phase1-joel-carias-projects.vercel.app` to it. That moving branch alias was inspected but not subjected to the full 141-URL authenticated crawl. Any later documentation push may advance the managed alias again; the approval candidate is the immutable tested URL and deployment ID above.

### Authenticated preview gate

Every HTTP request used the caller's existing Vercel authentication with the exact protected-deployment request form `vercel curl <path> --deployment bravo-build-pkts1wvph-joel-carias-projects.vercel.app -- --silent --show-error --max-time 30 --dump-header - --output -`. Deployment Protection remained enabled; no token or bypass secret was printed, persisted, or committed.

| Verification surface | Exact outcome |
|---|---|
| Sitemap inventory | 141/141 unique canonical URLs present; 0 duplicate or noncanonical origins. |
| Local inventory and membership | 54/54 local routes present in the sitemap: 34 city routes and 20 service-city routes. |
| Authenticated HTTP crawl | 141/141 sitemap URLs returned HTTP 200. |
| Crawler-visible page structure | 141/141 had exactly one H1; 141/141 had a nonempty title of at most 65 characters; 141/141 had a nonempty description of at most 160 characters. |
| Canonicals and HTML robots | 141/141 had the exact self-referencing `https://www.bravomechanicalny.com` canonical; 141/141 retained crawler-intended `index, follow` HTML metadata without HTML `noindex`. |
| Protected-preview isolation | 141/141 sitemap responses carried Vercel's preview-level `X-Robots-Tag: noindex`. |
| Structured data | 610 JSON-LD scripts parsed; 141 `HVACBusiness` nodes and 70 `FAQPage` nodes found; 0 parse failures, duplicate `HVACBusiness`, duplicate `FAQPage`, or self-serving `aggregateRating` findings. |
| Local rendered content | 54/54 local routes contained the reviewed copy, exactly one visible copy of every reviewed FAQ, the verified contact and phone links, and no visible editorial source notes. |
| Internal links | 344/344 asserted local relationship links, 80/80 same-service cross-city links, and 20/20 parent-to-service-city links passed. Across the sitemap crawl, 2,376 internal-link occurrences resolved to 122/122 unique sitemap targets; 0 extra or broken targets were found. |
| Redirects | 8/8 path redirects returned HTTP 308 with the expected destination. The exact inspected deployment config contained the one permanent apex-host redirect, so all 9/9 configured redirect boundaries passed. |
| Security and private-route headers | 423/423 global security-header assertions passed across the 141 sitemap responses: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: SAMEORIGIN`. `/auth`, `/admin/crm`, and `/proposal/preview-gate` passed 3/3 HTTP 200 plus `noindex, nofollow` checks. |
| Cache policies | 1/1 fingerprinted asset returned `Cache-Control: public, max-age=31536000, immutable`; 1/1 sitemap returned `Cache-Control: public, max-age=86400`. |
| Analytics privacy | 6/6 passed: private-path rejection, query/hash rejection, automatic page views disabled, referrer redaction, `ignore_referrer`, and dynamic-only GA loading. |
| Local duplicate/claim audit | `pnpm run audit:local-content` exited 0: 54 local landing-page records audited; 0 errors. |
| Gate total | 0 confirmed boundary failures; 0 authenticated-request warnings. |

Vercel CLI labels `vercel curl` as beta. Two preliminary gate-runner starts placed the optional global `--no-color` flag where this beta command forwarded it to the system curl; curl rejected the unsupported option before making a request. The final gate omitted that optional flag and passed. This was a local orchestration correction, not a preview response or application failure.

The host-conditioned `bravomechanicalny.com` redirect cannot be exercised against the protected deployment hostname without reassigning a production alias. The exact deployed preview configuration was inspected instead and matched the required permanent apex-to-`www` rule. Functional production-host verification remains part of the separately approved production gate.

### Version-control and production-unchanged evidence

The initial isolated worktree was clean on branch `codex/local-landing-pages` at `44b6680f5eeb301a32880d63eddb20b14c46eb1a`. The required command `git fetch origin codex/seo-aeo-phase1 && git merge-base --is-ancestor origin/codex/seo-aeo-phase1 HEAD && git push origin HEAD:codex/seo-aeo-phase1` exited 0 and fast-forwarded the remote branch from `5c99146` to `44b6680` without merge, rebase, or force.

Before and after the preview gate, `vercel inspect www.bravomechanicalny.com --json` resolved production to the same READY deployment `dpl_8NZZStt8oGFr5GA7abA4RvApXp4L` at `https://bravo-build-lz4b5l0cu-joel-carias-projects.vercel.app`, created from commit `5c99146071d9db0b873697a07da6cd3d5c27f70d`. Its production and custom-domain aliases remained `https://www.bravomechanicalny.com`, `https://bravomechanicalny.com`, `https://app.bravomechanicalny.com`, and the established project production aliases. Production was not promoted or redeployed. The separately managed Git branch-preview alias did advance automatically after the evidence-only push described above; that movement did not affect production.

## Task 8 local release-candidate verification - 2026-09-02

**Status: VERIFIED — ready for protected preview.** Every required local application, live authoritative-source, build, static-page, internal-link, schema, and crawler gate passed. Verification ran against branch `codex/local-landing-pages` at candidate commit `cac8dbad3b43b7099ae84851c99ca6fa7a2c9d2e` from 17:51 through 17:53 EDT (21:51 through 21:53 UTC).

### Required command results

| Command | Exit | Exact result |
|---|---:|---|
| `pnpm run audit:local-content` | 0 | 54 local landing-page records audited; 0 errors. |
| `node scripts/local-landing-content.mjs --live-sources` | 0 | 54 local landing-page records audited; 0 errors; 29 official sources checked live. A read-only per-URL confirmation using the same request headers recorded HTTP 200 for all 29. |
| `pnpm run typecheck` | 0 | `tsc -p tsconfig.json --noEmit` completed with no diagnostics. |
| `PORT=4174 pnpm run test` | 0 | Vitest: 5 test files passed (5); 75 tests passed (75); 0 failed. |
| `pnpm run build` | 0 | Vite transformed 2,283 modules; sitemap generation wrote exactly 141 URLs; metadata injection wrote exactly 141 per-route HTML files. |
| `pnpm run test:e2e` | 0 | The smoke script passed its homepage, CTA, robots.txt, sitemap.xml, llms.txt, and core-route assertions. The script does not emit an assertion count. |
| `node tests/local-landing-pages.mjs` | 0 | Dedicated local landing-page checks passed exactly 54 routes: 34 city routes and 20 service-city routes. |
| `PORT=4174 pnpm run serve` | running until audit completed | Port 4174 was clear before startup. The built preview became ready at `http://localhost:4174/`; readiness request returned success; the listener was PID 91839. |
| `pnpm run audit:seo:local` | 0 | 141 sitemap URLs audited; 141 passed; 0 failed against the built local preview. |
| Preview cleanup check | 0 | Sent an interrupt only to the preview session started for this audit. PID 91839 no longer existed and port 4174 had no listening process afterward. |

Final gate warnings: none. Interrupting the long-running preview command produced the package runner's expected non-zero shutdown status after the successful audit; the independent PID and port checks above confirmed clean termination.

### Request-identification correction

The first verification at commit `6bb38d4912d1f3eb8b864cb9292f61b4dbcea3e1` correctly failed rather than masking 61 route-level HTTP 403 responses from two New York State hosts, even though follow-up curl GETs returned HTTP 200. Commit `cac8dbad3b43b7099ae84851c99ca6fa7a2c9d2e` corrected that client-dependent rejection by applying the same transparent headers to every official-source request: `User-Agent: BravoMechanicalLinkVerifier/1.0 (+https://www.bravomechanicalny.com/contact)` and `Accept: text/html,application/pdf;q=0.9,*/*;q=0.8`.

The implementation contains no URL-specific exception, allowlist bypass, ignored status, or 403 waiver. Its regression coverage observes two representative source requests, asserts that both receive the request identity, redirect following, and accepted content types, and confirms that a simulated HTTP 503 remains an audit error. The fresh required live run then checked the complete 29-URL catalog with 0 errors.

### Live authoritative-source results

The required live command uses Node `fetch` with redirects enabled, transparent request-identification headers, and a 20-second timeout. It deduplicates identical URLs and treats every non-2xx response or request error as a failure for each affected route. The command checked all 29 unique authoritative URLs and exited 0 with 54 records audited and 0 errors.

The following read-only command produced the per-URL status and redirect evidence in the table below. Run it from `artifacts/bravo-mechanical`. It reads the reviewed JSON, deduplicates sources while retaining route-reference counts, applies the production verifier's headers and redirect/timeout behavior, prints each requested and final URL, and exits non-zero if any source fails. The implementation plan authorizes only this evidence document as a tracked Task 8 artifact, so no separate result file was added; stdout was captured in the Task 8 verification tool transcript and transcribed into the table. Its summary was `UNIQUE_SOURCES=29`, `PASS=29`, and `FAIL=0`.

```bash
node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile('src/content/localLandingPages.json', 'utf8'));
const routesByUrl = new Map();
const add = (route, source) => {
  if (!source?.url) return;
  const routes = routesByUrl.get(source.url) ?? new Set();
  routes.add(route);
  routesByUrl.set(source.url, routes);
};

for (const [slug, city] of Object.entries(data.cities)) {
  for (const source of city.municipalResources ?? []) add(`/service-areas/${slug}`, source);
  for (const source of city.sourceNotes ?? []) add(`/service-areas/${slug}`, source);
}
for (const [key, page] of Object.entries(data.serviceCities)) {
  for (const source of page.sourceNotes ?? []) add(`/services/${key}`, source);
}

const headers = {
  Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
  'User-Agent': 'BravoMechanicalLinkVerifier/1.0 (+https://www.bravomechanicalny.com/contact)',
};
const results = await Promise.all([...routesByUrl].map(async ([url, routes]) => {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers,
      signal: AbortSignal.timeout(20_000),
    });
    return { url, routes: routes.size, status: response.status, final: response.url, ok: response.ok };
  } catch (error) {
    return { url, routes: routes.size, status: 'FETCH_ERROR', final: error.message, ok: false };
  }
}));

results.sort((left, right) => left.url.localeCompare(right.url));
console.log(`UNIQUE_SOURCES=${results.length}`);
console.log(`PASS=${results.filter((result) => result.ok).length}`);
console.log(`FAIL=${results.filter((result) => !result.ok).length}`);
for (const result of results) {
  console.log(`${result.status}\t${result.routes}\t${result.url}\t${result.final}`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
NODE
```

The captured output recorded HTTP 200 for every URL; there were no timeouts, DNS errors, connection failures, or non-2xx responses.

#### HTTP 200 — 29 unique URLs

| Route references | Authoritative source URL | Redirect outcome |
|---:|---|---|
| 1 | https://bedfordny.gov/180/Forms-Applications | None |
| 2 | https://bedfordny.gov/1884/The-Hamlets-of-Bedford | None |
| 34 | https://dos.ny.gov/system/files/documents/2025/01/localgovernmenthandbook_2024.pdf | None |
| 1 | https://greenburghny.com/DocumentCenter/View/1948/Adopted-Comprehensive-Plan-Reduced-Size-PDF | None |
| 1 | https://www.cityofwhiteplains.com/115/Building-Permits-Applications | None |
| 1 | https://www.cityofwhiteplains.com/123/Inspection-Information | None |
| 2 | https://www.cityofwhiteplains.com/86/Building | None |
| 38 | https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet | None |
| 4 | https://www.energystar.gov/saveathome/heating-cooling/hvac-quality-installation | None |
| 10 | https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist | None |
| 1 | https://www.epa.gov/air-quality/indoor-air-quality | None |
| 5 | https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home | None |
| 2 | https://www.epa.gov/indoor-air-quality-iaq/improving-indoor-air-quality | None |
| 1 | https://www.epa.gov/indoor-air-quality-iaq/ozone-generators-are-sold-air-cleaners | None |
| 2 | https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home | None |
| 4 | https://www.mountvernonny.gov/187/Buildings | None |
| 1 | https://www.mynewcastleny.gov/ | None |
| 1 | https://www.newrochelleny.gov/237/Building-Permits | None |
| 3 | https://www.newrochelleny.gov/DocumentCenter/View/20595/GreenNR-Climate-Action-Plan-Update-2025 | None |
| 1 | https://www.northcastleny.com/213/Customers-Guide-to-the-Building-Permit-P | HTTP 200 at `https://www.northcastleny.gov/DocumentCenter/View/272/A-Customers-Guide-to-the-Building-Permit-Process-PDF` |
| 1 | https://www.northcastleny.com/DocumentCenter/View/291/Town-of-North-Castle-Hamlet-Design-Guidelines-PDF | HTTP 200 at `https://www.northcastleny.gov/DocumentCenter/View/291/Town-of-North-Castle-Hamlet-Design-Guidelines-PDF` |
| 27 | https://www.ny.gov/counties/westchester | None |
| 36 | https://www.nyserda.ny.gov/Residents-and-Homeowners/Heat-and-Cool-Your-Home/Heating-Systems | None |
| 1 | https://www.scarsdale.gov/169/Building | None |
| 3 | https://www.scarsdale.gov/DocumentCenter/View/8645/Mechanical-Heating-Application | None |
| 1 | https://www.tax.ny.gov/research/property/osc_table4.htm | None |
| 2 | https://www.yonkersny.gov/217/Housing-Buildings | None |
| 2 | https://www.yonkersny.gov/229/Forms-Permits | None |
| 2 | https://www.yonkersny.gov/235/Housing-Code-Enforcement | None |

### Route, metadata, indexability, schema, and link outcomes

| Verification surface | Exact outcome |
|---|---|
| Local inventory | 54/54 generated local routes present: 34 city routes plus 20 service-city routes. |
| Sitemap and static output | 141 sitemap URLs and 141 generated route HTML files. |
| Local preview crawl | 141/141 sitemap URLs returned HTTP 200; 0 failed. |
| Titles and descriptions | Present on 141/141 generated route HTML files; smoke checks also enforced title length at most 65 characters and description length at most 160 characters. |
| H1 | Exactly one crawler-visible H1 on 141/141 generated route HTML files. |
| Canonical | Correct self-referencing production canonical on 141/141 generated route HTML files. |
| Indexability | Explicit `index, follow` metadata on 141/141 generated route HTML files; 0 contained `noindex`. `robots.txt` allowed crawling and referenced the canonical sitemap; private routes remained excluded/noindex by deployment configuration and absent from the sitemap. |
| Structured data | JSON-LD parsed on all generated pages. There were 141 `HVACBusiness` nodes and 70 `FAQPage` nodes; 0 pages had duplicate `HVACBusiness`, 0 had duplicate `FAQPage`, and 0 contained self-serving `aggregateRating` markup. |
| Local crawler-visible content | 54/54 local routes contained the reviewed copy and exactly one visible copy of each reviewed FAQ; editorial source notes were not exposed in the rendered body. |
| Local calls to action | 54/54 local routes contained the verified `/contact` link and `tel:+19143619142`. |
| Intentional relationships | Every asserted related city, related guide, city hub, parent service, and related service link resolved to a generated route and had meaningful anchor text. All 80 expected same-service cross-city links passed, and each applicable parent service linked to its service-city children. No blank, `undefined`, or `null` visible anchor label was found on the 54 local routes. |

### Search Console baseline and remaining uncertainty

The known baseline is the Google Search Console Page Indexing report last updated 2026-08-27: 114 indexed pages and 77 non-indexed pages. Of the sitemap's 141 discovered URLs, 63 were non-indexed: 40 `Discovered - currently not indexed`, 18 `Alternate page with proper canonical tag`, 3 `Duplicate without user-selected canonical`, and 2 `Crawled - currently not indexed`. The discovered-not-indexed group included 29 priority local pages: 15 city routes and 14 service-city routes.

Local verification establishes accessibility, self-canonicals, indexability, structured data, crawler-visible content, and internal discovery; it cannot establish when Google will crawl a URL or whether Google will select it for indexing. No bulk indexing request or sitemap resubmission was made. A settled post-deployment Search Console comparison remains required after an approved preview and production release. With the live-source gate now passing, this exact candidate is ready for protected-preview verification; production promotion still requires the plan's separate approval and public checks.

## Review method

All material locality claims were checked against primary government sources. Each ledger row identifies the concrete jurisdiction or locality claim retained and the official source that supports it. New York State municipal sources support government structure; route-specific Town, Village, or City sources support named local relationships and process references; NYSERDA supports system-configuration planning; and the U.S. Consumer Product Safety Commission supports carbon-monoxide boundaries.

The content does not turn postal names, ZIP Codes, neighborhoods, building styles, fuel types, or nearby routes into prevalence claims. Permit language assigns verification rather than claiming that Bravo Mechanical files, coordinates, or closes permits.

## ZIP and neighborhood handling

The seeded Yonkers value 10701 remains removed. No reviewed authoritative source established an exhaustive service-boundary ZIP list, so every zips and neighborhoods array remains empty and cannot be presented as a complete boundary list.

| City route | Primary intent | Official source supporting retained claim | Concrete claim retained | City-specific claims removed or qualified | Reviewed |
|---|---|---|---|---|---|
| /service-areas/yonkers | HVAC company serving Yonkers | City of Yonkers forms and permits: https://www.yonkersny.gov/229/Forms-Permits | Yonkers is a city with its own Department of Housing and Buildings, which publishes permit applications and filing resources. | Removed or qualified single ZIP, universal boiler or multifamily patterns, blanket permit handling. | 2026-09-02 |
| /service-areas/white-plains | HVAC company serving White Plains | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists White Plains as a Westchester city, so City guidance is the starting point for local project requirements. | Removed or qualified recurring commercial volume, typical equipment, fixed scheduling. | 2026-09-02 |
| /service-areas/new-rochelle | HVAC company serving New Rochelle | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists New Rochelle as a Westchester city, making City sources relevant when verifying local requirements. | Removed or qualified waterfront housing, coastal humidity, prevalent system types. | 2026-09-02 |
| /service-areas/mount-vernon | HVAC company serving Mount Vernon | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Mount Vernon as a Westchester city; current City channels should be used for code, permit, and inspection questions. | Removed or qualified boiler age, conversion volume, apartment-plan frequency, temperature extremes. | 2026-09-02 |
| /service-areas/scarsdale | HVAC company serving Scarsdale | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | Scarsdale is a coterminous town-village under New York's local-government structure, so current Village/Town guidance should be checked. | Removed or qualified prestige and architecture labels, HEPA outcomes, common projects. | 2026-09-02 |
| /service-areas/rye | HVAC company serving Rye | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Rye as a city distinct from the Town of Rye; confirm that the address is inside the City before relying on City requirements. | Removed or qualified universal coastal exposure, large-home assumptions, corrosion prescriptions. | 2026-09-02 |
| /service-areas/harrison | HVAC company serving Harrison | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | Harrison is a coterminous town-village under New York's local-government structure, making the Town/Village the municipal reference within its boundaries. | Removed or qualified office-park volume, estate work, heat-pump popularity, cold pockets. | 2026-09-02 |
| /service-areas/mamaroneck | HVAC company serving Mamaroneck | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists both a Town of Mamaroneck and a Village of Mamaroneck, so the shared place name does not establish jurisdiction. | Removed or qualified harbor humidity, waterfront housing, common boilers, universal IAQ needs. | 2026-09-02 |
| /service-areas/larchmont | HVAC company serving Larchmont | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State places the Village of Larchmont within the Town of Mamaroneck; Village guidance is the starting point inside Village boundaries. | Removed or qualified Tudor or Colonial prevalence, slate-roof scenarios, salt exposure. | 2026-09-02 |
| /service-areas/bronxville | HVAC company serving Bronxville | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Bronxville as a village within the Town of Eastchester; work inside Village boundaries should be checked against Village requirements. | Removed or qualified architectural-protection generalizations, prewar prevalence, steam-conversion frequency. | 2026-09-02 |
| /service-areas/tuckahoe | HVAC company serving Tuckahoe | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Tuckahoe as a village within the Town of Eastchester, so Village sources apply to addresses inside its boundaries. | Removed or qualified dominant furnace or boiler needs, utilization, localized weather. | 2026-09-02 |
| /service-areas/eastchester | HVAC company serving Eastchester | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Eastchester as a town containing the villages of Bronxville and Tuckahoe, so the address must determine the governing municipality. | Removed or qualified duct-sealing savings, housing eras, water-heater volume, contract frequency. | 2026-09-02 |
| /service-areas/tarrytown | HVAC company serving Tarrytown | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Tarrytown as a village within the Town of Greenburgh, making Village guidance the municipal starting point. | Removed or qualified electrification popularity, boiler volume, river microclimates, damp basements. | 2026-09-02 |
| /service-areas/sleepy-hollow | HVAC company serving Sleepy Hollow | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Sleepy Hollow as a village within the Town of Mount Pleasant; current Village requirements should be verified. | Removed or qualified historic-home prevalence, weekly work, river humidity, equipment longevity. | 2026-09-02 |
| /service-areas/ossining | HVAC company serving Ossining | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists both a Town of Ossining and a Village of Ossining, so the place name alone cannot select the responsible authority. | Removed or qualified elevation-driven cold, dry winters, prevalent equipment. | 2026-09-02 |
| /service-areas/peekskill | HVAC company serving Peekskill | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Peekskill as a Westchester city, making City information the starting point for local approvals and inspections. | Removed or qualified historic homes, condominium prevalence, rooftop-unit volume, colder winters. | 2026-09-02 |
| /service-areas/mount-kisco | HVAC company serving Mount Kisco | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | Mount Kisco is a coterminous town-village under New York's local-government structure, making Town/Village resources the municipal reference. | Removed or qualified wooded-lot pollen, equipment preferences, colder conditions, backup fuels. | 2026-09-02 |
| /service-areas/chappaqua | HVAC company serving Chappaqua | Town of New Castle official website and permit links: https://www.mynewcastleny.gov/ | The Town of New Castle's official website identifies Chappaqua as one of its hamlets and provides Town permit links. | Removed or qualified large wooded homes, premium equipment, geothermal interest, local cold. | 2026-09-02 |
| /service-areas/pleasantville | HVAC company serving Pleasantville | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Pleasantville as a village within the Town of Mount Pleasant, so current Village information applies inside its boundaries. | Removed or qualified vintage-versus-new housing patterns, routine equipment work, generalized weather. | 2026-09-02 |
| /service-areas/pound-ridge | HVAC company serving Pound Ridge | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Pound Ridge as a Westchester town, making Town sources the place to verify local requirements. | Removed or qualified universal propane, oil, wells, large lots, coldest-county conditions. | 2026-09-02 |
| /service-areas/bedford | HVAC company serving Bedford | Town of Bedford — the hamlets of Bedford: https://bedfordny.gov/1884/The-Hamlets-of-Bedford | New York State lists Bedford as a town, and the Town's official site identifies Bedford Village, Bedford Hills, and Katonah as its three hamlets. | Removed or qualified estate-home patterns, geothermal interest, hidden installations, severe winters. | 2026-09-02 |
| /service-areas/katonah | HVAC company serving Katonah | Town of Bedford — the hamlets of Bedford: https://bedfordny.gov/1884/The-Hamlets-of-Bedford | The Town of Bedford's official site identifies Katonah as a hamlet, and the separate Town forms source includes HVAC work. | Removed or qualified universal Victorian housing, coldest-day practices, common boilers, popular retrofits. | 2026-09-02 |
| /service-areas/armonk | HVAC company serving Armonk | Town of North Castle — Hamlet Design Guidelines: https://www.northcastleny.com/DocumentCenter/View/291/Town-of-North-Castle-Hamlet-Design-Guidelines-PDF | The Town guidelines identify Armonk as a hamlet overlay area; the separate permit guide directs project questions to the Town Building Department. | Removed or qualified large wooded properties, geothermal interest, cold microclimates, routine high-end work. | 2026-09-02 |
| /service-areas/hastings-on-hudson | HVAC company serving Hastings-on-Hudson | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Hastings-on-Hudson as a village within the Town of Greenburgh, so Village guidance applies inside Village boundaries. | Removed or qualified historic housing, vintage boiler volume, ductless popularity, river humidity. | 2026-09-02 |
| /service-areas/dobbs-ferry | HVAC company serving Dobbs Ferry | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Dobbs Ferry as a village within the Town of Greenburgh, making Village guidance the local reference. | Removed or qualified common heat pumps or boilers, construction patterns, sharp cold, guaranteed savings. | 2026-09-02 |
| /service-areas/irvington | HVAC company serving Irvington | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Irvington as a village within Greenburgh; current Village requirements should be verified inside municipal boundaries. | Removed or qualified Hudson-view framing, hidden-install prevalence, large homes, river humidity. | 2026-09-02 |
| /service-areas/briarcliff-manor | HVAC company serving Briarcliff Manor | New York State table of villages in more than one town: https://www.tax.ny.gov/research/property/osc_table4.htm | New York State records Briarcliff Manor as a village in both the towns of Ossining and Mount Pleasant, so the exact address matters. | Removed or qualified estate and subdivision patterns, common multi-zone or boiler work, colder winters. | 2026-09-02 |
| /service-areas/croton-on-hudson | HVAC company serving Croton-on-Hudson | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Croton-on-Hudson as a village within the Town of Cortlandt, so Village sources apply inside its boundaries. | Removed or qualified universal hillside, river, bay, humidity, elevation, common equipment. | 2026-09-02 |
| /service-areas/yorktown | HVAC company serving Yorktown | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Yorktown as a Westchester town; a postal place name should not substitute for address verification. | Removed or qualified exhaustive hamlets or ZIPs, widespread oil or propane, lakefront homes, colder conditions. | 2026-09-02 |
| /service-areas/somers | HVAC company serving Somers | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Somers as a Westchester town, making Town information the starting point for local project questions. | Removed or qualified rural-suburban and large-lot claims, condo prevalence, fuel mix, conversion popularity. | 2026-09-02 |
| /service-areas/ardsley | HVAC company serving Ardsley | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Ardsley as a village within the Town of Greenburgh, so Village guidance should be checked for the property. | Removed or qualified population, construction era, duct-loss savings, valley humidity, common calls. | 2026-09-02 |
| /service-areas/hartsdale | HVAC company serving Hartsdale | Town of Greenburgh comprehensive plan: https://greenburghny.com/DocumentCenter/View/1948/Adopted-Comprehensive-Plan-Reduced-Size-PDF | Hartsdale is absent from New York State's city, town, and village inventory, while Greenburgh's comprehensive plan documents Hartsdale locations in Town planning. | Removed or qualified prewar, cooperative, condominium, corridor-housing, climate prevalence. | 2026-09-02 |
| /service-areas/pelham | HVAC company serving Pelham | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists a Town of Pelham containing the Village of Pelham and Village of Pelham Manor, so the address must identify the municipality. | Removed or qualified commuter-suburb history, universal prewar construction, common steam work, guaranteed fixes. | 2026-09-02 |
| /service-areas/port-chester | HVAC company serving Port Chester | New York State — Westchester County municipalities: https://www.ny.gov/counties/westchester | New York State lists Port Chester as a village within the Town of Rye, making Village requirements the starting point inside its boundaries. | Removed or qualified density, river exposure, housing stock, restaurant or storefront volume, boiler prevalence. | 2026-09-02 |

## Service-city technical evidence

The service-city review used only official federal, state, and municipal material. [ENERGY STAR HVAC Quality Installation](https://www.energystar.gov/saveathome/heating-cooling/hvac-quality-installation) supports property-based sizing, manufacturer airflow targets, and refrigerant verification. [ENERGY STAR's Maintenance Checklist](https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist) supports filter, coil, condensate, airflow, control, electrical, fuel, combustion, and refrigerant context while distinguishing appropriate professional work. The [NYSERDA heating-system guide](https://www.nyserda.ny.gov/Residents-and-Homeowners/Heat-and-Cool-Your-Home/Heating-Systems) supports distribution-specific planning without asserting local prevalence. Two retired Department of Energy URLs used in the first review were removed from all records and this ledger after returning HTTP 404.

Indoor-air-quality copy follows EPA's hierarchy of source control, clean-air ventilation, and supplemental filtration. The relevant official material is [EPA's air-cleaner and filter guide](https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home), [EPA's indoor-air improvement guide](https://www.epa.gov/indoor-air-quality-iaq/improving-indoor-air-quality), [EPA's moisture and mold guide](https://www.epa.gov/mold/brief-guide-mold-moisture-and-your-home), and [EPA's warning on ozone generators](https://www.epa.gov/indoor-air-quality-iaq/ozone-generators-are-sold-air-cleaners). No device is said to remove every pollutant or deliver a health outcome. The [CPSC carbon-monoxide fact sheet](https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet) supports repeated alarm and evacuation language where the same life-safety hazard applies.

| Service-city route | Official technical source(s) | Why this route's advice differs | Business claim removed or qualified | Reviewed |
|---|---|---|---|---|
| /services/hvac-installation/yonkers | Yonkers Housing and Buildings: https://www.yonkersny.gov/217/Housing-Buildings; Yonkers forms and permits: https://www.yonkersny.gov/229/Forms-Permits; ENERGY STAR quality installation | Housing and Buildings supplies the City property-record and permit-application channels used for address-specific ownership and access checks; Forms and Permits supports only the separate current permit-form and filing reference. | Removed free quotes, staff-training/subcontractor claims, Manual J on every job, blanket permit coordination, fixed pricing, and universal timelines. | 2026-09-02 |
| /services/hvac-installation/white-plains | White Plains building permits: https://www.cityofwhiteplains.com/115/Building-Permits-Applications; ENERGY STAR quality installation | The City publishes separate boiler/HVAC and rigging/hoisting requirements, so equipment placement, access, and the applicable permit category are property-specific planning inputs. | Qualified sizing, commissioning, scheduling, access, pricing, and municipal responsibilities to the actual proposal. | 2026-09-02 |
| /services/hvac-installation/new-rochelle | New Rochelle building permits: https://www.newrochelleny.gov/237/Building-Permits; NYSERDA systems; ENERGY STAR quality installation | The City directs applicants to its current permit system and State code interpretations, while the route maps distribution, line-set, drainage, electrical, and plumbing changes for the exact scope. | Removed assumptions that existing heating distribution can carry cooling or that a room count determines ductless head count. | 2026-09-02 |
| /services/hvac-installation/mount-vernon | Mount Vernon Buildings: https://www.mountvernonny.gov/187/Buildings; NYSERDA systems | The Department reviews construction, repair, alteration, electrical, and plumbing applications and oversees older multifamily properties, so current use and affected spaces precede system selection. | Removed universal electrification outcomes, equipment-only boiler sizing, permit handling, fixed schedule, and blanket commissioning claims. | 2026-09-02 |
| /services/hvac-installation/scarsdale | Scarsdale mechanical-heating form: https://www.scarsdale.gov/DocumentCenter/View/8645/Mechanical-Heating-Application; ENERGY STAR quality installation | The Village form distinguishes hot-water, hydro-air, and steam systems and requests a location diagram and manufacturer clearances, making those project-specific design inputs. | Removed architecture, home-size, and premium-equipment generalizations; qualified sizing and startup to the selected system and site. | 2026-09-02 |
| /services/hvac-repair/yonkers | Yonkers Housing Code Enforcement: https://www.yonkersny.gov/235/Housing-Code-Enforcement; ENERGY STAR maintenance; CPSC carbon monoxide | The City inspects apartment houses and multiple residences and investigates insufficient heat or hot water, so intake distinguishes the affected unit, common area, and responsible contact. | Removed fast-response, licensed-technician, guaranteed timing, universal age, and repair-cost-percentage claims. | 2026-09-02 |
| /services/hvac-repair/white-plains | White Plains Building: https://www.cityofwhiteplains.com/86/Building; ENERGY STAR maintenance | The Department's oversight expressly includes repair, use, occupancy, and ventilation, so diagnosis is separated from any alteration or ventilation change requiring a current City check. | Qualified urgent and after-hours scheduling to current availability and removed universal serviceability or response promises. | 2026-09-02 |
| /services/hvac-repair/new-rochelle | New Rochelle GreeNR 2025: https://www.newrochelleny.gov/DocumentCenter/View/20595/GreenNR-Climate-Action-Plan-Update-2025; ENERGY STAR maintenance | The City plan identifies intense storms, higher temperatures, precipitation changes, and flooding risk, so property weather and water history is checked before labeling water as condensate. | Removed definitive diagnosis from symptoms, universal repair outcomes, and any homeowner refrigerant or pressurized-drain instruction. | 2026-09-02 |
| /services/hvac-repair/mount-vernon | Mount Vernon Buildings: https://www.mountvernonny.gov/187/Buildings; CPSC carbon monoxide; ENERGY STAR maintenance | The Department monitors existing structures, oversees older multifamily properties, and reviews repairs, so affected dwelling/common space and access are identified before technical diagnosis. | Removed universal reset, fill, vent, purge, pressure, and repair-versus-replace rules; explicitly forbids cycling equipment during gas, smoke, fire, CO-alarm, leak, or other warnings. | 2026-09-02 |
| /services/hvac-repair/scarsdale | Scarsdale mechanical-heating form: https://www.scarsdale.gov/DocumentCenter/View/8645/Mechanical-Heating-Application; ENERGY STAR maintenance | The Village form distinguishes system types and requires operating, maintenance, and shutdown instructions, so repair intake identifies the installed system and normal procedure before testing. | Removed age thresholds, efficiency-loss assumptions, response promises, and component conclusions based solely on thermostat history. | 2026-09-02 |
| /services/preventive-maintenance/yonkers | Yonkers Housing Code Enforcement: https://www.yonkersny.gov/235/Housing-Code-Enforcement; ENERGY STAR maintenance | The City receives annual boiler inspection reports for multiple residences of six or more units, so applicable owner records and the specific boiler are separated from routine service notes. | Removed guaranteed savings or reliability and qualified visit content, frequency, access, pricing, and repairs to the written scope. | 2026-09-02 |
| /services/preventive-maintenance/white-plains | White Plains inspection information: https://www.cityofwhiteplains.com/123/Inspection-Information; ENERGY STAR maintenance | The City says project inspections depend on scope and mechanical installations cannot be concealed before acceptance, so routine maintenance is separated from corrective alteration work. | Removed predictable-budget, priority-response, universal weather, and fixed-frequency claims; made plan terms agreement-specific. | 2026-09-02 |
| /services/preventive-maintenance/new-rochelle | New Rochelle GreeNR 2025: https://www.newrochelleny.gov/DocumentCenter/View/20595/GreenNR-Climate-Action-Plan-Update-2025; ENERGY STAR maintenance | The City plan identifies changing precipitation and flooding risks, so a property with relevant history gets storm exposure and water-entry context attached to drain and overflow findings. | Removed universal filter intervals and any implication that one condenser entry covers all ductless maintenance. | 2026-09-02 |
| /services/preventive-maintenance/mount-vernon | Mount Vernon Buildings: https://www.mountvernonny.gov/187/Buildings; ENERGY STAR maintenance; CPSC carbon monoxide | The Department oversees maintenance of older multifamily properties and vacant-apartment inspections, so applicable plans separate apartment equipment, common equipment, access, and owner records. | Removed guaranteed winter reliability and placed fuel, burner, venting, electrical, fill, relief, purge, and pressure tasks with professionals. | 2026-09-02 |
| /services/preventive-maintenance/scarsdale | Scarsdale mechanical-heating form: https://www.scarsdale.gov/DocumentCenter/View/8645/Mechanical-Heating-Application; ENERGY STAR maintenance; EPA filters | The Village form requires equipment-specific ignition, operating, maintenance, and shutdown instructions, so records remain tied to the identified hot-water, hydro-air, or steam system. | Removed universal high-MERV benefit, warranty-validity promise, visit interval, savings, and service-life claims. | 2026-09-02 |
| /services/indoor-air-quality/yonkers | Yonkers Housing and Buildings: https://www.yonkersny.gov/217/Housing-Buildings; EPA filters and IAQ improvement | The Department investigates housing and construction complaints, so a shared-property review identifies whether the condition is within a unit, common area, shared ventilation, or owner-controlled equipment. | Removed healthier-home, allergy/asthma, and universal purifier claims; filtration is only supplemental and device limits are disclosed. | 2026-09-02 |
| /services/indoor-air-quality/white-plains | White Plains Building: https://www.cityofwhiteplains.com/86/Building; EPA filters and indoor air quality | The Department lists ventilation of occupied structures among inspection responsibilities, so observations are separated from any ventilation alteration requiring current City review. | Removed assumed local pollutant prevalence and promises that filtration replaces ventilation or controls every pollutant. | 2026-09-02 |
| /services/indoor-air-quality/new-rochelle | New Rochelle GreeNR 2025: https://www.newrochelleny.gov/DocumentCenter/View/20595/GreenNR-Climate-Action-Plan-Update-2025; EPA moisture and IAQ improvement | The City plan identifies higher temperatures, intense storms, changing precipitation, and flooding risk, so weather and water history is logged without claiming every address shares the exposure. | Removed seasonal humidity and basement prevalence claims, mold outcomes, and the claim that an air cleaner or dehumidifier is universally needed. | 2026-09-02 |
| /services/indoor-air-quality/mount-vernon | Mount Vernon Buildings: https://www.mountvernonny.gov/187/Buildings; CPSC carbon monoxide; EPA filters | The Department enforces housing standards and oversees older multifamily properties, so an applicable review distinguishes one dwelling, a common system, and owner-controlled combustion equipment. | Removed purifier health and combustion-remediation promises; repeats evacuation language only for the identical life-safety hazard. | 2026-09-02 |
| /services/indoor-air-quality/scarsdale | Scarsdale Building: https://www.scarsdale.gov/169/Building; EPA filters, ozone, and moisture | The Department lists electrical and mechanical-heating permits, so an IAQ proposal that changes fixed equipment receives a current Village review rather than an assumed exemption. | Removed allergy/asthma outcomes, one-size-fits-all high-MERV or whole-home claims, and ozone-producing occupied-space recommendations. | 2026-09-02 |

### Reusable service-content review

The reusable `serviceContent.ts` taxonomy retains service slugs, titles, route headings, scope fields, and FAQ functions while removing or qualifying the brief's unsupported claims. Specifically removed were “Free quotes,” “manufacturer-trained installers,” “not subcontractors,” “Manual J on every install,” blanket permit and inspection coordination, fixed pricing, universal one-day or two-to-four-day timelines, age and cost-percentage replacement rules, universal equipment lifespans, healthier-home and allergy/asthma outcomes, guaranteed maintenance benefits, “no upsell,” “Honest sizing,” “Clean, respectful in-home work,” and categorical condo or multifamily coordination. Replacement language requires property-, equipment-, manufacturer-, agreement-, confirmed-scope, and current-availability checks as appropriate.

## Cross-record sources and boundaries

- NYSERDA guidance supports discussion of distribution and system-specific planning without asserting local prevalence.
- The CPSC carbon-monoxide fact sheet supports alarm and evacuation guidance.
- Professional boundaries exclude gas-valve, burner, fuel-train, venting, and combustion-control work, plus opening, draining, filling, purging, venting, or pressurizing steam and hot-water systems.
- All 68 local-context paragraphs, 102 concern entries, and 204 FAQ questions and answers are distinct after city-name removal and normalization.
- All 20 service-city answer-first passages, 40 local-consideration entries, 60 concern entries, and 120 FAQ questions and answers are distinct after city-name removal and normalization.
- Related-city links remain limited to existing routes, and related-guide slugs resolve to the current blog inventory.
