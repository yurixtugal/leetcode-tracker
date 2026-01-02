import { z } from "zod";

/**
 * Tracker difficulty levels
 */
export const DifficultyEnum = z.enum(["Easy", "Medium", "Hard"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

/**
 * Tracker status types
 */
export const StatusEnum = z.enum(["Solved", "Attempted", "To Review"]);
export type Status = z.infer<typeof StatusEnum>;

/**
 * Base Tracker schema for creation
 */
export const CreateTrackerSchema = z.object({
  problem: z
    .string()
    .min(1, "Problem name is required")
    .max(200, "Problem name too long"),
  difficulty: DifficultyEnum,
  status: StatusEnum,
  notes: z.string().max(1000, "Notes too long").optional().default(""),
  dateCompleted: z.string().optional().nullable(),
  attempts: z
    .number()
    .int()
    .min(0, "Attempts must be non-negative")
    .optional()
    .default(0),
  timeSpent: z
    .number()
    .min(0, "Time spent must be non-negative")
    .optional()
    .default(0),
});

/**
 * Schema for updating a tracker (all fields optional)
 */
export const UpdateTrackerSchema = CreateTrackerSchema.partial();

/**
 * Full Tracker schema including DynamoDB keys and metadata
 */
export const TrackerSchema = CreateTrackerSchema.extend({
  PK: z.string(),
  SK: z.string(),
  trackerId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type CreateTrackerDTO = z.infer<typeof CreateTrackerSchema>;
export type UpdateTrackerDTO = z.infer<typeof UpdateTrackerSchema>;
export type Tracker = z.infer<typeof TrackerSchema>;

/**
 * API Response types
 */
export const TrackerResponseSchema = z.object({
  message: z.string(),
  tracker: TrackerSchema,
});

export const TrackersListResponseSchema = z.object({
  message: z.string(),
  trackers: z.array(TrackerSchema),
  count: z.number(),
});

export const DeleteTrackerResponseSchema = z.object({
  message: z.string(),
  trackerId: z.string(),
});

export type TrackerResponse = z.infer<typeof TrackerResponseSchema>;
export type TrackersListResponse = z.infer<typeof TrackersListResponseSchema>;
export type DeleteTrackerResponse = z.infer<typeof DeleteTrackerResponseSchema>;
