import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';
import { SourceList } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Methodology and trust',
  description: 'How scores, rankings, sources, verification dates and limitations work.',
};

export default function MethodologyPage() {
  const d = getDataset();
  return (
    <>
      <h1>Methodology and trust centre</h1>
      <p className="lead">
        This page says how each figure was produced, when it was last checked, and what is still missing. If a claim here
        and a page on the site disagree, treat the official source as correct and report the problem.
      </p>

      <h2>Status at a glance</h2>
      <ul className="bullets">
        <li>
          <strong>Career scores:</strong> {d.meta.familiesResearchStatus}. {d.meta.familiesResearchStatusNote}
        </li>
        <li>
          <strong>Universities:</strong> QS World University Rankings {d.meta.universitiesCoverage.edition.replace(/^QS World University Rankings /, '')}, ranks{' '}
          {d.meta.universitiesCoverage.rankRangeTranscribed} transcribed. {d.meta.universitiesCoverage.rankRangePending}. Cross-check status:{' '}
          {d.meta.universitiesCoverage.crossCheckStatus}.
        </li>
        <li>
          <strong>Funding:</strong> {d.scholarships.length} record(s) so far, each with its own verification status. Absence of a record is not
          evidence that no aid exists.
        </li>
        <li>
          <strong>Exchange rates:</strong> {d.fx.rates.map((r) => `USD→${r.quote} ${r.rate} (${r.rateType}, ${r.rateDate})`).join('; ')}. Other currencies are typed in by the user and are not verified. Re-check before relying on any rate.
        </li>
      </ul>

      <h2>Career family scores</h2>
      <p>
        Each degree family receives an integer score from 0 to 4 on seven criteria: Islamic alignment, benefit to people and
        society, financial lucrativeness, future resilience, AI resilience, employment stability and flexibility. The score is
        an analyst judgement, written with a rationale, assumptions, change factors and a confidence level. Full rules are in{' '}
        <a href="https://github.com/OmerAftab123/jamieat-almuslim/blob/main/docs/SCORING_METHODOLOGY.md"><code>docs/SCORING_METHODOLOGY.md</code></a>.
      </p>
      <ul className="bullets">
        <li>The overall score is the weighted mean of the seven scores, on the 0&ndash;4 scale. The default weights are equal (1/7 each).</li>
        <li>Shown to one decimal place; ranking uses the unrounded value, so the display never reorders rows.</li>
        <li>Ties share a rank with &ldquo;=N&rdquo; and the next rank is skipped.</li>
        <li>A missing criterion gives no overall score. It is never treated as 0.</li>
        <li>Future resilience (is the field likely to remain relevant?) and AI resilience (how exposed are its tasks to automation?) are scored separately.</li>
        <li>Religious alignment describes how well typical pathways match common Islamic values. It is not a ruling, and no score makes a degree obligatory or forbidden.</li>
      </ul>

      <h2>University rankings</h2>
      <p>
        Ranks are taken from the official QS World University Rankings page on topuniversities.com, with the edition and date
        recorded per record. Tied ranks are kept as published. The directory covers ranks 1&ndash;150 of the QS 2027 edition.
        Ranks 151 and below are outside this dataset.
      </p>

      <h2>Funding and costs</h2>
      <ul className="bullets">
        <li>Each funding record has a classification (for example <em>full tuition</em>, <em>full cost of attendance</em>, <em>partial</em>), an eligibility scope, and a list of what it does not cover.</li>
        <li><em>Full tuition</em> means tuition only. It is never described as a full ride.</li>
        <li>Loans are recorded separately and are never presented as scholarships. The matcher can exclude loan-bearing awards.</li>
        <li>Official total costs are shown as published, with no invented breakdown. Your own calculator results are labelled as your estimates.</li>
      </ul>

      <h2>Matcher rules</h2>
      <p>
        The matcher is deterministic. It never infers a programme from a university&rsquo;s rank or reputation. A
        &ldquo;possible candidate&rdquo; label requires a verified programme record and recorded admissions requirements that the profile
        meets. Competitiveness and admission probability are never estimated.
      </p>

      <h2>Sources</h2>
      <p>Every citation records its publisher, type, the date it was last checked, and how it was checked.</p>
      <SourceList ids={d.sources.map((s) => s.id)} sources={d.sources} />

      <h2>Known limitations</h2>
      <ul className="bullets">
        <li>Career scores are not yet cross-checked against BLS, O*NET or ILOSTAT-type datasets. Confidence levels show this.</li>
        <li>Most universities have no programme, admissions or funding research yet.</li>
        <li>Only one funding record exists so far.</li>
        <li>Official pages change; each record has a last-verified date.</li>
      </ul>

      <h2>Report an error</h2>
      <p>
        If you find an error, please open an issue in the GitHub repository with the page, the claim, and the official source that
        contradicts it. Corrections are made in the JSON files under <code>data/</code> with a new last-verified date.
      </p>
    </>
  );
}
