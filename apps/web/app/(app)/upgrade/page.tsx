"use client";
import { useState } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebaseApp } from "@studiqa/firebase-config";
import { getAuth } from "firebase/auth";

declare global {
  interface Window { Razorpay: any; }
}

interface OrderResponse { orderId: string; amount: number; currency: string; keyId: string; }

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      // The Cloud Function returns only an order ID + the PUBLIC key_id — the secret
      // key never leaves the server, so nothing sensitive is ever visible via
      // browser dev tools / network tab on this request.
      const createOrder = httpsCallable<{}, OrderResponse>(getFunctions(getFirebaseApp()), "createRazorpayOrder");
      const { data } = await createOrder({});

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Studiqa Premium",
        description: "Monthly subscription",
        handler: function () {
          // Actual upgrade is confirmed server-side by razorpayWebhook, not here —
          // this is just a friendly UI message; the dashboard listener will reflect
          // the real change once the webhook fires.
          alert("Payment received — your account will update within a few seconds.");
        },
        prefill: { email: getAuth(getFirebaseApp()).currentUser?.email ?? "" },
        theme: { color: "#5B5EF4" },
      });
      rzp.open();
    } catch {
      setError("Couldn't start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <h1>Upgrade to Premium</h1>
      <ul>
        <li>Unlimited mind maps</li>
        <li>Unlimited quizzes</li>
        <li>Unlimited AI tutor messages</li>
      </ul>
      <button onClick={handleUpgrade} disabled={loading}>{loading ? "Starting checkout…" : "Upgrade — ₹299/month"}</button>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
