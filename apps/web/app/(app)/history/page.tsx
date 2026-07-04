"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { ActivityHistoryItem, ActivityType } from "@studiqa/types";

const ROUTE_BY_TYPE: Record<ActivityType, (refId: string) => string> = {
  mindmap: (id) => `/mindmaps/${id}`,
  notes: (id) => `/notes/${id}`,
  quiz: (id) => `/quizzes/${id}`,
  flashcards: (id) => `/flashcards/${id}/review`,
  roadmap: (id) => `/roadmaps/${id}`,
  tutor: (id) => `/tutor/${id}`,
};

const LABEL_BY_TYPE: Record<ActivityType, string> = {
  mindmap: "🧠 Mind map",
  notes: "📝 Notes",
  quiz: "❓ Quiz",
  flashcards: "🗂️ Flashcards",
  roadmap: "🗺️ Roadmap",
  tutor: "💬 Tutor chat",
};

// This is the "history like ChatGPT" feature: every generation and tutor chat gets
// logged to activityHistory (by each Cloud Function) and shown here, newest first,
// with client-side search-as-you-type across titles.
export default function HistoryPage() {
  const [items, setItems] = useState<ActivityHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");

  useEffect(() => {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db(), "users", uid, "activityHistory"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityHistoryItem, "id">) })));
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [items, search, typeFilter]);

  return (
    <main style={{ padding: 48, maxWidth: 640, margin: "0 auto" }}>
      <h1>Your history</h1>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your history…"
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ActivityType | "all")} style={{ marginBottom: 20 }}>
        <option value="all">All types</option>
        {Object.keys(LABEL_BY_TYPE).map((t) => (
          <option key={t} value={t}>{LABEL_BY_TYPE[t as ActivityType]}</option>
        ))}
      </select>

      {filtered.length === 0 && <p style={{ opacity: 0.7 }}>Nothing here yet — go generate something!</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtered.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            <Link href={ROUTE_BY_TYPE[item.type](item.refId)}>
              {LABEL_BY_TYPE[item.type]} — {item.title}
            </Link>
            <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
