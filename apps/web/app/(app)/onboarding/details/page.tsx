"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { Goal } from "@studiqa/types";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Other"];
const YEARS = [1, 2, 3, 4];

function DetailsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const goal = (params.get("goal") as Goal | null) ?? "exam_prep";

  const [branch, setBranch] = useState(BRANCHES[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    // Single write completes onboarding — matches the "own non-protected fields" rule.
    await updateDoc(doc(db(), "users", uid), { goal, branch, year });
    router.push("/dashboard");
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <h1>Tell us a bit more</h1>
      <label>
        Branch
        <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 16 }}>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      <label>
        Year
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ display: "block", width: "100%", marginBottom: 16 }}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <button onClick={handleFinish} disabled={saving}>{saving ? "Saving…" : "Finish"}</button>
    </main>
  );
}

export default function OnboardingDetailsPage() {
  return (
    <Suspense fallback={<main style={{ padding: 48 }}>Loading…</main>}>
      <DetailsForm />
    </Suspense>
  );
}
