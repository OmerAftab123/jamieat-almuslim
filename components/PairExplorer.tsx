'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Dataset } from '@/lib/data';
import { AWARD_TYPES, AWARD_TYPE_LABEL, buildPairReport, type PairReport, type ScholarshipLine } from '@/lib/pairReport';
import { SourceList, StatusBadge } from '@/components/shared';

const TONE: Record<string, 'ok' | 'warn' | 'bad' | 'info' | 'neutral'> = {
  'verified-official': 'ok',
  'verified-official-absence': 'ok',
  'verified-official-page': 'ok',
  'verified-official-partial': 'ok',
  'partially-verified': 'warn',
  'official-sources-verified': 'ok',
  'official-sources-partially-verified': 'warn',
  'available-conditional': 'warn',
  'partially-researched': 'warn',
  'not-verified': 'neutral',
  'not-researched': 'neutral',
  'not-recorded': 'neutral',
  'not-applicable': 'neutral',
  'closed-for-2027': 'bad',
  'not-available': 'bad',
  unverified: 'neutral',
};

const VERDICT_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'info' | 'neutral'> = {
  'eligible-on-recorded-criteria': 'ok',
  'full-cover-route-recorded': 'ok',
  'reasonable-with-a-funding-plan': 'ok',
  'conditional-full-cover-route': 'warn',
  'partial-route-only': 'warn',
  'grades-not-checkable': 'info',
  'decide-on-cost-first': 'warn',
  'below-recorded-minimum': 'bad',
  'not-recommended-on-recorded-criteria': 'bad',
  'no-route-recorded': 'bad',
  'programme-not-verified': 'neutral',
  'not-researched': 'neutral',
  'not-enough-evidence': 'neutral',
};

function label(s: string) {
  return s.replace(/-/g, ' ');
}

export function PairExplorer({ dataset }: { dataset: Dataset }) {
  const { degrees, universities, families, sources } = dataset;
  const [degreeId, setDegreeId] = useState('');
  const [universityId, setUniversityId] = useState('');

  const degreesByFamily = useMemo(() => {
    const byFam = new Map<string, typeof degrees>();
    for (const deg of degrees) {
      const list = byFam.get(deg.family) ?? [];
      list.push(deg);
      byFam.set(deg.family, list);
    }
    return [...byFam.entries()]
      .map(([fam, list]) => ({ fam: families.find((f) => f.id === fam)?.name ?? fam, list }))
      .sort((a, b) => a.fam.localeCompare(b.fam));
  }, [degrees, families]);

  const sortedUnis = useMemo(
    () =>
      [...universities].sort(
        (a, b) => Number((a.qsRank as { position: number }).position) - Number((b.qsRank as { position: number }).position),
      ),
    [universities],
  );

  const report: PairReport | null = useMemo(
    () => (degreeId && universityId ? buildPairReport(dataset, degreeId, universityId, 2027) : null),
    [dataset, degreeId, universityId],
  );

  return (
    <div>
      <form className="form-grid" aria-label="Choose a category and a university" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="pe-degree">Bachelor&apos;s category</label>
          <select id="pe-degree" value={degreeId} onChange={(e) => setDegreeId(e.target.value)}>
            <option value="">Choose a category</option>
            {degreesByFamily.map((g) => (
              <optgroup key={g.fam} label={g.fam}>
                {g.list.map((deg) => (
                  <option key={deg.id} value={deg.id}>
                    {deg.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pe-uni">QS university</label>
          <select id="pe-uni" value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
            <option value="">Choose a university</option>
            {sortedUnis.map((u) => (
              <option key={u.id} value={u.id}>
                {(u.qsRank as { display: string }).display} · {u.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {!report ? (
        <p className="notice">Choose a category and a university to see the full report.</p>
      ) : (
        <Report report={report} dataset={dataset} sources={sources} />
      )}
    </div>
  );
}

function Report({ report: r, dataset, sources }: { report: PairReport; dataset: Dataset; sources: Dataset['sources'] }) {
  const a = r.answer;
  return (
    <div aria-live="polite">
      <h2 id="report">{r.question}</h2>
      <p className="notice warn">
        <strong>Evidence check:</strong> {r.completeness.score} of {r.completeness.of} evidence checks passed for this pair.{' '}
        Missing evidence is shown as <strong>not researched</strong> or <strong>not verified</strong>, never as “no”.
      </p>
      <ul className="clean small">
        {r.completeness.checks.map((c) => (
          <li key={c.label}>
            <StatusBadge tone={c.ok ? 'ok' : 'neutral'}>{c.ok ? 'recorded' : 'missing'}</StatusBadge> {c.label}
          </li>
        ))}
      </ul>

      <section className="result-section" aria-labelledby="sec-answer">
        <h3 id="sec-answer">1. Can, should and how</h3>
        <div className="answer-grid">
          <div className="card">
            <h4>Can apply and get admitted?</h4>
            <p>
              <StatusBadge tone={VERDICT_TONE[a.can.verdict] ?? 'neutral'}>{label(a.can.verdict)}</StatusBadge>
            </p>
            <p>{a.can.label}</p>
          </div>
          <div className="card">
            <h4>Can study for free?</h4>
            <p>
              <StatusBadge tone={VERDICT_TONE[a.free.verdict] ?? 'neutral'}>{label(a.free.verdict)}</StatusBadge>
            </p>
            <p>{a.free.label}</p>
          </div>
          <div className="card">
            <h4>Should you pursue it?</h4>
            <p>
              <StatusBadge tone={VERDICT_TONE[a.should.verdict] ?? 'neutral'}>{label(a.should.verdict)}</StatusBadge>
            </p>
            <p>{a.should.label}</p>
          </div>
        </div>
        <h4>How</h4>
        <ol>
          {a.how.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      </section>

      <section className="result-section" aria-labelledby="sec-programme">
        <h3 id="sec-programme">2. Programme</h3>
        <p>
          <StatusBadge tone={r.programme.status === 'verified' ? 'ok' : 'neutral'}>
            {r.programme.status === 'verified' ? 'verified' : 'not verified'}
          </StatusBadge>{' '}
          {r.programme.note}
        </p>
        {r.programme.officialTitle ? (
          <p className="small">
            Official title: {r.programme.officialTitle}
            {r.programme.officialUrl ? (
              <>
                {' '}
                (<a href={r.programme.officialUrl} rel="noopener noreferrer" target="_blank">official page</a>)
              </>
            ) : null}
          </p>
        ) : null}
      </section>

      <section className="result-section" aria-labelledby="sec-req">
        <h3 id="sec-req">3. Official requirements</h3>
        <h4>General admission</h4>
        <RequirementList items={r.requirements.general} sources={sources} />
        <h4>Subject-specific</h4>
        <RequirementList items={r.requirements.subject} sources={sources} />
      </section>

      <section className="result-section" aria-labelledby="sec-trends">
        <h3 id="sec-trends">4. Unofficial and trend-based (labelled, not official)</h3>
        <p className="notice">
          <StatusBadge tone={TONE[r.trends.status] ?? 'neutral'}>{label(r.trends.status)}</StatusBadge> {r.trends.detail}
        </p>
        {r.trends.items.length > 0 ? (
          <ul className="clean small">
            {r.trends.items.map((t) => (
              <li key={t.label}>
                <strong>{t.label}:</strong> {t.value} <span className="muted">({t.kind}; source {t.sourceId})</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="result-section" aria-labelledby="sec-sch">
        <h3 id="sec-sch">5. Scholarships by type</h3>
        <div className="grid-cards">
          {AWARD_TYPES.map((t) => (
            <div className="card" key={t}>
              <h4>{AWARD_TYPE_LABEL[t]}</h4>
              <ul className="clean small">
                {r.scholarships[t].map((s, i) => (
                  <ScholarshipItem key={`${t}-${i}`} line={s} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="result-section" aria-labelledby="sec-reason">
        <h3 id="sec-reason">6. Reasoning</h3>
        <div className="why-grid">
          <div className="card">
            <h4>Reasons to study this university</h4>
            <ul>{r.reasoning.universityFor.map((x) => <li key={x}>{x}</li>)}</ul>
            <h4>Reasons for caution</h4>
            <ul>{r.reasoning.universityAgainst.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="card">
            <h4>Reasons to study this degree (analyst draft, family level)</h4>
            <ul>{r.reasoning.degreeFor.map((x) => <li key={x}>{x}</li>)}</ul>
            <h4>Reasons for caution about this degree</h4>
            <ul>{r.reasoning.degreeAgainst.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="small muted">
              Research status: {r.reasoning.degreeResearchStatus}. Scores apply to the degree family, not to this university.
            </p>
          </div>
        </div>
      </section>

      <section className="result-section" aria-labelledby="sec-road">
        <h3 id="sec-road">7. Structured roadmap</h3>
        <ol className="clean">
          {r.roadmap.map((st) => (
            <li key={st.stage} className="card">
              <h4>
                Stage {st.stage}: {st.title}{' '}
                <StatusBadge tone={st.evidence === 'verified' ? 'ok' : st.evidence === 'partial' ? 'warn' : 'neutral'}>
                  {label(st.evidence)}
                </StatusBadge>
              </h4>
              <ul>{st.actions.map((x) => <li key={x}>{x}</li>)}</ul>
              {st.dates.length > 0 ? (
                <>
                  <h5>Dates from the record</h5>
                  <ul>{st.dates.map((x) => <li key={x}>{x}</li>)}</ul>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <p className="small">
        <Link href={`/universities/${r.university.id}`}>University page</Link>
        {' · '}
        {dataset.freeStudy.dossiers.some((x) => x.universityId === r.university.id) ? (
          <Link href={`/free-study/${r.university.id}`}>Free-study dossier</Link>
        ) : (
          <span className="muted">No free-study dossier yet</span>
        )}
      </p>

      <ul className="small muted">
        {r.disclaimers.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function RequirementList({
  items,
  sources,
}: {
  items: PairReport['requirements']['general'];
  sources: Dataset['sources'];
}) {
  return (
    <ul className="clean">
      {items.map((it, i) => (
        <li key={`${it.item}-${i}`} className="small">
          <StatusBadge tone={TONE[it.status] ?? 'neutral'}>{label(it.status)}</StatusBadge> <strong>{it.item}:</strong> {it.detail}
          <SourceList ids={it.sourceIds} sources={sources} />
        </li>
      ))}
    </ul>
  );
}

function ScholarshipItem({ line }: { line: ScholarshipLine }) {
  return (
    <li>
      <StatusBadge tone={TONE[line.status] ?? 'neutral'}>{label(line.status)}</StatusBadge>{' '}
      <strong>{line.name}</strong>
      {line.origin === 'record' ? <span className="muted"> (record)</span> : null}
      {line.origin === 'dossier' ? <span className="muted"> (dossier)</span> : null}
      {!line.appliesToCategory ? <span className="muted"> — not for this category</span> : null}
      <br />
      <span className="muted">{line.detail}</span>
      {line.note ? <div className="muted">{line.note}</div> : null}
    </li>
  );
}
