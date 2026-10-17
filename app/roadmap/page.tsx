import type { Metadata } from 'next';
import Link from 'next/link';
import { ROADMAP_TEMPLATE } from '@/lib/roadmap';
import { RoadmapChecklist } from '@/components/RoadmapChecklist';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'A step-by-step application plan with official deadlines separated from your own targets.',
};

export default function RoadmapPage() {
  return (
    <>
      <h1>Roadmap and planning</h1>
      <p className="lead">
        A general plan from secondary school to enrolment. Each step is labelled as an{' '}
        <strong>official deadline</strong> (check the source for the date), a <strong>checklist item</strong>, or a{' '}
        <strong>suggested personal target</strong> that you set yourself. No dates are invented here.
      </p>
      <p className="small">
        Ticks are saved in this browser only (local storage). They are not sent to the server. Use the{' '}
        <Link href="/matcher">matcher</Link> to check a specific degree and university.
      </p>
      <RoadmapChecklist steps={ROADMAP_TEMPLATE} />
    </>
  );
}
