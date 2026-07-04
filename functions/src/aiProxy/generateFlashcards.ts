import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { initSRSState } from "@studiqa/srs-engine";
import { flashcardDeckAISchema, type FlashcardDeckAIOutput } from "./flashcardSchema";

if (!getApps().length) initializeApp();

async function callFlashcardModel(topic: string): Promise<FlashcardDeckAIOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError("internal", "AI provider not configured");

  const prompt = `Generate a flashcard deck (JSON only, no prose) for "${topic}". ` +
    `Return {"title","cards":[{"front","back"}...]}. 12-20 cards, front is a question/term, back is the answer/definition.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new HttpsError("unavailable", "AI provider request failed");

  const data = await res.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text ?? "{}";
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new HttpsError("internal", "AI returned malformed JSON");
  }
  const parsed = flashcardDeckAISchema.safeParse(parsedJson);
  if (!parsed.success) throw new HttpsError("internal", "AI output failed schema validation");
  return parsed.data;
}

export const generateFlashcards = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const topic = String((request.data as { topic?: string })?.topic ?? "").trim();
  if (!topic || topic.length > 200) throw new HttpsError("invalid-argument", "topic must be 1-200 characters.");

  const db = getFirestore();
  const userRef = db.doc(`users/${request.auth.uid}`);
  const aiOutput = await callFlashcardModel(topic);
  const today = new Date().toISOString().slice(0, 10);

  const deckRef = userRef.collection("flashcardDecks").doc();
  await deckRef.set({
    title: aiOutput.title,
    subject: topic,
    isPublic: false,
    cardCount: aiOutput.cards.length,
    createdAt: Date.now(),
  });

  const batch = db.batch();
  for (const card of aiOutput.cards) {
    const cardRef = deckRef.collection("cards").doc();
    batch.set(cardRef, { front: card.front, back: card.back, srs: initSRSState(today) });
  }
  await batch.commit();

  return { deckId: deckRef.id };
});
