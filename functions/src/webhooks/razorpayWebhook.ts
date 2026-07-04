import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import * as crypto from "crypto";

if (!getApps().length) initializeApp();

/**
 * Razorpay webhook — the ONLY place subscriptionStatus/subscriptionExpiresAt ever get
 * written for Razorpay payments. This is an onRequest (raw HTTP) function, not onCall,
 * because Razorpay posts directly to it with its own signature header — there's no
 * Firebase Auth involved on this request at all. Trust comes entirely from verifying
 * the HMAC signature below using a secret that lives ONLY in this server environment
 * (set via `firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET`) — it is never sent
 * to the browser, never present in any client bundle, and therefore cannot be seen via
 * browser dev tools / "Inspect" no matter what a user does on the frontend.
 */
export const razorpayWebhook = onRequest(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).send("Webhook not configured");
    return;
  }

  const signature = req.headers["x-razorpay-signature"];
  if (typeof signature !== "string") {
    res.status(400).send("Missing signature");
    return;
  }

  // Signature must be computed over the EXACT raw request body bytes, before any
  // JSON parsing/mutation — Firebase Functions preserves req.rawBody for this reason.
  const expectedSignature = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!isValid) {
    // Deliberately vague response — don't reveal whether the payload or signature was the problem.
    res.status(400).send("Invalid signature");
    return;
  }

  const event = req.body;
  const db = getFirestore();

  try {
    if (event.event === "subscription.activated" || event.event === "subscription.charged") {
      const uid: string | undefined = event.payload?.subscription?.entity?.notes?.uid;
      if (!uid) {
        res.status(400).send("Missing uid in notes");
        return;
      }
      const subscriptionId = event.payload.subscription.entity.id;
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30-day cycle; adjust to actual plan period

      const userRef = db.doc(`users/${uid}`);
      await userRef.update({
        subscriptionStatus: "premium",
        subscriptionExpiresAt: expiresAt,
        subscriptionPlatform: "razorpay",
        subscriptionRenewalId: subscriptionId,
      });
      await userRef.collection("subscriptionEvents").add({
        type: event.event,
        platform: "razorpay",
        subscriptionId,
        receivedAt: Date.now(),
      });
    }

    if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const uid: string | undefined = event.payload?.subscription?.entity?.notes?.uid;
      if (uid) {
        const userRef = db.doc(`users/${uid}`);
        await userRef.update({ subscriptionStatus: "free" });
        await userRef.collection("subscriptionEvents").add({
          type: event.event,
          platform: "razorpay",
          receivedAt: Date.now(),
        });
      }
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("razorpayWebhook error", err);
    res.status(500).send("Internal error");
  }
});
