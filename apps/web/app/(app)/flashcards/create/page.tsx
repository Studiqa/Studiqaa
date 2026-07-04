"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp } from "@studiqa/firebase-config";

export default function CreateFlashcardDeckPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const generateFlashcards = httpsCallable<{ topic: string }, { deckId: string }>(
        getFunctions(getFirebaseApp()),
        "generateFlashcards"
      );
      const result = await generateFlashcards({ topic });
      router.push(`/flashcards/${result.data.deckId}/review`);
    } catch {
      setError("Couldn't generate flashcards right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <h1>Generate a flashcard deck</h1>
      <form onSubmit={handleGenerate}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic name" required style={{ width: "100%", padding: 8 }} />
        <button type="submit" disabled={loading || !topic.trim()} style={{ marginTop: 12 }}>
          {loading ? "Generating…" : "Generate deck"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
