import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Mission, principles and limits of the Jamieat Al-Muslim research platform.',
};

export default function AboutPage() {
  return (
    <>
      <h1>About this project</h1>
      <p className="lead">
        A free, open research tool to help Muslim students make informed choices about degrees, careers and universities,
        especially students from Pakistan who are looking at international undergraduate study.
      </p>

      <h2>Mission</h2>
      <p>
        Many students decide on a degree from rumours, family pressure or a single league table. This project tries to make the
        evidence visible: what a degree leads to, what a university officially says, what funding is documented, and what is still
        unknown. The full mission and vision are in <code>docs/MISSION_AND_VISION.md</code>.
      </p>

      <h2>Principles</h2>
      <ul className="bullets">
        <li>Verified data only. Missing data stays missing and is labelled as such.</li>
        <li>Every figure has a source, a date and a way it was checked.</li>
        <li>Scores are judgements, shown with reasons and confidence, not verdicts.</li>
        <li>Religious alignment is one dimension among several. The site does not issue rulings.</li>
        <li>Student information stays in the student&rsquo;s browser. The site has no accounts and no tracking.</li>
        <li>Open source, reproducible, and free to run.</li>
      </ul>

      <h2>What this is not</h2>
      <ul className="bullets">
        <li>Not an admissions service, a scholarship provider, a visa adviser or a legal or religious authority.</li>
        <li>Not a guarantee of admission, funding, employment or salary.</li>
        <li>Not a complete list of universities or scholarships yet.</li>
      </ul>

      <h2>Contributing</h2>
      <p>
        Corrections, sources and research help are welcome through GitHub issues. See the README and{' '}
        <code>docs/DEVELOPMENT_ROADMAP.md</code> for priorities.
      </p>
    </>
  );
}
