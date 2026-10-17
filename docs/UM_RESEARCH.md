# Universiti Malaya: research record (Phase 2 pilot, second university)

Record date: 17 October 2026. Scope: undergraduate, first-year international entry, for a Pakistani citizen. The record also applies to other non-Malaysian applicants, subject to their own qualification checks.

Data files: `data/universities.json` (programmes, admissions, notes), `data/scholarships.json` (`um-pte-x-um-scholarship-2026`), `data/freeStudy.json` (`um-free-study`), `data/sources.json` (sources listed below).

## Official sources used

| Source ID | Source | Type | How it was read |
|---|---|---|---|
| `um-international-booklet` | UM International Booklet, updated 15 Dec 2025 (`study.um.edu.my/doc/booklets/...pdf`) | Primary official | Fetched, chunks 0–3 of 5. Chunk 4 (remaining postgraduate tables) not read; it does not affect bachelor's records. |
| `um-asd-ug-faq` | ASD FAQ: Undergraduate International Admission (`aasd.um.edu.my/faq-ug-international-admission`), page says last updated 02/12/2021 | Primary official (dated) | Fetched in full (2 chunks). |
| `um-asd-financial-aid` | ASD Financial Aid for Undergraduate (`aasd.um.edu.my/financial-aid-for-undergraduate`), page says last updated 14/10/2026 | Primary official | Fetched in full. |
| `um-study-how-to-apply` | Study@UM How to Apply (`study.um.edu.my/how-to-apply`) | Primary official | Search excerpt only (snapshot dated 26 Aug 2026). |
| `um-study-faqs` | Study@UM FAQs & Info (`study.um.edu.my/faqs-amp-info`) | Primary official | Read in earlier build and through a search excerpt. |
| `mohe-mis-guidelines-2026` | MIS 2026 Guidelines (MOHE) | Primary official | Search excerpt only. Used to confirm that MIS is postgraduate only. |

## What is recorded, and how well it is verified

### Programmes (`verified`, 42 records)

Each UM bachelor's programme from the booklet is mapped to a catalogue degree, with `exact-title` or `closest-title`. The official title, the booklet URL, the printed figure, the mode code (CW, IM, and so on) and the duration are all recorded.

- **Mapping only.** Programmes with no catalogue equivalent are not mapped (for example Dentistry, Biomedical Science, Sports Management, Quantity Surveying, Real Estate, Music and Malay Studies). Their figures are in the booklet, not in this dataset.
- **Printed figures are not verified amounts.** The extract does not say the currency or whether the figure is per year or for the whole programme. The fee is shown as printed, with that caveat. It is not converted, and it is not called verified MYR.
- **Foundation programmes** are not mapped, because the official FAQ says they are not offered to international students (see conflicts below).

Examples of printed figures (see the booklet for all): Computer Science specialisations 89,200 (3.5 years); Civil, Biomedical, Electrical, Mechanical and Chemical Engineering 132,100 (4 years); Economics 77,100 (3.5 years); Medicine & Surgery 673,200 (5 years); Pharmacy 280,100 (4 years); Shariah 60,900 (3.5 years); Shariah and Law 82,500 (4 years).

### Admissions (`partially-researched`)

From the ASD FAQ (fetched in full):

- **Qualification:** 12 years of study and passing STPM, A-Level, IB, High School, Grade 12 or equivalent, or a recognised diploma with CGPA at least 3.00.
- **English:** IELTS Academic 5.0; TOEFL iBT 60 (PBT 500, CBT 173); PTE Academic 41; MUET band 3; Cambridge A-Level, O-Level or FCE grade C.
- **Higher English score** for listed programmes (Shariah and Law; Biomedical Science, Pharmacy, Nursing Science; Biochemistry, Biohealth, Genetics, Microbiology; Computer Science and IT; Civil, Biomedical, Electrical, Mechanical, Chemical Engineering; Accounting, Business Administration; TESL; Dental Surgery; English Language and Linguistics). **The higher figures are not published.**
- **Grade minimum:** none published, so the matcher reports grades as not checkable.
- **Standardised test:** none listed.
- **Interview:** may be required for some selection programmes.
- **Documents:** photos, certified passport copy, certified transcripts, English certificate if available, sponsor letter if sponsored, application fee. Certification by the school principal, a government officer, a commissioner for oaths or the embassy.
- **Malay language:** international students must take a Malay language course.

### Intakes and deadlines

Study@UM (2026/27, search excerpt): the October intake window for international undergraduates was 9 Feb to 30 Aug 2026 and has closed (Medicine had an earlier date, 9 June 2026). The **March 2027 window is 7 Sept 2026 to 30 Jan 2027, and it is open now.**

### Funding (`partially-researched`)

- **UM institutional scholarships for undergraduate international students: none.** Source: ASD FAQ (dated 2021). Check the current site.
- **PTE x UM Scholarship 2026:** GBP 3,000 towards tuition for international students, deadline 31 Dec 2026, per UM's ASD page (updated 14 Oct 2026). This is the only international-eligible external award on UM's official list. It is classified as **partial**. The sponsor's terms were not fetched, so eligibility details and the application route are not verified.
- **Not counted as free routes:**
  - PTPTN: Malaysian local higher-education loan.
  - BAeK PTPTN: for Malaysian eKasih households.
  - PTPS: for Sabah students.
  - AIA Penyala Harapan: for students admitted through UPU or Saluran Perdana.
  - RHB CMTF-i: Islamic financing, repayable.
  - PMG Pharmacy, EcoWorld and MMC Group: eligibility for international students is not stated on UM's page, so they are not counted. They should be checked with each sponsor.
- **MIS (Malaysia International Scholarship):** postgraduate only. Not an undergraduate route.
- **National (Pakistan), regional and sports awards:** not verified in this build.

### Costs

No costs record is stored for UM in USD (`costs: null`). The schema expects USD, and the printed figures are not confirmed as MYR. Living costs and visa costs are not verified.

## Conflicts between official sources (not resolved)

| Topic | Source A | Source B | What the site does |
|---|---|---|---|
| Intake months | ASD FAQ (2021): September (17 June) and February (11 November) | Study@UM 2026/27: October and March | Uses Study@UM (newer). |
| Application fee | ASD FAQ (2021): RM 300 | Study@UM: MYR 500 per international application | Uses MYR 500 and shows the conflict. Confirm in the portal. |
| Foundation for internationals | ASD FAQ: not offered to international students | Booklet lists foundation programmes at 35,000 | No foundation route recorded. |
| English minimum | ASD FAQ: IELTS 5.0 | Third-party sites: IELTS 6.5 or 6.0 | Uses the official 5.0 and marks higher programme figures as unknown. |
| Grade threshold | Third-party sites: about 65% | Official pages: none published | Uses "none published". |

## Verdict for a Pakistani international undergraduate

- **Can you apply?** Yes, on the recorded criteria. Grades cannot be checked because UM publishes no grade minimum.
- **Can you study for free?** No full-cover route is recorded. Only the PTE award (GBP 3,000 towards tuition) is listed. Tuition alone is not a full ride, and living costs are not covered.
- **Should you pursue it?** Decide on cost first. It may suit students who can fund the whole programme, and Islamic studies, engineering and science are among the options. It is not a free route on the evidence here.

## Next steps for this record

1. Read chunk 4 of the booklet only if postgraduate records are needed.
2. Fetch the PTE x UM sponsor page and record eligibility, nationalities and terms.
3. Confirm the application fee and intake calendar on the live portal (MAYA) and update the record.
4. Ask UM's international office to confirm the fee currency and per-year or total basis.
5. Check EcoWorld, MMC Group and PMG eligibility on their sponsor pages.
6. Confirm the programme-specific higher English score for the listed programmes.
