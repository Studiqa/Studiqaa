"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import { reviewCard, isDue, type SRSRating } from "@studiqa/srs-engine";
import type { Flashcard } from "@studiqa/types";

export default function FlashcardReviewPage({ params }: { params: { deckId: string } }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    return onSnapshot(
      collection(db(), "users", uid, "flashcardDecks", params.deckId, "cards"),
      (snap) => {
        const today = new Date().toISOString().slice(0, 10);
        const due = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Flashcard, "id">) }))
          .filter((c) => isDue(c.srs, today));
        setCards(due);
      }
    );
  }, [params.deckId]);

  async function handleRate(rating: SRSRating) {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    const card = cards[index];
    if (!uid || !card) return;
    const today = new Date().toISOString().slice(0, 10);
    const nextState = reviewCard(card.srs, rating, today, Date.now());
    await updateDoc(doc(db(), "users", uid, "flashcardDecks", params.deckId, "cards", card.id), { srs: nextState });
    setShowBack(false);
    setIndex((i) => i + 1);
  }

  if (cards.length === 0) return <main style={{ padding: 48 }}>Nothing due for review right now 🎉</main>;
  if (index >= cards.length) return <main style={{ padding: 48 }}>Session complete! Great work.</main>;

  const card = cards[index];

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <p style={{ opacity: 0.6 }}>Card {index + 1} of {cards.length}</p>
      <div
        onClick={() => setShowBack((s) => !s)}
        style={{ padding: 32, borderRadius: 16, background: "#15181C", color: "#EDEDED", minHeight: 160, cursor: "pointer" }}
      >
        <p style={{ fontSize: 18 }}>{showBack ? card.back : card.front}</p>
        {!showBack && <p style={{ fontSize: 12, opacity: 0.6 }}>Tap to reveal answer</p>}
      </div>
      {showBack && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          <button onClick={() => handleRate(0)}>Again</button>
          <button onClick={() => handleRate(1)}>Hard</button>
          <button onClick={() => handleRate(2)}>Good</button>
          <button onClick={() => handleRate(3)}>Easy</button>
        </div>
      )}
    </main>
  );
}
