"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@studiqa/firebase-config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth(), email, password);
      router.push("/users");
    } catch {
      setError("Invalid credentials.");
    }
  }

  return (
    <main style={{ padding: 48, maxWidth: 360, margin: "0 auto" }}>
      <h1>Studiqa Admin</h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: 8, marginTop: 8 }} />
        <button type="submit" style={{ marginTop: 12 }}>Log in</button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>
        Access is granted by role, not by this login page — an account must already have
        role "admin" or "moderator" set (via setAdminRole, by an existing admin).
      </p>
    </main>
  );
}
