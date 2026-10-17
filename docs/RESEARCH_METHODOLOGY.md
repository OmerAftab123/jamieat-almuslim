# Research methodology

This document explains how data gets into the site, how it is checked, and what it does and does not establish.

## 1. Principles

- **Primary sources first.** Official university pages, QS's own ranking page, official scholarship pages, and central bank or regulator data are preferred. Secondary articles are used only to find primary sources, and are not cited as evidence on their own.
- **Record what was seen, when.** Each record carries a `lastVerified` or `lastChecked` date. Dates are not inferred.
- **Do not fill gaps.** A missing item stays missing. The interface says "not verified" or "not researched".
- **Separate facts from judgements.** Official figures (for example a QS rank) are facts with a source. Family scores (0–4) are editorial judgements with a rationale and a confidence level.
- **Keep sources in one place.** Every source has an entry in `data/sources.json` with its URL, publisher, type, last-checked date and a plain description of how it was checked.

## 2. Source types

| Type (in `sources.json`) | Used for |
|---|---|
| `primary-official` | Facts such as QS rank, university or scholarship terms, deadlines, FX rates |
| `islamic-primary` | Quranic or other primary religious texts cited for Islamic-alignment reasoning (cited, not interpreted as rulings) |
| `credible-secondary-research` | Published research and occupational data used as evidence for family scores (for example labour-market and automation-exposure studies). Treated as evidence for a judgement, not as a fact about any university. |

The current list (16 entries) is in `data/sources.json`.

## 3. Verification steps

For each data item, a reviewer should:

1. Open the primary source and confirm the value, wording and date are on the page.
2. Record the URL, the page's own date (if any), and the date you checked (`lastChecked`).
3. Enter the value with the source ID. Do not paste values from memory.
4. Run `npm run validate:data` and `npm run check`.
5. Note any ambiguity in the record's `notes` field.

Pages that could not be fetched are not replaced by guesses. Record the failure in the record's `notes` and try again later.

## 4. Current verification status

- **University ranks (QS World University Rankings 2027, published 18 June 2026).** Ranks 1 to =150 transcribed from the official ranking page, with ties kept as displayed. The page footer shows 1,504 ranked institutions in total; only ranks 1–150 are in the dataset. **Not yet cross-checked** against a second official QS source. Some displayed ties do not follow strict competition ranking (for example, two institutions at =97 followed by two at =98); these are recorded as published.
- **MIT undergraduate financial aid.** Need-based aid meeting full demonstrated need, international applicants considered on the same terms, CSS Profile required, grants and work only (no loans) per MIT's own pages. Deadlines recorded from MIT's admissions pages. Re-verify each admissions cycle.
- **MIT total cost of attendance 2026–27: USD 92,760.** Recorded from MIT's affordability page. It is a total only, with no breakdown.
- **Exchange rate.** USD to PKR 276.9545 (SBP interbank M2M rate, 14 October 2026). The rate changes daily; the stored value is dated and should be refreshed before use.
- **Programmes, admissions requirements, tuition and funding for the other universities.** Not yet researched. Shown as "not researched".

## 5. What the matcher does and does not establish

- It shows whether a programme is **recorded** as verified, and whether **recorded** requirements are met.
- It does **not** predict admission, rank applicants, or assess competitiveness.
- Cost figures are arithmetic on the numbers you enter and the numbers recorded. Anything not recorded is listed as an unknown.

## 6. Handling disagreements and corrections

- If two official sources disagree, both are recorded in `notes`, the newer official source is preferred, and the discrepancy is raised as an issue.
- Corrections are made by pull request, citing the official page and date.
- Removed or superseded records are kept in history (Git) rather than silently overwritten.

## 7. Limits

- Official pages change without notice. A recorded value can be out of date.
- Pages behind login or form-only pages cannot be checked by the project and are marked as such.
- Religious alignment scores reflect general, common considerations. They are not rulings. Individuals should consult qualified scholars for personal questions.
- Salary and employment data are broad indications and are not guarantees.

## 8. Reproducing a check

1. Pick a record in `data/`, read its `sources` IDs.
2. Open each source URL in `sources.json`.
3. Compare the wording and figures with the record.
4. Update `lastChecked`, then run `npm run check`.
