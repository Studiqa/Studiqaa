import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { checkLimit } from "@studiqa/usage-limits";
import type { User } from "@studiqa/types";

if (!getApps().length) initializeApp();

/**
 * One AI Tutor turn. Creates a new session on first message (sessionId omitted),
 * otherwise appends to an existing one. Also writes an activityHistory entry so it
 * shows up in the searchable history sidebar alongside mind maps/notes/quizzes —
 * this is the "history like ChatGPT" requirement: every generation/chat is logged here.
 */
export const tutorChat = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const { message, sessionId } = (request.data as { message?: string; sessionId?: string }) ?? {};
  const cleanMessage = String(message ?? "").trim();
  if (!cleanMessage || cleanMessage.length > 2000) throw new HttpsError("invalid-argument", "message must be 1-2000 characters.");

  const db = getFirestore();
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError("not-found", "User profile not found.");
  const user = userSnap.data() as User;

  const limitResult = checkLimit(user, "tutorMessages");
  if (!limitResult.allowed) throw new HttpsError("resource-exhausted", "Free tutor-message limit reached for today.");

  const sessionRef = sessionId ? userRef.collection("tutorSessions").doc(sessionId) : userRef.collection("tutorSessions").doc();
  const isNewSession = !sessionId;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError("internal", "AI provider not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: "You are Studiqa's AI study tutor for engineering students. Be concise, accurate, and encouraging.",
      messages: [{ role: "user", content: cleanMessage }],
    }),
  });
  if (!res.ok) throw new HttpsError("unavailable", "AI provider request failed");
  const data = await res.json();
  const replyText: string = data.content?.find((b: any) => b.type === "text")?.text ?? "Sorry, I couldn't generate a response.";

  const now = Date.now();
  if (isNewSession) {
    await sessionRef.set({ title: cleanMessage.slice(0, 60), createdAt: now, updatedAt: now });
  } else {
    await sessionRef.update({ updatedAt: now });
  }

  const messagesRef = sessionRef.collection("messages");
  await messagesRef.add({ role: "user", content: cleanMessage, createdAt: now });
  await messagesRef.add({ role: "assistant", content: replyText, createdAt: now + 1 });

  if (isNewSession) {
    await userRef.collection("activityHistory").add({
      type: "tutor",
      title: cleanMessage.slice(0, 60),
      refId: sessionRef.id,
      createdAt: now,
    });
  }

  if (!limitResult.isPremium) {
    await userRef.update({ "usageCounters.tutorMessagesToday": FieldValue.increment(1) });
  }

  return { sessionId: sessionRef.id, reply: replyText };
});
