import type { User, FreeLimits } from "@studiqa/types";

// Default free-tier limits — Section 3.2 of the PRD. Overridable via adminMeta/appConfig.
export const DEFAULT_FREE_LIMITS: FreeLimits = {
  mindMapsPerMonth: 3,
  tutorMessagesPerDay: 15,
  quizzesPerMonth: 5,
};

export type LimitKey = "mindMaps" | "tutorMessages" | "quizzes";

export interface LimitCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
}

/**
 * Pure function: decides whether a user may perform a limited action.
 * Premium users are always allowed. Free users are checked against usageCounters.
 * This mirrors (and must stay consistent with) the Firestore security rule
 * that performs the same check server-side — this is the client-side/UI copy
 * used for instant feedback, never the sole enforcement point.
 */
export function checkLimit(
  user: Pick<User, "subscriptionStatus" | "usageCounters">,
  key: LimitKey,
  limits: FreeLimits = DEFAULT_FREE_LIMITS
): LimitCheckResult {
  const isPremium = user.subscriptionStatus === "premium";
  if (isPremium) {
    return { allowed: true, remaining: Infinity, limit: Infinity, isPremium: true };
  }

  const map: Record<LimitKey, { used: number; limit: number }> = {
    mindMaps: { used: user.usageCounters.mindMapsThisMonth, limit: limits.mindMapsPerMonth },
    tutorMessages: { used: user.usageCounters.tutorMessagesToday, limit: limits.tutorMessagesPerDay },
    quizzes: { used: user.usageCounters.quizzesThisMonth, limit: limits.quizzesPerMonth },
  };

  const { used, limit } = map[key];
  const remaining = Math.max(0, limit - used);
  return { allowed: used < limit, remaining, limit, isPremium: false };
}
