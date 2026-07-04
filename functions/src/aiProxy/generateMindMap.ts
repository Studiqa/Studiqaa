import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { checkLimit } from "@studiqa/usage-limits";
import type { User } from "@studiqa/types";
import { mindMapAISchema, type MindMapAIOutput } from "./mindMapSchema";

if (!getApps().length) initializeApp();

/**
 * Calls the LLM provider (Anthropic) to turn a topic into a structured mind map.
 * Kept isolated so it's the single place an API key is read from — never shipped
 * to the client, per Section 0's "no custom server, but AI keys still stay server-side" mandate.
 */
async function callMindMapModel(topic: string): Promise<MindMapAIOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError("internal", "AI provider not configured");

  const prompt = `Generate a mind map (JSON only, no prose) for the topic "${topic}". ` +
    `Return {"title": string, "nodes": [{"id","label","parentId","x","y","explanation"}...]}. ` +
    `Root node parentId is null. Lay nodes out radially with x/y in a 0-800 by 0-600 canvas.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
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

  const parsed = mindMapAISchema.safeParse(parsedJson);
  if (!parsed.success) {
    // Section 15.1 #5: reject and surface a retryable error rather than store bad data.
    throw new HttpsError("internal", "AI output failed schema validation");
  }
  return parsed.data;
}

export const generateMindMap = onCall(
  { enforceAppCheck: true, cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in.");
    }
    const topic = String((request.data as { topic?: string })?.topic ?? "").trim();
    if (!topic || topic.length > 200) {
      throw new HttpsError("invalid-argument", "topic must be 1-200 characters.");
    }

    const db = getFirestore();
    const userRef = db.doc(`users/${request.auth.uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) throw new HttpsError("not-found", "User profile not found.");
    const user = userSnap.data() as User;

    // Server-side enforcement — the real gate. The client-side checkLimit() call
    // (usage-limits package) is only for instant UI feedback, never trusted alone.
    const limitResult = checkLimit(user, "mindMaps");
    if (!limitResult.allowed) {
      throw new HttpsError("resource-exhausted", "Free mind-map limit reached for this month.");
    }

    const aiOutput = await callMindMapModel(topic);

    const mapRef = userRef.collection("mindMaps").doc();
    await mapRef.set({
      title: aiOutput.title,
      sourceType: "topic",
      nodes: aiOutput.nodes,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (!limitResult.isPremium) {
      await userRef.update({ "usageCounters.mindMapsThisMonth": FieldValue.increment(1) });
    }

    return { mapId: mapRef.id };
  }
);
