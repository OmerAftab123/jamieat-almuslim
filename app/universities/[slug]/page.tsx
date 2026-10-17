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
          <p>{u.programs.length} programme record(s) stored.</p>
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
          <pre className="small">{JSON.stringify(u.admissions, null, 2)}</pre>
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
