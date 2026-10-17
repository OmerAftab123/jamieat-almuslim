import { describe, expect, it } from 'vitest';
import { getDataset } from '@/lib/data';
import { answerFundamentalQuestion } from '@/lib/answer';
import type { MatchInput } from '@/lib/matching';

const d = getDataset();
const base: MatchInput = {
  degreeId: 'bachelor-mathematics',
  universityId: 'massachusetts-institute-technology-mit',
  intakeYear: 2027,
  applicantCountry: 'Pakistan',
  overallPercentage: null,
  englishTest: 'unknown',
  needsFinancialAid: null,
  annualBudgetUsd: null,
  avoidInterestFinance: false,
};

describe('answerFundamentalQuestion', () => {
  it('MIT, need unknown: can apply but grades cannot be checked; full cover depends on finances; should needs a funding plan', () => {
    const a = answerFundamentalQuestion(d, base);
    expect(a.can.verdict).toBe('grades-not-checkable');
    expect(a.free.verdict).toBe('conditional-full-cover-route');
    expect(a.should.verdict).toBe('reasonable-with-a-funding-plan');
    expect(a.dossierId).toBe('mit-free-study');
    expect(a.should.degreeScore?.rank).toBeGreaterThan(0);
  });

  it('MIT, applicant says they do not need aid: the need-based route is not counted as a free route', () => {
    const a = answerFundamentalQuestion(d, { ...base, needsFinancialAid: false });
    expect(a.free.verdict).toBe('no-route-recorded');
    expect(a.should.verdict).toBe('decide-on-cost-first');
  });

  it('UM, Pakistan, mapped programme: can apply (grades not checkable); only a partial external award, so free is partial-route-only', () => {
    const a = answerFundamentalQuestion(d, {
      ...base,
      degreeId: 'bachelor-economics',
      universityId: 'universiti-malaya-um',
      needsFinancialAid: true,
    });
    expect(a.dossierId).toBe('um-free-study');
    expect(a.can.verdict).toBe('grades-not-checkable');
    expect(a.free.verdict).toBe('partial-route-only');
    expect(a.should.verdict).toBe('decide-on-cost-first');
  });

  it('unverified programme is never answered as eligible', () => {
    const a = answerFundamentalQuestion(d, { ...base, universityId: 'university-michigan-ann-arbor' });
    expect(a.can.verdict).toBe('programme-not-verified');
    expect(a.should.verdict).toBe('not-enough-evidence');
    expect(a.free.verdict).toBe('not-researched');
  });

  it('every verdict carries explanatory text and the how-steps are never empty', () => {
    const a = answerFundamentalQuestion(d, base);
    for (const v of [a.can, a.free, a.should]) expect(v.label.length).toBeGreaterThan(10);
    expect(a.how.length).toBeGreaterThan(0);
    expect(a.disclaimers.length).toBeGreaterThan(0);
  });

  it('a university without a dossier gets generic how-steps', () => {
    const a = answerFundamentalQuestion(d, { ...base, universityId: 'university-michigan-ann-arbor' });
    expect(a.dossierId).toBeNull();
    expect(a.how[0]).toMatch(/course list|Confirm/);
  });
});
