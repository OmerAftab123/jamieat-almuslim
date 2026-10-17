import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { CompareWorkspace } from '@/components/CompareWorkspace';

export const metadata: Metadata = {
  title: 'Compare',
  description: 'Compare up to four career families or universities side by side.',
};

type SP = { [key: string]: string | string[] | undefined };

function ids(v: string | string[] | undefined): string[] {
  const raw = Array.isArray(v) ? v.join(',') : (v ?? '');
  return raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4);
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const d = getDataset();
  return (
    <>
      <h1>Comparison workspace</h1>
      <p className="lead">Compare up to four career families or four universities. Only stored, dated values are shown.</p>
      <CompareWorkspace
        families={d.families}
        universities={d.universities}
        initialFamilies={ids(sp.families)}
        initialUniversities={ids(sp.universities)}
        fxRate={d.fx.rate}
      />
    </>
  );
}
