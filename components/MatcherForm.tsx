'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Dataset } from '@/lib/data';
import type { Degree } from '@/lib/schemas';
import { evaluateMatch, type EnglishTest, type MatchInput, type MatchResult } from '@/lib/matching';
import { buildRoadmap } from '@/lib/roadmap';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { StatusBadge } from '@/components/shared';
import { COUNTRIES } from '@/lib/countries';
import { STUDENT_LIFE_DISCLAIMER, STUDENT_LIFE_ITEMS } from '@/lib/studentLife';

const DEFAULT_INPUT = {
  degreeId: '',
  universityId: '',
  intakeYear: 2027,
  applicantCountry: 'Pakistan',
  overallPercentage: '' as string,
  englishTest: 'unknown' as EnglishTest,
  needs: 'unknown' as 'yes' | 'no' | 'unknown',
  annualBudgetUsd: '' as string,
  avoidInterestFinance: false,
};

function num(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function MatcherForm({ dataset }: { dataset: Dataset }) {
  const { degrees, universities } = dataset;
  const [form, setForm] = useState(DEFAULT_INPUT);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const degreesByFamily = useMemo(() => {
    const map = new Map<string, Degree[]>();
    for (const deg of degrees) map.set(deg.family, [...(map.get(deg.family) ?? []), deg]);
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [degrees]);

  const unis = useMemo(
    () => [...universities].sort((a, b) => a.qsRank.position - b.qsRank.position),
    [universities],
  );

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setResult(null);
  }

  function run(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.degreeId || !form.universityId) {
      setError('Choose a degree and a university first.');
      return;
    }
    const pct = num(form.overallPercentage);
    if (form.overallPercentage.trim() !== '' && (pct === null || pct < 0 || pct > 100)) {
      setError('Enter your overall percentage as a number from 0 to 100, or leave it blank.');
      return;
    }
    const budget = num(form.annualBudgetUsd);
    if (form.annualBudgetUsd.trim() !== '' && (budget === null || budget < 0)) {
      setError('Enter the annual budget as a positive number in USD, or leave it blank.');
      return;
    }
    if (!Number.isInteger(form.intakeYear) || form.intakeYear < 2026 || form.intakeYear > 2035) {
      setError('Choose an intake year between 2026 and 2035.');
      return;
    }
    if (form.applicantCountry.trim() === '') {
      setError('Choose your citizenship (country). It decides which international-only awards may apply to you.');
      return;
    }
    const input: MatchInput = {
      degreeId: form.degreeId,
      universityId: form.universityId,
      intakeYear: form.intakeYear,
      applicantCountry: form.applicantCountry.trim(),
      overallPercentage: pct,
      englishTest: form.englishTest,
      needsFinancialAid: form.needs === 'yes' ? true : form.needs === 'no' ? false : null,
      annualBudgetUsd: budget,
      avoidInterestFinance: form.avoidInterestFinance,
    };
    setResult(evaluateMatch(dataset, input));
  }

  const roadmap = result ? buildRoadmap(result) : [];

  return (
    <div>
      <form onSubmit={run} className="panel" aria-labelledby="match-form-h" noValidate>
        <h2 id="match-form-h" style={{ marginTop: 0 }}>
          Your choices
        </h2>
        <div className="form-grid">
          <div>
            <label htmlFor="m-degree">Degree</label>
            <select id="m-degree" value={form.degreeId} onChange={(e) => set('degreeId', e.target.value)} required>
              <option value="">Choose a degree</option>
              {degreesByFamily.map(([fam, list]) => (
                <optgroup key={fam} label={fam.replace(/-/g, ' ')}>
                  {list.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="m-uni">University (QS 2027 list)</label>
            <select id="m-uni" value={form.universityId} onChange={(e) => set('universityId', e.target.value)} required>
              <option value="">Choose a university</option>
              {unis.map((u) => (
                <option key={u.id} value={u.id}>
                  QS {u.qsRank.display} &middot; {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="m-intake">Intake year (starts in autumn of)</label>
            <input
              id="m-intake"
              type="number"
              min={2026}
              max={2035}
              value={form.intakeYear}
              onChange={(e) => set('intakeYear', Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="m-country">Citizenship (country)</label>
            <input
              id="m-country"
              list="country-options"
              value={form.applicantCountry}
              onChange={(e) => set('applicantCountry', e.target.value)}
              autoComplete="country-name"
            />
            <datalist id="country-options">
              {COUNTRIES.map((c) => (
                <option key={c.iso2} value={c.name} />
              ))}
            </datalist>
            <span className="hint">
              Pre-filled with Pakistan as the starting choice. Change it to your own country. Used to check international-only funding.
            </span>
          </div>
          <div>
            <label htmlFor="m-pct">Overall percentage or grade equivalent (optional)</label>
            <input
              id="m-pct"
              type="text"
              inputMode="decimal"
              value={form.overallPercentage}
              onChange={(e) => set('overallPercentage', e.target.value)}
              placeholder="e.g. 78"
            />
            <span className="hint">Used only against a recorded minimum. Competitive selection is never assessed.</span>
          </div>
          <div>
            <label htmlFor="m-eng">English test status</label>
            <select id="m-eng" value={form.englishTest} onChange={(e) => set('englishTest', e.target.value as EnglishTest)}>
              <option value="unknown">Not sure yet</option>
              <option value="ielts">IELTS</option>
              <option value="toefl">TOEFL</option>
              <option value="pte">PTE</option>
              <option value="other">Other</option>
              <option value="none">No test yet</option>
            </select>
          </div>
          <div>
            <label htmlFor="m-needs">Do you need financial aid?</label>
            <select id="m-needs" value={form.needs} onChange={(e) => set('needs', e.target.value as 'yes' | 'no' | 'unknown')}>
              <option value="unknown">Not sure / not answered</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label htmlFor="m-budget">Annual budget in USD (optional)</label>
            <input
              id="m-budget"
              type="text"
              inputMode="decimal"
              value={form.annualBudgetUsd}
              onChange={(e) => set('annualBudgetUsd', e.target.value)}
              placeholder="e.g. 20000"
            />
          </div>
          <div>
            <label htmlFor="m-interest">
              <input
                id="m-interest"
                type="checkbox"
                checked={form.avoidInterestFinance}
                onChange={(e) => set('avoidInterestFinance', e.target.checked)}
                style={{ width: 'auto', marginRight: '0.4rem' }}
              />
              Avoid interest-bearing loans
            </label>
            <span className="hint">Loan-bearing awards are removed from results when this is ticked.</span>
          </div>
        </div>
        {error ? (
          <p className="notice bad" role="alert">
            {error}
          </p>
        ) : null}
        <div className="toolbar">
          <button type="submit">Check this match</button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm(DEFAULT_INPUT);
              setResult(null);
              setError(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {result ? <MatchReport result={result} dataset={dataset} roadmapLength={roadmap.length} /> : null}
      {result ? <StudentLifeChecklist /> : null}
    </div>
  );
}

function MatchReport({ result: r, dataset, roadmapLength }: { result: MatchResult; dataset: Dataset; roadmapLength: number }) {
  const candidateTone = r.classification.label === 'possible candidate' ? 'ok' : r.classification.label === 'poor fit' ? 'bad' : 'warn';
  const scholarships = r.funding.matches.map((m) => dataset.scholarships.find((s) => s.id === m.scholarshipId)).filter((s) => s !== undefined);
  return (
    <section className="panel" aria-labelledby="report-h" aria-live="polite">
      <h2 id="report-h" style={{ marginTop: 0 }}>
        Result: {r.degree.name} at {r.university.name}, intake {r.intakeYear}
      </h2>
      <p>
        <StatusBadge tone={candidateTone}>{r.classification.label}</StatusBadge> This is a rule-based label from recorded evidence,
        not a probability of admission.
      </p>

      <h3>Programme</h3>
      <p>
        <StatusBadge tone={r.program.status === 'program-verified' ? 'ok' : 'warn'}>{r.program.label}</StatusBadge>
      </p>
      <p>{r.program.detail}</p>

      <h3>Admissions and eligibility</h3>
      <p>
        <StatusBadge tone={r.eligibility.status === 'profile-below-recorded-requirements' ? 'bad' : r.eligibility.status === 'profile-meets-recorded-requirements' ? 'ok' : 'warn'}>
          {r.eligibility.label}
        </StatusBadge>
      </p>
      {r.eligibility.missingFields.length > 0 ? (
        <p className="small">
          Missing information: {r.eligibility.missingFields.join('; ')}.
        </p>
      ) : null}
      <ul className="bullets small">
        {r.eligibility.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      <h3>Funding</h3>
      <p>
        <StatusBadge tone={r.funding.status === 'matches-found' ? 'ok' : r.funding.status === 'no-verified-records' ? 'neutral' : 'warn'}>
          {r.funding.label}
        </StatusBadge>
      </p>
      {scholarships.map((s) => (
        <ScholarshipCard key={s.id} scholarship={s} sources={dataset.sources} />
      ))}
      {r.funding.excluded.length > 0 ? (
        <>
          <h4>Excluded</h4>
          <ul className="bullets small">
            {r.funding.excluded.map((e) => (
              <li key={e.id}>
                {e.name}: {e.reason}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3>Costs</h3>
      <p>
        <StatusBadge tone={r.costs.status === 'partially-verified' ? 'warn' : 'neutral'}>{r.costs.label}</StatusBadge>
      </p>
      {r.costs.officialCostOfAttendanceUsd !== null ? (
        <p>
          Official total cost of attendance 2026&ndash;27: <strong>${r.costs.officialCostOfAttendanceUsd.toLocaleString('en-US')}</strong>{' '}
          (USD). It is not split into tuition and living costs.
        </p>
      ) : null}
      <ul className="bullets small">
        {r.costs.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      <h3>Risks and unknowns</h3>
      <ul className="bullets">
        {[...r.classification.risks, ...r.classification.unknowns].map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      {r.classification.rationale.length > 0 ? (
        <ul className="bullets small">
          {r.classification.rationale.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : null}

      <h3>Next action</h3>
      <p>{r.nextAction}</p>
      <p>
        <Link href="/roadmap">Open the roadmap</Link> ({roadmapLength} steps for this match are listed on the roadmap page as a general
        checklist.)
      </p>
      <h4>Disclaimers</h4>
      <ul className="bullets small">
        {r.disclaimers.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function StudentLifeChecklist() {
  return (
    <section className="panel" aria-labelledby="life-h">
      <h2 id="life-h" style={{ marginTop: 0 }}>
        Questions to ask about student life
      </h2>
      <p className="small muted">{STUDENT_LIFE_DISCLAIMER}</p>
      <ul className="bullets small">
        {STUDENT_LIFE_ITEMS.map((item) => (
          <li key={item.id}>
            <strong>{item.topic}:</strong> {item.question} <span className="muted">Check: {item.whereToCheck}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
