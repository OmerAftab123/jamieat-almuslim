import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { UniversityDirectory } from '@/components/UniversityDirectory';

export const metadata: Metadata = {
  title: 'Universities',
  description: 'QS World University Rankings 2027 universities, with ties preserved and clear data-status labels.',
};

export default function UniversitiesPage() {
  const d = getDataset();
  return (
    <>
      <h1>University directory</h1>
      <p className="lead">
        Universities from the official QS World University Rankings 2027 (published 18 June 2026). Ties are shown as
        <code> =N</code>. The table covers ranks 1 to =45 at present; ranks 46&ndash;150 are <strong>not yet
        transcribed</strong>, so this directory is not the full Top 150.
      </p>
      <p className="notice warn">
        Only the rank is verified for most records. Programme lists, admissions requirements and costs are shown as
        &ldquo;not verified&rdquo; wherever the research is missing. Missing data is never filled in.
      </p>
      <UniversityDirectory universities={d.universities} coverage={d.meta.universitiesCoverage} />
    </>
  );
}
