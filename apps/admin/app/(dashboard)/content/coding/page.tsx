"use client";
import { useState } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp } from "@studiqa/firebase-config";
import { useAdminGuard } from "../../../../lib/useAdminGuard";

export default function ManageCodingProblemsPage() {
  const { status } = useAdminGuard();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [statement, setStatement] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // publishContent re-verifies admin/moderator role server-side — this call would
      // be rejected even if someone bypassed the useAdminGuard check on this page.
      const publishContent = httpsCallable(getFunctions(getFirebaseApp()), "publishContent");
      await publishContent({
        collectionName: "codingProblems",
        data: { title, difficulty, topicTags: [], statement, starterCode, testCases: [] },
      });
      setMessage("Published.");
      setTitle(""); setStatement(""); setStarterCode("");
    } catch {
      setMessage("Failed to publish.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <main style={{ padding: 48 }}>Checking access…</main>;
  if (status === "denied") return <main style={{ padding: 48 }}>Access denied.</main>;

  return (
    <main style={{ padding: 48, maxWidth: 640 }}>
      <h1>Publish a coding problem</h1>
      <form onSubmit={handlePublish}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required style={{ width: "100%", padding: 8 }} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} style={{ display: "block", marginTop: 8 }}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Problem statement" rows={6} style={{ width: "100%", marginTop: 8 }} />
        <textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} placeholder="Starter code" rows={6} style={{ width: "100%", marginTop: 8, fontFamily: "monospace" }} />
        <button type="submit" disabled={saving} style={{ marginTop: 12 }}>{saving ? "Publishing…" : "Publish"}</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
