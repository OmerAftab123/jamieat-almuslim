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
