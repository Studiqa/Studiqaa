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
| `apps/web` | Next.js app — **24 routes, `next build` succeeds clean** (see list below) |
| `functions/src/aiProxy/*` | 6 callable Cloud Functions (mind maps, notes, quizzes, flashcards, roadmaps, tutor chat) — **typechecks clean with `tsc --noEmit`** |
| `functions/src/webhooks/*` | Razorpay + Stripe webhooks with signature verification, + order-creation callable |
| `.github/workflows/ci.yml` | Typecheck + unit tests + web build on every PR |

### Web app routes
Marketing, signup, login (email + Google), **login-otp (phone/SMS)**, onboarding (goal/details),
dashboard, mind maps (create/view), notes (create/view), quizzes (create/attempt+score),
flashcards (create + SRS review session), coding practice (list/detail), roadmaps
(create/view with milestone checklist), **history (searchable activity log)**, **tutor
(AI chat with persistent sessions)**, upgrade (Razorpay checkout).

## Security model — payments & secrets (read this before going live)

**No API key, secret, or private credential is ever sent to the browser.** This isn't a
policy, it's the architecture:

- `ANTHROPIC_API_KEY`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`, and both webhook
  secrets live **only** as Firebase Functions secrets (`firebase functions:secrets:set`),
  read via `process.env` **inside Cloud Functions running on Google's servers**. They
  are never imported into any file under `apps/web`, never appear in a `next build`
  bundle, and therefore cannot be found by opening browser dev tools / "Inspect" no
  matter what a user does on the frontend — there's nothing there to find.
- The client only ever receives back non-secret values a function chooses to return —
  e.g. `createRazorpayOrder` returns an `orderId` and Razorpay's **public** `key_id`
  (public by design, like a storefront ID), never `key_secret`.
- `subscriptionStatus`, `subscriptionExpiresAt`, `role`, etc. can **only** be written by
  Cloud Functions using the Admin SDK (which bypasses Firestore rules) — `firestore.rules`
  explicitly blocks any client write that touches those fields (see
  `touchesProtectedBillingFields()`), so a user editing requests in dev tools cannot
  grant themselves premium or admin no matter what they send.
- Both webhooks (`razorpayWebhook`, `stripeWebhook`) verify the payment provider's
  cryptographic signature on the **raw** request body before trusting anything in the
  payload — forged/replayed webhook calls are rejected before they can touch Firestore.
- Every subscription change is logged to `users/{uid}/subscriptionEvents` (readable by
  the user and admins, writable by no one directly) as an audit trail.

## History / search (the "like ChatGPT" feature)

Every mind map, note set, quiz, flashcard deck, roadmap, and tutor conversation writes
an entry to `users/{uid}/activityHistory` at creation time. The `/history` page lists
all of it newest-first with live search-as-you-type and a type filter — the same shape
as a ChatGPT-style sidebar, just as a full searchable page instead of a sidebar (easy to
turn into a sidebar component later without changing any data model).

## OTP login

`/login-otp` uses Firebase Authentication's built-in phone-number sign-in: it sends a
real SMS one-time code via Firebase's backend (Google's infrastructure, not a custom
server) and verifies it client-side against Firebase — Studiqa's own servers never see
or generate the OTP itself. Requires enabling the **Phone** sign-in provider in the
Firebase Console (Authentication → Sign-in method) and, for production, adding your
domain to the reCAPTCHA allowlist there.

## What's intentionally stubbed / not yet built

- Coding practice judge/grading is a stub — it records attempts but doesn't execute code
  (real code execution needs a sandboxed judge API like Judge0/Piston, wired server-side only).
- Google Play / Apple IAP webhooks — Razorpay + Stripe are done; those two remain.
- Admin app, Mobile app — not started.
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
