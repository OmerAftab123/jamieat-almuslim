# Research methodology

## Principles

- Use primary sources first: official university, funder, government and statistics pages.
- Record for each source: publisher, URL, type, the date it was last checked, and how it was checked.
- Do not cite what has not been read. A source appears in `data/sources.json` only after a check.
- Keep each dataset's status visible in the UI. Never upgrade a status without a new check.

## Status labels

| Label | Meaning |
| --- | --- |
| `verified-official-page` | Read on the official page on the date shown. |
| `partially-researched` | Some fields verified; others missing. |
| `not-researched` | No verified research yet. Not the same as "does not exist". |
| `analyst-draft` | Editorial judgement not yet cross-checked against statistics. |
| `official-sources-verified` / `unverified` | Funding record status. |

## Universities

- Source: QS World University Rankings 2027 (published 18 June 2026) on topuniversities.com.
- Transcribed: ranks 1 to =45. Ties are kept as published (for example `=35`).
- Not transcribed: ranks 46–150. The site does not claim the full Top 150.
- Programme lists, admissions requirements and cost breakdowns are not yet researched for most universities.

## Funding

- A funding record is entered only after reading the funder's own eligibility, deadlines and coverage pages.
- Each record states what it covers and what it does not. Loans are recorded as loans.
- The current record (MIT need-based aid) is based on official MIT pages read on 2026-10-17. Deadlines must be checked each cycle.

## Exchange rate

- USD→PKR uses the State Bank of Pakistan interbank rate (M2M) with its date. The current value is in `data/fx.json`.
- The rate comes from a search excerpt and must be re-verified against the SBP page before publishing.

## Career families

- Scores are analyst judgements. Each has a rationale per criterion, assumptions, change factors, a confidence level and source ids.
- Planned cross-checks: BLS Occupational Outlook (US), O*NET task data (AI exposure), ILOSTAT (global employment). Results will be recorded as sources, and scores will change only when a check supports it.

## What is not done

- No cost-of-living estimates from third parties.
- No competitiveness, admission-probability or salary-guarantee estimates.
- No religious rulings. Religious alignment scores describe general fit with common values.
