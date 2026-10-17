import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { CareerExplorer } from '@/components/CareerExplorer';

export const metadata: Metadata = {
  title: 'Career explorer',
  description: 'Compare degree families on seven transparent criteria, with adjustable weights and visible rationale.',
};

export default function CareersPage() {
  const d = getDataset();
  return (
    <>
      <h1>Career explorer</h1>
      <p className="lead">
        Degree families scored 0&ndash;4 on seven criteria. Each score has a rationale, an assumption list and sources.
        Scores are <strong>analyst drafts</strong> and are not yet checked against the labour-market datasets named in the
        methodology.
      </p>
      <p className="notice warn">
        Religious alignment is one criterion among seven and reflects a general, documented assessment of how well typical
        pathways fit common Islamic values. <strong>A score never makes a degree obligatory, forbidden, or required</strong>; it
        is a research aid for your own judgement and for consulting a qualified scholar.
      </p>
      <CareerExplorer families={d.families} degrees={d.degrees} sources={d.sources} />
    </>
  );
}
