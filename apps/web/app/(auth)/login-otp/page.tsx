"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@studiqa/firebase-config";

// Firebase's phone auth handles the actual OTP send/verify — Firebase's backend generates
// and checks the code, so no OTP secret ever touches Studiqa's own servers or this bundle.
// The invisible reCAPTCHA below is Firebase's abuse-prevention step before it will send an SMS.
export default function LoginWithOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState(""); // E.164 format, e.g. +91XXXXXXXXXX
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!verifierRef.current && recaptchaContainerRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth(), recaptchaContainerRef.current, { size: "invisible" });
      }
      const result = await signInWithPhoneNumber(auth(), phone, verifierRef.current!);
      setConfirmation(result);
    } catch (err) {
      setError("Couldn't send OTP — check the phone number format (+countrycode...).");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmation) return;
    setLoading(true);
    setError(null);
    try {
      const cred = await confirmation.confirm(otp);
      // Same "create if new" pattern as email/Google signup — matches firestore.rules'
      // required create-shape (subscriptionStatus: free, role: user).
      await setDoc(
        doc(db(), "users", cred.user.uid),
        {
          uid: cred.user.uid,
          email: cred.user.phoneNumber ?? "",
          displayName: cred.user.phoneNumber ?? "Student",
          subscriptionStatus: "free",
          role: "user",
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          streakCount: 0,
          longestStreak: 0,
          usageCounters: { mindMapsThisMonth: 0, tutorMessagesToday: 0, quizzesThisMonth: 0, resetAt: Date.now() },
          fcmTokens: [],
        },
        { merge: true }
      );
      router.push("/dashboard");
    } catch {
      setError("Incorrect code — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 400, margin: "0 auto" }}>
      <h1>Log in with phone</h1>
      <div ref={recaptchaContainerRef} />
      {!confirmation ? (
        <form onSubmit={handleSendOtp}>
          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
          <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
          <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Verifying…" : "Verify & log in"}
          </button>
        </form>
      )}
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
