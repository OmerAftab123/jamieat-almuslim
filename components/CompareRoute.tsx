'use client';

import { useSearchParams } from 'next/navigation';
import type { Family, University } from '@/lib/schemas';
import { CompareWorkspace } from '@/components/CompareWorkspace';

type Props = {
  families: Family[];
  universities: University[];
  fxRate: number;
};

function ids(raw: string | null): string[] {
  return (raw ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4);
}

// Reads ?families= and ?universities= on the client, so the page can be
// statically exported (static export cannot read searchParams on the server).
export function CompareRoute({ families, universities, fxRate }: Props) {
  const sp = useSearchParams();
  return (
    <CompareWorkspace
      families={families}
      universities={universities}
      initialFamilies={ids(sp.get('families'))}
      initialUniversities={ids(sp.get('universities'))}
      fxRate={fxRate}
    />
  );
}
