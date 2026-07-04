"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp } from "@studiqa/firebase-config";

export default function CreateQuizPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const generateQuiz = httpsCallable<{ topic: string; difficulty: string }, { quizId: string }>(
        getFunctions(getFirebaseApp()),
        "generateQuiz"
      );
      const result = await generateQuiz({ topic, difficulty });
      router.push(`/quizzes/${result.data.quizId}`);
    } catch (err: any) {
      setError(err?.code === "functions/resource-exhausted"
        ? "You've reached your free quiz limit this month. Upgrade for unlimited quizzes."
        : "Couldn't generate a quiz right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <h1>Generate a quiz</h1>
      <form onSubmit={handleGenerate}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic name" required style={{ width: "100%", padding: 8 }} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} style={{ display: "block", width: "100%", marginTop: 12 }}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button type="submit" disabled={loading || !topic.trim()} style={{ marginTop: 12 }}>
          {loading ? "Generating…" : "Generate quiz"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
