import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { coverageSummary } from '@/lib/pairReport';
import { PairExplorer } from '@/components/PairExplorer';

export const metadata: Metadata = {
  title: 'Explore a degree at a university',
  description:
    'For any bachelor category and QS university: can, should and how a Pakistani international student could get admitted and study for free, with requirements, scholarships by type, reasoning and a roadmap.',
};

export default function ExplorePage() {
  const d = getDataset();
  const s = coverageSummary(d);
  return (
    <>
      <h1>Explore a degree at a university</h1>
      <p className="lead">
        Choose any bachelor category and any QS university. The report answers, for a Pakistani international undergraduate:
        can you apply, get admitted and study it for free, should you, and how. Every claim is tied to a stored source. Gaps
        are marked as not researched.
      </p>
      <p className="notice warn">
        <strong>Coverage:</strong> {s.pairs.toLocaleString('en-GB')} category and university pairs. {s.programmeVerifiedPairs} have a
        verified programme record, {s.universitiesWithDossier} universities have a free-study dossier, and{' '}
        {s.universitiesWithAdmissions} have a recorded admissions record. Scores are analyst drafts at degree-family level.
      </p>
      <PairExplorer dataset={d} />
    </>
  );
}
