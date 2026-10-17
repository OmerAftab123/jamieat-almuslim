import type { Scholarship, Source } from '@/lib/schemas';
import { SourceList, StatusBadge } from '@/components/shared';

const CLASS_LABEL: Record<Scholarship['classification'], string> = {
  'full-tuition': 'Full tuition (tuition only; not a full ride)',
  'full-ride': 'Full ride',
  'full-cost-of-attendance': 'Full cost of attendance',
  partial: 'Partial award',
  unconfirmed: 'Classification unconfirmed',
};

const VERIFY_TONE: Record<Scholarship['verificationStatus'], 'ok' | 'warn' | 'neutral'> = {
  'official-sources-verified': 'ok',
  'official-sources-partially-verified': 'warn',
  unverified: 'neutral',
};

/** Shows one funding record with its classification, eligibility, and what it does not cover. */
export function ScholarshipCard({ scholarship: s, sources }: { scholarship: Scholarship; sources: Source[] }) {
  return (
    <article className="card" aria-labelledby={`sch-${s.id}`}>
      <h3 id={`sch-${s.id}`}>{s.name}</h3>
      <p className="small">
        <StatusBadge tone={s.classification === 'unconfirmed' ? 'warn' : 'info'}>{CLASS_LABEL[s.classification]}</StatusBadge>{' '}
        <StatusBadge tone={VERIFY_TONE[s.verificationStatus]}>{s.verificationStatus.replace(/-/g, ' ')}</StatusBadge>{' '}
        <StatusBadge tone={s.loansIncluded ? 'bad' : 'ok'}>{s.loansIncluded ? 'Includes loans' : 'No loans'}</StatusBadge>
      </p>
      <p>{s.classificationNote}</p>
      <dl>
        <dt>Funder</dt>
        <dd>{s.funder}</dd>
        <dt>Award type</dt>
        <dd>{s.awardType.replace(/-/g, ' ')}</dd>
        <dt>What it covers</dt>
        <dd>
          <ul className="bullets">
            {Object.entries(s.coverage).map(([k, v]) => (
              <li key={k}>
                <strong>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {v}
              </li>
            ))}
          </ul>
        </dd>
        <dt>Not covered or unverified</dt>
        <dd>
          <ul className="bullets">
            {s.uncoveredCosts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </dd>
        <dt>Who can apply</dt>
        <dd>
          {s.eligibility.applicantScopeNote} {s.eligibility.pakistanNote}
          {s.eligibility.requiresFinancialNeed ? ' Awards depend on a documented financial-need assessment.' : ''}
        </dd>
        <dt>Academic and renewal conditions</dt>
        <dd>
          {s.eligibility.academicConditions} {s.eligibility.renewalConditions}
        </dd>
        <dt>Application method</dt>
        <dd>{s.applicationMethod}</dd>
        <dt>Required documents</dt>
        <dd>
          <ul className="bullets">
            {s.requiredDocuments.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </dd>
        <dt>Deadlines (check each cycle)</dt>
        <dd>
          <ul className="bullets">
            {Object.entries(s.deadlines).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        </dd>
        <dt>Selection statistics</dt>
        <dd>{s.selectionStatistics}</dd>
      </dl>
      <p className="small muted">
        Last verified {s.lastVerified}. {s.verificationNote}
      </p>
      <SourceList ids={s.sources} sources={sources} />
    </article>
  );
}
