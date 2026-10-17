import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { rankProgrammes } from '@/lib/ranking';
import { SourceList, StatusBadge } from '@/components/shared';

type Params = { slug: string };

export function generateStaticParams() {
  return getDataset().freeStudy.dossiers.map((x) => ({ slug: x.universityId }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const dossier = getDataset().freeStudy.dossiers.find((x) => x.universityId === slug);
  const uni = getDataset().universities.find((u) => u.id === slug);
  return { title: uni && dossier ? `Free-study dossier: ${uni.name}` : 'Dossier not found' };
}

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'info' | 'neutral'> = {
  none: 'bad',
  'available-conditional': 'warn',
  'not-verified': 'neutral',
  'verified-official': 'ok',
  'verified-official-absence': 'ok',
  'not-recorded': 'neutral',
};

export default async function FreeStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const d = getDataset();
  const dossier = d.freeStudy.dossiers.find((x) => x.universityId === slug);
  const uni = d.universities.find((u) => u.id === slug);
  if (!dossier || !uni) notFound();
  const ranking = rankProgrammes(d, uni.id);
  const a = dossier.answers;

  return (
    <>
      <p className="small">
        <Link href={`/universities/${uni.id}`}>&larr; {uni.name}</Link>
      </p>
      <h1>Free-study dossier: {uni.name}</h1>
      <p className="lead">
        Can, should and how a Pakistani international undergraduate could apply, be admitted, and study here for free. Free means
        tuition, and ideally living costs, covered by a scholarship that does not need repaying. Loans are never counted as free.
      </p>
      <p className="notice warn">
        <strong>Status:</strong> <StatusBadge tone="warn">{dossier.status.replace(/-/g, ' ')}</StatusBadge> Last checked{' '}
        {dossier.lastChecked}. Not every route is researched; each item below shows its own status. This is research, not an
        admission decision or an offer of aid.
      </p>

      <section aria-labelledby="ans-h">
        <h2 id="ans-h">The short answer</h2>
        {(
          [
            ['Can you apply?', a.can],
            ['Can you study for free?', a.free],
            ['Should you?', a.should],
          ] as const
        ).map(([q, ans]) => (
          <div key={q} className="panel">
            <h3 style={{ marginTop: 0 }}>{q}</h3>
            <p>
              <strong>{ans.verdict}</strong>
            </p>
            <p>{ans.detail}</p>
            {ans.sourceIds.length > 0 ? <SourceList ids={ans.sourceIds} sources={d.sources} /> : null}
          </div>
        ))}
        <h3>How, in order</h3>
        <ol>
          {a.how.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="req-h">
        <h2 id="req-h">Admission requirements</h2>
        <p className="small muted">Official requirements are marked as verified. Anything not verified is labelled, not assumed.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">What is required</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {dossier.officialRequirements.map((r) => (
                <tr key={r.item}>
                  <th scope="row">{r.item}</th>
                  <td>
                    {r.detail}
                    {r.sourceIds.length > 0 ? <SourceList ids={r.sourceIds} sources={d.sources} /> : null}
                  </td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status.replace(/-/g, ' ')}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sch-h">
        <h2 id="sch-h">Scholarships and free-study routes</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col">Status</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {dossier.scholarships.map((s) => (
                <tr key={s.route}>
                  <th scope="row">{s.route}</th>
                  <td>
                    <StatusBadge tone={STATUS_TONE[s.status] ?? 'neutral'}>{s.status.replace(/-/g, ' ')}</StatusBadge>
                  </td>
                  <td>
                    {s.detail}
                    {s.sourceIds.length > 0 ? <SourceList ids={s.sourceIds} sources={d.sources} /> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="trend-h">
        <h2 id="trend-h">Admission trends</h2>
        <ul className="bullets">
          {dossier.trends.map((t) => (
            <li key={t.label}>
              <strong>{t.label}:</strong> {t.value} <span className="small muted">({t.kind}; source below)</span>
              <SourceList ids={[t.sourceId]} sources={d.sources} />
            </li>
          ))}
        </ul>
        <p>
          <strong>Unofficial and community trends:</strong>{' '}
          <StatusBadge tone="neutral">{dossier.unofficialTrends.status.replace(/-/g, ' ')}</StatusBadge>{' '}
          {dossier.unofficialTrends.detail}
        </p>
      </section>

      <section aria-labelledby="why-h">
        <h2 id="why-h">Should you study this, here?</h2>
        <div>
          <div>
            <h3>Reasons for</h3>
            <ul className="bullets">
              {dossier.reasoning.forStudy.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Reasons for caution</h3>
            <ul className="bullets">
              {dossier.reasoning.againstOrCaution.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <h3>Questions to settle before you decide</h3>
        <ul className="bullets">
          {dossier.reasoning.decisionTest.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rank-h">
        <h2 id="rank-h">Mapped degrees, ranked by criteria</h2>
        <p className="notice warn small">{dossier.degreeRanking.note}</p>
        {ranking.length === 0 ? (
          <p className="empty">No verified programme records for this university yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col" className="num">
                    Rank
                  </th>
                  <th scope="col">Degree</th>
                  <th scope="col">Family</th>
                  <th scope="col" className="num">
                    Mean score (0–4)
                  </th>
                  <th scope="col">Family confidence</th>
                  <th scope="col">Title match</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.degreeId}>
                    <td className="num">{r.rank}</td>
                    <td>{r.degreeName}</td>
                    <td>{r.familyName}</td>
                    <td className="num">{r.overall.toFixed(1)}</td>
                    <td>{r.confidence}</td>
                    <td>{r.matchType === 'exact-title' ? 'Exact' : 'Closest'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SourceList ids={dossier.degreeRanking.sourceIds} sources={d.sources} />
      </section>

      <section aria-labelledby="road-h">
        <h2 id="road-h">Roadmap</h2>
        {dossier.roadmap.map((phase) => (
          <div key={phase.window} className="panel">
            <h3 style={{ marginTop: 0 }}>{phase.window}</h3>
            <ul className="bullets">
              {phase.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
