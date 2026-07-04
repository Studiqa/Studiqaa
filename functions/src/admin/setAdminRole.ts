import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import type { UserRole } from "@studiqa/types";

if (!getApps().length) initializeApp();

/**
 * The ONLY way a user's role can ever change to admin/moderator — firestore.rules
 * blocks clients from writing `role` directly (touchesProtectedBillingFields), and
 * this function additionally re-checks the CALLER is already an admin before letting
 * them grant that to someone else, so a compromised or buggy client can never
 * self-escalate even by calling this function directly.
 */
export const setAdminRole = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");

  const db = getFirestore();
  const callerSnap = await db.doc(`users/${request.auth.uid}`).get();
  const callerRole = callerSnap.data()?.role as UserRole | undefined;
  if (callerRole !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can change roles.");
  }

  const { targetUid, role } = (request.data as { targetUid?: string; role?: UserRole }) ?? {};
  if (!targetUid || !["user", "moderator", "admin"].includes(role ?? "")) {
    throw new HttpsError("invalid-argument", "targetUid and a valid role are required.");
  }

  await db.doc(`users/${targetUid}`).update({ role });
  return { ok: true };
});
