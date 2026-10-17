import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { CompareRoute } from '@/components/CompareRoute';

export const metadata: Metadata = {
  title: 'Compare',
  description: 'Compare up to four career families or universities side by side.',
};

export default function ComparePage() {
  const d = getDataset();
  return (
    <>
      <h1>Comparison workspace</h1>
      <p className="lead">Compare up to four career families or four universities. Only stored, dated values are shown.</p>
      <Suspense fallback={<p className="muted">Loading comparison&hellip;</p>}>
        <CompareRoute families={d.families} universities={d.universities} fx={d.fx} />
      </Suspense>
    </>
  );
}
