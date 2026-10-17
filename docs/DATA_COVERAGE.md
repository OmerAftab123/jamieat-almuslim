# Data coverage

This page states what the dataset contains and what it does not. Figures are as of the repository state on **17 October 2026**. Check `data/*.json` for the current values; `npm run validate:data` prints the counts.

## Summary

| Dataset | File | Records | Status |
|---|---|---|---|
| Bachelor's degrees | `data/degrees.json` | **102** | Canonical list with aliases. Each maps to one career family. |
| Career families | `data/families.json` | **41** | All seven criteria scored for every family. Scores are judgements. |
| Universities (QS 2027) | `data/universities.json` | **150** | Ranks 1 to =150 from the official QS page. Ties kept as published. |
| Scholarships | `data/scholarships.json` | **2** | MIT need-based undergraduate aid; UM PTE x UM Scholarship 2026 (contest prize, one winner, partial). |
| Sources | `data/sources.json` | **30** | Each with a URL, type and last-checked date. |
| Exchange rates | `data/fx.json` | **2** | USD to PKR 276.9545 (SBP M2M, 14 Oct 2026); USD to EUR from ECB reference rate (16 Oct 2026). Other currencies: user-entered, unverified. |

Validation status at this commit: `npm run validate:data` passes on these counts.

## Interpreting "100+ bachelor's degree families"

The brief asked for "about 100+ bachelor's degree families". This was read as:

- **100+ bachelor's degrees:** met. The catalogue has **102 degrees**.
- **100+ career families:** **not met**. There are **41 families**. Each family groups several related degrees, so the 102 degrees map onto 41 families.

If the intended meaning was 100+ families, the dataset needs more families or a finer split of existing ones. That would need a separate decision, because it changes the scoring units. This is an open item in `docs/DEVELOPMENT_ROADMAP.md`.

## Universities: QS World University Rankings 2027

- **Source:** the official QS ranking page on topuniversities.com (`items_per_page=150`), published 18 June 2026. The page footer shows 1,504 ranked institutions in total.
- **Coverage:** ranks 1 to =150 are in the dataset. Ranks 151 and below are outside the dataset.
- **Ties:** displayed as published (for example `=2`, `=45`, `=119`). Some displayed ties do not follow strict competition ranking, and the site keeps QS's displayed rank rather than recalculating it.
- **Cross-check:** not yet cross-checked against a second official QS representation or dataset. The rank transcription was done manually from the page.
- **What each record has:** name, city, country, QS rank and score, profile link, and a `dataStatus` for each section.

### Field status across the 150 universities

| Field | Status |
|---|---|
| QS rank and score | Verified (official page) for all 150 |
| Undergraduate programme list | Verified for MIT (22 degree charts) and Universiti Malaya (42 programmes from the UM International Booklet). Both are mapped to catalogue degrees by exact or closest title. Not researched for the other 148. |
| Admission requirements | MIT: SAT/ACT, English-test minimums and recommended scores, test deadlines. UM: general English minimums, 12-year qualification rule, higher-English programme list (figures not published), no grade minimum. Neither publishes a grade minimum, so grades cannot be checked for either. Not researched for the other 148. |
| Tuition and fees | MIT total cost figure (USD). UM printed programme figures, shown as printed: currency and per-year or total basis not confirmed. Not researched for the other 148. |
| Scholarships | MIT (need-based) and UM (one external partial award). UM's official FAQ says it offers no undergraduate scholarship to international students. |
| Free-study dossiers | `data/freeStudy.json` | **2** | MIT and Universiti Malaya: can/free/should answers, official requirements, scholarship routes by type, official trends, reasoning, ranked mapped degrees, roadmap. All other universities: no dossier. |
| Official website | Not recorded for any university |

The matcher therefore reports `program-not-verified` for pairs without a verified programme. This is the correct behaviour and not a bug.

## Scholarships and costs

- **MIT need-based undergraduate aid.** Need-based grant that aims to meet full demonstrated need. International applicants considered on the same terms (CSS Profile and parental financial documents required). Grants and work only, no loans, per MIT's own pages. Deadlines: Early Action 30 November, Regular Action 15 February (re-verify each cycle).
- **MIT total cost of attendance 2026–27: USD 92,760**, a single figure from MIT's affordability page. No breakdown into tuition, housing or other costs is recorded.
- **Not a full ride.** MIT's need-based aid does not guarantee a full ride for every student. Whether a student receives full coverage depends on the family's financial information.
- **No other scholarships are recorded.** The absence of a record means "not yet researched", not "none exists".

## Exchange rate

- USD to PKR: **276.9545** (State Bank of Pakistan, M2M rate, 14 October 2026). USD to EUR: from the ECB reference rate of 16 October 2026 (1.1253 USD per EUR, inverted).
- Rates change daily. Refresh the value before using cost estimates for a decision.

## Known gaps

1. Programme lists and admission requirements for 149 of 150 universities (MIT is partly done).
2. Tuition and living-cost records for almost all universities.
3. Scholarship records for almost all universities.
4. Second-source cross-check of QS ranks.
5. Independent review of the 41 family scores and rationales.
6. Ranks 151 and below.

## How to add a record

1. Read `docs/RESEARCH_METHODOLOGY.md`.
2. Add a source to `data/sources.json` with a checked date.
3. Add the value to the relevant record with the source ID and a date.
4. Set the relevant `dataStatus` field to a verified value only when every value in the section is checked.
5. Run `npm run check` and open a pull request.

## Batch 5 (17 Oct 2026): Peking, Tsinghua, UNSW Sydney, CUHK

- Added four dossiers, eight scholarship records and 19 official-page sources (total 24 dossiers, 31 scholarship records, 90 sources).
- Each record is labelled with what was verified. Missing items are "not researched" or "not verified".
- Key findings from official excerpts (not all fully fetched):
  - Peking: foreign passport holders aged 18 to 25 (2026 rule). PKU Scholarship (merit) covers full or partial tuition, stipend and insurance; amounts not published.
  - Tsinghua: eligibility and 2027 first-round dates (30 Sep to 20 Nov 2026, arts and design only) are official. Scholarships not researched.
  - UNSW Sydney: Pakistan is in the 2027 entry table (code B4, meaning not verified). International Student Award gives 20% of tuition for eligible countries; Pakistan's status not verified. Term 1 2027 award closes 30 Oct 2026.
  - CUHK: non-local tuition HK$230,000 for 2027-28. HKSAR Government Scholarship HK$80,000 a year for non-local students. Admission scholarships are automatic. Regular round deadline 7 Jan 2027.
- Not free on any verified route: UNSW, CUHK. Possibly free (not guaranteed): Peking. Not established: Tsinghua.
- Scholarship ID for UNSW's Scientia award is not recorded: only secondary sources mention it.
