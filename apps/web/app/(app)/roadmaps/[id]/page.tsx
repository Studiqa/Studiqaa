"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { Roadmap } from "@studiqa/types";

export default function RoadmapViewerPage({ params }: { params: { id: string } }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db(), "users", uid, "roadmaps", params.id), (snap) => {
      if (snap.exists()) setRoadmap({ id: snap.id, ...(snap.data() as Omit<Roadmap, "id">) });
    });
  }, [params.id]);

  async function toggleMilestone(milestoneId: string, completed: boolean) {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid || !roadmap) return;
    const nextMilestones = roadmap.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !completed } : m));
    await updateDoc(doc(db(), "users", uid, "roadmaps", roadmap.id), { milestones: nextMilestones });
  }

  if (!roadmap) return <main style={{ padding: 48 }}>Loading roadmap…</main>;

  const doneCount = roadmap.milestones.filter((m) => m.completed).length;

  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto" }}>
      <h1>{roadmap.title}</h1>
      <p>{doneCount} / {roadmap.milestones.length} milestones complete</p>
      <ol>
        {roadmap.milestones.map((m) => (
          <li key={m.id} style={{ marginBottom: 16, opacity: m.completed ? 0.5 : 1 }}>
            <label>
              <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(m.id, m.completed)} />{" "}
              <strong>{m.title}</strong>
            </label>
            <p style={{ marginLeft: 24, fontSize: 14 }}>{m.description}</p>
            <p style={{ marginLeft: 24 }}>
              <Link href={`/${m.resourceType === "external" ? "" : m.resourceType + "s/create"}`}>
                {m.resourceType === "external" ? "External resource" : `Create related ${m.resourceType}`}
              </Link>
            </p>
          </li>
        ))}
      </ol>
    </main>
  );
}
