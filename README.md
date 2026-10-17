# Jamieat Al-Muslim: career, university and free-study research for Muslim students

A free, open research site to help Muslim students, especially those in Pakistan considering international undergraduate study, compare degree families, check universities, look for documented funding, and plan each step.

**Honest status:** this is an early, partial research platform. Career scores are analyst drafts. The university list covers QS 2027 ranks 1 to =45 only. Funding records and programme data are very limited, and the site says so wherever data is missing. See [docs/DATA_COVERAGE.md](docs/DATA_COVERAGE.md).

## What it does

| Page | Purpose |
| --- | --- |
| `/careers` | Career explorer: 41 degree families scored 0–4 on seven criteria, adjustable weights, rationale and sources. |
| `/universities` | University directory: QS 2027 ranks 1 to =45, ties preserved, data status per section. |
| `/universities/[slug]` | University profile with status, costs, funding records and sources. |
| `/matcher` | Free-study matcher: degree × university × intake, programme status, eligibility, funding, costs, next action. Runs in your browser. |
| `/matcher` (calculator) | Cost calculator for your own USD estimates, with PKR conversion from a dated rate. |
| `/compare` | Compare up to four career families or four universities. |
| `/roadmap` | Step-by-step checklist, with official deadlines separated from personal targets. |
| `/methodology` | How scores, rankings, funding, costs and sources work, and what is missing. |
| `/about` | Mission, principles and limits. |

## Principles

- Verified or labelled: every figure is sourced and dated, or marked as an estimate, draft, or not verified.
- Missing is never zero. A missing score makes the overall score unavailable.
- Tuition-only support is never called a full scholarship, and loans are never called scholarships.
- Religious alignment is one of seven criteria. No score makes a degree obligatory or forbidden. The site does not issue rulings.
- No accounts, no tracking, no database, no paid AI APIs. Matcher inputs stay in your browser.

## Quick start

Windows (PowerShell) users: follow [docs/BEGINNER_LAUNCH_GUIDE.md](docs/BEGINNER_LAUNCH_GUIDE.md).

Short version (Node.js 20.9+ and Git required):

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 (listens on all interfaces). |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run validate:data` | Validate every file in `data/` against its schema and cross-file rules. |
| `npm run typecheck` | TypeScript strict type check. |
| `npm run lint` | ESLint. |
| `npm run test` | Unit tests (scoring, weights, ranking, costs, matching, data integrity). |
| `npx playwright install chromium` then `npm run test:e2e` | Browser smoke tests against the production build. |
| `npm run check` | All of the above except browser tests. |

## Project structure

```
app/          pages (App Router) and layout
components/   client and shared components
lib/          pure logic: schemas, data loader, scoring, costs, matching, roadmap
data/         versioned datasets (JSON) with sources and dates
scripts/      data validation script
tests/        Vitest unit tests
e2e/          Playwright smoke tests
docs/         mission, roadmap, architecture, methodology, coverage, launch guide
```

## Data and sources

All research data lives in `data/` as versioned JSON. Each source is listed in `data/sources.json` with how it was checked and when. To correct or add data, edit the JSON, run `npm run check`, and open a pull request. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#extending-the-data).

## Configuration

Copy `.env.example` to `.env.local` only if you need it. No secrets are required. Any variable prefixed `NEXT_PUBLIC_` is visible to every visitor and must never hold a secret.

## Deployment

- **GitHub:** repository with CI (`.github/workflows/ci.yml`) that runs the checks and browser smoke tests on each push.
- **Vercel:** import the repository in Vercel and deploy. No environment variables are required. See the launch guide, section 8.

Deployment status is reported in the pull request and repository notes. Do not assume a live URL exists until it is confirmed.

## Documentation

- [Mission and vision](docs/MISSION_AND_VISION.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Research methodology](docs/RESEARCH_METHODOLOGY.md)
- [Scoring methodology](docs/SCORING_METHODOLOGY.md)
- [Data coverage](docs/DATA_COVERAGE.md)
- [Beginner launch guide (Windows, PowerShell first)](docs/BEGINNER_LAUNCH_GUIDE.md)

## Licence and contributions

Add a licence before accepting outside contributions. Corrections are welcome through GitHub issues, with the official source that supports the correction.
