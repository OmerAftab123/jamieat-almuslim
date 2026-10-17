import type { Source } from '@/lib/schemas';

/*
 * Client-safe presentational helpers. This file must NOT import lib/data.ts
 * (which reads the JSON datasets) so it can be used from client components.
 */

/** Small, accessible status badge. The label carries the meaning; colour is secondary. */
export function StatusBadge({
  tone,
  children,
}: {
  tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral';
  children: React.ReactNode;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/** Renders citations with title, publisher, URL, dates and how the claim was checked. */
export function SourceList({ ids, sources }: { ids: string[]; sources: Source[] }) {
  const found = ids
    .map((id) => sources.find((s) => s.id === id))
    .filter((s): s is Source => Boolean(s));
  if (found.length === 0) {
    return <p className="muted small">No sources recorded for this item.</p>;
  }
  return (
    <ul className="clean source-list small">
      {found.map((s) => (
        <li key={s.id}>
          <a href={s.url} rel="noopener noreferrer" target="_blank">
            {s.title}
          </a>{' '}
          <span className="muted">
            ({s.publisher}; {s.type.replace(/-/g, ' ')}; last checked {s.lastChecked})
          </span>
          <br />
          <span className="muted">How it was checked: {s.verificationMethod}</span>
        </li>
      ))}
    </ul>
  );
}

export function scoreClass(score: number | null): string {
  return score === null ? 'muted' : `score-${score}`;
}

export function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="muted">Research missing</span>;
  return (
    <span className="bar" aria-hidden="true">
      <span style={{ width: `${(score / 4) * 100}%` }} />
    </span>
  );
}
