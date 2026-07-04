import { z } from "zod";

export const flashcardSchema = z.object({
  front: z.string().min(1).max(300),
  back: z.string().min(1).max(500),
});

export const flashcardDeckAISchema = z.object({
  title: z.string().min(1).max(120),
  cards: z.array(flashcardSchema).min(3).max(40),
});

export type FlashcardDeckAIOutput = z.infer<typeof flashcardDeckAISchema>;
