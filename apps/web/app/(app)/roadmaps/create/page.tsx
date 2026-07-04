"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp } from "@studiqa/firebase-config";
import type { Goal } from "@studiqa/types";

export default function CreateRoadmapPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState<Goal>("exam_prep");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const generateRoadmap = httpsCallable<{ subject: string; goal: Goal }, { roadmapId: string }>(
        getFunctions(getFirebaseApp()),
        "generateRoadmap"
      );
      const result = await generateRoadmap({ subject, goal });
      router.push(`/roadmaps/${result.data.roadmapId}`);
    } catch {
      setError("Couldn't generate a roadmap right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <h1>Generate a learning roadmap</h1>
      <form onSubmit={handleGenerate}>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (e.g. Data Structures)" required style={{ width: "100%", padding: 8 }} />
        <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} style={{ display: "block", width: "100%", marginTop: 12 }}>
          <option value="exam_prep">Exam Prep</option>
          <option value="placement">Placement</option>
          <option value="upskilling">Upskilling</option>
        </select>
        <button type="submit" disabled={loading || !subject.trim()} style={{ marginTop: 12 }}>
          {loading ? "Generating…" : "Generate roadmap"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
