import Link from 'next/link';
import type { Metadata } from 'next';
import { getDataset } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Compare degree families, check universities and free-study routes, and plan your application with sourced evidence.',
};

export default function HomePage() {
  const d = getDataset();
  const verifiedUnis = d.universities.filter((u) => u.dataStatus.qsRank === 'verified-official-page').length;
  const withFunding = d.universities.filter((u) => u.scholarshipIds.length > 0).length;
  const verifiedPrograms = d.universities.reduce(
    (n, u) => n + u.programs.length,
    0,
  );

  return (
    <>
      <section>
        <h1>Choose a degree, a career and a university with evidence you can check</h1>
        <p className="lead">
          A research platform for Muslim students, especially those applying from Pakistan as international
          undergraduates. It helps you compare degree families on seven transparent criteria, look up
          universities from the QS ranking, check whether a free-study route is documented, and plan each step.
        </p>
        <p className="notice warn">
          <strong>Honest status:</strong> the scores, university list and funding records are early and partial.
          Each page shows its own verification status. Where the platform has no verified record, it says
          &ldquo;not verified&rdquo; instead of guessing.
        </p>
      </section>

      <div className="grid-cards" role="list">
        <div role="listitem">
          <Link className="card card-link" href="/careers">
            <h3>Career explorer</h3>
            <p className="small">
              Rank degree families on seven criteria. Adjust the weights and see the ranking update at once.
            </p>
          </Link>
        </div>
        <div role="listitem">
          <Link className="card card-link" href="/universities">
            <h3>University directory</h3>
            <p className="small">
              Official QS 2027 ranks, with tie notation, city and country. Search, filter and open profiles.
            </p>
          </Link>
        </div>
        <div role="listitem">
          <Link className="card card-link" href="/matcher">
            <h3>Free-study matcher</h3>
            <p className="small">
              Pick a degree, a university and an intake year. Get programme, admissions and funding status, with
              every gap marked.
            </p>
          </Link>
        </div>
        <div role="listitem">
          <Link className="card card-link" href="/compare">
            <h3>Comparison workspace</h3>
            <p className="small">Compare up to four degree families or four universities side by side.</p>
          </Link>
        </div>
        <div role="listitem">
          <Link className="card card-link" href="/roadmap">
            <h3>Roadmap and planning</h3>
            <p className="small">
              A step-by-step plan from secondary school to enrolment. Official deadlines are marked separately from
              your own targets.
            </p>
          </Link>
        </div>
        <div role="listitem">
          <Link className="card card-link" href="/methodology">
            <h3>Methodology and trust</h3>
            <p className="small">How scores, rankings, sources, verification dates and limitations work.</p>
          </Link>
        </div>
      </div>

      <h2>What the data covers today</h2>
      <div className="stat-row" aria-label="Dataset summary">
        <div className="stat">
          <strong>{d.families.length}</strong>
          <span>career families scored on 7 criteria (analyst draft)</span>
        </div>
        <div className="stat">
          <strong>{d.degrees.length}</strong>
          <span>canonical bachelor&rsquo;s degrees, with aliases</span>
        </div>
        <div className="stat">
          <strong>{verifiedUnis}</strong>
          <span>QS 2027 universities transcribed (ranks 1&ndash;150)</span>
        </div>
        <div className="stat">
          <strong>{withFunding}</strong>
          <span>universities with at least one funding record</span>
        </div>
        <div className="stat">
          <strong>{verifiedPrograms}</strong>
          <span>verified programme records (none yet)</span>
        </div>
      </div>
      <p className="small muted">
        Coverage detail, unresolved gaps and the next research priorities are in{' '}
        <Link href="/methodology">the methodology page</Link> and the repository&rsquo;s <a href="https://github.com/OmerAftab123/jamieat-almuslim/blob/main/docs/DATA_COVERAGE.md"><code>docs/DATA_COVERAGE.md</code></a>.
      </p>

      <h2>Who this is for, and what it is not</h2>
      <p>
        The default applicant is a Pakistani student applying as an international undergraduate. You can change the
        applicant country in the matcher. The platform is not an admissions service, does not issue religious
        rulings, and does not guarantee admission, scholarships, jobs or salaries.
      </p>
      <p>
        Your matcher inputs are processed in your browser. The site does not ask for an account and does not store your
        personal profile on the server.
      </p>
    </>
  );
}
