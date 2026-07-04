"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";

const TOPICS = [
  "Data Structures", "Operating Systems", "DBMS", "Computer Networks",
  "OOP", "System Design", "Web Development", "DSA for Interviews",
];

// Onboarding step 3 of 3 — interests picker (Section 5.1 screen 7).
// Completing this marks onboarding done and sends the user to their first "aha moment" (Section 5.2).
export default function OnboardingInterestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggle(topic: string) {
    setSelected((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  async function handleFinish() {
    setSaving(true);
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (uid) await updateDoc(doc(db(), "users", uid), { interests: selected, onboardingCompletedAt: Date.now() });
    router.push("/dashboard");
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <p style={{ opacity: 0.6 }}>Step 3 of 3</p>
      <h1>Pick a few topics you care about</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => toggle(topic)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: selected.includes(topic) ? "2px solid #5B5EF4" : "1px solid #333",
              background: selected.includes(topic) ? "#1B1E3A" : "transparent",
              cursor: "pointer",
            }}
          >
            {topic}
          </button>
        ))}
      </div>
      <button onClick={handleFinish} disabled={selected.length === 0 || saving} style={{ marginTop: 24 }}>
        Finish setup
      </button>
    </main>
  );
}
