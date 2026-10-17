# Scoring methodology

This document describes exactly how career-family scores, weights and rankings are calculated. The implementation is in `lib/scoring.ts` and is covered by unit tests in `tests/scoring.test.ts`.

## 1. What is scored

- **Unit:** a career family (41 in total). Each family groups related bachelor's degrees (102 degrees in total, see `data/degrees.json`).
- **Criteria:** seven, each scored from **0 to 4** (integers):

| Key (in data and code) | Criterion | Question it answers (from `CRITERION_META`) |
|---|---|---|
| `islamic` | Islamic alignment | How well do the realistic career pathways align with Islamic principles and common religious preferences? |
| `benefit` | Benefit to people and society | How much potential does the field have to contribute to human welfare and real-world problem solving? |
| `financial` | Financial lucrativeness | What are the realistic earnings, progression and long-term financial prospects? |
| `futureResilience` | Future resilience | How likely is the field to remain relevant as technology, industries and society change? |
| `aiResilience` | AI resilience | How exposed are the field's tasks to AI-driven automation or displacement? (Higher = more resilient.) |
| `employmentStability` | Employment stability | What are the prospects for stable, sustainable employment across economic conditions and career stages? |
| `flexibility` | Flexibility | How transferable are the skills, and how many alternative careers, locations or self-employment options exist? |

Future resilience and AI resilience are **separate** criteria on purpose. A field can be durable in general but still exposed to automation, or the reverse.

### Score scale

Each score has a neutral label, shown in the UI (`SCORE_LABELS` in `lib/scoring.ts`):

| Score | Label |
|---|---|
| 0 | Very weak |
| 1 | Weak |
| 2 | Mixed |
| 3 | Strong |
| 4 | Very strong |

These labels describe the criterion, not a religious ruling. The scale deliberately avoids words such as "must", "should" or "may", which belong to religious rulings and would be misleading here.

### Missing scores

A criterion with no researched score is stored as **missing** (`null`), not zero. A family with any missing criterion has **no overall score**. It appears after the ranked families and is labelled as incomplete. A missing value is never treated as 0 or as the median.

## 2. Evidence behind each score

Every criterion of every family records:

- `score` (0–4 or missing),
- `rationale` (plain-language reason),
- the family's `confidence` (level and explanation), `sources` (IDs from `sources.json`), `assumptions`, and `changeFactors` (what would make the score change).

Scores are **editorial judgements** by the project. They are not measurements. Their reasons are shown alongside the number so that users can disagree with specific reasons.

## 3. Weights

- Default: **equal weights**, one-seventh (about 14.29%) per criterion.
- Users may change any weight. Weights are then **normalised** so that they sum to exactly 1 (100%). For example, weights 2, 1, 1, 1, 1, 1, 1 become 2/8, 1/8, 1/8, and so on.
- Negative, non-numeric or all-zero weights are rejected. The explorer then falls back to the normalised default weights.
- **Restore defaults** resets all weights to equal.

## 4. Overall score

For a family with all seven scores present:

```
overall = sum over criteria of (weight_i × score_i)  /  sum of weight_i
```

With normalised weights the denominator is 1. With default weights this is the arithmetic mean of the seven scores.

- The overall score is **stored unrounded** and used for ordering.
- It is **displayed to one decimal place** (for example 2.9). The rounding is display only.
- Two families whose unrounded scores differ, even if they display the same, are ordered by the unrounded value. Two families whose scores are equal within a tiny tolerance (floating-point noise) share a rank.

## 5. Ranking and ties

- Families are sorted by unrounded overall score, highest first.
- **Competition ranking** is used: equal scores share the best rank, and the next rank is skipped. Example: 1, =2, =2, 4.
- Families with incomplete data are listed after ranked families and get no rank.

## 6. Ranking by a single criterion

The "sort by criterion" option ranks families by one criterion only, using the same competition-ranking rule. Families with a missing score for that criterion are unranked and placed at the bottom with a dash. They are never placed as if their score were zero.

## 7. Thresholds and labels

The site does not use the overall score to label a degree as "recommended", "mandatory", "halal" or "haram". Overall scores are informational. A high score does not make a degree religiously required, and a low score does not make it forbidden.

## 8. Limits of the method

- Equal weights reflect no particular person's priorities. Users should adjust weights to reflect their own situation.
- A seven-criterion mean hides trade-offs. Read the criterion breakdown, not just the overall number.
- Scores describe typical pathways. Individual outcomes vary.
- Scores should be reviewed when labour-market or AI evidence changes. Each family's `changeFactors` lists what would prompt a review.

## 9. How to propose a change to a score

1. Open an issue or a pull request that edits the family entry in `data/families.json`.
2. Update the score, the rationale, the sources (add to `data/sources.json` with a checked date) and, if needed, the confidence level.
3. Run `npm run validate:data` and `npm test`.
4. State the reason for the change in the pull request description.
