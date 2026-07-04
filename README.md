# Studiqa — Phase 0 + Vertical Slice Scaffold

This repo implements the **Phase 0 foundation** and **one proven vertical slice**
(Auth → Onboarding stub → Mind Map creation) from `Studiqa_PRD_SRS_Architecture.md`,
following the build sequence in Section 17.2 of that document: shared packages first,
security rules before UI, then one full feature end-to-end before replicating the
pattern for Notes/Quizzes/Flashcards/Coding/Roadmaps.

## What's here and verified working

| Area | Status |
|---|---|
| `packages/types` | Shared TS types mirroring the Firestore schema (Section 6) — typechecks clean |
| `packages/usage-limits` | Free/premium limit-checking logic — **4/4 unit tests passing** |
| `packages/srs-engine` | SM-2 spaced repetition algorithm — **5/5 unit tests passing** |
| `packages/firebase-config` | Firebase client init + App Check wiring |
| `packages/ui` | Seed design-system components using Section 4.3's tokens |
| `firestore.rules` / `storage.rules` | Deny-by-default rules incl. the "can't self-grant premium/admin" requirement |
| `tests/rules/firestore.rules.test.ts` | Emulator-based positive/negative rule tests (see below — not run in this environment) |
| `apps/web` | Next.js app: marketing page, signup, login, dashboard, mind-map create + viewer — **builds cleanly with `next build`** |
| `functions/src/aiProxy/generateMindMap.ts` | Callable Cloud Function: App Check + auth check + server-side usage-limit enforcement + AI call + Zod schema validation on the model's output — **typechecks clean with `tsc --noEmit`** |
| `.github/workflows/ci.yml` | Typecheck + unit tests + web build on every PR |

## What's intentionally stubbed / not yet built

- Onboarding flow screens (goal/branch/year pickers) — routes are referenced but not built yet.
- Notes, Quizzes, Flashcards, Coding, Roadmaps, Admin app, Mobile app — next per Section 17.2 step 6.
- Payment webhooks (Razorpay/Stripe/Play/Apple) — Section 17.2 step 7, comes after the core loop.
- The Firestore rules emulator tests are written but **not executed in this sandbox** — running them
  requires the Firebase Emulator Suite (Java + downloaded emulator binaries from Google's servers),
  which this environment can't reach. Run them yourself once you clone the repo:
  ```bash
  npm install
  npm test --workspace=@studiqa/rules-tests
  ```

## Running it locally after cloning

```bash
npm install
cp apps/web/.env.local.example apps/web/.env.local   # fill in your Firebase project's web config
cp functions/.env.example functions/.env              # for local emulator use only
npm run dev --workspace=@studiqa/web
firebase deploy --only firestore:rules,storage:rules  # after `firebase init` / `firebase use <project>`
```

You'll need to create a real Firebase project (Auth + Firestore + Storage + Functions +
App Check with reCAPTCHA Enterprise) and set `ANTHROPIC_API_KEY` as a Functions secret
before `generateMindMap` will work end-to-end — see Section 17.4's checklist in the PRD.

## Next steps (per Section 17.2)

1. Build the onboarding screens (goal → branch/year → interests).
2. Replicate the mind-map pattern for Notes, then Quizzes, then Flashcards, then Coding, then Roadmaps.
3. Wire up payment webhooks in sandbox mode before any paywall UI ships.
4. Build the Admin app once `publicContent` collections exist.
5. Layer in SRS-driven flashcard review, streaks, and the mastery dashboard.
