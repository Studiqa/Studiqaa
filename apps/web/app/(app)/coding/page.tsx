"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@studiqa/firebase-config";
import type { CodingProblem } from "@studiqa/types";

// Coding problems are curated content (Section 6 publicContent), not AI-generated per
// request — same publicContent/{collection}/{docId} pattern as quizBank etc.
export default function CodingListPage() {
  const [problems, setProblems] = useState<CodingProblem[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db(), "publicContent", "codingProblems", "items"), (snap) => {
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CodingProblem, "id">) })));
    });
  }, []);

  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto" }}>
      <h1>Coding Practice</h1>
      {problems.length === 0 && <p style={{ opacity: 0.7 }}>No problems published yet — check back soon.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {problems.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <Link href={`/coding/${p.id}`}>{p.title}</Link>{" "}
            <span style={{ fontSize: 12, opacity: 0.6 }}>({p.difficulty})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
