"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@studiqa/firebase-config";
import type { User } from "@studiqa/types";

/**
 * Client-side gate for the admin app. This is UX only — the REAL enforcement is
 * server-side: firestore.rules' isAdmin() check and every admin Cloud Function
 * (setAdminRole, publishContent, moderationAction) re-verifying the caller's role
 * itself. Even if someone bypassed this hook entirely, every read/write they could
 * attempt would still be rejected by rules or by the functions' own role check.
 */
export function useAdminGuard() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">("loading");
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth(), (fbUser) => {
      if (!fbUser) {
        setStatus("denied");
        router.push("/login");
        return;
      }
      return onSnapshot(doc(db(), "users", fbUser.uid), (snap) => {
        const data = snap.data() as User | undefined;
        if (data && (data.role === "admin" || data.role === "moderator")) {
          setProfile({ ...data, uid: fbUser.uid });
          setStatus("authorized");
        } else {
          setStatus("denied");
        }
      });
    });
    return () => unsub();
  }, [router]);

  return { status, profile };
}
