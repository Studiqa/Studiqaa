import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { randomUUID } from "crypto";
import { roadmapAISchema, type RoadmapAIOutput } from "./roadmapSchema";
import type { Goal } from "@studiqa/types";

if (!getApps().length) initializeApp();

async function callRoadmapModel(subject: string, goal: Goal): Promise<RoadmapAIOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError("internal", "AI provider not configured");

  const prompt = `Generate a step-by-step learning roadmap (JSON only, no prose) for "${subject}", ` +
    `for a student whose goal is "${goal}". Return {"title","milestones":[{"title","description","resourceType"}...]}. ` +
    `8-15 ordered milestones, resourceType one of mindmap/notes/quiz/flashcards/external.`;

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
  const parsed = roadmapAISchema.safeParse(parsedJson);
  if (!parsed.success) throw new HttpsError("internal", "AI output failed schema validation");
  return parsed.data;
}

export const generateRoadmap = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const { subject, goal } = (request.data as { subject?: string; goal?: Goal }) ?? {};
  const cleanSubject = String(subject ?? "").trim();
  if (!cleanSubject || cleanSubject.length > 200) throw new HttpsError("invalid-argument", "subject must be 1-200 characters.");
  const cleanGoal: Goal = (["exam_prep", "placement", "upskilling"] as Goal[]).includes(goal as Goal)
    ? (goal as Goal)
    : "upskilling";

  const db = getFirestore();
  const userRef = db.doc(`users/${request.auth.uid}`);
  const aiOutput = await callRoadmapModel(cleanSubject, cleanGoal);

  const roadmapRef = userRef.collection("roadmaps").doc();
  await roadmapRef.set({
    title: aiOutput.title,
    goal: cleanGoal,
    milestones: aiOutput.milestones.map((m) => ({ id: randomUUID(), ...m, completed: false })),
    createdAt: Date.now(),
  });

  await userRef.collection("activityHistory").add({
    type: "roadmap",
    title: aiOutput.title,
    refId: roadmapRef.id,
    createdAt: Date.now(),
  });

  return { roadmapId: roadmapRef.id };
});
