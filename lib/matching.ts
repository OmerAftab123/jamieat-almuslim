import type { Dataset } from '@/lib/data';
import type { Degree, Family, Scholarship, University } from '@/lib/schemas';
import { COUNTRIES } from '@/lib/countries';

/**
 * Deterministic degree x university matcher. Pure function: no network, no AI, no storage.
 * It reports only what the stored evidence establishes and marks every other item as unverified.
 */

export type EnglishTest = 'none' | 'ielts' | 'toefl' | 'pte' | 'other' | 'unknown';

export type MatchInput = {
  degreeId: string;
  universityId: string;
  intakeYear: number;
  /** Applicant country of citizenship: a country name or ISO code, e.g. "Malaysia" or "MY". Defaults to Pakistan in the UI. */
  applicantCountry: string;
  /** Optional: overall percentage or grade equivalent, if the student knows it. */
  overallPercentage: number | null;
  englishTest: EnglishTest;
  /** true = needs aid, false = does not need aid, null = unknown. */
  needsFinancialAid: boolean | null;
  /** Optional annual budget in USD. */
  annualBudgetUsd: number | null;
  /** Student preference: avoid conventional interest-bearing finance. */
  avoidInterestFinance: boolean;
};

export type ProgramStatus =
  | 'program-verified'
  | 'program-not-verified'
  | 'no-matching-program-found'
  | 'postgraduate-only';

export type MatchResult = {
  degree: { id: string; name: string; family: string; familyName: string };
  university: { id: string; name: string; country: string; city: string; qsRank: string };
  intakeYear: number;
  program: { status: ProgramStatus; label: string; detail: string };
  eligibility: {
    status: 'insufficient-evidence' | 'profile-meets-recorded-requirements' | 'profile-below-recorded-requirements';
    label: string;
    missingFields: string[];
    notes: string[];
  };
  funding: {
    status: 'no-verified-records' | 'matches-found' | 'matches-found-with-unknowns';
    label: string;
    matches: FundingMatch[];
    excluded: { id: string; name: string; reason: string }[];
  };
  costs: {
    status: 'unverified' | 'partially-verified';
    label: string;
    officialCostOfAttendanceUsd: number | null;
    sourceId: string | null;
    notes: string[];
  };
  classification: {
    label: CandidateLabel;
    rationale: string[];
    risks: string[];
    unknowns: string[];
  };
  nextAction: string;
  disclaimers: string[];
};

export type CandidateLabel =
  | 'strong candidate'
  | 'possible candidate'
  | 'ambitious candidate'
  | 'poor fit'
  | 'insufficient evidence';

export type FundingMatch = {
  scholarshipId: string;
  name: string;
  classification: string;
  classificationNote: string;
  relevance: 'possible' | 'unknown-depends-on-finances' | 'low';
  reasons: string[];
  warnings: string[];
  sourceIds: string[];
  lastVerified: string;
  verificationStatus: string;
};

const COUNTRY_ALIASES: Record<string, string> = {
  us: 'united states',
  usa: 'united states',
  'united states of america': 'united states',
  uk: 'united kingdom',
  'great britain': 'united kingdom',
  england: 'united kingdom',
  'hong kong sar': 'hong kong',
  'hong kong': 'hong kong',
  'south korea': 'south korea',
  'republic of korea': 'south korea',
  'korea, republic of': 'south korea',
  'uae': 'united arab emirates',
};

/** ISO 3166 alpha-2 codes for the citizenship list, mapped to lower-case names. */
const ISO2_TO_NAME: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.iso2.toLowerCase(), c.name.toLowerCase()]),
);

/** Normalise a country name or code for comparison. Unknown values are returned lower-cased. */
export function normaliseCountry(value: string): string {
  const key = value.trim().toLowerCase().replace(/\s+/g, ' ');
  const byCode = key.length === 2 ? ISO2_TO_NAME[key] : undefined;
  return byCode ?? COUNTRY_ALIASES[key] ?? key;
}

function isInternational(applicantCountry: string, universityCountry: string): boolean {
  return normaliseCountry(applicantCountry) !== normaliseCountry(universityCountry.replace(/\s*\(.*\)$/, ''));
}

function findFamily(d: Dataset, familyId: string): Family | undefined {
  return d.families.find((f) => f.id === familyId);
}

/** Evaluate funding records for one applicant. Pure: relies only on the supplied records. */
export function evaluateFunding(
  scholarships: Scholarship[],
  university: University,
  degree: Degree,
  input: Pick<MatchInput, 'applicantCountry' | 'needsFinancialAid' | 'avoidInterestFinance'>,
): { matches: FundingMatch[]; excluded: { id: string; name: string; reason: string }[] } {
  const matches: FundingMatch[] = [];
  const excluded: { id: string; name: string; reason: string }[] = [];

  for (const s of scholarships) {
    if (s.universityId !== university.id) continue;
    const e = s.eligibility;
    const reasons: string[] = [];
    const warnings: string[] = [];

    if (e.applicantScope === 'international-only' && !isInternational(input.applicantCountry, university.country)) {
      excluded.push({ id: s.id, name: s.name, reason: 'Open only to international applicants; your country matches the university country.' });
      continue;
    }
    if (e.applicantScope === 'nationalities') {
      const list = (e.nationalities ?? []).map(normaliseCountry);
      if (!list.includes(normaliseCountry(input.applicantCountry))) {
        excluded.push({ id: s.id, name: s.name, reason: 'Limited to listed nationalities, which do not include your country.' });
        continue;
      }
    }
    if (e.degreeFamilyScope !== 'any' && !e.degreeFamilyScope.includes(degree.family)) {
      excluded.push({ id: s.id, name: s.name, reason: 'Does not cover this degree family.' });
      continue;
    }

    let relevance: FundingMatch['relevance'] = 'possible';
    if (e.requiresFinancialNeed) {
      if (input.needsFinancialAid === false) {
        relevance = 'low';
        reasons.push('Need-based: you indicated you do not need financial aid, so this award is unlikely to matter.');
      } else if (input.needsFinancialAid === null) {
        relevance = 'unknown-depends-on-finances';
        reasons.push('Need-based: the award amount depends on family finances, which you have not provided.');
      } else {
        reasons.push('Need-based award; eligibility depends on a documented financial-need assessment.');
      }
    } else {
      reasons.push('Not need-based according to the record.');
    }
    reasons.push(`Classification: ${s.classification.replace(/-/g, ' ')}. ${s.classificationNote}`);

    if (s.loansIncluded) {
      warnings.push(s.loansNote);
      if (input.avoidInterestFinance) {
        excluded.push({ id: s.id, name: s.name, reason: 'Includes loans, which you asked to avoid.' });
        continue;
      }
    } else {
      reasons.push(s.loansNote);
    }
    warnings.push(...s.uncoveredCosts.map((c) => `Not covered or unverified: ${c}`));

    matches.push({
      scholarshipId: s.id,
      name: s.name,
      classification: s.classification,
      classificationNote: s.classificationNote,
      relevance,
      reasons,
      warnings,
      sourceIds: s.sources,
      lastVerified: s.lastVerified,
      verificationStatus: s.verificationStatus,
    });
  }
  return { matches, excluded };
}

export function evaluateMatch(d: Dataset, input: MatchInput): MatchResult {
  const degree = d.degrees.find((x) => x.id === input.degreeId);
  if (!degree) throw new Error(`Unknown degree: ${input.degreeId}`);
  const university = d.universities.find((x) => x.id === input.universityId);
  if (!university) throw new Error(`Unknown university: ${input.universityId}`);
  const family = findFamily(d, degree.family);
  const familyName = family?.name ?? degree.family;

  // ---- Programme availability: never inferred from the university's existence or rank. ----
  const programRecords = (university.programs as Array<{ degreeId: string; status: string }>).filter(
    (p) => p.degreeId === degree.id,
  );
  const verifiedProgram = programRecords.find((p) => p.status === 'verified');
  let program: MatchResult['program'];
  if (verifiedProgram) {
    program = {
      status: 'program-verified',
      label: 'Programme verified to exist',
      detail: 'A verified undergraduate programme record exists for this degree at this university.',
    };
  } else {
    program = {
      status: 'program-not-verified',
      label: 'Programme NOT verified',
      detail: `We have no verified undergraduate record for ${degree.name} at ${university.name}. This does not prove the programme is absent: it may exist under a different title. Check the university's official course list.`,
    };
  }

  // ---- Eligibility: only the recorded admissions requirements can be assessed. ----
  const missingFields: string[] = [];
  if (input.overallPercentage === null) missingFields.push('Overall percentage or grade equivalent (secondary-school results)');
  if (input.englishTest === 'unknown') missingFields.push('English-language test status');
  if (input.needsFinancialAid === null) missingFields.push('Whether you need financial aid');
  if (input.annualBudgetUsd === null) missingFields.push('Annual budget (optional, for affordability context)');

  const notes: string[] = [];
  const admissions = university.admissions as null | {
    minimumPercentage?: number;
    acceptableEnglishTests?: EnglishTest[];
    sourceId: string;
  };
  let eligibilityStatus: MatchResult['eligibility']['status'] = 'insufficient-evidence';
  let eligibilityLabel = 'Insufficient evidence: admissions requirements are not recorded for this university.';
  if (admissions) {
    const below =
      admissions.minimumPercentage !== undefined &&
      input.overallPercentage !== null &&
      input.overallPercentage < admissions.minimumPercentage;
    if (below) {
      eligibilityStatus = 'profile-below-recorded-requirements';
      eligibilityLabel = 'Your profile is below a recorded minimum requirement.';
    } else if (admissions.minimumPercentage !== undefined && input.overallPercentage === null) {
      eligibilityStatus = 'insufficient-evidence';
      eligibilityLabel = 'Insufficient evidence: enter your grades to check the recorded minimum.';
    } else if (admissions.minimumPercentage === undefined) {
      // A record without a grade minimum must not be read as "requirements met".
      eligibilityStatus = 'insufficient-evidence';
      eligibilityLabel =
        'Insufficient evidence: no grade minimum is recorded for this university, so your grades cannot be checked against it.';
      notes.push('Other recorded requirements (for example English and standardised tests) are shown on the university profile. The matcher does not check them.');
    } else {
      eligibilityStatus = 'profile-meets-recorded-requirements';
      eligibilityLabel = 'Profile meets the recorded requirements checked here (competitive selection is not assessed).';
    }
  } else {
    notes.push('Admissions requirements have not been researched for this university. Eligibility cannot be assessed from stored evidence.');
  }
  notes.push(
    'Equivalence of your school-leaving qualification (for example FSc, A-levels, IB Diploma, a national exam or an O/A-level sequence) must be checked on the university’s official international admissions page.',
  );

  // ---- Funding: deterministic filter over stored records. ----
  const funding = evaluateFunding(
    d.scholarships.filter((s) => university.scholarshipIds.includes(s.id)),
    university,
    degree,
    input,
  );
  let fundingStatus: MatchResult['funding']['status'] = 'no-verified-records';
  let fundingLabel =
    'No verified funding record for this university and profile. This is NOT a finding that no aid exists: research is incomplete.';
  if (funding.matches.length > 0) {
    const unknown = funding.matches.some((m) => m.relevance === 'unknown-depends-on-finances');
    fundingStatus = unknown ? 'matches-found-with-unknowns' : 'matches-found';
    fundingLabel = unknown
      ? 'Possible matches found; relevance depends on information you have not provided.'
      : 'Possible matches found in stored records. Eligibility must be confirmed with the funder.';
  }

  // ---- Costs. ----
  const coa = university.costs;
  const costs: MatchResult['costs'] = coa
    ? {
        status: 'partially-verified',
        label: 'Official total cost of attendance recorded; breakdown not verified.',
        officialCostOfAttendanceUsd: coa.totalCostOfAttendance2026_27USD,
        sourceId: coa.sourceId,
        notes: [coa.note, 'Use the cost calculator with your own living and travel estimates.'],
      }
    : {
        status: 'unverified',
        label: 'Costs not verified for this university.',
        officialCostOfAttendanceUsd: null,
        sourceId: null,
        notes: ['Tuition, fees and living costs must be checked on the official fees and accommodation pages.'],
      };

  // ---- Classification: explainable rules; never a probability. ----
  const rationale: string[] = [];
  const risks: string[] = [];
  const unknowns: string[] = [];
  let label: CandidateLabel = 'insufficient evidence';
  if (program.status !== 'program-verified') {
    unknowns.push('Whether the degree is offered as an undergraduate programme here.');
    rationale.push('The programme has not been verified, so no suitability classification can be made.');
  }
  if (!admissions) unknowns.push('Official admissions and entry requirements.');
  if (eligibilityStatus === 'profile-below-recorded-requirements') {
    label = 'poor fit';
    risks.push('Your recorded profile is below a documented minimum requirement.');
  }
  if (program.status === 'program-verified' && admissions && eligibilityStatus === 'profile-meets-recorded-requirements') {
    label = 'possible candidate';
    rationale.push('The programme exists and the recorded requirements are met. Competitiveness is not assessed.');
  }
  if (funding.matches.length === 0) risks.push('No verified funding route is recorded; the full cost may be out-of-pocket.');
  if (funding.matches.some((m) => m.relevance === 'unknown-depends-on-finances')) {
    unknowns.push('Your family financial position, which decides need-based award size.');
  }
  if (input.needsFinancialAid === false) {
    rationale.push('You indicated you do not need financial aid, so need-based awards carry less weight for you.');
  }
  risks.push('Admission, scholarship and visa outcomes are never guaranteed.');
  unknowns.push('Competitive selection statistics for this programme and intake.');
  if (input.englishTest === 'none' || input.englishTest === 'unknown') {
    unknowns.push('English-language requirements and whether your test results satisfy them.');
  }

  let nextAction: string;
  if (program.status !== 'program-verified') {
    nextAction = `Open ${university.name}'s official undergraduate course list and confirm whether ${degree.name} is offered for ${input.intakeYear}.`;
  } else if (!admissions) {
    nextAction = `Read the official international admissions requirements for ${degree.name} and compare them with your results.`;
  } else {
    nextAction = `Check the official deadlines and document list for ${input.intakeYear} and start the application checklist.`;
  }

  return {
    degree: { id: degree.id, name: degree.name, family: degree.family, familyName },
    university: {
      id: university.id,
      name: university.name,
      country: university.country,
      city: university.city,
      qsRank: university.qsRank.display,
    },
    intakeYear: input.intakeYear,
    program,
    eligibility: { status: eligibilityStatus, label: eligibilityLabel, missingFields, notes },
    funding: { status: fundingStatus, label: fundingLabel, matches: funding.matches, excluded: funding.excluded },
    costs,
    classification: { label, rationale, risks, unknowns },
    nextAction,
    disclaimers: [
      'Educational research and decision support only. This is not an admissions decision, a scholarship offer, or individual religious or legal advice.',
      'Results use only the stored, dated records. Anything marked unverified must be checked on the official source before you rely on it.',
      'Your profile is processed in your browser. Nothing you enter here is sent to or stored on the server.',
    ],
  };
}
