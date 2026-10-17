import { describe, expect, it } from 'vitest';
import { getDataset } from '@/lib/data';
import { AWARD_TYPES, buildPairReport, coverageSummary, routeTypes } from '@/lib/pairReport';

const d = getDataset();

describe('routeTypes', () => {
  it('maps dossier route wording to the six award types', () => {
    expect(routeTypes('Merit and need (TUM scholarship)')).toEqual(['merit', 'need']);
    expect(routeTypes('National (MEXT)')).toEqual(['national']);
    expect(routeTypes('Need-based (institutional)')).toEqual(['need', 'institutional']);
    expect(routeTypes('Regional or sports')).toEqual(['regional', 'sports']);
    expect(routeTypes('Something else')).toEqual([]);
  });
});

describe('buildPairReport', () => {
  it('returns null for unknown degree or university', () => {
    expect(buildPairReport(d, 'no-such-degree', 'massachusetts-institute-technology-mit')).toBeNull();
    expect(buildPairReport(d, 'bachelor-computer-science', 'no-such-university')).toBeNull();
  });

  it('MIT x computer science: verified programme, need-based route, five-stage roadmap', () => {
    const r = buildPairReport(d, 'bachelor-computer-science', 'massachusetts-institute-technology-mit')!;
    expect(r.programme.status).toBe('verified');
    expect(r.scholarships.need.some((s) => s.name.toLowerCase().includes('need') && s.appliesToCategory)).toBe(true);
    expect(r.requirements.general.length).toBeGreaterThan(0);
    expect(r.requirements.subject[0]!.status).toBe('verified-official');
    expect(r.roadmap).toHaveLength(5);
    expect(r.completeness.of).toBe(5);
    expect(r.completeness.score).toBeGreaterThanOrEqual(3);
    expect(r.question).toContain('Pakistani international student');
  });

  it('Harvard x computer science: programme not verified, never reported as offered', () => {
    const r = buildPairReport(d, 'bachelor-computer-science', 'harvard-university')!;
    expect(r.programme.status).toBe('not-verified');
    expect(r.roadmap[0]!.evidence).toBe('not-researched');
    expect(['not-researched', 'not-verified']).toContain(r.scholarships.national[0]!.status);
    expect(r.scholarships.sports[0]!.status).not.toBe('verified-official');
  });

  it('Edinburgh Mathematics award applies to maths and not to computing', () => {
    const maths = buildPairReport(d, 'bachelor-mathematics', 'university-edinburgh')!;
    const cs = buildPairReport(d, 'bachelor-computer-science', 'university-edinburgh')!;
    const mathsLine = maths.scholarships.merit.find((s) => s.name.includes('Mathematics'));
    const csLine = cs.scholarships.merit.find((s) => s.name.includes('Mathematics'));
    expect(mathsLine?.appliesToCategory).toBe(true);
    expect(csLine?.appliesToCategory).toBe(false);
  });

  it('Imperial scope covers engineering and computing, not arts', () => {
    const cs = buildPairReport(d, 'bachelor-computer-science', 'imperial-college-london')!;
    const line = cs.scholarships.merit.find((s) => s.name.includes('Inspires'));
    expect(line?.appliesToCategory).toBe(true);
  });

  it('every scholarship type key is always present', () => {
    const r = buildPairReport(d, 'bachelor-computer-science', 'university-tokyo')!;
    for (const t of AWARD_TYPES) expect(r.scholarships[t].length).toBeGreaterThan(0);
  });

  it('builds a report for every category x university pair without throwing', () => {
    let n = 0;
    for (const deg of d.degrees) {
      for (const u of d.universities) {
        const r = buildPairReport(d, deg.id, u.id);
        expect(r).not.toBeNull();
        n++;
      }
    }
    expect(n).toBe(d.degrees.length * d.universities.length);
  }, 120000);

  it('summary counts agree with the stored records', () => {
    const s = coverageSummary(d);
    expect(s.pairs).toBe(d.degrees.length * d.universities.length);
    expect(s.programmeVerifiedPairs).toBeGreaterThan(0);
    expect(s.universitiesWithDossier).toBe(d.freeStudy.dossiers.length);
  });
});
