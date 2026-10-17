import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { formatMoney } from '@/lib/costs';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { SourceList, StatusBadge } from '@/components/shared';

type Params = { slug: string };

export function generateStaticParams() {
  return getDataset().universities.map((u) => ({ slug: u.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const u = getDataset().universities.find((x) => x.id === slug);
  return { title: u ? u.name : 'University not found' };
}

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'info' | 'neutral'> = {
  'verified-official-page': 'ok',
  'partially-researched': 'warn',
  'not-researched': 'neutral',
};

const STATUS_TEXT: Record<string, string> = {
  'verified-official-page': 'Verified (official page)',
  'partially-researched': 'Partly researched',
  'not-researched': 'Not researched',
};

type ProgramRecord = {
  degreeId: string;
  officialTitle: string;
  officialUrl: string;
  matchType: 'exact-title' | 'closest-title';
  matchNote: string;
  sourceId: string;
  lastChecked: string;
};

type AdmissionsRecord = {
  sourceId: string;
  lastChecked: string;
  standardisedTests: string;
  englishTests: { test: string; minimum: string; recommended: string }[];
  englishRequirementNote: string;
  testDeadlines?: string;
  gradeMinimum?: string | null;
  notes: string[];
};

function AdmissionsView({ a, sources }: { a: AdmissionsRecord; sources: Parameters<typeof SourceList>[0]["sources"] }) {
  return (
    <>
      <p className="small muted">Checked {a.lastChecked}.</p>
      <dl>
        <dt>Standardised tests</dt>
        <dd>{a.standardisedTests}</dd>
        <dt>Grade minimum</dt>
        <dd>{a.gradeMinimum ?? 'None published. The matcher cannot check grades for this university.'}</dd>
        {a.testDeadlines ? (
          <>
            <dt>Test deadlines</dt>
            <dd>{a.testDeadlines}</dd>
          </>
        ) : null}
      </dl>
      {a.englishTests.length > 0 ? (
        <div className="table-wrap">
          <table>
            <caption className="small muted" style={{ textAlign: 'left' }}>
              English-language tests (minimum and recommended scores)
            </caption>
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col" className="num">
                  Minimum
                </th>
                <th scope="col" className="num">
                  Recommended
                </th>
              </tr>
            </thead>
            <tbody>
              {a.englishTests.map((t) => (
                <tr key={t.test}>
                  <td>{t.test}</td>
                  <td className="num">{t.minimum}</td>
                  <td className="num">{t.recommended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="small">{a.englishRequirementNote}</p>
      <ul>
        {a.notes.map((n) => (
          <li key={n} className="small">
            {n}
          </li>
        ))}
      </ul>
      <SourceList ids={[a.sourceId]} sources={sources} />
    </>
  );
}

function degreeName(id: string): string {
  return getDataset().degrees.find((x) => x.id === id)?.name ?? id;
}


export default async function UniversityProfile({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const d = getDataset();
  const u = d.universities.find((x) => x.id === slug);
  if (!u) notFound();

  const qsSource = d.sources.find((s) => s.id === u.qsSourceId);
  const scholarships = d.scholarships.filter((s) => u.scholarshipIds.includes(s.id));
  const sections: Array<[string, string]> = [
    ['QS 2027 rank', u.dataStatus.qsRank],
    ['Undergraduate programmes', u.dataStatus.programs],
    ['Admissions requirements', u.dataStatus.admissions],
    ['Scholarships and funding', u.dataStatus.scholarships],
    ['Costs', u.dataStatus.costs],
  ];

  return (
    <>
      <p className="small">
        <Link href="/universities">&larr; Back to the directory</Link>
      </p>
      <h1>{u.name}</h1>
      <p className="lead">
        QS 2027 rank <strong>{u.qsRank.display}</strong> &middot; {u.city}, {u.country}
        {u.qsRank.tied ? ' (tied rank)' : ''}
      </p>

      <section aria-labelledby="status-h">
        <h2 id="status-h">Data status by section</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Section</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(([label, status]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>
                  <StatusBadge tone={STATUS_TONE[status] ?? 'neutral'}>{STATUS_TEXT[status] ?? status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small muted">Last verified: {u.lastVerified}.</p>
      </section>

      <section aria-labelledby="prog-h">
        <h2 id="prog-h">Undergraduate programmes</h2>
        {u.programs.length === 0 ? (
          <p className="empty">
            No verified programme records for this university yet. This does not mean a programme is absent. Check the
            official course list. Programme verification is in progress.
          </p>
        ) : (
          <>
            <p className="small">
              Each row is a programme listed on the university&rsquo;s official page. &ldquo;Exact title&rdquo; means the
              official title matches the degree here. &ldquo;Closest title&rdquo; means the university uses a different name:
              check the curriculum before relying on it.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Degree in this catalogue</th>
                    <th scope="col">Official programme title</th>
                    <th scope="col">Match</th>
                    <th scope="col">Official page</th>
                  </tr>
                </thead>
                <tbody>
                  {(u.programs as ProgramRecord[]).map((p) => (
                    <tr key={p.degreeId + p.officialTitle}>
                      <td>{degreeName(p.degreeId)}</td>
                      <td>{p.officialTitle}</td>
                      <td>
                        {p.matchType === 'exact-title' ? 'Exact title' : 'Closest title'}
                        <div className="small muted">{p.matchNote}</div>
                      </td>
                      <td>
                        <a href={p.officialUrl} target="_blank" rel="noopener noreferrer">
                          Official page
                        </a>
                        <div className="small muted">Checked {p.lastChecked}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceList ids={[...new Set((u.programs as ProgramRecord[]).map((p) => p.sourceId))]} sources={d.sources} />
          </>
        )}
      </section>

      <section aria-labelledby="adm-h">
        <h2 id="adm-h">Admissions</h2>
        {u.admissions === null ? (
          <p className="empty">
            Admissions requirements for this university have not been researched. Use the official international admissions
            page; the matcher cannot check your eligibility here.
          </p>
        ) : (
          <AdmissionsView a={u.admissions as AdmissionsRecord} sources={d.sources} />
        )}
      </section>

      <section aria-labelledby="cost-h">
        <h2 id="cost-h">Costs</h2>
        {u.costs ? (
          <>
            <p>
              Total cost of attendance 2026&ndash;27 as quoted by the university:{' '}
              <strong>{formatMoney(u.costs.totalCostOfAttendance2026_27USD, 'USD')}</strong>. {u.costs.note}
            </p>
            <p className="small muted">Breakdown into tuition, fees and living costs is not verified.</p>
          </>
        ) : (
          <p className="empty">Costs not verified for this university.</p>
        )}
      </section>

      <section aria-labelledby="fund-h">
        <h2 id="fund-h">Funding records</h2>
        {scholarships.length === 0 ? (
          <p className="empty">No funding record is stored. This is not a finding that no aid exists.</p>
        ) : (
          scholarships.map((s) => <ScholarshipCard key={s.id} scholarship={s} sources={d.sources} />)
        )}
      </section>

      {u.notes.length > 0 ? (
        <section aria-labelledby="notes-h">
          <h2 id="notes-h">Notes</h2>
          <ul className="bullets">
            {u.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="src-h">
        <h2 id="src-h">Sources</h2>
        {qsSource ? <SourceList ids={[qsSource.id]} sources={d.sources} /> : null}
        <p className="small">
          QS profile:{' '}
          <a href={u.qsProfileUrl} target="_blank" rel="noopener noreferrer">
            {u.qsProfileUrl}
          </a>
        </p>
        {u.officialWebsite ? (
          <p className="small">
            Official website:{' '}
            <a href={u.officialWebsite} target="_blank" rel="noopener noreferrer">
              {u.officialWebsite}
            </a>
          </p>
        ) : (
          <p className="small muted">Official website not recorded yet.</p>
        )}
      </section>
    </>
  );
}
