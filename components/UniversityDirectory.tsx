'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { University } from '@/lib/schemas';

type Coverage = { edition: string; rankRangeTranscribed: string; rankRangePending: string; verificationDate: string };

const SHORT: Record<string, string> = {
  'verified-official-page': 'Verified',
  'partially-researched': 'Partly',
  'not-researched': 'Not researched',
};

export function UniversityDirectory({ universities, coverage }: { universities: University[]; coverage: Coverage }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');

  const countries = useMemo(
    () => [...new Set(universities.map((u) => u.country))].sort((a, b) => a.localeCompare(b)),
    [universities],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return universities.filter((u) => {
      if (country && u.country !== country) return false;
      if (!q) return true;
      return [u.name, u.city, u.country, ...u.alternateNames].join(' ').toLowerCase().includes(q);
    });
  }, [universities, query, country]);

  return (
    <div>
      <div className="toolbar" role="search">
        <div>
          <label htmlFor="uni-search">Search by name or city</label>
          <input
            id="uni-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Tokyo, MIT"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="uni-country">Country</label>
          <select id="uni-country" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <span className="small muted" aria-live="polite">
          Showing {rows.length} of {universities.length}.
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="empty">No universities match. Clear the filters to see the full list.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="small muted" style={{ textAlign: 'left', padding: '0.5rem 0.6rem' }}>
              QS World University Rankings 2027, ranks {coverage.rankRangeTranscribed} transcribed; {coverage.rankRangePending}{' '}
              pending. Rank checked {coverage.verificationDate}.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="num">
                  QS rank
                </th>
                <th scope="col">University</th>
                <th scope="col">City, country</th>
                <th scope="col">Programmes</th>
                <th scope="col">Admissions</th>
                <th scope="col">Funding</th>
                <th scope="col">Costs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="num">{u.qsRank.display}</td>
                  <td>
                    <Link href={`/universities/${u.id}`}>{u.name}</Link>
                  </td>
                  <td>
                    {u.city}, {u.country}
                  </td>
                  <td>{SHORT[u.dataStatus.programs] ?? u.dataStatus.programs}</td>
                  <td>{SHORT[u.dataStatus.admissions] ?? u.dataStatus.admissions}</td>
                  <td>{u.scholarshipIds.length > 0 ? 'Record(s) stored' : 'Not verified'}</td>
                  <td>{u.costs ? 'Total CoA only' : 'Not verified'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
