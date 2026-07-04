# STUDIQA
## Product Requirements Document (PRD) + Software Requirements Specification (SRS) + Technical Architecture
### Version 2.0 — Founder/CTO Master Document

---

## 0. DOCUMENT PURPOSE

This is the single source of truth for building Studiqa end-to-end. It is written so that any AI coding agent or engineering team can implement the entire application — frontend, data layer, security, payments, and AI features — **without needing to ask clarifying questions**. No backend server is used; Firebase (primary recommendation) or Supabase handles Auth, Database, Storage, Realtime, and Notifications. AI APIs are called directly from the client using secured, restricted keys and App Check — never through a custom server.

---

## 1. VISION & GOALS

### 1.1 Vision Statement
Studiqa makes hard engineering and CS concepts *visual, interactive, and unforgettable*. Instead of static PDFs and passive video lectures, Studiqa turns any topic, textbook, or syllabus into a living study system: AI-generated mind maps, interactive notes, quizzes, flashcards, coding practice, and a 24/7 AI tutor — all wrapped in a premium, distraction-free interface.

### 1.2 Core Differentiation (Why Studiqa ≠ NotebookLM/Clones)
| Dimension | Generic AI Notebook Tools | Studiqa |
|---|---|---|
| Primary output | Text summaries, audio overviews | Visual mind maps + structured interactive notes + practice loop |
| Audience | General knowledge workers | Engineering students & developers specifically |
| Learning loop | One-shot Q&A on documents | Full cycle: Learn → Map → Quiz → Flashcard → Code → Track mastery |
| Coding | Not supported | Native in-browser coding practice tied to topics |
| Career layer | None | Role-based roadmaps (e.g., "Backend Developer", "Data Engineer") |
| Retention mechanism | None | Spaced-repetition flashcards + streaks + mastery scoring |
| Pricing | Often $20+/mo | ₹200/month (~$2.4), India-first pricing with global support |

### 1.3 Goals (Year 1)
- G1: Launch MVP within 10–12 weeks using frontend-first architecture.
- G2: 50,000 registered users in 6 months post-launch (organic + student community driven).
- G3: 4–6% free-to-premium conversion rate.
- G4: <2s perceived load time on core screens (dashboard, tutor chat, mind map).
- G5: Zero critical security incidents; SOC2-style controls even without dedicated backend.
- G6: Sub-24-hour AI tutor response satisfaction rate >85% (measured via thumbs up/down).

### 1.4 Non-Goals (Explicitly Out of Scope for MVP)
- Live 1:1 human tutoring / video calls.
- Enterprise/institution admin (school-wide licensing) — planned Phase 3.
- Native offline-first mobile app — planned Phase 3.
- Multi-language content localization — planned Phase 4.

---

## 2. USER PERSONAS

### 2.1 Primary: "Aarav" — 2nd/3rd Year Engineering Student
- Age 19–22, B.Tech/B.E. (CS, IT, ECE, Mech).
- Studies for university exams + placements simultaneously.
- Pain: dense textbooks, poor time management, forgets concepts before exams.
- Wants: quick visual understanding, last-minute revision tools, quizzes with instant feedback.
- Device: Android phone primary, laptop secondary. Price-sensitive → ₹200/month is the ceiling.

### 2.2 Secondary: "Priya" — Final Year Student / Fresher preparing for placements
- Preparing for technical interviews (DSA, System Design, CS fundamentals).
- Pain: scattered resources across YouTube, GeeksforGeeks, LeetCode.
- Wants: structured roadmap + coding practice + AI explanations of "why is my code wrong."

### 2.3 Tertiary: "Rohit" — Junior Working Developer (0–3 yrs experience)
- Upskilling in a new stack (e.g., moving from frontend to full-stack, or learning cloud/DevOps).
- Wants: fast conceptual grounding via mind maps, not another 40-hour course.
- Willing to pay premium if it saves time.

### 2.4 Quaternary: "Ms. Kavita" — College Faculty / Mentor (future persona, Phase 3)
- Wants to assign topics/quizzes to a batch and track class performance.
- Institutional/admin persona — informs future Admin Panel design but not required for MVP.

---

## 3. COMPLETE FEATURE SET

### 3.1 Feature Philosophy
Every feature maps to one stage of the **Studiqa Learning Loop**:
`Import/Choose Topic → Understand (AI + Mind Map) → Practice (Quiz/Code) → Retain (Flashcards/Spaced Repetition) → Track (Mastery Dashboard)`

### 3.2 FREE TIER Features
1. **Account & Onboarding**
   - Sign up via Email/Password, Google, Apple (mobile).
   - Onboarding quiz: branch, year, goals (exam prep / placement / upskilling).
2. **AI Tutor (Limited)**
   - 15 messages/day with AI tutor (text only).
   - Basic explanations, no follow-up depth control.
3. **Mind Maps (Limited)**
   - Generate up to 3 AI mind maps/month from a topic name or short text (not full document upload).
   - View-only interactive canvas (pan/zoom), no export.
4. **Interactive Notes (Limited)**
   - Access to pre-built notes library for top 20 core CS/Engineering subjects.
   - Cannot generate custom notes from own material.
5. **Quizzes**
   - Unlimited access to pre-built quiz bank (community + curated).
   - AI-generated quiz: 5/month limit.
6. **Flashcards**
   - Access to public flashcard decks.
   - Create up to 2 custom decks, 30 cards each.
   - Basic (non-spaced-repetition) review mode.
7. **Coding Practice**
   - Access to Easy-tier coding problems only.
   - In-browser code editor with syntax highlighting, run/test against sample cases.
8. **Roadmaps**
   - View 3 public roadmaps (e.g., "Web Developer", "DSA Beginner", "Placement Ready").
   - No progress tracking persistence beyond session.
9. **Community / Social (light)**
   - View trending decks/mind maps shared by others (read-only).
10. **Notifications**
    - Daily streak reminder (push/local).

### 3.3 PREMIUM TIER Features (₹200/month)
1. **AI Tutor (Unlimited + Advanced)**
   - Unlimited messages/day.
   - Voice input, multi-turn deep-dive mode, "explain like I'm 5 / explain like an interviewer" toggles.
   - Upload documents/images (PDF, PPT, handwritten notes) for context-aware tutoring.
2. **Unlimited AI Mind Maps**
   - Generate from: topic text, uploaded PDF/PPT/DOCX, pasted syllabus, or image of textbook page (OCR).
   - Editable nodes, custom themes, export as PNG/PDF/SVG, shareable public link.
   - Auto-linking: mind map nodes link directly to relevant notes/quizzes/flashcards.
3. **Unlimited Interactive Notes Generation**
   - Convert any material into structured notes: headings, key terms glossary, diagrams-in-text, TL;DR summary, "exam-likely questions" section.
   - Notes auto-versioned; edit and re-generate sections.
4. **Advanced Quizzes**
   - Unlimited AI-generated quizzes from any material, adjustable difficulty, adaptive quizzing (weak-topic-focused).
   - Detailed analytics per question (time taken, confidence, weak concept tagging).
5. **Smart Flashcards + Spaced Repetition**
   - Unlimited decks and cards.
   - SM-2 based spaced repetition algorithm scheduling.
   - Auto-generate flashcards from notes/mind maps/PDFs.
6. **Full Coding Practice**
   - All difficulty tiers (Easy/Medium/Hard), company-tagged problems, AI code review & optimization suggestions, "explain my error" on failed test cases, multi-language support.
7. **Personalized Roadmaps**
   - AI-generated custom roadmap based on goal + current level + timeline.
   - Progress tracking, milestone badges, calendar-integrated study plan.
8. **Mastery Dashboard & Analytics**
   - Topic-wise mastery %, weak-area heatmap, time-spent analytics, exam-readiness score.
9. **Offline Access (PWA)**
   - Downloaded notes/flashcards available offline (cached via service worker).
10. **Priority AI + No Ads**
    - Faster AI response (priority queue via model tier selection), zero ads (free tier may show light non-intrusive ads in Phase 2).
11. **Export & Integrations**
    - Export notes to PDF/Notion-style markdown, calendar sync (Google Calendar) for study plan.
12. **Early Access**
    - New features 2 weeks before free tier rollout.

### 3.4 Monetization Add-ons (Post-MVP, Phase 2+)
- One-time "Exam Cram Pack" purchases (subject-specific intensive packs).
- Team/referral plans (3 friends split premium).
- Institutional licensing (Phase 3).

---

## 4. UI/UX DESIGN PRINCIPLES

### 4.1 Design Language
- **Style**: Modern minimal premium — generous whitespace, soft depth (subtle shadows, not skeuomorphic), rounded-but-precise corners (12–16px radius), no clutter.
- **Typography**: One display/heading font with character (e.g., a geometric sans like "Satoshi" or "General Sans") + one highly legible body font (e.g., "Inter"). Avoid default system fonts for brand screens.
- **Color System**: Dark-mode-first (student usage skews evening/night). Deep charcoal/near-black base (#0B0D10 range), one signature accent color (electric indigo or teal) used sparingly for CTAs and active states, plus a light mode mirror. Avoid pure black/pure white — use tinted near-black and off-white for reduced eye strain.
- **Motion**: Purposeful micro-interactions only (mind map node expand, flashcard flip, streak celebration). No gratuitous animation. Respect `prefers-reduced-motion`.
- **Iconography**: Single consistent icon set (e.g., Lucide/Phosphor), 1.5–2px stroke weight throughout.
- **Data density**: Progressive disclosure — dashboards show summary first, drill down on tap/click, never overwhelm with all analytics at once.

### 4.2 Core UX Principles
1. **Zero blank-state confusion** — every empty screen (no notes yet, no flashcards yet) has a clear, single primary action.
2. **AI is a companion, not a modal interruption** — AI tutor is always one tap away (persistent floating action button), never a full takeover unless user chooses focus mode.
3. **Frictionless input** — topic → mind map should be achievable in under 3 taps from home.
4. **Trust and transparency on AI** — always show "Generated by AI — verify important facts" microcopy on generated academic content; allow quick regenerate/report-issue.
5. **Gamified but not childish** — streaks, mastery %, and badges styled to feel premium (think Duolingo's engagement mechanics, Linear/Notion's visual polish) — not cartoonish.
6. **Accessibility** — WCAG 2.1 AA minimum: color contrast ≥4.5:1, all interactive elements keyboard-navigable, screen-reader labels on icons, scalable text.

### 4.3 Design System Tokens (for implementation)
- Spacing scale: 4/8/12/16/24/32/48/64 (px, base-4 system).
- Radius scale: sm=8, md=12, lg=16, xl=24, full=999.
- Elevation: 3 levels only (flat, raised-card, floating/modal).
- Breakpoints: mobile (<640px), tablet (640–1024px), desktop (>1024px). Mobile-first responsive, but desktop is a first-class citizen (many students study on laptops).

---

## 5. SCREEN LIST & USER FLOW

### 5.1 Full Screen Inventory
**Auth & Onboarding**
1. Splash/Launch
2. Sign Up
3. Log In
4. Forgot Password
5. Onboarding — Goal Selection (Exam Prep / Placement / Upskilling)
6. Onboarding — Branch & Year Selection
7. Onboarding — Interests/Topics Picker

**Core App (Bottom Nav / Sidebar)**
8. Home / Dashboard (streak, continue learning, recommended topics, mastery snapshot)
9. AI Tutor Chat (full screen + persistent floating bubble on other screens)
10. Mind Maps — Library (grid of saved maps)
11. Mind Maps — Create (input: topic/text/upload)
12. Mind Maps — Canvas Viewer/Editor
13. Notes — Library
14. Notes — Create/Generate
15. Notes — Reader/Editor View
16. Quizzes — Library (by subject/topic)
17. Quizzes — Create (AI-generate from topic/material)
18. Quiz — Active Session
19. Quiz — Results & Review
20. Flashcards — Deck Library
21. Flashcards — Deck Detail
22. Flashcards — Study/Review Mode (spaced repetition)
23. Flashcards — Create/Edit Deck
24. Coding — Problem List (filters: difficulty, topic, company tag)
25. Coding — Problem Detail + Editor + Console
26. Roadmaps — Explore/Browse
27. Roadmaps — My Roadmap Detail (milestones, progress)
28. Roadmaps — AI Generate Custom Roadmap
29. Analytics/Mastery Dashboard
30. Profile & Settings
31. Subscription/Upgrade Screen (paywall)
32. Payment Checkout (Razorpay/Stripe/Store billing sheet)
33. Notifications Center
34. Search (global, across notes/mindmaps/quizzes/flashcards/roadmaps)
35. Shared Content Viewer (public link view for shared mind maps/decks — no login required, soft paywall to interact)

**Admin (separate protected web app)**
36. Admin — Login (with 2FA)
37. Admin — Dashboard (KPIs)
38. Admin — User Management
39. Admin — Content Moderation Queue
40. Admin — Subscription/Payments Overview
41. Admin — AI Usage & Cost Monitoring
42. Admin — Feature Flags & Announcements
43. Admin — Support/Reported Issues

### 5.2 Primary User Flow (New User → First "Aha Moment")
```
Launch App → Sign Up (Google, 1 tap) → Onboarding (goal + branch + year, ~30s)
  → Home Dashboard (empty state: "Try your first topic")
  → Tap suggested topic chip (e.g., "Operating Systems - Deadlock")
  → AI generates Mind Map (loading state <8s with engaging progress copy)
  → Mind Map Canvas shown → user taps a node → side panel shows AI explanation
  → CTA: "Turn this into a quiz" → 5-question quiz generated → user completes
  → Result screen: score + "Save weak topics to flashcards" CTA
  → Flashcards created → Home dashboard now shows streak = 1, mastery snapshot appears
  → After 3rd map created in free tier limit → soft paywall nudge (non-blocking, dismissible)
```

### 5.3 Upgrade Flow
```
Any limit-hit trigger point (4th mind map, 16th tutor message, etc.)
  → Contextual paywall modal (shows exactly what's blocked + premium benefit)
  → Tap "Upgrade" → Subscription Screen (monthly ₹200, show value bullets)
  → Platform-aware payment: 
      Web → Razorpay (India) / Stripe (international)
      Android app → Google Play Billing (mandatory for digital goods per Play policy)
      iOS app → Apple In-App Purchase (mandatory per App Store policy)
  → Payment success → Firestore/Supabase user doc updated via webhook-verified Cloud Function
     → Instant UI unlock via realtime listener on user's subscription status
```

---

## 6. DATABASE DESIGN

> Primary recommendation: **Firebase (Firestore + Auth + Storage + Cloud Messaging + Cloud Functions for payment webhooks only)**. Supabase (Postgres) is documented as an alternative schema below since it's relational — pick one, do not run both.

### 6.1 Firestore Schema (Document-Oriented)

```
users/{userId}
  - uid, email, displayName, photoURL
  - branch, year, goal (enum: exam_prep|placement|upskilling)
  - subscriptionStatus: free|premium
  - subscriptionExpiresAt, subscriptionPlatform (razorpay|stripe|google_play|apple)
  - subscriptionRenewalId (external ref, never store card data)
  - createdAt, lastActiveAt
  - streakCount, longestStreak, lastStreakDate
  - usageCounters: { mindMapsThisMonth, tutorMessagesToday, quizzesThisMonth, resetAt }
  - fcmTokens: [array of device tokens for push]
  - role: user|admin|moderator

users/{userId}/mindMaps/{mapId}
  - title, sourceType (topic|pdf|text|image), sourceRefStoragePath
  - nodes: [{id, label, parentId, x, y, colorTag, explanation}]
  - isPublic, publicShareSlug
  - createdAt, updatedAt

users/{userId}/notes/{noteId}
  - title, subject, contentBlocks (structured JSON: headings/paragraphs/glossary/examQuestions)
  - sourceRefStoragePath, version, createdAt, updatedAt

users/{userId}/quizzes/{quizId}
  - title, subject, difficulty, questions: [{q, options[4], correctIndex, explanation, weakTopicTag}]
  - isAIGenerated, sourceRef, createdAt

users/{userId}/quizAttempts/{attemptId}
  - quizId, score, totalQuestions, answers: [{qIndex, selected, correct, timeTakenSec}]
  - weakTopicsIdentified: [string], completedAt

users/{userId}/flashcardDecks/{deckId}
  - title, subject, isPublic, cardCount, createdAt

users/{userId}/flashcardDecks/{deckId}/cards/{cardId}
  - front, back, sourceRef
  - srs: { easeFactor, intervalDays, repetitions, nextReviewDate, lastReviewedAt } // SM-2 algorithm state

users/{userId}/codingProgress/{problemId}
  - status: not_started|attempted|solved, lastSubmission, attemptsCount, bestRuntimeMs

users/{userId}/roadmaps/{roadmapId}
  - title, isCustomAI, goal, milestones: [{id, title, resourceRefs[], status, targetDate}]
  - progressPercent, createdAt

publicContent/codingProblems/{problemId}   // curated, admin-managed, global collection
  - title, difficulty, topicTags[], companyTags[], statement, starterCode: {lang: code}, testCases: [{input, expectedOutput, isHidden}]

publicContent/quizBank/{quizId}            // curated pre-built quizzes, global
publicContent/flashcardDecks/{deckId}      // curated public decks, global
publicContent/roadmapTemplates/{roadmapId} // e.g. "Web Developer", "DSA Beginner"

adminMeta/appConfig
  - featureFlags: {}, minAppVersion, maintenanceMode, freeLimits: {mindMapsPerMonth, tutorMessagesPerDay, quizzesPerMonth}

adminMeta/moderationQueue/{itemId}
  - contentType, contentRef, reportedBy, reason, status: pending|actioned|dismissed

analyticsAggregates/{date}   // written by scheduled Cloud Function, read by admin dashboard
  - dau, newSignups, premiumConversions, aiApiCostEstimate
```

### 6.2 Supabase (Postgres) Equivalent — Alternative Path
If Supabase is chosen instead of Firebase, mirror the same entities as relational tables: `users`, `mind_maps`, `mind_map_nodes`, `notes`, `quizzes`, `quiz_questions`, `quiz_attempts`, `flashcard_decks`, `flashcard_cards` (with `srs_ease_factor`, `srs_interval_days`, `srs_next_review_date` columns), `coding_problems`, `coding_progress`, `roadmaps`, `roadmap_milestones`, `app_config`, `moderation_queue`, `analytics_aggregates`. Use **Row Level Security (RLS)** policies (see Section 7) as the Postgres equivalent of Firestore Security Rules. Use Supabase Realtime channels in place of Firestore's onSnapshot listeners, and Supabase Storage + Edge Functions (only for payment webhook verification) in place of Firebase equivalents.

### 6.3 Indexing Requirements
- Composite index: `quizAttempts` on (userId, completedAt desc) for analytics timelines.
- Composite index: `flashcardCards` on (userId, srs.nextReviewDate asc) for "due today" queries.
- Composite index: `publicContent/codingProblems` on (difficulty, topicTags array-contains).
- Full-text/search: use Algolia or Typesense (client-side triggered via Cloud Function on write) for the global Search screen, since Firestore lacks native full-text search.

---

## 7. AUTHENTICATION

### 7.1 Methods
- Email/Password (with mandatory email verification before premium purchase).
- Google Sign-In (primary, 1-tap).
- Apple Sign-In (mandatory on iOS per App Store guideline 4.8 if other social logins exist).
- Phone/OTP as optional secondary method (useful for India-first user base).

### 7.2 Session & Token Handling
- Firebase Auth ID tokens (JWT), auto-refreshed client-side by SDK; never manually cache tokens in localStorage — rely on SDK's IndexedDB-backed persistence.
- Enforce short-lived custom claims for `role` (admin/moderator) set only via a secured Cloud Function triggered by a super-admin action, never client-writable.

### 7.3 Firestore Security Rules (Core Pattern)
- Default deny-all.
- `users/{userId}/**` — read/write only if `request.auth.uid == userId`, EXCEPT `subscriptionStatus`, `subscriptionExpiresAt`, `role` fields which are **only writable by Cloud Functions (Admin SDK)**, never by the client, to prevent users from self-granting premium.
- `publicContent/**` — public read, write restricted to `request.auth.token.role == 'admin'`.
- `adminMeta/**` — read/write restricted to admin role only.
- All writes validated with schema checks (field types, string length limits, enum whitelist) directly in security rules to prevent malformed/malicious data injection since there's no backend to sanitize input.

### 7.4 Abuse Prevention (No-Backend Context)
- Firebase App Check (with reCAPTCHA Enterprise on web, Play Integrity on Android, DeviceCheck on iOS) enforced on Firestore, Storage, and any callable Cloud Functions — blocks unauthorized clients/bots from hitting Firebase resources directly.
- Client-side + security-rule-enforced rate limiting: usage counters (`usageCounters`) checked and incremented atomically in security rules / transactions before allowing an AI-triggering write.

---

## 8. PAYMENTS ARCHITECTURE

### 8.1 Platform-Specific Requirement (Critical Compliance Rule)
- **Android app**: Digital goods (premium subscription) MUST use Google Play Billing. Razorpay/Stripe cannot be used inside the Android app for subscription purchases — Play Store policy violation risk of app removal.
- **iOS app**: Digital goods MUST use Apple In-App Purchase (StoreKit 2). Same restriction as Android.
- **Web app (studiqa.com)**: Free to use Razorpay (India, UPI/cards/netbanking) and Stripe (international cards) directly — no app store restriction applies to web purchases.
- Recommendation: **drive premium upgrades to the web checkout flow** even from mobile app (via a deep link/browser handoff) where legally permitted, to avoid the 15–30% app store cut — clearly disclose this is standard practice (Apple/Google now permit "external purchase link" entitlements in several regions; verify current regional policy before launch, since this changes).

### 8.2 Payment Flow (No Custom Backend)
1. Client initiates checkout with Razorpay/Stripe Checkout (client-side SDK) or platform billing SDK.
2. Payment provider redirects/returns success to client.
3. **Never trust client-side "success" alone to unlock premium.** A Cloud Function (Firebase Functions) — the *only* backend-like component in this architecture — listens to:
   - Razorpay Webhook (`payment.captured`, `subscription.charged`) with signature verification.
   - Stripe Webhook (`checkout.session.completed`, `invoice.paid`) with signature verification.
   - Google Play RTDN (Real-Time Developer Notifications) via Pub/Sub.
   - Apple App Store Server Notifications V2 (JWS-signed).
4. Cloud Function verifies signature → updates `users/{userId}.subscriptionStatus = 'premium'` and `subscriptionExpiresAt` using the Admin SDK (bypasses security rules safely, since this is trusted server-side code).
5. Client's realtime Firestore listener on the user doc instantly reflects the unlock — no polling needed.

### 8.3 Subscription Lifecycle Handling
- Renewal success → extend `subscriptionExpiresAt`.
- Renewal failure/cancellation → grace period (3 days) then downgrade to free via scheduled Cloud Function (cron, checks expired-but-not-renewed docs daily).
- Refund/chargeback webhook → immediate downgrade + flag account in `adminMeta/moderationQueue`.

### 8.4 Pricing Display
- ₹200/month shown in INR for Indian users (detected via IP/locale); USD equivalent (~$2.49–2.99, adjusted for store fees) shown for international via Stripe/App Store/Play regional pricing.

---

## 9. AI INTEGRATIONS

### 9.1 Principle: Client-Direct, Key-Protected
Since there's no custom backend, AI API calls are made directly from the client using the Anthropic API (Claude) and/or OpenAI as fallback, protected by:
- **API keys never embedded in client bundle.** Instead, use **Firebase AI Logic (formerly Vertex AI in Firebase)** or a minimal **Cloud Function-as-proxy** purely to hold the secret key server-side and forward the request — this is the one exception to "no backend," implemented as a stateless Cloud Function, not a full API server.
- App Check token required on every AI-triggering callable function to block abuse/scraping.
- Per-user, per-day rate limiting enforced via `usageCounters` before the call is allowed.

### 9.2 AI Feature Mapping
| Feature | Model Task | Notes |
|---|---|---|
| AI Tutor Chat | Conversational, context-aware Q&A | Maintain short rolling context window (last ~10 turns) client-side, sent with each call |
| Mind Map Generation | Structured JSON output (nodes/edges/labels) | Prompt enforces strict JSON schema output; client parses into canvas |
| Interactive Notes Generation | Long-form structured content generation | Chunked generation for large PDFs (split by page ranges, then merge) |
| Quiz Generation | Structured JSON (MCQs + explanations) | Include answer-shuffling logic client-side to prevent pattern memorization |
| Flashcard Auto-Generation | Structured JSON (front/back pairs) | Derived from notes/mind map nodes as source context |
| Code Review/Explain Error | Code + stderr as input, natural language output | Sandbox execution (see 9.4) happens client/edge-side, not via the AI call itself |
| OCR (image/handwritten notes) | Vision-capable model call | Pre-process image client-side (crop/compress) before sending |
| Adaptive Roadmap Generation | Structured JSON (milestones + resources) | Personalization inputs: goal, branch, current mastery scores |

### 9.3 Cost & Abuse Controls
- Tiered model routing: cheaper/faster model for free-tier and simple tasks (e.g., flashcard generation), stronger model reserved for premium deep-tutor sessions and complex document parsing.
- Hard per-user daily/monthly caps enforced BEFORE the call is dispatched (check `usageCounters`, increment atomically, reject if exceeded — never rely on catching it after the fact).
- Cost telemetry logged per call (tokens in/out, feature tag) into `analyticsAggregates` for admin cost monitoring.

### 9.4 Code Execution Sandbox
- In-browser execution for simple languages (JS/Python via Pyodide/WebAssembly) runs fully client-side — zero backend cost, zero security risk to infra since it's sandboxed in the user's own browser (Web Worker isolation).
- For languages requiring server execution (Java/C++/Go), use a third-party secure code execution API (e.g., Judge0 API or Piston API) called directly from the client with a restricted key — still no custom backend required.

---

## 10. SECURITY (ENTERPRISE-GRADE, NO-BACKEND CONTEXT)

Security here is the single most critical section given the "no custom backend" model — the security rules and client hardening effectively **are** the backend's security layer.

### 10.1 Defense Layers
1. **Identity Layer**: Firebase Auth with email verification enforced, App Check on every product surface (Firestore, Storage, Functions), Play Integrity/DeviceCheck/reCAPTCHA Enterprise as platform attestation.
2. **Data Access Layer**: Firestore Security Rules as the primary authorization engine — deny-by-default, explicit allow per collection, field-level write restrictions on sensitive fields (subscription status, role), schema validation in rules (type checks, string length caps, enum whitelists) to block malformed/oversized payloads.
3. **Transport Layer**: HTTPS enforced everywhere (default on Firebase Hosting/Storage/Firestore); HSTS header on hosting config; no mixed content.
4. **Storage Layer**: Firebase Storage Security Rules mirror Firestore's per-user isolation (`/users/{userId}/uploads/**` only accessible by owner); file type whitelist (pdf/png/jpg/docx/pptx only) and max file size (e.g., 25MB) enforced in rules; virus/malware scanning via a Cloud Function trigger on upload (e.g., ClamAV in a Cloud Function or a 3rd-party scanning API) before the file is marked "usable" by the app.
5. **Secrets Layer**: All AI API keys, payment secret keys, and webhook signing secrets stored in **Google Secret Manager**, injected only into server-side Cloud Functions — never in client bundles, never in Firestore, never in environment files committed to git.
6. **Application Layer**: Content Security Policy (CSP) headers on the hosted web app to prevent XSS; Subresource Integrity (SRI) on any third-party script tags; strict input sanitization on any user-generated content rendered as HTML (e.g., markdown notes) using a hardened sanitizer (DOMPurify) — never `dangerouslySetInnerHTML` raw AI output without sanitization.
7. **Payment Security**: Webhook signature verification mandatory (Razorpay HMAC, Stripe signing secret, Apple JWS, Google Pub/Sub auth) — a request is never trusted without cryptographic verification; idempotency keys used to prevent double-processing of webhook retries.
8. **Abuse/Fraud Layer**: Firestore transaction-based rate limiting on all AI-triggering and content-generation writes; anomaly flags (e.g., >X mind maps in 1 minute) auto-suspend account pending review in `adminMeta/moderationQueue`.
9. **Privacy & Compliance**: GDPR/India DPDP Act-aligned — explicit consent on signup, data export/delete-my-account self-service flow (triggers a Cloud Function that cascades-deletes all user subcollections and storage files), no sale of data to third parties, privacy policy + terms of service versioned and re-consent required on material change.
10. **Monitoring & Incident Response**: Firebase App Check metrics + Cloud Functions logs shipped to a monitoring dashboard (Google Cloud Monitoring or a SIEM-lite via BigQuery export); alerting on abnormal read/write spikes (potential data scraping); documented incident response runbook (detect → contain → notify affected users within regulatory window → post-mortem).
11. **Dependency & Supply Chain Security**: Automated dependency vulnerability scanning (Dependabot/Snyk) on the frontend repo; lockfile enforcement; no wildcard version ranges for security-sensitive packages.
12. **Admin Panel Hardening**: Separate subdomain (admin.studiqa.com), mandatory 2FA (TOTP) for all admin/moderator accounts, IP-based conditional access optional for super-admin, full audit log of every admin action (who changed what, when) stored in an append-only `auditLogs` collection writable only by Cloud Functions triggered from verified admin actions.

### 10.2 Threat Model Summary (STRIDE-lite)
| Threat | Mitigation |
|---|---|
| Spoofing (fake client hitting Firestore directly) | App Check + Auth required on all rules |
| Tampering (user edits own subscription status) | Field-level rule lockdown, only Admin SDK can write those fields |
| Repudiation (admin denies action) | Immutable audit log |
| Information Disclosure (reading other users' data) | Per-doc ownership checks in rules, no collection-group queries exposed without rule guards |
| Denial of Service (AI cost-bombing) | Per-user rate limits + App Check + anomaly auto-suspend |
| Elevation of Privilege (self-granting admin role) | Custom claims settable only via secured Cloud Function, never client Firestore write |

---

## 11. ADMIN PANEL

### 11.1 Purpose
A separate, restricted web application (not part of the public client bundle) for the founder/ops team to manage content, users, payments, and AI cost.

### 11.2 Modules
1. **Dashboard**: DAU/MAU, new signups, premium conversion rate, churn, AI cost burn-rate vs. revenue, real-time active sessions.
2. **User Management**: search/filter users, view profile + subscription history, manually grant/revoke premium (audit-logged), ban/suspend account.
3. **Content Moderation**: queue of reported public mind maps/decks/roadmaps, approve/remove, view reporter + reason.
4. **Curated Content Management**: CRUD for `publicContent/codingProblems`, `quizBank`, `flashcardDecks`, `roadmapTemplates` — this is how the founder team seeds high-quality initial content pre-launch.
5. **Payments & Subscriptions**: reconciliation view across Razorpay/Stripe/Play/Apple, failed payment list, refund/chargeback log.
6. **AI Usage & Cost Monitoring**: per-feature token spend, per-user top consumers, daily cost trend graph, budget alert thresholds.
7. **Feature Flags & Config**: toggle features remotely (`adminMeta/appConfig`), adjust free-tier limits without app redeploy, maintenance mode switch, minimum app version gate.
8. **Announcements/Notifications**: compose and send push notifications/in-app announcements to segments (all users, free only, premium only, inactive 7+ days).
9. **Support/Issue Tracker**: view user-submitted bug reports/feedback with device/app-version metadata attached automatically.

### 11.3 Access Control
- Roles: `super_admin`, `admin`, `moderator`, `support` — each with scoped permissions (e.g., moderator can only access Content Moderation module).
- 2FA mandatory, session timeout after 30 minutes idle, all actions audit-logged.

---

## 12. TECH STACK

### 12.1 Frontend (Web)
- Framework: **Next.js (React)** — SSR/SSG for marketing pages + SEO, CSR for app shell.
- Styling: Tailwind CSS + a small design-tokens layer matching Section 4.3.
- State Management: React Query (Firestore/Supabase data caching + sync) + lightweight global state (Zustand) for UI state.
- Mind Map Canvas: a canvas/graph library (e.g., React Flow) for interactive node rendering.
- Code Editor: Monaco Editor (VS Code's editor component) embedded for coding practice.
- PWA: next-pwa or Workbox for offline caching (premium offline access feature).

### 12.2 Frontend (Mobile)
- **React Native (Expo)** — single codebase for iOS + Android, shares business logic/hooks with the Next.js web app where feasible (monorepo).
- Native modules only where required: Play Billing / StoreKit (via Expo's in-app-purchase or RevenueCat as an abstraction layer — RevenueCat strongly recommended to unify Play/Apple billing logic without writing native code twice).

### 12.3 Backend-as-a-Service
- **Firebase**: Authentication, Firestore, Storage, Cloud Messaging (push notifications), Cloud Functions (payment webhooks + AI key proxy + scheduled jobs only), App Check, Firebase Hosting.
- *(Alternative: Supabase — Auth, Postgres, Storage, Realtime, Edge Functions for the same limited server-side needs.)*

### 12.4 AI Layer
- Primary: Anthropic Claude API (via Firebase AI Logic or a thin Cloud Function proxy) for tutoring, notes, mind maps, quizzes, flashcards.
- Vision/OCR: same provider's vision-capable model for image/handwritten input.
- Code execution: Pyodide (client-side, JS/Python) + Judge0/Piston API (server-language execution) for coding practice.
- Search: Algolia or Typesense for global search/full-text.

### 12.5 Payments
- Razorpay (India web), Stripe (international web), RevenueCat abstracting Google Play Billing + Apple StoreKit (mobile).

### 12.6 DevOps/Tooling
- Monorepo: Turborepo or Nx (shared packages: types, hooks, design tokens across web + mobile + admin).
- CI/CD: GitHub Actions → Firebase Hosting (web/admin), EAS Build/Submit (Expo mobile).
- Error/Perf Monitoring: Sentry (frontend errors) + Firebase Performance Monitoring + Google Analytics for Firebase.
- Feature flags: Firebase Remote Config (in addition to the custom `adminMeta/appConfig` for business-logic flags).

---

## 13. DEPLOYMENT

### 13.1 Environments
- `dev` (Firebase project #1) → local/staging testing, seeded with fake data.
- `staging` (Firebase project #2) → pre-prod, mirrors prod config, used for QA + payment sandbox testing (Razorpay/Stripe test mode, Play/Apple sandbox tracks).
- `prod` (Firebase project #3) → live.
- Strict environment variable separation per project; no shared secrets between environments.

### 13.2 Release Process
- Web + Admin: GitHub Actions on merge to `main` → build → deploy to Firebase Hosting (staging channel first, manual promote to live channel after smoke test).
- Mobile: Expo EAS Build → internal testing track (TestFlight/Play Internal Testing) → staged rollout (10% → 50% → 100%) on Play Store; phased release on App Store.
- Firestore Security Rules and Indexes deployed via CLI as part of the same CI pipeline, version-controlled alongside app code (never edited manually in console for prod).

### 13.3 Rollback Strategy
- Hosting: instant rollback to previous release channel (Firebase Hosting supports this natively).
- Mobile: halt staged rollout / use store's rollback-to-previous-version where supported; Remote Config kill-switch for any feature causing issues without needing a store resubmission.

---

## 14. SCALABILITY

### 14.1 Data Scaling
- Firestore scales horizontally by design; avoid hot-spotting by sharding high-write counters if any single document (e.g., a global "total users" counter) becomes a write bottleneck — use distributed counters pattern if/when needed.
- Paginate all list queries (mind maps, notes, quiz bank) with cursor-based pagination (`startAfter`), never full-collection fetches.

### 14.2 AI Cost Scaling
- Cache identical/near-identical AI generations (e.g., a commonly requested "Operating Systems - Deadlock" mind map) in `publicContent` as a suggested starting template, reducing redundant generation cost as user base grows.
- Model routing (cheaper model for high-volume simple tasks) as the primary lever to keep marginal cost per user low as scale increases.

### 14.3 Infrastructure Scaling
- Firebase Hosting + CDN handles static asset scaling automatically.
- Cloud Functions (webhooks/proxy) auto-scale but should have max-instance caps set to prevent runaway billing from an attack; combine with App Check to block unauthenticated invocation attempts.
- Move to Supabase's connection pooling (PgBouncer) equivalent consideration only if the Supabase path is chosen and read/write volume on Postgres grows beyond comfortable direct-connection limits.

### 14.4 Growth Path Beyond Frontend-Only
- Explicitly plan a **Phase 3 trigger condition**: if AI cost-per-user or the need for complex server-side business logic (e.g., institutional bulk operations) exceeds what Cloud Functions can cleanly handle, introduce a minimal dedicated backend (Node.js/NestJS or similar) — but this document intentionally defers that until proven necessary, per the "no custom backend initially" mandate.

---

## 15. TESTING STRATEGY

### 15.1 Test Layers
1. **Unit Tests**: business logic (SRS algorithm, usage-counter logic, roadmap progress calc) — Jest/Vitest.
2. **Component Tests**: UI components in isolation — React Testing Library / Storybook interaction tests.
3. **Integration Tests**: Firestore Security Rules tested with the Firebase Emulator Suite (`@firebase/rules-unit-testing`) — every allow/deny rule path covered, including negative tests (attempt to write another user's data, attempt to self-grant premium — must fail).
4. **E2E Tests**: critical user journeys (signup → onboarding → first mind map → quiz → upgrade flow) via Playwright/Detox (mobile).
5. **AI Output Validation Tests**: schema-validation tests ensuring AI-generated JSON (mind map nodes, quiz questions) always conforms to expected structure before being rendered/stored — reject and retry/fallback on malformed output.
6. **Payment Flow Tests**: sandbox-mode tests for Razorpay/Stripe test cards and Play/Apple sandbox purchases, including webhook signature verification unit tests with intentionally-tampered payloads (must reject).
7. **Security Penetration Testing**: pre-launch third-party audit of Firestore rules + App Check config + admin panel access control; repeat annually.
8. **Load/Performance Testing**: simulate concurrent AI-call bursts to validate rate-limiting holds under load (k6 or Artillery against a staging Cloud Function proxy).
9. **Accessibility Testing**: automated (axe-core) + manual screen-reader pass on core screens before each major release.

### 15.2 QA Gates (Definition of Done)
- No merge to `main` without passing unit + rule-emulator tests in CI.
- No prod deploy without a completed manual QA pass on staging covering the full learning loop + upgrade flow.
- No feature ships without a corresponding security-rule test proving unauthorized access is denied.

---

## 16. ROADMAP

### Phase 0 — Foundation (Weeks 1–2)
- Firebase/Supabase project setup (dev/staging/prod), Auth methods configured, Security Rules v1 (deny-all default + user-owned collections), design system + component library scaffolded, monorepo setup.

### Phase 1 — MVP Core Loop (Weeks 3–8)
- Onboarding flow, Home Dashboard, AI Tutor (basic), Mind Map generation (topic/text input only), Interactive Notes (pre-built library + limited generation), Quizzes (pre-built + limited AI), Flashcards (basic, no SRS yet), Coding Practice (Easy tier, JS/Python via Pyodide only), 3 public Roadmaps (static), Free-tier usage limits enforced, Razorpay + Stripe web checkout, basic Admin Panel (User Management + Content Moderation + Curated Content CRUD).

### Phase 2 — Premium Depth & Retention (Weeks 9–14)
- Document/PDF/image upload → mind maps & notes, SRS spaced repetition for flashcards, adaptive quizzing, full coding tiers + Judge0/Piston integration, AI-generated custom roadmaps, Mastery Dashboard, Google Play Billing + Apple IAP via RevenueCat, PWA offline access, push notifications, global search (Algolia), referral/sharing (public share links).

### Phase 3 — Scale & Expansion (Months 4–6)
- Native mobile polish + store optimization, institutional/faculty admin persona, light non-intrusive ads for free tier (optional, evaluate against premium conversion impact), community features (comments/upvotes on public content), advanced AI cost optimization (caching, model routing maturity), evaluate need for a minimal dedicated backend per Section 14.4 trigger condition.

### Phase 4 — Expansion (Months 6–12)
- Multi-language content support, exam-board-specific content packs (university-specific syllabi), team/institution licensing plans, deeper analytics (predictive exam-readiness), potential dedicated backend introduction if triggered.

---

## 17. IMPLEMENTATION PLAN

### 17.1 Monorepo Project Structure
```
studiqa/
├── apps/
│   ├── web/                     # Next.js app (marketing + main app shell)
│   │   ├── app/                 # App Router: /(marketing), /(auth), /(app)/dashboard, /(app)/mindmaps, etc.
│   │   ├── components/
│   │   ├── lib/                 # firebase client init, query hooks, ai-client wrapper
│   │   ├── public/
│   │   └── next.config.js
│   ├── mobile/                  # Expo React Native app
│   │   ├── app/                 # Expo Router screens mirroring web's screen list
│   │   ├── components/
│   │   └── app.config.ts
│   └── admin/                   # Separate Next.js app, admin.studiqa.com
│       ├── app/
│       └── components/
├── packages/
│   ├── ui/                      # Shared design-system components (buttons, cards, modals)
│   ├── types/                   # Shared TypeScript types (User, MindMap, Quiz, Flashcard, etc.)
│   ├── firebase-config/         # Shared Firebase init + typed Firestore converters
│   ├── ai-client/                # Shared wrapper calling the AI proxy Cloud Function, with schema validation
│   ├── srs-engine/              # SM-2 spaced repetition algorithm (pure functions, unit-testable)
│   └── usage-limits/            # Shared free/premium limit-checking logic
├── functions/                    # Firebase Cloud Functions (the ONLY server-side code)
│   ├── src/
│   │   ├── webhooks/            # razorpay.ts, stripe.ts, googlePlay.ts, appleIap.ts
│   │   ├── aiProxy/              # secured callable functions forwarding to Claude API
│   │   ├── scheduled/            # daily usage-counter reset, subscription expiry sweep
│   │   └── admin/                # setAdminRole, moderationActions (audit-logged)
│   └── package.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
└── turbo.json
```

### 17.2 Build Sequence (Aligned to Roadmap Phases)
1. Scaffold monorepo + shared packages (`types`, `ui`, `firebase-config`) first — every app depends on these.
2. Implement Security Rules + emulator tests BEFORE any feature UI — this is the foundation, not an afterthought.
3. Build Auth + Onboarding flow.
4. Build Home Dashboard shell with empty states.
5. Build one full vertical slice first: **Mind Map creation → view → AI explain node** — proves the AI-proxy Cloud Function + App Check + usage-limit pattern end-to-end before replicating it for Notes/Quizzes/Flashcards.
6. Replicate the proven pattern for Notes, Quizzes, Flashcards, Coding, Roadmaps.
7. Wire up payments (webhooks first, in staging/sandbox, before any UI paywall is shown).
8. Build Admin Panel in parallel once Curated Content collections exist (needed to seed content before public launch).
9. Layer in retention mechanics (SRS, streaks, mastery dashboard) once core loop is stable.
10. Final security audit + load test + accessibility pass before prod launch.

### 17.3 Key UI Components to Build (Shared Package)
- `AppButton`, `AppCard`, `AppModal`, `AppInput`, `AppBadge`, `StreakIndicator`
- `MindMapCanvas` (node/edge renderer + pan/zoom + node-detail side panel)
- `QuizPlayer` (question stepper, timer, answer feedback, results summary)
- `FlashcardStack` (swipe/flip interaction, SRS "again/hard/good/easy" rating buttons)
- `CodeEditorPane` (Monaco wrapper + console output panel + test-case results)
- `RoadmapTimeline` (milestone progress visualization)
- `PaywallModal` (contextual, reusable across every limit-hit trigger point)
- `AITutorBubble` (persistent floating chat entry point + full-screen chat view)
- `MasteryHeatmap` (topic-strength visualization for the analytics dashboard)

### 17.4 Immediate Next Steps Checklist
- [ ] Confirm Firebase vs Supabase final decision (this document defaults to Firebase).
- [ ] Register Firebase projects (dev/staging/prod) and Razorpay/Stripe/Play/Apple developer accounts.
- [ ] Finalize AI provider contract (Anthropic API access + rate limits/budget alert setup).
- [ ] Set up monorepo skeleton per Section 17.1.
- [ ] Write and test Firestore/Storage Security Rules v1 with emulator before writing any UI code.
- [ ] Design and lock the visual design system (Section 4) in Figma before component build begins.

---

*This document is considered complete and buildable as-is. Any AI agent or engineering team can proceed directly to implementation following Section 17's build sequence without further clarification.*
