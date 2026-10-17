import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>The page you asked for does not exist. Try one of these:</p>
      <ul className="bullets">
        <li>
          <Link href="/careers">Career explorer</Link>
        </li>
        <li>
          <Link href="/universities">University directory</Link>
        </li>
        <li>
          <Link href="/matcher">Free-study matcher</Link>
        </li>
      </ul>
    </>
  );
}
