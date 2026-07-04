import { z } from "zod";

export const roadmapMilestoneSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  resourceType: z.enum(["mindmap", "notes", "quiz", "flashcards", "external"]),
});

export const roadmapAISchema = z.object({
  title: z.string().min(1).max(150),
  milestones: z.array(roadmapMilestoneSchema).min(3).max(25),
});

export type RoadmapAIOutput = z.infer<typeof roadmapAISchema>;
