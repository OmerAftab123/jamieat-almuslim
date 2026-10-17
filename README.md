# Jamieat Al-Muslim: career, university and free-study research for Muslim students

A free, open research website to help Muslim students (default: students from Pakistan considering **international undergraduate** study) compare degrees and careers, look at universities, check possible funding routes, and plan the steps.

It is a **static website** (Next.js 16, TypeScript). There is no database, no login, no paid AI API, and no server that receives student data. All data ships as versioned JSON files in `data/`, each record with a source, a date and a verification status.

> **Honesty first.** Missing data is shown as missing. Scores are documented judgements, not facts. Tuition-only support is never called a full scholarship. Loans are never called scholarships. The site does not issue religious rulings.

## What is in the site

| Page | What it does | Data status |
|---|---|---|
| `/careers` | Career explorer: 41 career families scored 0–4 on seven criteria, adjustable weights, restore defaults | Scores are editorial judgements with rationale and confidence per family |
| `/universities` | Directory of the **QS World University Rankings 2027 Top 150** (ties kept as published) | Ranks transcribed from the official QS page; programmes, admissions and costs mostly not yet researched |
| `/universities/[slug]` | Profile for each of the 150 universities | Shows only what is recorded; “not verified” elsewhere |
| `/matcher` | Free-study matcher: degree × university × intake × profile, with funding and cost estimate | Deterministic rules; only verified records can produce a “possible candidate” |
| `/compare` | Side-by-side comparison of up to 4 families or 4 universities (URL: `?families=…` or `?universities=…`) | Shows stored, dated values |
| `/roadmap` | Planning checklist, saved only in your browser (local storage) | General steps, labelled by kind |
| `/methodology` | Trust centre: sources, scoring, limitations | — |
| `/about` | Mission, principles, what this is not | — |

## Quick start (any operating system)

You need **Node.js 22 LTS** (20.9 or newer works) and **npm**.

```bash
npm ci                 # install exact dependencies from package-lock.json
npm run dev            # development server at http://localhost:3000
```

Full beginner instructions for Windows and PowerShell: **[docs/BEGINNER_LAUNCH_GUIDE.md](docs/BEGINNER_LAUNCH_GUIDE.md)**.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (binds to 0.0.0.0) |
| `npm run validate:data` | Checks every JSON file against its schema and cross-file references |
| `npm run typecheck` | TypeScript strict type check |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (scoring, weights, ranking, costs, scholarships, matcher, data integrity) |
| `npm run build` | Production static export to `out/` |
| `npm run check` | All of the above except the browser test: data, types, lint, unit tests, build |
| `npm run test:e2e` | Playwright browser smoke tests against `out/` (run `npm run build` first) |
| `npm run serve` | Serve the built `out/` folder locally on port 3100 |

## Deployment

| Target | Config in repo | Status |
|---|---|---|
| **GitHub Pages** (static export) | `.github/workflows/pages.yml`, `next.config.mjs` | Workflow written. It deploys only after the repository owner sets *Settings → Pages → Source: GitHub Actions*. See the status note in the [launch guide](docs/BEGINNER_LAUNCH_GUIDE.md). |
| **Vercel** | Next.js is detected automatically; no `BASE_PATH` needed | Not deployed by this repository. Import the GitHub repository in Vercel to create a deployment. |
| CI | `.github/workflows/ci.yml` | Runs `npm run check` and the Playwright smoke tests on each push and pull request |

Environment variables are optional and public. See `.env.example`. No secret is required or used.

## Project layout

```
app/            Pages (Next.js App Router) and layout
components/     Interactive client components and shared display helpers
lib/            Schemas (Zod), data loader, scoring, costs, matcher, roadmap
data/           Versioned research data (JSON) with sources and dates
tests/          Vitest unit tests
e2e/            Playwright browser smoke tests
scripts/        Data validator and a small static server for E2E tests
docs/           Mission, roadmap, architecture, methodology, coverage, launch guide
```

## Documentation

- [Mission and vision](docs/MISSION_AND_VISION.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Research methodology](docs/RESEARCH_METHODOLOGY.md)
- [Scoring methodology](docs/SCORING_METHODOLOGY.md)
- [Data coverage](docs/DATA_COVERAGE.md)
- [Beginner launch guide (Windows / PowerShell first)](docs/BEGINNER_LAUNCH_GUIDE.md)

## Contributing and corrections

Corrections, sources and research help are welcome through GitHub issues. Please include a link to an official source and the date you checked it.

## Licence and use

No licence file has been added yet. Until one is chosen, all rights are reserved by the repository owner. Data displayed on the site is from third-party sources (QS, universities, SBP); check each source's own terms before reuse.
