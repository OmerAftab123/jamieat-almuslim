# Architecture

## Overview

```
data/*.json  ──(Zod schemas, lib/schemas.ts)──>  lib/data.ts (load, integrity checks, cache)
                                                     │
            ┌────────────────────────────────────────┼───────────────────────────┐
            ▼                                        ▼                           ▼
 lib/scoring.ts (weights, ranks)     lib/matching.ts + lib/costs.ts     lib/roadmap.ts
            │                                        │                           │
            ▼                                        ▼                           ▼
 CareerExplorer (client)          MatcherForm, CostCalculator (client)  RoadmapChecklist (client)
            ▲
 app/*/page.tsx  (server components render static HTML; datasets are read at build time)
```

## Why this design

- **No database.** Research data is versioned JSON in Git, which keeps every change reviewable. A database would add secrets and hosting cost without a current need.
- **Static pages.** Most routes are prerendered at build time (`○` or `●` in the build output). Only `/compare` reads query parameters at request time.
- **Client-side matcher.** Student profile data never leaves the browser.
- **Single schema layer.** `lib/schemas.ts` defines each dataset. `lib/data.ts` also checks cross-file rules: unique ids, known source ids, known degree families, and known scholarship links.

## Directory map

| Path | Purpose |
| --- | --- |
| `app/` | Routes (App Router). `layout.tsx` holds the navigation and disclaimer footer. |
| `components/` | Client components (`CareerExplorer`, `UniversityDirectory`, `MatcherForm`, `CostCalculator`, `CompareWorkspace`, `RoadmapChecklist`) and shared presentational pieces. |
| `lib/` | Pure logic: schemas, data loader, scoring, costs, matching, roadmap. No network calls. |
| `data/` | Versioned datasets, each with a version, date and source ids. |
| `scripts/validate-data.ts` | `npm run validate:data`. Fails the build when data is inconsistent. |
| `tests/` | Vitest unit tests for scoring, weights, ranking, costs, matching and data integrity. |
| `e2e/` | Playwright smoke tests run against the production build. |
| `docs/` | Project documentation (this folder). |

## Key rules encoded in code

- Scores are integers 0–4 (`scoreSchema`). A missing score is `null`.
- Overall score is `null` if any criterion is missing (`scoreFamily`).
- Ordering uses the exact value; display rounds to one decimal (`overallDisplay`).
- Ties use an epsilon comparison and competition ranking (`sameScore`, `rankFamilies`).
- Scholarships apply to annual costs only, capped at annual gross cost (`computeCosts`).
- `classification` values are fixed; `full-tuition` is never shown as a full ride.
- Loan-bearing awards are removed when the student avoids interest-bearing finance (`evaluateFunding`).

## Security

- No secrets in client code. The only environment variable, `NEXT_PUBLIC_SITE_URL`, is public and optional.
- Security headers are set in `next.config.mjs` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- No user input is sent to a server, so there is no server-side input handling to attack.

## Extending the data

1. Add or edit JSON in `data/`, with a `lastVerified`/`lastChecked` date and a source id.
2. Add the source to `data/sources.json` with its verification method.
3. Run `npm run validate:data`, `npm run test`, and `npm run build`.
