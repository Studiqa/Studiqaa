import { onCall, HttpsError } from "firebase-functions/v2/https";
import Razorpay from "razorpay";

/**
 * Client calls this to start a checkout — it only ever receives back an order ID,
 * never the Razorpay key SECRET (only the public "key_id" is safe client-side, and
 * even that is passed back here rather than hardcoded in the frontend bundle).
 * The actual grant of premium happens later, only via razorpayWebhook after payment
 * confirms — this function does not and must not set subscriptionStatus itself.
 */
export const createRazorpayOrder = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new HttpsError("internal", "Payments not configured");

  const planAmountPaise = 29900; // ₹299/month — move to adminMeta/appConfig if this needs to be editable without a redeploy

  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await instance.orders.create({
    amount: planAmountPaise,
    currency: "INR",
    notes: { uid: request.auth.uid }, // webhook reads this back to know which user to upgrade
  });

  return { orderId: order.id, amount: order.amount, currency: order.currency, keyId };
});
