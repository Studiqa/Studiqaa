"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@studiqa/firebase-config";
import { checkLimit } from "@studiqa/usage-limits";
import type { User } from "@studiqa/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth(), (fbUser) => {
      if (!fbUser) return;
      // Realtime listener: instantly reflects subscription changes after the
      // payment webhook Cloud Function updates this doc (Section 5.3 upgrade flow).
      return onSnapshot(doc(db(), "users", fbUser.uid), (snap) => {
        if (snap.exists()) setUser({ uid: fbUser.uid, ...(snap.data() as Omit<User, "uid">) });
      });
    });
    return () => unsubAuth();
  }, []);

  if (!user) return <main style={{ padding: 48 }}>Loading…</main>;

  const mindMapLimit = checkLimit(user, "mindMaps");

  return (
    <main style={{ padding: 48 }}>
      <h1>Welcome back, {user.displayName}</h1>
      <p>🔥 Streak: {user.streakCount} days</p>
      <p>
        Mind maps this month: {user.usageCounters.mindMapsThisMonth}
        {mindMapLimit.isPremium ? " (unlimited)" : ` / ${mindMapLimit.limit}`}
      </p>
      {!mindMapLimit.allowed && (
        <p style={{ color: "darkorange" }}>
          You've hit your free mind-map limit this month. <Link href="/upgrade">Upgrade to premium</Link>.
        </p>
      )}
      <p><Link href="/mindmaps/create">+ New mind map</Link></p>
    </main>
  );
}
