'use client';

import { useMemo, useState } from 'react';
import type { Family, University } from '@/lib/schemas';
import { CRITERION_KEYS, CRITERION_META, scoreFamily, scoreLabel, type CriterionKey } from '@/lib/scoring';
import { formatMoney } from '@/lib/costs';
import { ScoreBar, scoreClass } from '@/components/shared';

const MAX = 4;

type Props = {
  families: Family[];
  universities: University[];
  initialFamilies: string[];
  initialUniversities: string[];
  fxRate: number;
};

export function CompareWorkspace({ families, universities, initialFamilies, initialUniversities, fxRate }: Props) {
  const [mode, setMode] = useState<'families' | 'universities'>(initialUniversities.length > 0 && initialFamilies.length === 0 ? 'universities' : 'families');
  const [famIds, setFamIds] = useState<string[]>(() => initialFamilies.filter((id) => families.some((f) => f.id === id)));
  const [uniIds, setUniIds] = useState<string[]>(() => initialUniversities.filter((id) => universities.some((u) => u.id === id)));

  const famRows = useMemo(
    () => famIds.map((id) => families.find((f) => f.id === id)).filter((f): f is Family => Boolean(f)),
    [famIds, families],
  );
  const uniRows = useMemo(
    () => uniIds.map((id) => universities.find((u) => u.id === id)).filter((u): u is University => Boolean(u)),
    [uniIds, universities],
  );

  function toggle(list: string[], set: (v: string[]) => void, id: string) {
    if (list.includes(id)) set(list.filter((x) => x !== id));
    else if (list.length < MAX) set([...list, id]);
  }

  const selectedCount = mode === 'families' ? famIds.length : uniIds.length;

  return (
    <div>
      <div className="toolbar" role="group" aria-label="Choose what to compare">
        <button type="button" className={mode === 'families' ? '' : 'secondary'} aria-pressed={mode === 'families'} onClick={() => setMode('families')}>
          Career families
        </button>
        <button type="button" className={mode === 'universities' ? '' : 'secondary'} aria-pressed={mode === 'universities'} onClick={() => setMode('universities')}>
          Universities
        </button>
        <span className="small muted" aria-live="polite">
          {selectedCount} of {MAX} selected.
        </span>
      </div>

      {mode === 'families' ? (
        <>
          <fieldset className="panel">
            <legend>Choose career families (up to {MAX})</legend>
            <div className="chip-grid">
              {families.map((f) => (
                <label key={f.id} className="chip">
                  <input
                    type="checkbox"
                    checked={famIds.includes(f.id)}
                    disabled={!famIds.includes(f.id) && famIds.length >= MAX}
                    onChange={() => toggle(famIds, setFamIds, f.id)}
                  />{' '}
                  {f.name}
                </label>
              ))}
            </div>
          </fieldset>
          {famRows.length === 0 ? (
            <p className="empty">Select at least one family to compare.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <caption className="small muted" style={{ textAlign: 'left' }}>
                  Scores 0&ndash;4 with equal weights. An overall score needs all seven criteria; a missing score is never zero.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Criterion</th>
                    {famRows.map((f) => (
                      <th scope="col" key={f.id}>
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Overall (equal weights)</th>
                    {famRows.map((f) => {
                      const s = scoreFamily(f);
                      return (
                        <td key={f.id} className="num">
                          {s.overallDisplay ?? <span className="badge badge-warn">Incomplete research</span>}
                        </td>
                      );
                    })}
                  </tr>
                  {CRITERION_KEYS.map((k: CriterionKey) => (
                    <tr key={k}>
                      <th scope="row">{CRITERION_META[k].label}</th>
                      {famRows.map((f) => {
                        const v = f.scores[k]?.score ?? null;
                        return (
                          <td key={f.id}>
                            <span className={scoreClass(v)}>{scoreLabel(v)}</span>
                            <ScoreBar score={v} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Confidence</th>
                    {famRows.map((f) => (
                      <td key={f.id}>{f.confidence}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Typical pathways</th>
                    {famRows.map((f) => (
                      <td key={f.id} className="small">
                        {f.pathways.join('; ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <fieldset className="panel">
            <legend>Choose universities (up to {MAX})</legend>
            <div className="chip-grid">
              {universities.map((u) => (
                <label key={u.id} className="chip">
                  <input
                    type="checkbox"
                    checked={uniIds.includes(u.id)}
                    disabled={!uniIds.includes(u.id) && uniIds.length >= MAX}
                    onChange={() => toggle(uniIds, setUniIds, u.id)}
                  />{' '}
                  QS {u.qsRank.display} &middot; {u.name}
                </label>
              ))}
            </div>
          </fieldset>
          {uniRows.length === 0 ? (
            <p className="empty">Select at least one university to compare.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <caption className="small muted" style={{ textAlign: 'left' }}>
                  Only verified fields are shown. Blank fields are not verified.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    {uniRows.map((u) => (
                      <th scope="col" key={u.id}>
                        {u.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">QS 2027 rank</th>
                    {uniRows.map((u) => (
                      <td key={u.id} className="num">
                        {u.qsRank.display}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Location</th>
                    {uniRows.map((u) => (
                      <td key={u.id}>
                        {u.city}, {u.country}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Programme data</th>
                    {uniRows.map((u) => (
                      <td key={u.id}>{u.dataStatus.programs.replace(/-/g, ' ')}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Admissions data</th>
                    {uniRows.map((u) => (
                      <td key={u.id}>{u.dataStatus.admissions.replace(/-/g, ' ')}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Total cost of attendance 2026&ndash;27</th>
                    {uniRows.map((u) => (
                      <td key={u.id} className="num">
                        {u.costs ? (
                          <>
                            {formatMoney(u.costs.totalCostOfAttendance2026_27USD, 'USD')}
                            <div className="small muted">
                              about {formatMoney(u.costs.totalCostOfAttendance2026_27USD * fxRate, 'PKR')} (at the stored rate)
                            </div>
                          </>
                        ) : (
                          'Not verified'
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Funding records</th>
                    {uniRows.map((u) => (
                      <td key={u.id}>{u.scholarshipIds.length > 0 ? `${u.scholarshipIds.length} record(s)` : 'None recorded'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
