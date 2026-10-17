'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Degree, Family, Source } from '@/lib/schemas';
import {
  CRITERION_KEYS,
  CRITERION_META,
  EQUAL_WEIGHTS,
  normalizeWeights,
  rankByCriterion,
  rankFamilies,
  scoreLabel,
  type CriterionKey,
  type Weights,
} from '@/lib/scoring';
import { ScoreBar, scoreClass } from '@/components/shared';

type Props = {
  families: Family[];
  degrees: Degree[];
  sources: Source[];
};

type SortKey = 'overall' | CriterionKey;

const DEFAULT_PERCENT = 100 / CRITERION_KEYS.length;

export function CareerExplorer({ families, degrees, sources }: Props) {
  // Raw slider values (0-100). They are normalised to sum to 100% before scoring.
  const [raw, setRaw] = useState<Record<CriterionKey, number>>(
    () => Object.fromEntries(CRITERION_KEYS.map((k) => [k, DEFAULT_PERCENT])) as Record<CriterionKey, number>,
  );
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('overall');
  const [selected, setSelected] = useState<string[]>([]);

  const weightError = useMemo(() => {
    try {
      normalizeWeights(raw);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid weights.';
    }
  }, [raw]);

  const effectiveWeights: Weights = useMemo(
    () => (weightError ? normalizeWeights(EQUAL_WEIGHTS) : normalizeWeights(raw)),
    [raw, weightError],
  );

  const isEqual = CRITERION_KEYS.every((k) => Math.abs(raw[k] - DEFAULT_PERCENT) < 0.01);

  const degreesByFamily = useMemo(() => {
    const map = new Map<string, Degree[]>();
    for (const deg of degrees) map.set(deg.family, [...(map.get(deg.family) ?? []), deg]);
    return map;
  }, [degrees]);

  const sourceMapLocal = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);

  const ranked = useMemo(() => rankFamilies(families, effectiveWeights), [families, effectiveWeights]);
  const criterionRanks = useMemo(() => {
    if (sortBy === 'overall') return null;
    return new Map(rankByCriterion(families, sortBy).map((r) => [r.familyId, r]));
  }, [families, sortBy]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const matchesQuery = (f: Family) => {
      if (!q) return true;
      const degreeText = (degreesByFamily.get(f.id) ?? []).map((d) => [d.name, ...d.aliases].join(' ')).join(' ');
      return [f.name, f.description, ...f.pathways, degreeText].join(' ').toLowerCase().includes(q);
    };
    const rows = ranked.filter((r) => {
      const fam = families.find((f) => f.id === r.familyId);
      return fam ? matchesQuery(fam) : false;
    });
    if (sortBy === 'overall') return rows;
    // Re-sort by one criterion; unranked (missing) families stay at the bottom.
    return [...rows].sort((a, b) => {
      const ra = criterionRanks?.get(a.familyId)?.rank ?? Number.POSITIVE_INFINITY;
      const rb = criterionRanks?.get(b.familyId)?.rank ?? Number.POSITIVE_INFINITY;
      return ra - rb || a.name.localeCompare(b.name);
    });
  }, [ranked, families, q, degreesByFamily, sortBy, criterionRanks]);

  function setCriterion(key: CriterionKey, value: number) {
    setRaw((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSelected(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]));
  }

  const compareHref = `/compare?families=${selected.join(',')}`;

  return (
    <div>
      <section className="panel" aria-labelledby="weights-heading">
        <h2 id="weights-heading" style={{ marginTop: 0 }}>
          Criterion weights
        </h2>
        <p className="small muted">
          The default ranking gives every criterion equal weight, so the overall score is the average of the seven
          scores (sum &divide; 7). Move a slider to change the emphasis. Weights are normalised to 100% and the ranking
          updates immediately. This is a preference tool, not a verdict.
        </p>
        <div className="form-grid">
          {CRITERION_KEYS.map((k) => {
            const id = `w-${k}`;
            const pct = effectiveWeights[k] * 100;
            return (
              <div key={k}>
                <label htmlFor={id}>
                  {CRITERION_META[k].label}
                  <span className="hint">{CRITERION_META[k].question}</span>
                </label>
                <input
                  id={id}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={raw[k]}
                  onChange={(e) => setCriterion(k, Number(e.target.value))}
                  aria-describedby={`${id}-value`}
                />
                <span id={`${id}-value`} className="small">
                  Raw {Math.round(raw[k])} &middot; effective weight <strong>{pct.toFixed(1)}%</strong>
                </span>
              </div>
            );
          })}
        </div>
        {weightError ? (
          <p className="notice bad" role="alert">
            {weightError} Showing the equal-weight ranking until this is fixed.
          </p>
        ) : null}
        <div className="toolbar">
          <button
            type="button"
            className="secondary"
            onClick={() => setRaw(Object.fromEntries(CRITERION_KEYS.map((k) => [k, DEFAULT_PERCENT])) as Record<CriterionKey, number>)}
            disabled={isEqual}
          >
            Restore equal weighting
          </button>
          <span className="small muted" aria-live="polite">
            {isEqual ? 'Equal weighting (default) is active.' : 'Custom weighting is active.'}
          </span>
        </div>
      </section>

      <div className="toolbar" role="search">
        <div>
          <label htmlFor="family-search">Search families or degrees</label>
          <input
            id="family-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. nursing, BBA, cybersecurity"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="sort-by">Rank by</label>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            <option value="overall">Overall (weighted score)</option>
            {CRITERION_KEYS.map((k) => (
              <option key={k} value={k}>
                {CRITERION_META[k].label} only
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="small muted" aria-live="polite">
            Showing {visible.length} of {families.length} families.
          </span>
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="notice" role="status">
          {selected.length} selected for comparison (max 4).{' '}
          <Link href={compareHref}>Open comparison</Link> &middot;{' '}
          <button type="button" className="secondary" onClick={() => setSelected([])}>
            Clear selection
          </button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="empty">No career families match this search. Try a broader term such as &ldquo;engineering&rdquo;.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="small muted" style={{ textAlign: 'left', padding: '0.5rem 0.6rem' }}>
              Scores run 0&ndash;4 (0 = MUST NOT, 1 = SHOULD NOT, 2 = CAN/MAY, 3 = SHOULD, 4 = MUST). Ranking uses the
              exact weighted score; the display is rounded to one decimal place. Missing research is never shown as 0.
            </caption>
            <thead>
              <tr>
                <th scope="col">Select</th>
                <th scope="col" className="num">
                  Rank
                </th>
                <th scope="col">Career family</th>
                <th scope="col" className="num">
                  Overall (0&ndash;4)
                </th>
                {CRITERION_KEYS.map((k) => (
                  <th scope="col" className="num" key={k}>
                    <abbr title={CRITERION_META[k].label}>{CRITERION_META[k].short}</abbr>
                  </th>
                ))}
                <th scope="col">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const fam = families.find((f) => f.id === row.familyId)!;
                const crank = criterionRanks?.get(row.familyId);
                const shownRank = crank ? crank.rankDisplay : row.rankDisplay;
                const famDegrees = degreesByFamily.get(fam.id) ?? [];
                const isSelected = selected.includes(fam.id);
                return (
                  <FamilyRow
                    key={fam.id}
                    fam={fam}
                    rowOverall={row.overallDisplay}
                    rankDisplay={shownRank}
                    scores={row.scores}
                    completeness={row.completeness}
                    isSelected={isSelected}
                    onToggle={() => toggleSelected(fam.id)}
                    degrees={famDegrees}
                    sourceMap={sourceMapLocal}
                    criterionRankLabel={sortBy === 'overall' ? null : crank?.rankDisplay ?? '\u2014'}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted" style={{ marginTop: '0.8rem' }}>
        Research status: <strong>analyst draft</strong>. These scores are editorial judgements with the confidence
        shown; they are not yet checked against the labour-market and automation datasets listed in the methodology.
      </p>
    </div>
  );
}

type RowProps = {
  fam: Family;
  rowOverall: string | null;
  rankDisplay: string;
  scores: Record<CriterionKey, number | null>;
  completeness: number;
  isSelected: boolean;
  onToggle: () => void;
  degrees: Degree[];
  sourceMap: Map<string, Source>;
  criterionRankLabel: string | null;
};

function FamilyRow({
  fam,
  rowOverall,
  rankDisplay,
  scores,
  completeness,
  isSelected,
  onToggle,
  degrees,
  sourceMap,
  criterionRankLabel,
}: RowProps) {
  const incomplete = completeness < 1;
  return (
    <>
      <tr>
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            aria-label={`Select ${fam.name} for comparison`}
          />
        </td>
        <td className="num">
          {rankDisplay}
          {criterionRankLabel !== null ? <div className="small muted">criterion rank {criterionRankLabel}</div> : null}
        </td>
        <td>
          <strong>{fam.name}</strong>
          <details>
            <summary>Why this score? ({fam.confidence} confidence)</summary>
            <div className="details-body">
              <p>{fam.description}</p>
              <dl>
                <dt>Typical pathways</dt>
                <dd>{fam.pathways.join('; ')}</dd>
                <dt>Degrees in this family</dt>
                <dd>{degrees.length > 0 ? degrees.map((d) => d.name).join('; ') : 'None recorded'}</dd>
                <dt>Additional qualifications</dt>
                <dd>{fam.additionalQualifications ?? 'None recorded'}</dd>
              </dl>
              <h3>Per-criterion rationale</h3>
              <ul className="clean">
                {CRITERION_KEYS.map((k) => (
                  <li key={k}>
                    <strong>{CRITERION_META[k].label}:</strong>{' '}
                    <span className={scoreClass(scores[k])}>{scoreLabel(scores[k])}</span>.{' '}
                    {fam.scores[k].rationale}
                  </li>
                ))}
              </ul>
              <h3>Assumptions</h3>
              <ul className="bullets">
                {fam.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <h3>What would change this assessment</h3>
              <ul className="bullets">
                {fam.changeFactors.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <h3>Sources</h3>
              <ul className="clean small">
                {fam.sources.map((id) => {
                  const s = sourceMap.get(id);
                  return s ? (
                    <li key={id}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>{' '}
                      <span className="muted">
                        ({s.publisher}; checked {s.lastChecked}; {s.verificationMethod})
                      </span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </details>
        </td>
        <td className="num">
          {rowOverall === null ? (
            <span className="badge badge-warn">Incomplete research</span>
          ) : (
            <span className="score-cell">{rowOverall}</span>
          )}
          {incomplete ? <div className="small muted">{Math.round(completeness * 100)}% complete</div> : null}
        </td>
        {CRITERION_KEYS.map((k) => (
          <td className="num" key={k} aria-label={`${CRITERION_META[k].label}: ${scores[k] ?? 'missing'}`}>
            {scores[k] === null ? (
              <span className="muted">n/a</span>
            ) : (
              <span className={`score-cell ${scoreClass(scores[k])}`}>{scores[k]}</span>
            )}
            <div>
              <ScoreBar score={scores[k]} />
            </div>
          </td>
        ))}
        <td>
          <span className={`badge ${fam.confidence === 'low' ? 'badge-warn' : 'badge-neutral'}`}>
            {fam.confidence} confidence
          </span>
        </td>
      </tr>
    </>
  );
}
