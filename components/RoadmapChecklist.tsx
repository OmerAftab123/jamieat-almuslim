'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { KIND_LABEL, ROADMAP_STORAGE_KEY, type RoadmapStep } from '@/lib/roadmap';

type Progress = Record<string, boolean>;

function parseProgress(raw: string | null): Progress {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as Progress) : {};
  } catch {
    return {};
  }
}

// Subscribe to localStorage changes made in this tab (via a synthetic 'storage' event) and other tabs.
function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(ROADMAP_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Progress checklist saved to localStorage in this browser only. Server render shows nothing ticked. */
export function RoadmapChecklist({ steps }: { steps: RoadmapStep[] }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const done = useMemo(() => parseProgress(raw), [raw]);

  const write = useCallback((next: Progress) => {
    try {
      window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked or full: progress will not persist, but the page keeps working.
    }
    window.dispatchEvent(new StorageEvent('storage', { key: ROADMAP_STORAGE_KEY }));
  }, []);

  const phases = useMemo(() => {
    const map = new Map<string, RoadmapStep[]>();
    for (const s of steps) map.set(s.phase, [...(map.get(s.phase) ?? []), s]);
    return [...map.entries()];
  }, [steps]);

  const completed = steps.filter((s) => done[s.id]).length;

  return (
    <div>
      <p aria-live="polite">
        Progress: <strong>{completed}</strong> of {steps.length} steps ticked.{' '}
        <button type="button" className="secondary" onClick={() => write({})} disabled={completed === 0}>
          Clear progress
        </button>
      </p>
      {phases.map(([phase, list]) => (
        <section key={phase} aria-labelledby={`ph-${phase}`}>
          <h2 id={`ph-${phase}`}>{phase}</h2>
          <ul className="clean">
            {list.map((s) => (
              <li key={s.id} className="check-item">
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(done[s.id])}
                    onChange={(e) => write({ ...done, [s.id]: e.target.checked })}
                    style={{ width: 'auto', marginTop: '0.3rem' }}
                  />
                  <span>
                    <strong>{s.title}</strong>{' '}
                    <span className={`badge ${s.kind === 'official-deadline' ? 'badge-info' : s.kind === 'suggested-personal' ? 'badge-neutral' : 'badge-ok'}`}>
                      {KIND_LABEL[s.kind]}
                    </span>
                    <br />
                    <span className="small">{s.detail}</span>
                    <br />
                    <span className="small muted">Timing: {s.timing}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
