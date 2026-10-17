import type { Dataset } from '@/lib/data';
import { evaluateMatch, type MatchInput, type MatchResult } from '@/lib/matching';
import { rankProgrammes } from '@/lib/ranking';

/**
 * The fundamental question, answered from stored evidence only:
 *   Can a Pakistani (or any) international undergraduate apply, get admitted, and study this
 *   degree at this university for free?
 * Every verdict names the evidence behind it. Missing evidence is reported as "not researched",
 * never as "no". Nothing here is an admissions decision or a guarantee of funding.
 */

export type Verdict<T extends string> = { verdict: T; label: string; reasons: string[]; sourceIds: string[] };

export type CanVerdict = Verdict<
  'eligible-on-recorded-criteria' | 'below-recorded-minimum' | 'grades-not-checkable' | 'programme-not-verified' | 'not-researched'
>;

export type FreeVerdict = Verdict<
  'full-cover-route-recorded' | 'conditional-full-cover-route' | 'partial-route-only' | 'no-route-recorded' | 'not-researched'
> & { routes: Array<{ name: string; classification: string; relevance: string; warnings: string[] }> };

export type ShouldVerdict = Verdict<'reasonable-with-a-funding-plan' | 'decide-on-cost-first' | 'not-enough-evidence' | 'not-recommended-on-recorded-criteria'> & {
  forStudy: string[];
  forCaution: string[];
  degreeScore: { overall: number; rank: number; of: number; confidence: string } | null;
};

export type FundamentalAnswer = {
  degree: { id: string; name: string };
  university: { id: string; name: string };
  intakeYear: number;
  can: CanVerdict;
  free: FreeVerdict;
  should: ShouldVerdict;
  how: string[];
  dossierId: string | null;
  match: MatchResult;
  disclaimers: string[];
};

const FULL_COVER = new Set(['full-tuition', 'full-ride', 'full-cost-of-attendance']);

export function answerFundamentalQuestion(d: Dataset, input: MatchInput): FundamentalAnswer {
  const match = evaluateMatch(d, input);
  const uni = d.universities.find((u) => u.id === input.universityId)!;
  const degree = d.degrees.find((x) => x.id === input.degreeId)!;
  const dossier = d.freeStudy.dossiers.find((x) => x.universityId === uni.id) ?? null;
  const uniSources = uni.admissions && typeof uni.admissions === 'object' ? [(uni.admissions as { sourceId: string }).sourceId] : [];

  // ---- Can apply and get admitted (recorded criteria only). ----
  let can: CanVerdict;
  if (match.program.status !== 'program-verified') {
    can = {
      verdict: 'programme-not-verified',
      label: 'Programme not verified here. Confirm on the official course list before you rely on this.',
      reasons: [match.program.detail],
      sourceIds: [],
    };
  } else if (!uni.admissions) {
    can = {
      verdict: 'not-researched',
      label: 'Admission requirements not researched for this university.',
      reasons: ['No admissions record is stored. Check the official international admissions page.'],
      sourceIds: [],
    };
  } else if (match.eligibility.status === 'profile-below-recorded-requirements') {
    can = {
      verdict: 'below-recorded-minimum',
      label: 'Your profile is below a recorded minimum requirement.',
      reasons: match.eligibility.notes,
      sourceIds: uniSources,
    };
  } else if (match.eligibility.status === 'profile-meets-recorded-requirements') {
    can = {
      verdict: 'eligible-on-recorded-criteria',
      label: 'You meet the recorded criteria. Competitive selection is not assessed.',
      reasons: match.eligibility.notes,
      sourceIds: uniSources,
    };
  } else {
    can = {
      verdict: 'grades-not-checkable',
      label: 'Recorded criteria cannot be checked with the information you gave.',
      reasons: [...match.eligibility.notes, ...match.eligibility.missingFields.map((m) => `Missing: ${m}`)],
      sourceIds: uniSources,
    };
  }

  // ---- Can study for free (tuition, or tuition plus living costs, from a non-loan award). ----
  const routes = match.funding.matches.map((m) => ({
    name: m.name,
    classification: m.classification,
    relevance: m.relevance,
    warnings: m.warnings,
  }));
  // A route the student is unlikely to need (relevance 'low') is not counted as a free route.
  const fullRoutes = match.funding.matches.filter((m) => FULL_COVER.has(m.classification) && m.relevance !== 'low');
  let free: FreeVerdict;
  if (dossier === null && uni.dataStatus.scholarships === 'not-researched' && routes.length === 0) {
    free = {
      verdict: 'not-researched',
      label: 'Scholarships not researched for this university. This is not a finding that no free route exists.',
      reasons: ['No funding records are stored for this university.'],
      sourceIds: [],
      routes,
    };
  } else if (fullRoutes.length > 0) {
    const needDependent = fullRoutes.some((m) => m.relevance === 'unknown-depends-on-finances');
    free = {
      verdict: needDependent ? 'conditional-full-cover-route' : 'full-cover-route-recorded',
      label: needDependent
        ? 'A full-cover route is recorded, but the award depends on your family finances, which you have not given.'
        : 'A full-cover route is recorded for your profile. Eligibility must still be confirmed with the funder.',
      reasons: fullRoutes.flatMap((m) => m.reasons),
      sourceIds: fullRoutes.flatMap((m) => m.sourceIds),
      routes,
    };
  } else if (routes.some((r) => r.relevance !== 'low')) {
    const relevant = match.funding.matches.filter((m) => m.relevance !== 'low');
    free = {
      verdict: 'partial-route-only',
      label: 'Only partial routes are recorded. They do not cover the full cost, so a free degree is not established.',
      reasons: relevant.map((m) => `${m.name}: ${m.classification.replace(/-/g, ' ')}`),
      sourceIds: relevant.flatMap((m) => m.sourceIds),
      routes,
    };
  } else {
    free = {
      verdict: 'no-route-recorded',
      label: 'No verified free route is recorded for your profile. Research is incomplete, so this is not proof that none exists.',
      reasons: [
        ...routes
          .filter((r) => r.relevance === 'low')
          .map((r) => `${r.name}: you said you do not need aid, so it is unlikely to apply.`),
        ...match.funding.excluded.map((x) => `Excluded: ${x.name}. ${x.reason}`),
      ],
      sourceIds: [],
      routes,
    };
  }

  // ---- Should you pursue it here? (reasons, not a recommendation of a person's life choices.) ----
  const ranking = rankProgrammes(d, uni.id);
  const row = ranking.find((r) => r.degreeId === degree.id) ?? null;
  const forStudy: string[] = [];
  const forCaution: string[] = [];
  if (can.verdict === 'eligible-on-recorded-criteria') forStudy.push('You meet the recorded admission criteria.');
  if (free.verdict === 'full-cover-route-recorded' || free.verdict === 'conditional-full-cover-route') {
    forStudy.push('A full-cover funding route is recorded, which would limit the cost you carry.');
  }
  if (row) {
    forStudy.push(
      `The degree ranks ${row.rank} of ${ranking.length} mapped programmes at this university on the analyst-draft criteria (mean ${row.overall.toFixed(1)} of 4).`,
    );
  }
  if (dossier) forStudy.push(...dossier.reasoning.forStudy);
  if (can.verdict !== 'eligible-on-recorded-criteria') forCaution.push(can.label);
  if (free.verdict === 'no-route-recorded' || free.verdict === 'partial-route-only' || free.verdict === 'not-researched') {
    forCaution.push('Without a full-cover route, the full cost may fall on your family or on loans. Plan the total before you apply.');
  }
  if (free.verdict === 'conditional-full-cover-route') {
    forCaution.push('The free route depends on a financial-need assessment, which can leave a gap.');
  }
  if (dossier) forCaution.push(...dossier.reasoning.againstOrCaution);
  forCaution.push('Admission outcomes and funding are never guaranteed.');

  let shouldVerdict: ShouldVerdict['verdict'];
  let shouldLabel: string;
  if (can.verdict === 'not-researched' || can.verdict === 'programme-not-verified') {
    shouldVerdict = 'not-enough-evidence';
    shouldLabel = 'Not enough verified evidence to recommend this route. Research the programme and the admission requirements first.';
  } else if (can.verdict === 'below-recorded-minimum') {
    shouldVerdict = 'not-recommended-on-recorded-criteria';
    shouldLabel = 'The recorded criteria are not met. Consider a programme or university where the requirements match your profile.';
  } else if (free.verdict === 'full-cover-route-recorded' || free.verdict === 'conditional-full-cover-route') {
    shouldVerdict = 'reasonable-with-a-funding-plan';
    shouldLabel = 'Reasonable to pursue if you can meet the funding conditions, and keep a plan for any gap.';
  } else {
    shouldVerdict = 'decide-on-cost-first';
    shouldLabel = 'Decide on cost first. No full-cover route is established for your profile.';
  }

  const how: string[] = dossier
    ? [...dossier.answers.how]
    : [
        match.program.status === 'program-verified'
          ? 'Confirm the programme and its prerequisites on the official course list.'
          : 'Find this degree on the university’s official undergraduate course list and confirm it is offered for your intake.',
        'Read the official international admission requirements, including English-test minimums and any subject prerequisites.',
        'Read the official scholarship pages for international undergraduates and record each route’s conditions, including whether it involves loans.',
        'Build a total-cost plan in your own currency, using the official tuition and fee page and your own living-cost estimate.',
        'Apply by the official deadline and keep copies of every document and submission confirmation.',
      ];

  return {
    degree: { id: degree.id, name: degree.name },
    university: { id: uni.id, name: uni.name },
    intakeYear: input.intakeYear,
    can,
    free,
    should: {
      verdict: shouldVerdict,
      label: shouldLabel,
      reasons: forStudy,
      sourceIds: [],
      forStudy,
      forCaution,
      degreeScore: row ? { overall: row.overall, rank: row.rank, of: ranking.length, confidence: row.confidence } : null,
    },
    how,
    dossierId: dossier ? dossier.id : null,
    match,
    disclaimers: [
      'Research output from stored, dated records. It is not an admissions decision, a scholarship offer, a guarantee, or individual religious or legal advice.',
      'Degree scores are analyst-draft opinions. They are not evidence of job or salary outcomes.',
      'A "not researched" result means the platform has no record yet. It does not mean the route does not exist.',
    ],
  };
}
