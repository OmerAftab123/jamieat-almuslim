# Development roadmap

Status key: **done** (in the repository and tested), **partial**, **planned**.

## Phase 0: foundation: done
- Next.js 16 (App Router), TypeScript strict mode, ESLint, Vitest, Playwright.
- Versioned JSON datasets validated by Zod schemas at load time.
- Static build: no database and no paid APIs.

## Phase 1: career explorer: done (analyst draft)
- 41 career families, 102 canonical degrees with aliases.
- Seven criteria scored 0–4, equal default weights, adjustable weights normalised to 100%.
- Ranking with competition ties; missing research never scored as 0.
- **Next:** cross-check scores against BLS, O*NET and ILOSTAT-type sources; record each check in `data/sources.json`.

## Phase 2: university directory: partial
- QS World University Rankings 2027, ranks 1 to =45 transcribed (45 records, ties preserved).
- **Next:** transcribe ranks 46–150 from the official QS page, one row at a time, with a verification date.
- **Next:** research programme lists, admissions requirements and official cost breakdowns per university.

## Phase 3: funding and costs: partial
- One need-based record (MIT) with a loan flag, deadlines and uncovered costs.
- Cost calculator on user-entered figures; PKR conversion from a dated SBP rate.
- **Next:** research funding for more universities; record the classification for each award; re-verify the FX rate before each release.

## Phase 4: matcher: partial
- Deterministic rules: programme, eligibility, funding, costs, classification, next action.
- Labels are never probabilities.
- **Blocked on data:** the matcher reports "programme not verified" for every university until programme records exist.

## Phase 5: planning and trust: done
- Roadmap checklist (browser storage), comparison workspace, methodology and about pages.

## Phase 6: deployment: see the status in the README
- GitHub repository and CI workflow.
- Vercel deployment requires a Vercel account and import of this repository. It is not confirmed in this repository until the owner completes it.
