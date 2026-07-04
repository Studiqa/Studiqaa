import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

/**
 * Runs once a day (00:05 UTC — pick a low-traffic hour for your primary user base).
 * Resets tutorMessagesToday for every user. mindMapsThisMonth/quizzesThisMonth are
 * reset separately (see resetMonthlyCounters) since they're on a different cycle.
 * Batched in chunks of 400 to stay under Firestore's 500-writes-per-batch limit.
 */
export const resetDailyUsageCounters = onSchedule({ schedule: "5 0 * * *", timeZone: "UTC" }, async () => {
  const db = getFirestore();
  const usersSnap = await db.collection("users").get();

  const chunks: FirebaseFirestore.QueryDocumentSnapshot[][] = [];
  for (let i = 0; i < usersSnap.docs.length; i += 400) chunks.push(usersSnap.docs.slice(i, i + 400));

  for (const chunk of chunks) {
    const batch = db.batch();
    for (const userDoc of chunk) {
      batch.update(userDoc.ref, { "usageCounters.tutorMessagesToday": 0 });
    }
    await batch.commit();
  }
  console.log(`resetDailyUsageCounters: reset ${usersSnap.size} users`);
});

/**
 * Runs on the 1st of each month. Resets mindMapsThisMonth and quizzesThisMonth.
 * NOTE: for real billing-cycle accuracy (vs. calendar-month), track each user's
 * signup/renewal anchor date instead — this simple version matches the PRD's
 * "per month" free-tier wording at calendar-month granularity.
 */
export const resetMonthlyUsageCounters = onSchedule({ schedule: "0 0 1 * *", timeZone: "UTC" }, async () => {
  const db = getFirestore();
  const usersSnap = await db.collection("users").get();

  const chunks: FirebaseFirestore.QueryDocumentSnapshot[][] = [];
  for (let i = 0; i < usersSnap.docs.length; i += 400) chunks.push(usersSnap.docs.slice(i, i + 400));

  for (const chunk of chunks) {
    const batch = db.batch();
    for (const userDoc of chunk) {
      batch.update(userDoc.ref, {
        "usageCounters.mindMapsThisMonth": 0,
        "usageCounters.quizzesThisMonth": 0,
        "usageCounters.resetAt": Date.now(),
      });
    }
    await batch.commit();
  }
  console.log(`resetMonthlyUsageCounters: reset ${usersSnap.size} users`);
});
