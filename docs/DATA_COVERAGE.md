# Data coverage (as of 2026-10-17)

| Dataset | File | Count | Status |
| --- | --- | --- | --- |
| Degrees (bachelor's) | `data/degrees.json` | 102 (86 seed, 16 expansion) | Names and aliases. Each maps to one family. |
| Career families | `data/families.json` | 41 | Analyst draft. Each family scored on 7 criteria. Not yet cross-checked. |
| Universities | `data/universities.json` | 45 records (QS ranks 1 to =45) | QS rank verified. Other sections mostly not researched. |
| Universities, ranks 46–150 | — | 0 | **Not transcribed.** |
| Funding records | `data/scholarships.json` | 1 (MIT need-based aid) | Official pages read; deadlines need re-checking each cycle. |
| Programme records | inside `universities.json` | 0 verified | **None yet.** The matcher reports this for every university. |
| Admissions records | inside `universities.json` | 0 | **None yet.** |
| Cost records | inside `universities.json` | 1 total (MIT, USD 92,760, 2026–27) | Total only. No breakdown. |
| Exchange rate | `data/fx.json` | USD→PKR 276.9545 | SBP M2M, 14 Oct 2026, from an excerpt. Re-verify before release. |
| Sources | `data/sources.json` | 16 | Each has a verification method and a last-checked date. |

## Known gaps, in priority order

1. Transcribe QS ranks 46–150 from the official QS page.
2. Verified programme lists for the top-ranked universities, starting with those that have official course catalogues.
3. Admissions requirements for Pakistani (FSc/A-level) applicants.
4. Funding records beyond MIT, each with its own eligibility, deadlines and loan status.
5. Cost breakdowns from official fee and accommodation pages.
6. Cross-checks of career-family scores against BLS, O*NET and ILOSTAT.

## What "verified" means here

A record is verified only when its source was read and its date is stated. Verification notes are kept next to the data they support.
