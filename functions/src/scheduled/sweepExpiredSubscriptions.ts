import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

/**
 * Safety net that runs every 6 hours: if a subscription's expiry passed without a
 * renewal webhook firing (payment failure, cancelled-but-not-caught, etc.), this
 * downgrades the user to free. Real-time downgrades still happen instantly via
 * razorpayWebhook/stripeWebhook's cancellation events — this just catches anything
 * those miss, so nobody stays "premium" forever due to a missed webhook delivery.
 */
export const sweepExpiredSubscriptions = onSchedule({ schedule: "every 6 hours" }, async () => {
  const db = getFirestore();
  const now = Date.now();

  const expiredSnap = await db
    .collection("users")
    .where("subscriptionStatus", "==", "premium")
    .where("subscriptionExpiresAt", "<=", now)
    .get();

  if (expiredSnap.empty) {
    console.log("sweepExpiredSubscriptions: nothing to downgrade");
    return;
  }

  const batch = db.batch();
  for (const userDoc of expiredSnap.docs) {
    batch.update(userDoc.ref, { subscriptionStatus: "free" });
    batch.set(userDoc.ref.collection("subscriptionEvents").doc(), {
      type: "expired_sweep_downgrade",
      platform: userDoc.data().subscriptionPlatform ?? "unknown",
      receivedAt: now,
    });
  }
  await batch.commit();
  console.log(`sweepExpiredSubscriptions: downgraded ${expiredSnap.size} users`);
});
