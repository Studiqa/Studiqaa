import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { google } from "googleapis";
import { verifyGooglePushAuth } from "./verifyGooglePushAuth";

if (!getApps().length) initializeApp();

interface RTDNMessage {
  message: { data: string; messageId: string };
  subscription: string;
}

interface SubscriptionNotification {
  version: string;
  notificationType: number; // 4 = RENEWED, 3 = CANCELED, 13 = EXPIRED, etc. (Google's enum)
  purchaseToken: string;
  subscriptionId: string;
}

// Google's numeric notification types (Real-time Developer Notifications reference).
const RENEWED_OR_ACTIVE = new Set([1, 2, 4, 7]); // RECOVERED, RENEWED, PURCHASED, RESTARTED
const DOWNGRADE_TYPES = new Set([3, 12, 13]); // CANCELED, REVOKED, EXPIRED

/**
 * Google Play sends subscription events via Pub/Sub push. Trust here comes from
 * TWO independent layers:
 *   1. verifyGooglePushAuth() below — confirms this request really came from your
 *      configured Pub/Sub push subscription (Google-signed OIDC token), not from
 *      someone who just knows/guesses this URL.
 *   2. We NEVER trust the notification body's claims about entitlement — we take
 *      only the purchaseToken from it and re-fetch the actual subscription state
 *      from Google's Play Developer API using a service-account credential that
 *      lives only on this server (GOOGLE_PLAY_SERVICE_ACCOUNT_JSON), never in any
 *      client bundle.
 */
export const googlePlayWebhook = onRequest(async (req, res) => {
  try {
    await verifyGooglePushAuth(req);
  } catch (err: any) {
    res.status(err.code === "unauthenticated" ? 401 : 403).send(err.message ?? "Unauthorized");
    return;
  }

  try {
    const body = req.body as RTDNMessage;
    const decoded = Buffer.from(body.message.data, "base64").toString("utf8");
    const notification = JSON.parse(decoded) as { subscriptionNotification?: SubscriptionNotification };
    const sub = notification.subscriptionNotification;
    if (!sub) {
      res.status(200).send("ignored: not a subscription notification");
      return;
    }

    const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      res.status(500).send("Google Play verification not configured");
      return;
    }
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
    const androidPublisher = google.androidpublisher({ version: "v3", auth });

    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
    const purchase = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: sub.subscriptionId,
      token: sub.purchaseToken,
    });

    // obfuscatedExternalAccountId must be set to the Firebase uid when the purchase was
    // initiated client-side (Play Billing Library's setObfuscatedAccountId) — this is how
    // we tie a Play purchase back to a Studiqa user without trusting the client's say-so.
    const uid = purchase.data.obfuscatedExternalAccountId;
    if (!uid) {
      res.status(400).send("Purchase missing linked account id");
      return;
    }

    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);

    if (RENEWED_OR_ACTIVE.has(sub.notificationType)) {
      const expiresAt = Number(purchase.data.expiryTimeMillis ?? Date.now());
      await userRef.update({
        subscriptionStatus: "premium",
        subscriptionExpiresAt: expiresAt,
        subscriptionPlatform: "google_play",
        subscriptionRenewalId: sub.purchaseToken,
      });
    } else if (DOWNGRADE_TYPES.has(sub.notificationType)) {
      await userRef.update({ subscriptionStatus: "free" });
    }

    await userRef.collection("subscriptionEvents").add({
      type: `play_notification_${sub.notificationType}`,
      platform: "google_play",
      receivedAt: Date.now(),
    });

    res.status(200).send("ok");
  } catch (err) {
    console.error("googlePlayWebhook error", err);
    res.status(500).send("Internal error");
  }
});
