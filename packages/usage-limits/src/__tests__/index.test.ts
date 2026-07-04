import { describe, it, expect } from "vitest";
import { checkLimit } from "../index";

const baseUser = {
  subscriptionStatus: "free" as const,
  usageCounters: { mindMapsThisMonth: 0, tutorMessagesToday: 0, quizzesThisMonth: 0, resetAt: 0 },
};

describe("checkLimit", () => {
  it("allows free user under the limit", () => {
    const r = checkLimit(baseUser, "mindMaps");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(3);
  });

  it("blocks free user at the limit", () => {
    const user = { ...baseUser, usageCounters: { ...baseUser.usageCounters, mindMapsThisMonth: 3 } };
    const r = checkLimit(user, "mindMaps");
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("always allows premium users regardless of counters", () => {
    const user = { subscriptionStatus: "premium" as const, usageCounters: { ...baseUser.usageCounters, mindMapsThisMonth: 999 } };
    const r = checkLimit(user, "mindMaps");
    expect(r.allowed).toBe(true);
    expect(r.isPremium).toBe(true);
  });

  it("never returns negative remaining", () => {
    const user = { ...baseUser, usageCounters: { ...baseUser.usageCounters, quizzesThisMonth: 50 } };
    const r = checkLimit(user, "quizzes");
    expect(r.remaining).toBe(0);
  });
});
