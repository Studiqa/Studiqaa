import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { checkLimit } from "@studiqa/usage-limits";
import type { User } from "@studiqa/types";
import { notesAISchema, type NotesAIOutput } from "./notesSchema";

if (!getApps().length) initializeApp();

// Notes generation shares the mind-map's limit bucket conceptually but is
// currently uncapped for free users per PRD Section 3.2 (only mindMaps/tutor/quizzes
// are metered) — kept as a distinct function so a per-note limit can be added later
// without touching generateMindMap.
async function callNotesModel(topic: string): Promise<NotesAIOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError("internal", "AI provider not configured");

  const prompt = `Generate structured study notes (JSON only, no prose) for the topic "${topic}". ` +
    `Return {"title": string, "sections": [{"heading","body","keyPoints": string[]}...]}. ` +
    `4-8 sections, each with 2-5 concise keyPoints.`;

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
  const parsed = notesAISchema.safeParse(parsedJson);
  if (!parsed.success) throw new HttpsError("internal", "AI output failed schema validation");
  return parsed.data;
}

export const generateNotes = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const topic = String((request.data as { topic?: string })?.topic ?? "").trim();
  if (!topic || topic.length > 200) throw new HttpsError("invalid-argument", "topic must be 1-200 characters.");

  const db = getFirestore();
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError("not-found", "User profile not found.");

  const aiOutput = await callNotesModel(topic);
  const noteRef = userRef.collection("notes").doc();
  await noteRef.set({
    title: aiOutput.title,
    sections: aiOutput.sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return { noteId: noteRef.id };
});
