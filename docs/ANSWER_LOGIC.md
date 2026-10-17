# How the answer to the fundamental question is built

The site answers one question for each degree and university pair:

> Can a Pakistani (or other international) Muslim undergraduate apply, get admitted and study this degree at this university **for free**, and should they?

The answer is built in `lib/answer.ts` from stored evidence only. It calls `lib/matching.ts` (eligibility and funding) and `lib/ranking.ts` (degree scores). The page that shows it is the `AnswerPanel` on `/matcher`, and the full record is on `/free-study/<university-id>`.

## Principles

- **Missing evidence is never reported as "no".** "Not researched" and "not verified" are separate from "not available".
- **Tuition alone is not a full ride.** A route counts as full cover only if its stored classification is `full-tuition`, `full-ride` or `full-cost-of-attendance`, and only if it covers the cost the student actually faces.
- **Loans are not scholarships.** Loan and financing products are listed, labelled and never counted as free routes.
- **No degree is described as religiously mandatory** because of its score, and no score is a recommendation for any individual.
- The answers are **decision aids**, not admissions decisions or guarantees of funding.

## The three answers

### 1. Can you apply and be admitted? (`can`)

| Verdict | When it is shown |
|---|---|
| `programme-not-verified` | The degree has no verified programme record at this university. |
| `not-researched` | There is no admissions record. |
| `below-recorded-minimum` | The applicant's entered grade or English score is below a recorded minimum. |
| `eligible-on-recorded-criteria` | The applicant meets every recorded criterion. Competitive selection is not assessed. |
| `grades-not-checkable` | A recorded criterion (for example a grade minimum) is missing, so it cannot be checked. This is the default for UM because UM publishes no grade minimum. |

### 2. Can you study for free? (`free`)

Routes come from `data/scholarships.json` for the university. Each route is tested against the applicant's citizenship, need and budget.

| Verdict | Meaning |
|---|---|
| `full-cover-route-recorded` | A full-cover route applies to the profile. The funder still needs to confirm it. |
| `conditional-full-cover-route` | A full-cover route is recorded, but it depends on family finances that were not entered. |
| `partial-route-only` | Only partial routes apply, so a free degree is not established. |
| `no-route-recorded` | No relevant route is recorded. This is not proof that none exists. |
| `not-researched` | The university has no funding research at all. |

A route the student is unlikely to need (for example a need-based award when the student has said they do not need aid) is marked `low` relevance and is **not** counted as a full or partial route. It is reported as a reason instead. This was fixed in this build and has a unit test (`tests/answer.test.ts`).

### 3. Should you pursue it? (`should`)

| Verdict | Meaning |
|---|---|
| `reasonable-with-a-funding-plan` | The degree is verified, the requirements are met, and a full-cover route is recorded but needs a funding plan. |
| `decide-on-cost-first` | The degree is verified, but the main cost is not covered by a recorded full route. |
| `not-enough-evidence` | The programme or requirements are not verified well enough to judge. |
| `not-recommended-on-recorded-criteria` | A recorded criterion excludes the applicant. |

The answer also shows reasons for and against, the degree's analyst-draft score (overall mean of the seven criteria, unrounded for ordering, with its rank among mapped degrees), and disclaimers.

## The how-steps and dossier

Each dossier in `data/freeStudy.json` has:

- `answers`: `can`, `free`, `should` and a `how` list, each with source IDs.
- `officialRequirements`: each item has a status (`verified-official`, `verified-official-absence`, `conflict-recorded`, `not-verified`) and sources.
- `scholarships`: one row per route type (merit, need, national, regional, sports, external and others), each with a status.
- `trends`: only official figures, each with a source.
- `unofficialTrends`: always labelled. Currently `not-recorded` for every dossier.
- `reasoning`: reasons for, cautions and a decision test.
- `roadmap`: dated windows with steps.

## Current dossiers

| University | Dossier | Status |
|---|---|---|
| MIT | `mit-free-study` | Partially researched (pilot) |
| Universiti Malaya | `um-free-study` | Partially researched |

All other universities show "not researched" for the free-study answer. This is a deliberate gap, not a "no".

## Known limits

- Degree-family scores are analyst drafts with stated confidence. They are not evidence of outcomes.
- Printed fees are shown as printed. Currency and per-year or total basis are only confirmed where the source says so.
- Visas, language-test equivalence, national scholarships for each country and living-cost data are mostly not verified yet.
- The matcher runs in the browser. Nothing is sent to a server.

## Pair report: any bachelor category at any QS university (added 17 Oct 2026)

Page: `/explore` (component `components/PairExplorer.tsx`; logic `lib/pairReport.ts`; tests `tests/pairReport.test.ts`).

For one category and one university, for a Pakistani international undergraduate, the report contains:

1. **Can, should and how**: the fundamental answer from `answerFundamentalQuestion`, with a default profile (no grades or aid need entered).
2. **Programme**: verified only when the university's official course list has a verified record for that category. Otherwise "not verified".
3. **Official requirements**: general admission, and subject-specific rows from the free-study dossier (or the admissions record when no dossier exists).
4. **Unofficial and trend-based**: from the dossier's `unofficialTrends` and `trends`, always labelled with their kind and source. Nothing is presented as official.
5. **Scholarships by type**: merit, need, national, regional, institutional and sports. Records use `scholarshipTypes` (or a fallback from `awardType`). Dossier routes are mapped by keyword (`routeTypes`). A type with no record shows "not researched". A record whose `degreeFamilyScope` excludes the category, or whose citizenship rule excludes Pakistan, is shown as "not for this category".
6. **Reasoning**: university reasons for and against (from the dossier), and degree reasons for and against (from the analyst-draft family scores: scores 3 to 4 as reasons for, 0 to 1 as cautions). Degree scores are family-level, not university-specific.
7. **Structured roadmap**: five stages (confirm the category, meet admission requirements, plan the funding route, apply, study and keep the award). Dates come only from dossier roadmaps.

**Completeness** is the number of five evidence checks passed: programme verified; official admission requirements recorded; subject requirements verified; scholarship records by type; trend data recorded. A pair is complete only when all five pass. Most pairs pass fewer.

### What is coded versus what is complete (17 Oct 2026)

- Coded: the report, the explorer page, the six-type scholarship grouping, the completeness checks and the tests. Every one of the 15,300 pairs (102 categories x 150 universities) produces a report without error.
- Not complete: the ranking. Programme-level verification exists for 2 universities only (MIT, UM), so degree ordering is available only for those 2. Family scores are analyst drafts (`families.json`, status "analyst-draft") and are not yet cross-checked against the labour-market datasets in `data/sources.json`.
- Not complete: dossiers exist for 20 universities. Requirements, scholarships and trends for the other 130 are "not researched".
- Not tested in a browser: the explorer's interactive behaviour (no browser in this sandbox). The build and unit tests pass.

### Data corrections made with this change

- Edinburgh's Mathematics award was tagged to every category; it now applies only to the mathematics-statistics family.
- Imperial's Inspires award used subject names instead of family IDs, so it never matched; it now lists the matching families.
- Each scholarship record has a `scholarshipTypes` list (merit, need, national, regional, institutional, sports).
