"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";

const BRANCHES = ["CSE", "IT", "ECE", "Mechanical", "Civil", "Other"];
const YEARS = [1, 2, 3, 4];

// Onboarding step 2 of 3 — branch & year (Section 5.1 screen 6).
export default function OnboardingProfilePage() {
  const router = useRouter();
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!branch || !year) return;
    setSaving(true);
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (uid) await updateDoc(doc(db(), "users", uid), { branch, year });
    router.push("/onboarding/interests");
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <p style={{ opacity: 0.6 }}>Step 2 of 3</p>
      <h1>Tell us about your course</h1>

      <label style={{ display: "block", marginTop: 24 }}>Branch</label>
      <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ width: "100%", padding: 8 }}>
        <option value="">Select branch</option>
        {BRANCHES.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      <label style={{ display: "block", marginTop: 16 }}>Year</label>
      <div style={{ display: "flex", gap: 8 }}>
        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: year === y ? "2px solid #5B5EF4" : "1px solid #333",
              background: year === y ? "#1B1E3A" : "transparent",
              cursor: "pointer",
            }}
          >
            Year {y}
          </button>
        ))}
      </div>

      <button onClick={handleContinue} disabled={!branch || !year || saving} style={{ marginTop: 24 }}>
        Continue
      </button>
    </main>
  );
}
