import { describe, expect, it } from 'vitest';
import { getDataset } from '@/lib/data';
import { evaluateFunding, evaluateMatch, normaliseCountry, type MatchInput } from '@/lib/matching';
import type { Scholarship, University, Degree } from '@/lib/schemas';

const d = getDataset();
const mit = d.universities.find((u) => u.id === 'massachusetts-institute-technology-mit')!;
const degree = d.degrees[0]!;

const baseInput: MatchInput = {
  degreeId: degree.id,
  universityId: mit.id,
  intakeYear: 2027,
  applicantCountry: 'Pakistan',
  overallPercentage: null,
  englishTest: 'unknown',
  needsFinancialAid: null,
  annualBudgetUsd: null,
  avoidInterestFinance: false,
};

function fakeScholarship(overrides: Partial<Scholarship>): Scholarship {
  const base = d.scholarships[0]!;
  return { ...base, id: 'test-award', universityId: mit.id, ...overrides, eligibility: { ...base.eligibility, ...(overrides.eligibility ?? {}) } };
}

describe('programme status', () => {
  it('never reports a programme as verified when no record exists', () => {
    // Nursing is not on MIT's undergraduate degree charts, so no record exists for it.
    const r = evaluateMatch(d, { ...baseInput, degreeId: 'bachelor-nursing' });
    expect(r.program.status).toBe('program-not-verified');
    expect(r.classification.label).toBe('insufficient evidence');
  });
});

describe('verified MIT programme', () => {
  it('shows a mapped degree as verified, but never a possible candidate without a recorded grade minimum', () => {
    const r = evaluateMatch(d, { ...baseInput, degreeId: 'bachelor-mathematics', overallPercentage: 99 });
    expect(r.program.status).toBe('program-verified');
    expect(r.eligibility.status).toBe('insufficient-evidence');
    expect(r.classification.label).not.toBe('possible candidate');
  });
});

describe('eligibility', () => {
  it('reports insufficient evidence when admissions requirements are not recorded', () => {
    // Imperial has no admissions record in the dataset (MIT now has one).
    const r = evaluateMatch(d, { ...baseInput, universityId: 'imperial-college-london', overallPercentage: 95 });
    expect(r.eligibility.status).toBe('insufficient-evidence');
    expect(r.eligibility.notes.join(' ')).toMatch(/not been researched/);
  });

  it('does not report requirements as met when the record has no grade minimum', () => {
    const withAdmissions = { ...mit, admissions: { sourceId: 'x', englishTests: [] } };
    const fake = { ...d, universities: d.universities.map((u) => (u.id === mit.id ? withAdmissions : u)) };
    const r = evaluateMatch(fake, { ...baseInput, overallPercentage: 95 });
    expect(r.eligibility.status).toBe('insufficient-evidence');
    expect(r.eligibility.label).toMatch(/no grade minimum/);
  });

  it('marks missing fields rather than assuming them', () => {
    const r = evaluateMatch(d, baseInput);
    expect(r.eligibility.missingFields.length).toBeGreaterThan(0);
  });
});

describe('funding', () => {
  it('matches the MIT need-based record for a Pakistani applicant and marks the outcome as depending on finances when need is unknown', () => {
    const r = evaluateMatch(d, { ...baseInput, needsFinancialAid: null });
    expect(r.funding.matches.map((m) => m.scholarshipId)).toContain('mit-need-based-scholarship');
    const m = r.funding.matches.find((x) => x.scholarshipId === 'mit-need-based-scholarship')!;
    expect(m.relevance).toBe('unknown-depends-on-finances');
    expect(r.funding.status).toBe('matches-found-with-unknowns');
  });

  it('is low relevance when the applicant says they do not need aid', () => {
    const r = evaluateMatch(d, { ...baseInput, needsFinancialAid: false });
    const m = r.funding.matches.find((x) => x.scholarshipId === 'mit-need-based-scholarship')!;
    expect(m.relevance).toBe('low');
  });

  it('excludes an international-only award for a domestic applicant', () => {
    const r = evaluateMatch(d, { ...baseInput, applicantCountry: 'United States' });
    expect(r.funding.matches.length).toBe(0);
    expect(r.funding.excluded.some((e) => e.id === 'mit-need-based-scholarship')).toBe(true);
  });

  it('never labels the MIT record as a full ride or full scholarship', () => {
    const s = d.scholarships.find((x) => x.id === 'mit-need-based-scholarship')!;
    expect(s.classification).not.toBe('full-ride');
    expect(s.loansIncluded).toBe(false);
  });

  it('removes loan-bearing awards when the student avoids interest-bearing finance', () => {
    const uni = { ...mit, scholarshipIds: ['loan-award'] } as University;
    const loan = fakeScholarship({ id: 'loan-award', loansIncluded: true, loansNote: 'Includes a loan.' });
    const res = evaluateFunding([loan], uni, degree as Degree, {
      applicantCountry: 'Pakistan',
      needsFinancialAid: true,
      avoidInterestFinance: true,
    });
    expect(res.matches).toHaveLength(0);
    expect(res.excluded[0]?.reason).toMatch(/loans/i);
  });

  it('keeps a loan-bearing award but warns when the student does not avoid loans', () => {
    const uni = { ...mit } as University;
    const loan = fakeScholarship({ id: 'loan-award', loansIncluded: true, loansNote: 'Includes a loan.' });
    const res = evaluateFunding([loan], uni, degree as Degree, {
      applicantCountry: 'Pakistan',
      needsFinancialAid: true,
      avoidInterestFinance: false,
    });
    expect(res.matches).toHaveLength(1);
    expect(res.matches[0]?.warnings.join(' ')).toMatch(/Includes a loan/);
  });

  it('excludes awards limited to other nationalities', () => {
    const uni = { ...mit } as University;
    const s = fakeScholarship({
      id: 'nat-award',
      eligibility: { ...d.scholarships[0]!.eligibility, applicantScope: 'nationalities', nationalities: ['Kenya'] },
    });
    const res = evaluateFunding([s], uni, degree as Degree, {
      applicantCountry: 'Pakistan',
      needsFinancialAid: null,
      avoidInterestFinance: false,
    });
    expect(res.matches).toHaveLength(0);
    expect(res.excluded[0]?.reason).toMatch(/nationalities/);
  });
});

describe('costs', () => {
  it('shows the official MIT total as partially verified, with no breakdown invented', () => {
    const r = evaluateMatch(d, baseInput);
    expect(r.costs.status).toBe('partially-verified');
    expect(r.costs.officialCostOfAttendanceUsd).toBe(92760);
  });

  it('reports unverified costs for a university without cost records', () => {
    const other = d.universities.find((u) => u.costs === null)!;
    const r = evaluateMatch(d, { ...baseInput, universityId: other.id });
    expect(r.costs.status).toBe('unverified');
    expect(r.costs.officialCostOfAttendanceUsd).toBeNull();
  });
});

describe('country normalisation', () => {
  it('maps common aliases to one form', () => {
    expect(normaliseCountry('PK')).toBe('pakistan');
    expect(normaliseCountry(' USA ')).toBe('united states');
    expect(normaliseCountry('United Kingdom')).toBe('united kingdom');
  });
});

describe('international applicants', () => {
  it('treats a Malaysian applicant as international for an international-only award', () => {
    const r = evaluateMatch(d, { ...baseInput, degreeId: 'bachelor-mathematics', applicantCountry: 'Malaysia', needsFinancialAid: true });
    expect(r.funding.matches.some((m) => m.scholarshipId === 'mit-need-based-scholarship')).toBe(true);
    expect(r.funding.excluded.some((x) => x.id === 'mit-need-based-scholarship')).toBe(false);
  });

  it('excludes an applicant whose citizenship is the university country from international-only aid', () => {
    const r = evaluateMatch(d, { ...baseInput, degreeId: 'bachelor-mathematics', applicantCountry: 'United States' });
    expect(r.funding.excluded.some((x) => x.id === 'mit-need-based-scholarship')).toBe(true);
  });

  it('resolves ISO codes from the citizenship list to country names', () => {
    expect(normaliseCountry('MY')).toBe('malaysia');
    expect(normaliseCountry('EG')).toBe('egypt');
    expect(normaliseCountry('Egypt')).toBe('egypt');
    expect(normaliseCountry('US')).toBe('united states');
  });
});

