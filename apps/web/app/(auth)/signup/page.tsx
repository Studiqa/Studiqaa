"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@studiqa/firebase-config";
import type { User } from "@studiqa/types";

// Creates the Firestore users/{uid} doc that firestore.rules requires to be
// shaped as subscriptionStatus: "free", role: "user" on create (see rules test).
function newUserDoc(uid: string, email: string, displayName: string): Omit<User, "uid"> {
  return {
    email,
    displayName,
    subscriptionStatus: "free",
    role: "user",
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    streakCount: 0,
    longestStreak: 0,
    usageCounters: { mindMapsThisMonth: 0, tutorMessagesToday: 0, quizzesThisMonth: 0, resetAt: Date.now() },
    fcmTokens: [],
  } as Omit<User, "uid">;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth(), email, password);
      await sendEmailVerification(cred.user); // required before premium purchase, per Section 7.1
      await setDoc(doc(db(), "users", cred.user.uid), newUserDoc(cred.user.uid, email, email.split("@")[0]));
      router.push("/onboarding/goal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithPopup(auth(), new GoogleAuthProvider());
      await setDoc(
        doc(db(), "users", cred.user.uid),
        newUserDoc(cred.user.uid, cred.user.email ?? "", cred.user.displayName ?? "Student"),
        { merge: true }
      );
      router.push("/onboarding/goal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 400, margin: "0 auto" }}>
      <h1>Create your account</h1>
      <button onClick={handleGoogleSignup} disabled={loading}>Continue with Google</button>
      <p style={{ textAlign: "center", margin: "16px 0" }}>or</p>
      <form onSubmit={handleEmailSignup}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 8 chars)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>Sign up</button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
