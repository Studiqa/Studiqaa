"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Goal } from "@studiqa/types";

const GOALS: { value: Goal; label: string; blurb: string }[] = [
  { value: "exam_prep", label: "Exam Prep", blurb: "Semester exams, GATE, university tests" },
  { value: "placement", label: "Placement", blurb: "Coding interviews, aptitude, core CS" },
  { value: "upskilling", label: "Upskilling", blurb: "Learning beyond the syllabus" },
];

export default function OnboardingGoalPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Goal | null>(null);

  function handleNext() {
    if (!selected) return;
    // Passed via query param; /onboarding/details writes the full profile in one Firestore call.
    router.push(`/onboarding/details?goal=${selected}`);
  }

  return (
    <main style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
      <h1>What are you here for?</h1>
      <p>This helps us tailor mind maps, quizzes, and roadmaps to you.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {GOALS.map((g) => (
          <button
            key={g.value}
            onClick={() => setSelected(g.value)}
            style={{
              textAlign: "left",
              padding: 16,
              borderRadius: 12,
              border: selected === g.value ? "2px solid #5B5EF4" : "1px solid #333",
              background: selected === g.value ? "#1a1c3d" : "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <strong>{g.label}</strong>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{g.blurb}</div>
          </button>
        ))}
      </div>
      <button onClick={handleNext} disabled={!selected} style={{ marginTop: 24 }}>
        Continue
      </button>
    </main>
  );
}
