"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db, getFirebaseApp } from "@studiqa/firebase-config";
import { useAdminGuard } from "../../../lib/useAdminGuard";

interface ModerationItem { id: string; title?: string; reason?: string; status?: string; }

export default function ModerationQueuePage() {
  const { status } = useAdminGuard();
  const [items, setItems] = useState<ModerationItem[]>([]);

  useEffect(() => {
    if (status !== "authorized") return;
    return onSnapshot(collection(db(), "adminMeta", "moderationQueue", "items"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ModerationItem, "id">) })));
    });
  }, [status]);

  async function resolve(itemId: string, action: "approve" | "reject" | "dismiss") {
    const moderationAction = httpsCallable(getFunctions(getFirebaseApp()), "moderationAction");
    await moderationAction({ itemId, action });
  }

  if (status === "loading") return <main style={{ padding: 48 }}>Checking access…</main>;
  if (status === "denied") return <main style={{ padding: 48 }}>Access denied.</main>;

  return (
    <main style={{ padding: 48 }}>
      <h1>Moderation queue ({items.filter((i) => !i.status).length} pending)</h1>
      {items.filter((i) => !i.status).map((item) => (
        <div key={item.id} style={{ border: "1px solid #333", borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <p><strong>{item.title ?? item.id}</strong></p>
          <p style={{ fontSize: 13, opacity: 0.8 }}>{item.reason}</p>
          <button onClick={() => resolve(item.id, "approve")}>Approve</button>{" "}
          <button onClick={() => resolve(item.id, "reject")}>Reject</button>{" "}
          <button onClick={() => resolve(item.id, "dismiss")}>Dismiss</button>
        </div>
      ))}
      {items.filter((i) => !i.status).length === 0 && <p>Nothing pending 🎉</p>}
    </main>
  );
}
