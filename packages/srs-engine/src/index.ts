import type { SRSState } from "@studiqa/types";

// SM-2 spaced repetition algorithm (Section 3.3 #5 / packages/srs-engine in the PRD).
// Rating scale mirrors the FlashcardStack UI buttons: again(0) / hard(1) / good(2) / easy(3).
export type SRSRating = 0 | 1 | 2 | 3;

const MIN_EASE_FACTOR = 1.3;

export function initSRSState(today: string): SRSState {
  return { easeFactor: 2.5, intervalDays: 0, repetitions: 0, nextReviewDate: today };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Applies one review rating to the card's SRS state and returns the next state.
 * `today` is injected (rather than read from Date.now() internally) to keep this a pure,
 * easily-unit-tested function, per Section 15.1 unit-test requirements.
 */
export function reviewCard(state: SRSState, rating: SRSRating, today: string, nowMs: number): SRSState {
  // "Again" resets progress but keeps the card in the deck (shown again same session/day).
  if (rating === 0) {
    return {
      easeFactor: Math.max(MIN_EASE_FACTOR, state.easeFactor - 0.2),
      intervalDays: 1,
      repetitions: 0,
      nextReviewDate: today,
      lastReviewedAt: nowMs,
    };
  }

  const qualityToEaseDelta: Record<Exclude<SRSRating, 0>, number> = {
    1: -0.15, // hard
    2: 0, // good
    3: 0.15, // easy
  };

  const newEase = Math.max(MIN_EASE_FACTOR, state.easeFactor + qualityToEaseDelta[rating]);
  const repetitions = state.repetitions + 1;

  let intervalDays: number;
  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = 6;
  else intervalDays = Math.round(state.intervalDays * newEase);

  return {
    easeFactor: newEase,
    intervalDays,
    repetitions,
    nextReviewDate: addDays(today, intervalDays),
    lastReviewedAt: nowMs,
  };
}

export function isDue(state: SRSState, today: string): boolean {
  return state.nextReviewDate <= today;
}
