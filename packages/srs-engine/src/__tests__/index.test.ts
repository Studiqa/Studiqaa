import { describe, it, expect } from "vitest";
import { initSRSState, reviewCard, isDue } from "../index";

describe("SM-2 srs-engine", () => {
  it("schedules a new card for today", () => {
    const s = initSRSState("2026-07-04");
    expect(isDue(s, "2026-07-04")).toBe(true);
  });

  it("first 'good' review schedules +1 day", () => {
    const s = initSRSState("2026-07-04");
    const next = reviewCard(s, 2, "2026-07-04", 0);
    expect(next.intervalDays).toBe(1);
    expect(next.nextReviewDate).toBe("2026-07-05");
    expect(next.repetitions).toBe(1);
  });

  it("second 'good' review schedules +6 days", () => {
    let s = initSRSState("2026-07-04");
    s = reviewCard(s, 2, "2026-07-04", 0);
    s = reviewCard(s, 2, "2026-07-05", 0);
    expect(s.intervalDays).toBe(6);
    expect(s.repetitions).toBe(2);
  });

  it("'again' resets repetitions and interval to 1", () => {
    let s = initSRSState("2026-07-04");
    s = reviewCard(s, 2, "2026-07-04", 0);
    s = reviewCard(s, 2, "2026-07-05", 0);
    s = reviewCard(s, 0, "2026-07-11", 0);
    expect(s.repetitions).toBe(0);
    expect(s.intervalDays).toBe(1);
    expect(s.easeFactor).toBeLessThan(2.5);
  });

  it("ease factor never drops below 1.3", () => {
    let s = initSRSState("2026-07-04");
    for (let i = 0; i < 20; i++) {
      s = reviewCard(s, 0, "2026-07-04", 0);
    }
    expect(s.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
