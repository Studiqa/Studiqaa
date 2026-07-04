import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import Stripe from "stripe";

if (!getApps().length) initializeApp();

/**
 * Stripe webhook — mirrors razorpayWebhook's security model. Stripe's own SDK verifies
 * the signature (constructEvent) using STRIPE_WEBHOOK_SECRET, a value that lives only
 * as a Firebase Functions secret on the server — never shipped to any client bundle.
 */
export const stripeWebhook = onRequest(async (req, res) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecretKey || !webhookSecret) {
    res.status(500).send("Webhook not configured");
    return;
  }
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature as string, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook signature verification failed`);
    return;
  }

  const db = getFirestore();

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.paid": {
        const obj = event.data.object as any;
        const uid: string | undefined = obj.metadata?.uid ?? obj.subscription_details?.metadata?.uid;
        if (!uid) break;
        const userRef = db.doc(`users/${uid}`);
        await userRef.update({
          subscriptionStatus: "premium",
          subscriptionExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          subscriptionPlatform: "stripe",
          subscriptionRenewalId: obj.subscription ?? obj.id,
        });
        await userRef.collection("subscriptionEvents").add({ type: event.type, platform: "stripe", receivedAt: Date.now() });
        break;
      }
      case "customer.subscription.deleted": {
        const obj = event.data.object as any;
        const uid: string | undefined = obj.metadata?.uid;
        if (!uid) break;
        const userRef = db.doc(`users/${uid}`);
        await userRef.update({ subscriptionStatus: "free" });
        await userRef.collection("subscriptionEvents").add({ type: event.type, platform: "stripe", receivedAt: Date.now() });
        break;
      }
      default:
        break; // ignore events we don't act on
    }
    res.status(200).send("ok");
  } catch (err) {
    console.error("stripeWebhook error", err);
    res.status(500).send("Internal error");
  }
});
