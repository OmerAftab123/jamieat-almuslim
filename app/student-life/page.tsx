import type { Metadata } from 'next';
import { STUDENT_LIFE_DISCLAIMER, STUDENT_LIFE_ITEMS } from '@/lib/studentLife';

export const metadata: Metadata = {
  title: 'Student life',
  description: 'Practical questions for Muslim students studying abroad: prayer, food, Ramadan, housing, finance and visas.',
};

export default function StudentLifePage() {
  return (
    <>
      <h1>Student life abroad</h1>
      <p className="lead">
        Studying in a new country raises practical questions for Muslim students: where to pray, what food is available, how
        Ramadan and Eid fit into the timetable, and how to fund study without interest-bearing debt if that matters to you.
        This page lists the questions to ask. It does not tell you what any university provides.
      </p>
      <p className="notice">{STUDENT_LIFE_DISCLAIMER}</p>

      <h2>Questions to check with each university</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Question to ask</th>
              <th scope="col">Where to check</th>
            </tr>
          </thead>
          <tbody>
            {STUDENT_LIFE_ITEMS.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.topic}</th>
                <td>{item.question}</td>
                <td>{item.whereToCheck}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Religious questions</h2>
      <p>
        Questions about what is permissible, for example about a particular loan, a particular job, or how to observe a rule while
        travelling, need an answer from a qualified scholar you trust. This platform does not issue religious rulings, and no
        degree or career score should be read as a religious judgement.
      </p>

      <h2>Use the matcher</h2>
      <p>
        The <a href="/matcher">free-study matcher</a> lists the same questions after each check. Tick &ldquo;avoid interest-bearing
        loans&rdquo; there to remove loan-bearing awards from the results.
      </p>
    </>
  );
}
