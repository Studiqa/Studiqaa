"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { CodingProblem } from "@studiqa/types";

export default function CodingProblemPage({ params }: { params: { problemId: string } }) {
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db(), "publicContent", "codingProblems", "items", params.problemId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...(snap.data() as Omit<CodingProblem, "id">) };
        setProblem(data);
        setCode(data.starterCode);
      }
    });
  }, [params.problemId]);

  // NOTE: real code execution/judging happens server-side (a sandboxed Cloud Function
  // or third-party judge API) — never eval() untrusted code in the browser. This is a
  // stub that just records the attempt; wire in a judge0/piston-style API here later.
  async function handleSubmit() {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid || !problem) return;
    setResult("Submitted — grading isn't wired to a judge API yet in this scaffold.");
    await setDoc(
      doc(db(), "users", uid, "codingProgress", problem.id),
      { problemId: problem.id, status: "attempted", lastSubmittedCode: code, attempts: increment(1) },
      { merge: true }
    );
  }

  if (!problem) return <main style={{ padding: 48 }}>Loading problem…</main>;

  return (
    <main style={{ padding: 48, maxWidth: 720, margin: "0 auto" }}>
      <h1>{problem.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{problem.statement}</p>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={16}
        style={{ width: "100%", fontFamily: "monospace", background: "#0B0D10", color: "#EDEDED", padding: 12 }}
      />
      <button onClick={handleSubmit} style={{ marginTop: 12 }}>Submit</button>
      {result && <p>{result}</p>}
    </main>
  );
}
