import { z } from "zod";

export const noteSectionSchema = z.object({
  heading: z.string().min(1).max(100),
  body: z.string().min(1).max(4000),
  keyPoints: z.array(z.string().max(200)).max(10),
});

export const notesAISchema = z.object({
  title: z.string().min(1).max(120),
  sections: z.array(noteSectionSchema).min(1).max(15),
});

export type NotesAIOutput = z.infer<typeof notesAISchema>;
