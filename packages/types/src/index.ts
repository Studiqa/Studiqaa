// Shared domain types for Studiqa — mirrors the Firestore schema in Section 6 of the PRD/SRS.

export type Goal = "exam_prep" | "placement" | "upskilling";
export type SubscriptionStatus = "free" | "premium";
export type SubscriptionPlatform = "razorpay" | "stripe" | "google_play" | "apple";
export type UserRole = "user" | "admin" | "moderator";

export interface UsageCounters {
  mindMapsThisMonth: number;
  tutorMessagesToday: number;
  quizzesThisMonth: number;
  resetAt: number; // epoch ms
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  branch?: string;
  year?: number;
  goal?: Goal;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: number;
  subscriptionPlatform?: SubscriptionPlatform;
  subscriptionRenewalId?: string;
  createdAt: number;
  lastActiveAt: number;
  streakCount: number;
  longestStreak: number;
  lastStreakDate?: string; // YYYY-MM-DD
  usageCounters: UsageCounters;
  fcmTokens: string[];
  role: UserRole;
}

export type MindMapSourceType = "topic" | "pdf" | "text" | "image";

export interface MindMapNode {
  id: string;
  label: string;
  parentId: string | null;
  x: number;
  y: number;
  colorTag?: string;
  explanation?: string;
}

export interface MindMap {
  id: string;
  title: string;
  sourceType: MindMapSourceType;
  sourceRefStoragePath?: string;
  nodes: MindMapNode[];
  isPublic: boolean;
  publicShareSlug?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  weakTopicTag?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  isAIGenerated: boolean;
  sourceRef?: string;
  createdAt: number;
}

export interface SRSState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedAt?: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  isPublic: boolean;
  cardCount: number;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  sourceRef?: string;
  srs: SRSState;
}

export interface FreeLimits {
  mindMapsPerMonth: number;
  tutorMessagesPerDay: number;
  quizzesPerMonth: number;
}

// --- Coding practice (Section 6 codingProblems / codingProgress) ---
export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topicTags: string[];
  statement: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
}

export type CodingProgressStatus = "unsolved" | "attempted" | "solved";

export interface CodingProgress {
  problemId: string;
  status: CodingProgressStatus;
  lastSubmittedCode?: string;
  attempts: number;
  solvedAt?: number;
}

// --- Roadmaps ---
export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  resourceType: "mindmap" | "notes" | "quiz" | "flashcards" | "external";
  resourceRef?: string;
  completed: boolean;
}

export interface Roadmap {
  id: string;
  title: string;
  goal: Goal;
  milestones: RoadmapMilestone[];
  createdAt: number;
}

// --- Activity history (Section: user history/search, like a ChatGPT sidebar) ---
export type ActivityType = "mindmap" | "notes" | "quiz" | "flashcards" | "roadmap" | "tutor";

export interface ActivityHistoryItem {
  id: string;
  type: ActivityType;
  title: string;
  refId: string; // points to the doc in its own collection (mindMaps/{id}, etc.)
  createdAt: number;
}

// --- AI Tutor chat sessions ---
export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface TutorSession {
  id: string;
  title: string; // auto-derived from first message, editable
  createdAt: number;
  updatedAt: number;
}
