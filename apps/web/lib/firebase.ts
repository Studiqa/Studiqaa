"use client";
import { getFirebaseApp, initAppCheck } from "@studiqa/firebase-config";

// Call once on app boot (see app/(app)/layout.tsx) — sets up Firebase App
// and App Check, which the aiProxy Cloud Functions require to accept calls.
export function bootFirebase() {
  getFirebaseApp();
  initAppCheck();
}
