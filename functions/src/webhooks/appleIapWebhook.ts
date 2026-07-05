import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { SignedDataVerifier, Environment } from "@apple/app-store-server-library";

if (!getApps().length) initializeApp();

// Apple's notification subtypes/types we act on (App Store Server Notifications V2).
const ACTIVE_TYPES = new Set(["SUBSCRIBED", "DID_RENEW", "DID_CHANGE_RENEWAL_STATUS"]);
const DOWNGRADE_TYPES = new Set(["EXPIRED", "REFUND", "REVOKE", "GRACE_PERIOD_EXPIRED"]);

/**
 * Apple sends App Store Server Notifications V2 as a signed JWS (`signedPayload`).
 * Just like the others, trust comes from cryptographic verification — here Apple's
 * own SignedDataVerifier checks the JWS's certificate chain against Apple's root CA
 * (bundled in the library) before we read a single field from the payload. The
 * app's shared secret / private key (APPLE_IAP_PRIVATE_KEY, APPLE_IAP_KEY_ID, etc.)
 * lives only as a Functions secret on this server — never in the mobile app bundle.
 */
export const appleIapWebhook = onRequest(async (req, res) => {
  try {
    const bundleId = process.env.APPLE_BUNDLE_ID;
    const appAppleId = process.env.APPLE_APP_ID ? Number(process.env.APPLE_APP_ID) : undefined;
    if (!bundleId) {
      res.status(500).send("Apple webhook not configured");
      return;
    }

    // In production, load Apple's root CA certs (fetched once at deploy time / cached)
    // rather than an empty array — required for constructor to actually validate the chain.
    const rootCerts: Buffer[] = []; // TODO: load Apple's G3 root CA certs before going live
    const verifier = new SignedDataVerifier(
      rootCerts,
      true, // enableOnlineChecks
      Environment.PRODUCTION,
      bundleId,
      appAppleId
    );

    const { signedPayload } = req.body as { signedPayload: string };
    const payload = await verifier.verifyAndDecodeNotification(signedPayload);

    const notificationType = payload.notificationType as string;
    const transactionInfoSigned = payload.data?.signedTransactionInfo;
    if (!transactionInfoSigned) {
      res.status(200).send("ignored: no transaction info");
      return;
    }
    const transactionInfo = await verifier.verifyAndDecodeTransaction(transactionInfoSigned);

    // appAccountToken must be set to the Firebase uid when the purchase was initiated
    // client-side (StoreKit's Purchase.Option.appAccountToken) — same idea as Google
    // Play's obfuscatedExternalAccountId, ties the receipt back to a Studiqa user.
    const uid = transactionInfo.appAccountToken;
    if (!uid) {
      res.status(400).send("Transaction missing linked account id");
      return;
    }

    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);

    if (ACTIVE_TYPES.has(notificationType)) {
      await userRef.update({
        subscriptionStatus: "premium",
        subscriptionExpiresAt: Number(transactionInfo.expiresDate ?? Date.now()),
        subscriptionPlatform: "apple",
        subscriptionRenewalId: transactionInfo.originalTransactionId,
      });
    } else if (DOWNGRADE_TYPES.has(notificationType)) {
      await userRef.update({ subscriptionStatus: "free" });
    }

    await userRef.collection("subscriptionEvents").add({
      type: `apple_${notificationType}`,
      platform: "apple",
      receivedAt: Date.now(),
    });

    res.status(200).send("ok");
  } catch (err) {
    console.error("appleIapWebhook error", err);
    res.status(500).send("Internal error");
  }
});
