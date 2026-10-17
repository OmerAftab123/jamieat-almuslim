# Architecture

## Summary

A **static website** built with Next.js 16 (App Router) and TypeScript. Research data is stored as versioned JSON files in `data/`. Those files are validated with Zod at build time and loaded during the static export. Interactive tools (career explorer, matcher, cost calculator, comparison, roadmap) are client-side React components.

There is **no database, no backend API, no authentication, and no paid service** in the runtime.

```
data/*.json  ──(Zod schemas, lib/schemas.ts)──>  lib/data.ts (server-side loader, build time)
                                                      │
                                                      ▼
                          app/*/page.tsx  (server components, prerendered to HTML)
                                                      │ props (plain serialisable data)
                                                      ▼
                    components/*.tsx  (client components: interactivity only)
                                                      │
                 lib/scoring.ts, lib/costs.ts, lib/matching.ts, lib/roadmap.ts
                 (pure functions; run in the browser; no network, no AI)
```

## Why static

- Cheap and reliable to host (GitHub Pages, Vercel, or any static host).
- No student data reaches a server. The matcher and cost calculator run in the browser.
- Reproducible: the same commit always produces the same site.
- Simple to maintain by volunteers who edit JSON and open a pull request.

The trade-off is that data changes need a rebuild. That is acceptable for research data that changes slowly and is reviewed before release.

## Directory map

| Path | Role |
|---|---|
| `app/` | Pages and layout. `layout.tsx` holds navigation, skip link and footer disclaimer. |
| `components/` | Client components (`CareerExplorer`, `UniversityDirectory`, `MatcherForm`, `CostCalculator`, `CompareWorkspace`, `CompareRoute`, `RoadmapChecklist`, `ScholarshipCard`) and `shared.tsx` (display helpers). |
| `lib/schemas.ts` | Zod schemas and TypeScript types for every dataset. |
| `lib/data.ts` | Loads and validates all JSON files, runs cross-file integrity checks (server side only). |
| `lib/scoring.ts` | Weights, family scoring, ranking, criterion ranking. Client-safe. |
| `lib/costs.ts` | Cost model, USD conversion with a dated rate, money formatting. |
| `lib/currency.ts` | Display-currency choice: USD, stored rates, or a user-typed rate (never shown as verified). |
| `lib/countries.ts` | Citizenship list with ISO codes. Any other country can still be typed in. |
| `lib/studentLife.ts` | Practical questions for Muslim students abroad (questions to ask, not claims). |
| `lib/matching.ts` | Matcher rules: programme status, admissions check, funding classification. |
| `lib/roadmap.ts` | Roadmap template and builder. |
| `scripts/validate-data.ts` | `npm run validate:data`. |
| `scripts/serve-static.mjs` | Tiny static server for `out/` (used by `npm run serve` and Playwright). |
| `tests/` | Vitest unit tests. |
| `e2e/` | Playwright smoke tests. |
| `.github/workflows/` | `ci.yml` (checks and smoke tests) and `pages.yml` (GitHub Pages deploy). |

## Important design decisions

**Client-safe boundaries.** `lib/data.ts` reads the file system and must stay out of client bundles. Client components import only `lib/scoring.ts`, `lib/costs.ts`, `lib/matching.ts`, `lib/roadmap.ts` and `components/shared.tsx`. `shared.tsx` must never import `lib/data.ts`.

**No server-side search parameters.** Static export cannot read `searchParams` on the server. The `/compare` page therefore renders a client component (`CompareRoute`) inside a `Suspense` boundary, which reads the query string in the browser.

**Base path.** Project sites on GitHub Pages live under `/<repository-name>/`. `next.config.mjs` reads `BASE_PATH` (set by `pages.yml`, empty otherwise). Internal links use `next/link`, which applies the base path automatically. Plain `<a href>` is used only for external links.

**Trailing slashes.** `trailingSlash: true` produces `/careers/index.html`, which GitHub Pages serves without redirects.

**No image optimisation.** `images.unoptimized` is set because static export has no image server.

**Security headers.** The earlier `headers()` config was removed because it is not supported in static export. Hosts that accept custom headers (for example Vercel) can add them in their own configuration. The site has no forms that post to a server and no third-party scripts.

**Determinism.** Matcher and scoring functions are pure. Ties and rounding are explicit (see `docs/SCORING_METHODOLOGY.md`). Floating-point comparisons use a small epsilon.

**Storage.** The only browser storage is the roadmap checklist (`localStorage`, key `jamieat-roadmap-progress-v1`).

## Data model (summary)

| File | Records | Notes |
|---|---|---|
| `data/degrees.json` | 102 degrees | Each maps to one career family. Aliases support search. |
| `data/families.json` | 41 families | Seven criteria, each with a score (0–4 or missing), rationale, confidence, sources, assumptions and change factors |
| `data/universities.json` | 150 universities | QS 2027 rank, score, location, per-section `dataStatus`, programme/admission/cost/scholarship fields |
| `data/scholarships.json` | 1 scholarship record | MIT need-based aid. Structured eligibility and classification fields. |
| `data/sources.json` | 16 sources | Every citation ID used in the data must exist here |
| `data/fx.json` | 2 rates | USD to PKR (SBP) and USD to EUR (ECB), each with type, date and source |

Integrity checks (`checkIntegrity` in `lib/data.ts`) verify that references resolve, that IDs are unique, and that a scholarship classified as a full ride is not described as covering tuition only.

## Matcher logic (summary)

See `docs/SCORING_METHODOLOGY.md` for scoring. For the matcher:

1. **Programme status.** A programme is "verified" only if it has an entry in the university's `programs` list. Otherwise the result is `program-not-verified`. Existence or rank of the university never implies a programme.
2. **Admissions check.** Only recorded minimum requirements are checked. Competitiveness is never assessed.
3. **Candidate label.** `possible candidate` requires a verified programme and all recorded requirements met. `insufficient evidence` is used when data is missing. `poor fit` is used when a recorded minimum is missed.
4. **Funding.** Each scholarship is classified (full ride, partial, need-based, loan-bearing, etc.). Need-dependent awards are marked `unknown-depends-on-finances` when finances are not given. Loan-bearing awards are excluded when the student avoids interest-bearing finance.
5. **Costs.** Totals are arithmetic on user-entered or recorded amounts. Scholarship amounts are capped at annual gross cost and the unused remainder is shown.

## Testing

| Layer | Tool | Command |
|---|---|---|
| Data integrity | `scripts/validate-data.ts` | `npm run validate:data` |
| Types | TypeScript strict | `npm run typecheck` |
| Lint | ESLint (flat config) | `npm run lint` |
| Unit | Vitest (`tests/**/*.test.ts`) | `npm test` |
| Build | Next.js static export | `npm run build` |
| Browser smoke | Playwright (`e2e/smoke.spec.ts`) against `out/` | `npm run test:e2e` |

## Scaling path

If the dataset grows beyond what JSON files can comfortably handle (for example, thousands of programmes with many editors), consider a managed Postgres database with a read-only public API and a static export that reads from it at build time. The student-facing tools would still run in the browser. Any database credentials would be **server-only** secrets and must never use a `NEXT_PUBLIC_` prefix. This is not implemented.
