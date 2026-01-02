# @leetcode-tracker/shared-types

Shared Zod schemas and TypeScript types for LeetCode Progress Tracker.

## Purpose

This package provides a single source of truth for data validation and type definitions, shared between the backend Lambda handlers and frontend React application.

## Features

- ✅ Runtime validation with Zod schemas
- ✅ TypeScript type inference from schemas
- ✅ Custom error messages
- ✅ Enum definitions for difficulty and status
- ✅ Partial schemas for updates
- ✅ Zero runtime overhead when using types only

## Installation

This is a workspace package, automatically available to other workspaces:

```json
// In apps/backend/package.json or apps/web/package.json
{
  "dependencies": {
    "@leetcode-tracker/shared-types": "workspace:*"
  }
}
```

## Usage

### Import Schemas

```typescript
import {
  CreateTrackerSchema,
  UpdateTrackerSchema,
  TrackerSchema,
  DifficultyEnum,
  StatusEnum,
} from "@leetcode-tracker/shared-types";
```

### Import Types

```typescript
import type {
  CreateTrackerDTO,
  UpdateTrackerDTO,
  Tracker,
} from "@leetcode-tracker/shared-types";
```

## Schemas

### DifficultyEnum

Enum for problem difficulty levels.

```typescript
const DifficultyEnum = z.enum(["Easy", "Medium", "Hard"]);

// Type
type Difficulty = z.infer<typeof DifficultyEnum>;
// "Easy" | "Medium" | "Hard"
```

### StatusEnum

Enum for tracker status.

```typescript
const StatusEnum = z.enum(["Solved", "Attempted", "To Review"]);

// Type
type Status = z.infer<typeof StatusEnum>;
// "Solved" | "Attempted" | "To Review"
```

### CreateTrackerSchema

Schema for creating a new tracker. All fields except optional ones are required.

```typescript
const CreateTrackerSchema = z.object({
  problem: z.string().min(1, "Problem name is required").max(200),
  difficulty: DifficultyEnum,
  status: StatusEnum,
  notes: z.string().max(1000).optional().default(""),
  dateCompleted: z.string().optional().nullable(),
  attempts: z.number().int().min(0).optional().default(0),
  timeSpent: z.number().min(0).optional().default(0),
});

// Type
type CreateTrackerDTO = z.infer<typeof CreateTrackerSchema>;
```

**Example:**

```typescript
const newTracker = CreateTrackerSchema.parse({
  problem: "Two Sum",
  difficulty: "Easy",
  status: "Solved",
  notes: "Used hash map approach",
  attempts: 1,
  timeSpent: 30,
});
```

### UpdateTrackerSchema

Partial schema for updating a tracker. All fields are optional.

```typescript
const UpdateTrackerSchema = CreateTrackerSchema.partial();

// Type
type UpdateTrackerDTO = z.infer<typeof UpdateTrackerSchema>;
```

**Example:**

```typescript
const update = UpdateTrackerSchema.parse({
  status: "To Review",
  notes: "Need to optimize solution",
});
```

### TrackerSchema

Complete schema including DynamoDB metadata fields.

```typescript
const TrackerSchema = CreateTrackerSchema.extend({
  PK: z.string(),
  SK: z.string(),
  trackerId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Type
type Tracker = z.infer<typeof TrackerSchema>;
```

**DynamoDB Structure:**

- `PK`: Partition Key - `USER#<userId>`
- `SK`: Sort Key - `TRACK#<trackerId>`
- `trackerId`: UUID v4
- `createdAt`: ISO 8601 timestamp
- `updatedAt`: ISO 8601 timestamp

## Validation Examples

### Backend (Lambda Handler)

```typescript
// apps/backend/src/handlers/create-tracker.ts
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Validate with Zod
    const validatedData = CreateTrackerSchema.parse(body);

    // validatedData is now type-safe and validated
    // Continue with DynamoDB insert...
  } catch (error) {
    if (error && typeof error === "object" && "errors" in error) {
      // Zod validation error
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Validation error",
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        }),
      };
    }

    // Other errors...
  }
};
```

### Frontend (React Form)

```typescript
// apps/web/src/components/TrackerForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTrackerSchema } from '@leetcode-tracker/shared-types';
import type { CreateTrackerDTO } from '@leetcode-tracker/shared-types';

export function TrackerForm() {
  const form = useForm<CreateTrackerDTO>({
    resolver: zodResolver(CreateTrackerSchema),
    defaultValues: {
      problem: '',
      difficulty: 'Easy',
      status: 'Solved',
      notes: '',
      attempts: 0,
      timeSpent: 0,
    },
  });

  const onSubmit = async (data: CreateTrackerDTO) => {
    // data is already validated by Zod
    await createTracker(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Error Messages

### Custom Messages

```typescript
// Problem field
z.string().min(1, "Problem name is required");

// Difficulty field
DifficultyEnum;
// Error: "Invalid enum value. Expected 'Easy' | 'Medium' | 'Hard', received 'SuperHard'"

// Attempts field
z.number().int().min(0);
// Error: "Number must be greater than or equal to 0"
```

### Error Response Format

When validation fails, errors are returned in this format:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "path": "problem",
      "message": "Problem name is required"
    },
    {
      "path": "difficulty",
      "message": "Invalid enum value. Expected 'Easy' | 'Medium' | 'Hard', received 'SuperHard'"
    }
  ]
}
```

## Field Constraints

| Field           | Type         | Required | Min | Max  | Default |
| --------------- | ------------ | -------- | --- | ---- | ------- |
| `problem`       | string       | ✅       | 1   | 200  | -       |
| `difficulty`    | enum         | ✅       | -   | -    | -       |
| `status`        | enum         | ✅       | -   | -    | -       |
| `notes`         | string       | ❌       | -   | 1000 | `""`    |
| `dateCompleted` | string       | ❌       | -   | -    | `null`  |
| `attempts`      | number (int) | ❌       | 0   | -    | `0`     |
| `timeSpent`     | number       | ❌       | 0   | -    | `0`     |

## Type Safety Benefits

### Before (No Validation)

```typescript
// ❌ No validation, runtime errors possible
function createTracker(data: any) {
  // What if data.difficulty is "SuperHard"?
  // What if data.problem is missing?
  // What if data.attempts is negative?
  await db.insert(data);
}
```

### After (With Zod)

```typescript
// ✅ Validated and type-safe
function createTracker(data: unknown) {
  const validated = CreateTrackerSchema.parse(data);
  // validated.difficulty is guaranteed to be "Easy" | "Medium" | "Hard"
  // validated.problem is guaranteed to be a non-empty string
  // validated.attempts is guaranteed to be a non-negative integer
  await db.insert(validated);
}
```

## Development

```bash
# Build package
pnpm build

# Watch mode
pnpm dev
```

## Testing Validation

```typescript
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";

// Valid data
const valid = CreateTrackerSchema.safeParse({
  problem: "Two Sum",
  difficulty: "Easy",
  status: "Solved",
});

console.log(valid.success); // true
console.log(valid.data); // { problem: "Two Sum", ... }

// Invalid data
const invalid = CreateTrackerSchema.safeParse({
  problem: "",
  difficulty: "SuperHard",
  status: "Maybe",
});

console.log(invalid.success); // false
console.log(invalid.error.errors); // Array of validation errors
```

## Benefits

1. **Single Source of Truth:** One place to define validation rules
2. **DRY Principle:** No duplication between backend and frontend
3. **Type Safety:** TypeScript types automatically derived from schemas
4. **Runtime Safety:** Validates data at runtime, not just compile-time
5. **Better UX:** Consistent error messages across backend and frontend
6. **Maintainability:** Change schema once, updates everywhere

## Related Files

- `src/tracker.ts` - Main schemas
- `src/index.ts` - Exports
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration

## License

MIT
