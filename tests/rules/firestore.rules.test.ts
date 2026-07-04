import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Requires the Firestore emulator running (see functions/README or `npm run emulators`).
// This is the Section 15.1 #3 integration-test layer: every allow/deny path in
// firestore.rules gets a positive AND a negative test.

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-studiqa",
    firestore: { rules: readFileSync("../../firestore.rules", "utf8") },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

const baseUserDoc = {
  uid: "alice",
  email: "alice@example.com",
  displayName: "Alice",
  subscriptionStatus: "free",
  role: "user",
  createdAt: 0,
  lastActiveAt: 0,
  streakCount: 0,
  longestStreak: 0,
  usageCounters: { mindMapsThisMonth: 0, tutorMessagesToday: 0, quizzesThisMonth: 0, resetAt: 0 },
  fcmTokens: [],
};

describe("users/{userId} rules", () => {
  it("lets a user create their own profile as free/user", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(alice, "users/alice"), baseUserDoc));
  });

  it("denies creating another user's profile", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "users/bob"), { ...baseUserDoc, uid: "bob" }));
  });

  it("denies a user self-granting premium status", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/alice"), baseUserDoc);
    });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(updateDoc(doc(alice, "users/alice"), { subscriptionStatus: "premium" }));
  });

  it("denies a user self-granting admin role", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/alice"), baseUserDoc);
    });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(updateDoc(doc(alice, "users/alice"), { role: "admin" }));
  });

  it("allows a user to update their own non-protected fields", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/alice"), baseUserDoc);
    });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(updateDoc(doc(alice, "users/alice"), { displayName: "Alice B." }));
  });

  it("denies reading another user's private mind map", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/bob/mindMaps/map1"), { isPublic: false, title: "x" });
    });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(getDoc(doc(alice, "users/bob/mindMaps/map1")));
  });

  it("allows reading another user's PUBLIC mind map", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/bob/mindMaps/map2"), { isPublic: true, title: "x" });
    });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(getDoc(doc(alice, "users/bob/mindMaps/map2")));
  });

  it("denies an unauthenticated user from reading any profile", async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "users/alice")));
  });

  it("denies a non-admin from writing publicContent", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "publicContent/quizBank/q1"), { title: "hack" }));
  });
});
