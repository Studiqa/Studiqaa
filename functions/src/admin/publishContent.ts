import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import type { UserRole } from "@studiqa/types";

if (!getApps().length) initializeApp();

async function requireAdminOrModerator(uid: string) {
  const db = getFirestore();
  const snap = await db.doc(`users/${uid}`).get();
  const role = snap.data()?.role as UserRole | undefined;
  if (role !== "admin" && role !== "moderator") {
    throw new HttpsError("permission-denied", "Admin/moderator role required.");
  }
  return db;
}

/**
 * Writes curated content (coding problems, quiz bank items, etc.) into publicContent/{collection}/items/{docId}.
 * firestore.rules already blocks any direct client write to publicContent for non-admins —
 * this function is the only sanctioned write path, and it re-checks the role server-side too
 * (never trust a client-sent "I'm an admin" claim alone).
 */
export const publishContent = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const db = await requireAdminOrModerator(request.auth.uid);

  const { collectionName, docId, data } = (request.data as { collectionName?: string; docId?: string; data?: Record<string, unknown> }) ?? {};
  const allowedCollections = ["codingProblems", "quizBank", "mindMapTemplates"];
  if (!collectionName || !allowedCollections.includes(collectionName) || !data) {
    throw new HttpsError("invalid-argument", "collectionName (allowed set) and data are required.");
  }

  const ref = docId
    ? db.doc(`publicContent/${collectionName}/items/${docId}`)
    : db.collection(`publicContent/${collectionName}/items`).doc();
  await ref.set({ ...data, updatedAt: Date.now() }, { merge: true });

  return { id: ref.id };
});

/** Resolves a flagged item in the moderation queue (approve/reject/dismiss). */
export const moderationAction = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");
  const db = await requireAdminOrModerator(request.auth.uid);

  const { itemId, action } = (request.data as { itemId?: string; action?: "approve" | "reject" | "dismiss" }) ?? {};
  if (!itemId || !["approve", "reject", "dismiss"].includes(action ?? "")) {
    throw new HttpsError("invalid-argument", "itemId and a valid action are required.");
  }

  await db.doc(`adminMeta/moderationQueue/items/${itemId}`).update({
    status: action,
    resolvedBy: request.auth.uid,
    resolvedAt: Date.now(),
  });

  return { ok: true };
});
