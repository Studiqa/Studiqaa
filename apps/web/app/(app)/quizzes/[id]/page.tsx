"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { Quiz } from "@studiqa/types";

export default function QuizAttemptPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db(), "users", uid, "quizzes", params.id), (snap) => {
      if (snap.exists()) setQuiz({ id: snap.id, ...(snap.data() as Omit<Quiz, "id">) });
    });
  }, [params.id]);

  if (!quiz) return <main style={{ padding: 48 }}>Loading quiz…</main>;

  const score = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);

  async function handleSubmit() {
    setSubmitted(true);
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid || !quiz) return;
    // quizAttempts is create-only per firestore.rules — attempts are immutable once recorded.
    await addDoc(collection(db(), "users", uid, "quizAttempts"), {
      quizId: quiz.id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      completedAt: Date.now(),
    });
  }

  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto" }}>
      <h1>{quiz.title}</h1>
      {quiz.questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <p><strong>{i + 1}. {q.q}</strong></p>
          {q.options.map((opt, oi) => {
            const isCorrect = submitted && oi === q.correctIndex;
            const isWrongPick = submitted && answers[i] === oi && oi !== q.correctIndex;
            return (
              <label key={oi} style={{ display: "block", color: isCorrect ? "green" : isWrongPick ? "crimson" : "inherit" }}>
                <input
                  type="radio"
                  name={`q${i}`}
                  disabled={submitted}
                  checked={answers[i] === oi}
                  onChange={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                />{" "}
                {opt}
              </label>
            );
          })}
          {submitted && <p style={{ fontSize: 13, opacity: 0.8 }}>{q.explanation}</p>}
        </div>
      ))}
      {!submitted ? (
        <button onClick={handleSubmit} disabled={Object.keys(answers).length < quiz.questions.length}>
          Submit
        </button>
      ) : (
        <p><strong>Score: {score} / {quiz.questions.length}</strong></p>
      )}
    </main>
  );
}
