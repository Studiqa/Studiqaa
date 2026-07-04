import { z } from "zod";

export const quizQuestionSchema = z.object({
  q: z.string().min(1).max(500),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(1).max(1000),
  weakTopicTag: z.string().max(60).optional(),
});

export const quizAISchema = z.object({
  title: z.string().min(1).max(120),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questions: z.array(quizQuestionSchema).min(3).max(20),
});

export type QuizAIOutput = z.infer<typeof quizAISchema>;
