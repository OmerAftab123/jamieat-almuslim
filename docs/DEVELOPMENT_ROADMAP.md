# Development roadmap

Status key: **Done** = in the repository and checked. **In progress** = partly built. **Planned** = not started. Nothing here is a promise of a date.

## Phase 1: Working MVP (current)

| Item | Status | Notes |
|---|---|---|
| Static Next.js site with 9 pages | Done | Builds to `out/` (static export) |
| 102 canonical bachelor's degrees with aliases | Done | `data/degrees.json` |
| 41 career families, 7 criteria scored 0–4 with rationale | Done | `data/families.json`. Scores are judgements. |
| Weights (normalised to 100%) and restore defaults | Done | `lib/scoring.ts` |
| QS 2027 Top 150 directory with ties | Done (ranks only) | Ranks transcribed from the official page. Cross-check against a second source is pending. |
| University profile pages (150) | Done | Most fields show "not researched" |
| Free-study matcher (rules-based, in browser) | Done | Works for every pair. Only verified programmes can produce a "possible candidate". |
| Cost estimate with PKR conversion | Done | FX: SBP M2M 276.9545 PKR per USD (14 Oct 2026), dated in `data/fx.json` |
| MIT need-based scholarship record | Done | One record only |
| Comparison workspace | Done | Up to 4 families or 4 universities |
| Roadmap checklist (saved in browser) | Done | Local storage only |
| Methodology and About pages | Done | Link to docs in GitHub |
| Unit tests (37), data validator, E2E smoke tests (8) | Done | See `npm run check` and `npm run test:e2e` |
| GitHub Pages workflow | Written, not yet live | Live only after the repository owner enables Pages with *GitHub Actions* as the source |
| Vercel deployment | Not done | Import the repository in Vercel |

## Phase 2: Fill the evidence gaps (next)

Priority order:

1. **Programme lists** for the top universities: verify that each undergraduate programme exists on the official website, with a link and date. Start with the 10 most-requested degree families.
2. **Admissions requirements**: official minimum grades, English test requirements and application deadlines for each programme (not competitiveness).
3. **Costs**: official tuition and fee pages per programme, plus official living-cost estimates, in the university's currency.
4. **Funding**: official scholarship pages for international undergraduates, recording eligibility, nationality limits, need-based or merit-based status, and whether loans are involved.
5. **Second-source cross-check** of the QS 2027 ranks.
6. **Score review**: a second reviewer checks at least a sample of family scores and rationales.

## Phase 3: Quality and reach

- Automated link checking for source URLs (scheduled workflow).
- Accessibility audit (keyboard, screen reader, contrast) on each page.
- Urdu and other language versions, with human translation review.
- A mobile-first review of the matcher form.
- A public data-change log.

## Phase 4: Optional, only if needed

- A managed database or CMS, **only** if volunteers cannot keep the JSON files up to date. See `docs/ARCHITECTURE.md`.
- Subject-level QS rankings, if verified and dated.

## Not planned

- Paid AI APIs in the core product.
- Collecting student profiles on a server.
- Religious rulings or "halal" certification of degrees.
