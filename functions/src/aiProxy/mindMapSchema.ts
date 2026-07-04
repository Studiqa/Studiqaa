import { z } from "zod";

// AI output validation (Section 15.1 #5): the model's JSON must conform to this
// shape before we ever store or render it. Malformed output is rejected and retried.
export const mindMapNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  parentId: z.string().nullable(),
  x: z.number(),
  y: z.number(),
  colorTag: z.string().optional(),
  explanation: z.string().max(2000).optional(),
});

export const mindMapAISchema = z.object({
  title: z.string().min(1).max(120),
  nodes: z.array(mindMapNodeSchema).min(1).max(60),
});

export type MindMapAIOutput = z.infer<typeof mindMapAISchema>;
