"use client";
import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { TutorMessage } from "@studiqa/types";

export default function TutorSessionPage({ params }: { params: { sessionId: string } }) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db(), "users", uid, "tutorSessions", params.sessionId, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => d.data() as TutorMessage));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
  }, [params.sessionId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const tutorChat = httpsCallable<{ message: string; sessionId: string }, {}>(getFunctions(getFirebaseApp()), "tutorChat");
      await tutorChat({ message: draft, sessionId: params.sessionId });
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left", marginBottom: 12 }}>
            <span style={{
              display: "inline-block", padding: "8px 12px", borderRadius: 12,
              background: m.role === "user" ? "#5B5EF4" : "#15181C", color: "#EDEDED", maxWidth: "80%",
            }}>
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Continue the conversation…" style={{ flex: 1, padding: 8 }} />
        <button type="submit" disabled={sending || !draft.trim()}>{sending ? "…" : "Send"}</button>
      </form>
    </main>
  );
}
