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
| Cost estimate with currency choice | Done | USD base; PKR (SBP, 14 Oct 2026) and EUR (ECB, 16 Oct 2026) from `data/fx.json`; other currencies user-entered and labelled unverified |
| MIT need-based scholarship record | Done | One record only |
| Comparison workspace | Done | Up to 4 families or 4 universities |
| Roadmap checklist (saved in browser) | Done | Local storage only |
| Methodology and About pages | Done | Link to docs in GitHub |
| Unit tests (37), data validator, E2E smoke tests (8) | Done | See `npm run check` and `npm run test:e2e` |
| GitHub Pages workflow | Written, not yet live | Live only after the repository owner enables Pages with *GitHub Actions* as the source |
| Vercel deployment | Not done | Import the repository in Vercel |

## Phase 2b: International audience (done in this build)

- Citizenship is a country list with ISO codes; any other country can be typed in. A blank citizenship is rejected instead of being assumed to be Pakistan. Pakistan is only the pre-selected starting value.
- International-only awards are judged against the applicant's citizenship (for example Malaysia, Egypt or Indonesia all count as international for MIT). Tests cover this.
- Costs can be shown in USD, PKR (SBP), EUR (ECB), or a currency the user converts with their own rate. User-entered rates are labelled as unverified everywhere they appear.
- A "Student life" page and a matcher checklist list questions to ask each university about prayer space, Jumu’ah, halal food, Ramadan, Eid, housing, community, interest-bearing finance, visas and health cover. These are questions, not claims about any university, and not religious rulings.

## Phase 2c: Free-study dossier (MIT pilot, done)

- `data/freeStudy.json` answers, for one university, whether a Pakistani international undergraduate can apply, study for free, and should. Each answer is linked to sources. The page is at `/free-study/<university-id>`.
- MIT and Universiti Malaya are the two dossiers (see below).
- MIT is the first dossier. Its official sources: Class of 2029 admissions statistics (6,926 international applicants, 136 admitted), need-only aid with no merit, athletic or talent awards, and CSS Profile requirements.
- Not done: dossiers for the other 149 universities; national (HEC, embassy), regional and external scholarships for MIT; unofficial trend data; visa and credential-equivalence checks.
- Degree rankings use the analyst-draft family scores (`lib/ranking.ts`, tested). They are not evidence of outcomes.

## Phase 2 pilot 2: Universiti Malaya (done, partially researched)

- Official sources read: the UM International Booklet (updated 15 Dec 2025; chunks 0–3 of 5), the ASD undergraduate international FAQ and financial aid page (both fetched in full), and Study@UM intake and fee pages (search excerpts). Full record: `docs/UM_RESEARCH.md`.
- 42 bachelor's programme records mapped to catalogue degrees (exact or closest title). Printed fees are shown as printed; currency and per-year or total basis are unconfirmed.
- Admissions: general English minimums (IELTS 5.0, TOEFL iBT 60, PTE 41, MUET 3, Cambridge grade C), 12-year qualification rule, higher-English programme list (figures not published), no grade minimum (grades not checkable).
- Funding: no UM institutional scholarship for undergraduate internationals (official FAQ, dated 2021). One partial external award, the PTE x UM Scholarship (GBP 3,000 towards tuition, deadline 31 Dec 2026). Loans and Islamic financing are listed but not counted as free.
- Four official conflicts are recorded, not resolved: intake months, application fee (RM 300 vs MYR 500), foundation availability and English minimum (aggregator figures). See `docs/UM_RESEARCH.md`.
- Not done: the PTE sponsor terms, UM costs in USD, living costs, visa, and a re-check of the live portal.

## Phase 2 answer engine and matcher (done in this build)

- `lib/answer.ts` answers the fundamental question (can / free / should / how) from stored evidence. Logic is documented in `docs/ANSWER_LOGIC.md`.
- Low-relevance routes (for example need-based aid when the student has said they do not need aid) are not counted as full or partial routes. Unit tests cover this.
- The matcher shows an answer panel above the detailed match report.
- Home page hero and calls to action; a sticky header and a responsive design layer in `app/globals.css`.
- Test coverage now includes answer logic for MIT (need unknown and need not required), an unverified programme, and UM (partial route only).

## Phase 2: Fill the evidence gaps (started)

**Started.** One institution is fully worked through as a pilot: MIT.
- Programmes: 22 official MIT undergraduate degree charts mapped to catalogue degrees, each with an official link and a match type (exact or closest title). Unmapped MIT majors are listed as unmapped.
- Admissions: SAT/ACT requirement, English-test minimums and recommended scores, and deadlines, from MIT's official test page. No grade minimum is published, so the matcher reports insufficient evidence for grades.
- Matcher fix: a record without a grade minimum no longer counts as "requirements met".
- Profile page: programme and admissions tables replace the raw JSON display.
- Not yet done in this pilot: MIT scholarship re-verification, per-programme costs, and browser E2E re-run in this environment (no browser available here).
- Universiti Malaya is the second dossier. See the UM pilot section above.

The next steps below remain open.

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
