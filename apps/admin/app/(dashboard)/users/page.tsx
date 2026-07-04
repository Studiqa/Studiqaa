"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db, getFirebaseApp } from "@studiqa/firebase-config";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import type { User, UserRole } from "@studiqa/types";

export default function UsersPage() {
  const { status, profile } = useAdminGuard();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (status !== "authorized") return;
    // limit(200): a real admin panel would paginate — kept simple for this scaffold.
    return onSnapshot(query(collection(db(), "users"), limit(200)), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<User, "uid">) })));
    });
  }, [status]);

  async function handleRoleChange(targetUid: string, role: UserRole) {
    const setAdminRole = httpsCallable(getFunctions(getFirebaseApp()), "setAdminRole");
    await setAdminRole({ targetUid, role });
  }

  if (status === "loading") return <main style={{ padding: 48 }}>Checking access…</main>;
  if (status === "denied") return <main style={{ padding: 48 }}>Access denied — admin/moderator role required.</main>;

  return (
    <main style={{ padding: 48 }}>
      <h1>Users ({users.length})</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">Email</th><th align="left">Plan</th><th align="left">Role</th><th align="left">Streak</th><th /></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid} style={{ borderTop: "1px solid #333" }}>
              <td>{u.email}</td>
              <td>{u.subscriptionStatus}</td>
              <td>{u.role}</td>
              <td>{u.streakCount}</td>
              <td>
                {profile?.role === "admin" && u.role !== "admin" && (
                  <button onClick={() => handleRoleChange(u.uid, "moderator")}>Make moderator</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
