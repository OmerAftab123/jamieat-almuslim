import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { MatcherForm } from '@/components/MatcherForm';
import { CostCalculator } from '@/components/CostCalculator';

export const metadata: Metadata = {
  title: 'Free-study matcher',
  description: 'Check a degree and university against stored evidence: programme, admissions, funding, costs and next steps.',
};

export default function MatcherPage() {
  const d = getDataset();
  return (
    <>
      <h1>Free-study matcher</h1>
      <p className="lead">
        Choose a degree, a university and an intake year. The matcher reports only what the stored, dated evidence
        supports. Everything else is marked <strong>not verified</strong>.
      </p>
      <p className="notice warn">
        Your inputs are processed in your browser and are not sent to or stored on this server. Results are decision support,
        not an admissions or scholarship decision. Tuition-only support is never described as a full scholarship, and loan-based
        awards are never described as scholarships.
      </p>
      <MatcherForm dataset={d} />
      <h2 id="cost-calc">Cost calculator</h2>
      <CostCalculator fx={d.fx} />
    </>
  );
}
