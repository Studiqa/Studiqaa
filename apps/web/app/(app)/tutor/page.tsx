"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp } from "@studiqa/firebase-config";

export default function TutorHomePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tutorChat = httpsCallable<{ message: string }, { sessionId: string }>(getFunctions(getFirebaseApp()), "tutorChat");
      const result = await tutorChat({ message });
      router.push(`/tutor/${result.data.sessionId}`);
    } catch (err: any) {
      setError(err?.code === "functions/resource-exhausted"
        ? "You've hit your daily free tutor-message limit. Upgrade for unlimited chats."
        : "Couldn't reach the tutor right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <h1>Ask your AI Tutor</h1>
      <form onSubmit={handleSend}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Ask anything about your coursework…" style={{ width: "100%", padding: 8 }} />
        <button type="submit" disabled={loading || !message.trim()} style={{ marginTop: 12 }}>
          {loading ? "Thinking…" : "Send"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
