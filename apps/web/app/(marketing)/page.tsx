import Link from "next/link";

export default function MarketingHome() {
  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto" }}>
      <h1>Studiqa</h1>
      <p>Turn any topic into a mind map, quiz, and flashcard deck — in seconds.</p>
      <p>
        <Link href="/signup">Get started</Link> · <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
