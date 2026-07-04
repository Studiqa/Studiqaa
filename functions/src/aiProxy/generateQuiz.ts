import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { checkLimit } from "@studiqa/usage-limits";
import type { User } from "@studiqa/types";
import { quizAISchema, type QuizAIOutput } from "./quizSchema";

if (!getApps().length) initializeApp();

async function callQuizModel(topic: string, difficulty: string): Promise<QuizAIOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpsError("internal", "AI provider not configured");

  const prompt = `Generate a ${difficulty} multiple-choice quiz (JSON only, no prose) on "${topic}". ` +
    `Return {"title","difficulty","questions":[{"q","options":[4 strings],"correctIndex":0-3,"explanation","weakTopicTag"}...]}. ` +
    `8 questions. Exactly one correct option per question.`;

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
  const parsed = quizAISchema.safeParse(parsedJson);
  if (!parsed.success) throw new HttpsError("internal", "AI output failed schema validation");
  return parsed.data;
}

export const generateQuiz = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const { topic, difficulty } = (request.data as { topic?: string; difficulty?: string }) ?? {};
  const cleanTopic = String(topic ?? "").trim();
  const cleanDifficulty = ["easy", "medium", "hard"].includes(String(difficulty)) ? String(difficulty) : "medium";
  if (!cleanTopic || cleanTopic.length > 200) throw new HttpsError("invalid-argument", "topic must be 1-200 characters.");

  const db = getFirestore();
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError("not-found", "User profile not found.");
  const user = userSnap.data() as User;

  const limitResult = checkLimit(user, "quizzes");
  if (!limitResult.allowed) throw new HttpsError("resource-exhausted", "Free quiz limit reached for this month.");

  const aiOutput = await callQuizModel(cleanTopic, cleanDifficulty);
  const quizRef = userRef.collection("quizzes").doc();
  await quizRef.set({
    title: aiOutput.title,
    subject: cleanTopic,
    difficulty: aiOutput.difficulty,
    questions: aiOutput.questions,
    isAIGenerated: true,
    createdAt: Date.now(),
  });

  if (!limitResult.isPremium) {
    await userRef.update({ "usageCounters.quizzesThisMonth": FieldValue.increment(1) });
  }

  await userRef.collection("activityHistory").add({
    type: "quiz",
    title: aiOutput.title,
    refId: quizRef.id,
    createdAt: Date.now(),
  });

  return { quizId: quizRef.id };
});
