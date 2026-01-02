# AI Agent Guidelines - LeetCode Tracker

**Project:** LeetCode Progress Tracker (Serverless)  
**Stack:** React 19 + AWS Lambda + CDK + DynamoDB + Cognito  
**Monorepo:** Turborepo + pnpm workspaces

---

## Quick Reference

### Project Structure

```
leetcode-tracker/
├── apps/
│   ├── backend/     # Lambda handlers (TypeScript)
│   └── web/         # React + Vite (UI pending)
├── infra/           # AWS CDK stacks
└── packages/
    └── shared-types # Zod schemas + types
```

### Key Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all dev servers
pnpm build                # Build all workspaces
pnpm --filter <pkg> <cmd> # Run command in specific workspace

cd infra
npx cdk deploy --all      # Deploy infrastructure
npx cdk diff BackendStack # Preview changes
```

---

## Active Endpoints

**Base URL:** `https://<API_ID>.execute-api.<REGION>.amazonaws.com/<STAGE>/`

All endpoints require: `Authorization: Bearer <JWT_TOKEN>`

### Available Routes

- `POST /trackers` - Create tracker
- `GET /trackers` - List all trackers
- `GET /trackers/{id}` - Get single tracker
- `PUT /trackers/{id}` - Update tracker
- `DELETE /trackers/{id}` - Delete tracker

### Test Credentials (Cognito)

- **Email:** `testuser@example.com`
- **Password:** `<USE_YOUR_TEST_PASSWORD>`
- **User Pool:** `leetcode-tracker-users-dev`

**Get JWT Token:**

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <YOUR_CLIENT_ID> \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=<YOUR_PASSWORD>
```

---

## Workspace Details

### 1. `apps/backend`

**Purpose:** Lambda handlers for REST API  
**Stack:** TypeScript + AWS SDK v3 + Zod validation

**Files:**

- `src/handlers/*.ts` - 5 Lambda functions (CRUD operations)

**Key Features:**

- Runtime validation with Zod schemas from `shared-types`
- DynamoDB SDK v3 integration
- Cognito JWT authentication via `event.requestContext.authorizer.claims.sub`
- Bundled with esbuild via CDK `NodejsFunction`

**Common Tasks:**

```bash
pnpm --filter @leetcode-tracker/backend build
pnpm --filter @leetcode-tracker/backend lint
```

### 2. `apps/web`

**Purpose:** React frontend (Modern, production-ready)  
**Stack:** React 19 + Vite 7 + TypeScript + Modern tooling

**Status:** 🚧 Infrastructure deployed (S3 + CloudFront), UI implementation pending

**Tech Stack (Best Practices 2025):**

- **React 19** - Latest with Server Components support
- **Vite 7** - Lightning-fast builds
- **TypeScript 5.9** - Strict mode, full type safety
- **Zustand** - State management (better than Redux/Context)
- **React Router v7** - File-based routing
- **TanStack Query v5** - Server state (async data fetching)
- **Zod** - Runtime validation (shared with backend)
- **shadcn/ui** - Unstyled, accessible components
- **Tailwind CSS v4** - Utility-first styling
- **AWS Amplify v6** - Cognito authentication

**Common Tasks:**

```bash
pnpm --filter @leetcode-tracker/web dev    # http://localhost:5173
pnpm --filter @leetcode-tracker/web build
pnpm --filter @leetcode-tracker/web preview # Preview production build
```

**Architecture Patterns:**

```
src/
├── app/                    # React Router v7 app directory
│   ├── routes/            # File-based routing
│   │   ├── _index.tsx     # Dashboard (/)
│   │   ├── login.tsx      # Login page
│   │   ├── trackers.tsx   # Tracker list
│   │   └── trackers.$id.tsx # Tracker detail
│   ├── root.tsx           # Root layout
│   └── entry.client.tsx   # Client entry
├── components/
│   ├── ui/                # shadcn components (primitives)
│   ├── tracker/           # Domain components
│   └── layouts/           # Layout components
├── lib/
│   ├── api.ts             # API client (fetch wrapper)
│   ├── auth.ts            # Amplify auth helpers
│   └── utils.ts           # Utility functions
├── hooks/
│   ├── use-auth.ts        # Auth state (Zustand)
│   ├── use-trackers.ts    # TanStack Query hooks
│   └── use-toast.ts       # Toast notifications
└── stores/
    ├── auth.ts            # Auth store (Zustand)
    └── ui.ts              # UI state (Zustand)
```

**Next Steps:**

- Configure Tailwind CSS + shadcn/ui
- Set up Zustand stores (auth, UI state)
- Implement AWS Amplify auth flow
- Create React Router routes
- Build tracker CRUD with TanStack Query

### 3. `infra`

**Purpose:** AWS CDK infrastructure (TypeScript)  
**Stack:** AWS CDK v2 + TypeScript

**Stacks:**

- `AuthStack` - Cognito User Pool + Client
- `DatabaseStack` - DynamoDB TableV2 (on-demand)
- `BackendStack` - API Gateway + 5 Lambdas + CORS
- `FrontendStack` - S3 + CloudFront

**Stack Props:** Shared via `stack-props.ts`

**Common Tasks:**

```bash
cd infra
npx cdk deploy --all              # Deploy everything
npx cdk deploy BackendStack       # Deploy specific stack
npx cdk diff BackendStack         # Preview changes
npx cdk destroy --all             # Teardown (careful!)
```

**Environment Context:**

```bash
# Development (default)
npx cdk deploy --all

# Production
npx cdk deploy --all -c environment=prod
```

### 4. `packages/shared-types`

**Purpose:** Shared Zod schemas + TypeScript types  
**Stack:** Zod v3.23.8 + TypeScript

**Exports:**

- `CreateTrackerSchema` - Validation for POST
- `UpdateTrackerSchema` - Partial validation for PUT
- `TrackerSchema` - Full entity with DynamoDB keys
- `DifficultyEnum` - "Easy" | "Medium" | "Hard"
- `StatusEnum` - "Solved" | "Attempted" | "To Review"

**Usage:**

```typescript
import {
  CreateTrackerSchema,
  type Tracker,
} from "@leetcode-tracker/shared-types";

const result = CreateTrackerSchema.safeParse(body);
```

---

## Common Workflows

### Adding a New Lambda Handler

1. Create handler in `apps/backend/src/handlers/<name>.ts`
2. Import types from `shared-types`
3. Add route in `infra/lib/backend-stack.ts`
4. Deploy: `cd infra && npx cdk deploy BackendStack`

### Modifying Database Schema

1. Update Zod schema in `packages/shared-types/src/tracker.ts`
2. Update Lambda handlers in `apps/backend/src/handlers/`
3. Test locally, then deploy backend

### Updating CORS Configuration

1. Modify `allowedOrigins` in `infra/lib/backend-stack.ts`
2. Run `npx cdk diff BackendStack` to preview
3. Deploy: `npx cdk deploy BackendStack`

---

## Troubleshooting

### Lambda Errors

```bash
# View logs
aws logs tail /aws/lambda/<function-name> --follow
```

### CDK Deployment Issues

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name BackendStack

# View stack events
aws cloudformation describe-stack-events --stack-name BackendStack
```

### Cognito Token Issues

```bash
# Verify token
aws cognito-idp get-user --access-token <ACCESS_TOKEN>
```

---

## Code Standards

### TypeScript

- Use `interface` for objects, `type` for unions/primitives
- Prefer `const` over `let`, avoid `var`
- Use template literals for strings with variables

### Error Handling

```typescript
// Lambda responses
return {
  statusCode: 400,
  body: JSON.stringify({ message: 'Validation failed', errors: [...] })
};
```

### Zod Validation Pattern

```typescript
const result = CreateTrackerSchema.safeParse(JSON.parse(event.body));
if (!result.success) {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Validation failed",
      errors: result.error.errors,
    }),
  };
}
```

---

## Project Status

**Backend:** ✅ 100% Complete  
**Frontend Infrastructure:** ✅ 100% Complete  
**Frontend UI:** 🚧 0% Complete  
**Overall:** ~70% Complete

---

## Important Notes

- **NEVER commit `.env` files or AWS credentials**
- **Always validate input with Zod before DynamoDB operations**
- **Use `pnpm --filter` for workspace-specific commands**
- **Test CDK changes with `cdk diff` before deploying**
- **CloudFront URL is dynamically passed to BackendStack for CORS**

---

## Next Steps (Frontend)

1. Implement Cognito auth flow (login/signup)
2. Create dashboard layout
3. Build tracker list with filters
4. Add forms (create/edit) with Zod validation
5. Add progress visualizations

---

## Best Practices & Patterns

### AWS CDK Best Practices

**1. L2 Constructs (Recommended)**

```typescript
// ✅ GOOD: L2 constructs with sensible defaults
const fn = new lambda.Function(this, "MyFunction", {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: "index.handler",
  code: lambda.Code.fromAsset("lambda"),
  timeout: Duration.seconds(10),
});

// ❌ AVOID: L1 constructs (too verbose)
const fn = new lambda.CfnFunction(this, "MyFunction", {
  runtime: "nodejs20.x",
  handler: "index.handler",
  code: {
    /* complex object */
  },
  timeout: 10,
});
```

**2. Stack Props for Cross-Stack References**

```typescript
// ✅ GOOD: Type-safe props
export interface BackendStackProps extends StackProps {
  userPool: cognito.UserPool;
  table: dynamodb.TableV2;
}

// In app:
const backendStack = new BackendStack(app, "BackendStack", {
  userPool: authStack.userPool,
  table: databaseStack.table,
});

// ❌ AVOID: CfnOutput/Exports (string-based, breaks on rename)
```

**3. Environment-Specific Resources**

```typescript
// ✅ GOOD: Suffix resources with environment
const environment = this.node.tryGetContext("environment") || "dev";

new lambda.Function(this, "CreateFunction", {
  functionName: `leetcode-tracker-create-${environment}`,
  // ...
});

// ❌ AVOID: Hardcoded names (conflicts in multi-env)
```

**4. NodejsFunction for Lambda**

```typescript
// ✅ GOOD: Auto-bundles with esbuild
new lambda.NodejsFunction(this, "CreateHandler", {
  entry: "../apps/backend/src/handlers/create.ts",
  handler: "handler",
  bundling: {
    minify: true,
    sourceMap: true,
    externalModules: ["@aws-sdk/*"],
  },
});

// ❌ AVOID: Manual bundling with lambda.Code.fromAsset
```

**5. Removal Policies**

```typescript
// ✅ GOOD: Explicit removal policies
new dynamodb.TableV2(this, "Table", {
  removalPolicy: RemovalPolicy.RETAIN, // Prod: RETAIN, Dev: DESTROY
});

// ⚠️ WARNING: Default is RETAIN (leaves resources on destroy)
```

---

### TypeScript Best Practices

**1. Strict Mode Configuration**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true, // Enable all strict checks
    "noUncheckedIndexedAccess": true, // Array access safety
    "noImplicitReturns": true, // Explicit returns
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true, // Clean imports
    "skipLibCheck": true // Speed up compilation
  }
}
```

**2. Type Inference over Explicit Types**

```typescript
// ✅ GOOD: Let TypeScript infer
const trackers = await queryTrackers();
const count = trackers.length;

// ❌ AVOID: Unnecessary annotations
const trackers: Tracker[] = await queryTrackers();
const count: number = trackers.length;
```

**3. Use Zod for Runtime Validation**

```typescript
// ✅ GOOD: Runtime + compile-time safety
const TrackerSchema = z.object({
  problem: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

type Tracker = z.infer<typeof TrackerSchema>;

// ❌ AVOID: TypeScript types only (no runtime validation)
```

**4. Prefer `unknown` over `any`**

```typescript
// ✅ GOOD: Forces type checking
function parseJSON(input: string): unknown {
  return JSON.parse(input);
}

const data = parseJSON('{"name": "test"}');
// Must check type before using
if (typeof data === "object" && data !== null) {
  // safe to use
}

// ❌ AVOID: any disables type checking
```

**5. Lambda Handler Types**

```typescript
// ✅ GOOD: Explicit AWS Lambda types
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // TypeScript knows event.body, event.headers, etc.
};
```

---

### React 19 Best Practices

**1. Server Components (New in React 19)**

```tsx
// ✅ GOOD: Default to Server Components
export default async function TrackerList() {
  const trackers = await fetchTrackers(); // Runs on server

  return (
    <div>
      {trackers.map((tracker) => (
        <TrackerCard key={tracker.id} tracker={tracker} />
      ))}
    </div>
  );
}

// Only use 'use client' when needed:
// - Event handlers (onClick, onChange)
// - State (useState, useReducer)
// - Effects (useEffect)
// - Browser APIs (window, localStorage)
```

**2. Actions (New in React 19)**

```tsx
// ✅ GOOD: Use actions for mutations
"use client";

import { useActionState } from "react";

async function createTracker(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const validated = CreateTrackerSchema.parse(data);

  await api.createTracker(validated);
  return { success: true };
}

export function TrackerForm() {
  const [state, action, isPending] = useActionState(createTracker, null);

  return (
    <form action={action}>
      <input name="problem" required />
      <button disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

**3. Use Transitions for Non-Urgent Updates**

```tsx
// ✅ GOOD: Keep UI responsive
import { useTransition } from "react";

function SearchBar() {
  const [isPending, startTransition] = useTransition();

  const handleSearch = (query: string) => {
    startTransition(() => {
      // Non-urgent update (doesn't block typing)
      setFilteredTrackers(filterTrackers(query));
    });
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

**4. Optimistic Updates with `useOptimistic`**

```tsx
// ✅ GOOD: Instant UI feedback
import { useOptimistic } from "react";

function TrackerList({ trackers }) {
  const [optimisticTrackers, addOptimistic] = useOptimistic(
    trackers,
    (state, newTracker) => [...state, newTracker],
  );

  async function handleCreate(data) {
    addOptimistic(data); // UI updates instantly
    await api.createTracker(data); // Then sync with server
  }
}
```

---

### Zustand Best Practices

**1. Slice Pattern for Large Stores**

```typescript
// ✅ GOOD: Separate slices
import { create } from "zustand";

interface AuthSlice {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface UISlice {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

type Store = AuthSlice & UISlice;

const useStore = create<Store>((set, get) => ({
  // Auth slice
  user: null,
  login: async (email, password) => {
    const user = await authService.login(email, password);
    set({ user });
  },
  logout: () => set({ user: null }),

  // UI slice
  theme: "light",
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));

// ❌ AVOID: Giant monolithic store
```

**2. Persist State (Optional)**

```typescript
// ✅ GOOD: Persist auth state
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({ token: state.token }), // Only persist token
    },
  ),
);
```

**3. Computed Values with Selectors**

```typescript
// ✅ GOOD: Derive state in selectors
const useStore = create<Store>((set) => ({
  trackers: [],
  addTracker: (tracker) => set(state => ({
    trackers: [...state.trackers, tracker]
  })),
}));

// Use in components
function Stats() {
  const solvedCount = useStore(state =>
    state.trackers.filter(t => t.status === 'Solved').length
  );

  return <div>Solved: {solvedCount}</div>;
}

// ❌ AVOID: Storing derived state
```

**4. Immer for Complex Updates**

```typescript
// ✅ GOOD: Use immer middleware for nested updates
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useStore = create(
  immer<State>((set) => ({
    trackers: [],
    updateTracker: (id, updates) =>
      set((state) => {
        const tracker = state.trackers.find((t) => t.id === id);
        if (tracker) {
          Object.assign(tracker, updates); // Mutate directly with immer
        }
      }),
  })),
);
```

---

### TanStack Query Best Practices

**1. Query Keys Pattern**

```typescript
// ✅ GOOD: Structured query keys
const queryKeys = {
  trackers: {
    all: ["trackers"] as const,
    lists: () => [...queryKeys.trackers.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.trackers.lists(), { filters }] as const,
    details: () => [...queryKeys.trackers.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.trackers.details(), id] as const,
  },
};

// Usage
const { data } = useQuery({
  queryKey: queryKeys.trackers.detail(id),
  queryFn: () => fetchTracker(id),
});
```

**2. Mutations with Optimistic Updates**

```typescript
// ✅ GOOD: Optimistic updates + rollback
const { mutate } = useMutation({
  mutationFn: createTracker,
  onMutate: async (newTracker) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["trackers"] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["trackers"]);

    // Optimistically update
    queryClient.setQueryData(["trackers"], (old: Tracker[]) => [
      ...old,
      newTracker,
    ]);

    return { previous }; // Context for rollback
  },
  onError: (err, newTracker, context) => {
    // Rollback on error
    queryClient.setQueryData(["trackers"], context?.previous);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["trackers"] });
  },
});
```

**3. Prefetching**

```typescript
// ✅ GOOD: Prefetch on hover for instant navigation
function TrackerCard({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const prefetchDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['trackers', id],
      queryFn: () => fetchTracker(id),
      staleTime: 10000, // Cache for 10s
    });
  };

  return (
    <Link
      to={`/trackers/${id}`}
      onMouseEnter={prefetchDetails} // Prefetch on hover
    >
      View Details
    </Link>
  );
}
```

**4. Polling with Auto-Pause**

```typescript
// ✅ GOOD: Poll only when tab is visible
const { data } = useQuery({
  queryKey: ["trackers"],
  queryFn: fetchTrackers,
  refetchInterval: 30000, // Poll every 30s
  refetchIntervalInBackground: false, // Pause when tab hidden
});
```

---

### React Router v7 Best Practices

**1. File-Based Routing**

```
app/routes/
├── _index.tsx           → /
├── login.tsx            → /login
├── trackers.tsx         → /trackers (layout)
├── trackers._index.tsx  → /trackers (index)
├── trackers.$id.tsx     → /trackers/:id
└── trackers.$id.edit.tsx → /trackers/:id/edit
```

**2. Loaders for Data Fetching**

```typescript
// ✅ GOOD: Fetch data before rendering
import { useLoaderData } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  const tracker = await fetchTracker(params.id);
  if (!tracker) throw new Response('Not Found', { status: 404 });
  return tracker;
}

export default function TrackerDetail() {
  const tracker = useLoaderData<typeof loader>();
  return <div>{tracker.problem}</div>;
}
```

**3. Actions for Mutations**

```typescript
// ✅ GOOD: Handle form submissions
import { redirect } from 'react-router';

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const validated = CreateTrackerSchema.parse(data);
  const tracker = await createTracker(validated);

  return redirect(`/trackers/${tracker.id}`);
}

export default function NewTracker() {
  return (
    <form method="post">
      <input name="problem" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

**4. Protected Routes**

```typescript
// ✅ GOOD: Auth check in loader
export async function loader() {
  const user = await getCurrentUser();
  if (!user) {
    throw redirect("/login");
  }
  return null;
}
```

---

### Tailwind CSS + shadcn/ui Best Practices

**1. shadcn/ui Component Installation**

```bash
# ✅ GOOD: Install components as needed (not a dependency)
pnpx shadcn@latest add button
pnpx shadcn@latest add form
pnpx shadcn@latest add dialog

# Components are copied to src/components/ui/
# You own the code, can customize freely
```

**2. Tailwind Configuration**

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theme switching
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

**3. Component Composition**

```tsx
// ✅ GOOD: Compose shadcn components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function DeleteConfirm({ onDelete }: { onDelete: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <p>Are you sure?</p>
        <Button onClick={onDelete}>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
}
```

**4. Custom Utility Classes**

```css
/* ✅ GOOD: Use @layer for custom utilities */
@layer components {
  .card {
    @apply rounded-lg border bg-card text-card-foreground shadow-sm;
  }

  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
}
```

---

### Zod Validation Best Practices

**1. Shared Schemas**

```typescript
// ✅ GOOD: Define once, use everywhere
// packages/shared-types/src/tracker.ts
export const CreateTrackerSchema = z.object({
  problem: z.string().min(1, "Problem name required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  status: z.enum(["Solved", "Attempted", "To Review"]),
  notes: z.string().optional(),
  attempts: z.number().int().min(0).default(0),
  timeSpent: z.number().int().min(0).default(0),
});

export type CreateTrackerInput = z.infer<typeof CreateTrackerSchema>;

// Used in:
// - Backend Lambda handlers (validation)
// - Frontend forms (react-hook-form integration)
// - API client (type safety)
```

**2. React Hook Form Integration**

```tsx
// ✅ GOOD: Zod + react-hook-form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";

export function TrackerForm() {
  const form = useForm({
    resolver: zodResolver(CreateTrackerSchema),
    defaultValues: {
      problem: "",
      difficulty: "Easy" as const,
      status: "Solved" as const,
      attempts: 0,
      timeSpent: 0,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    // data is fully typed and validated
    await createTracker(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("problem")} />
      {form.formState.errors.problem && (
        <span>{form.formState.errors.problem.message}</span>
      )}
      <button type="submit">Create</button>
    </form>
  );
}
```

**3. Transform and Refine**

```typescript
// ✅ GOOD: Transform input + custom validation
const FormSchema = z
  .object({
    email: z.string().email().toLowerCase().trim(),
    age: z.string().transform((val) => parseInt(val, 10)),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

---

### AWS Amplify v6 Best Practices

**1. Configuration**

```typescript
// ✅ GOOD: Configure once at app entry
// src/lib/amplify.ts
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: import.meta.env.VITE_COGNITO_REGION,
    },
  },
});
```

**2. Auth Hooks**

```typescript
// ✅ GOOD: Custom hook for auth state
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch {
        return null;
      }
    },
    staleTime: Infinity, // Cache until logout
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      await signIn({ username: email, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: () => signOut(),
  };
}
```

**3. Fetching with Auth Token**

```typescript
// ✅ GOOD: Auto-inject auth token
import { fetchAuthSession } from "aws-amplify/auth";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export const api = {
  createTracker: async (data: CreateTrackerInput) => {
    const response = await fetchWithAuth(`${API_URL}/trackers`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create tracker");
    return response.json();
  },
};
```

---

## Recommended Package Versions (2025)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "zod": "^3.23.8",
    "aws-amplify": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@hookform/resolvers": "^3.9.0",
    "react-hook-form": "^7.53.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vite": "^7.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

---

## Architecture Decision Records (ADRs)

### Why Zustand over Redux/Context?

**Zustand wins because:**

- ✅ **Simpler:** 1/10th the boilerplate of Redux
- ✅ **Faster:** No Context re-render issues
- ✅ **Smaller:** 1KB minified (Redux is 8KB+)
- ✅ **TypeScript:** Perfect inference, no manual typing
- ✅ **DevTools:** Built-in Redux DevTools support
- ✅ **Flexible:** Can use with/without React

### Why TanStack Query over SWR/Apollo?

**TanStack Query wins because:**

- ✅ **Most popular:** 42k+ stars, industry standard
- ✅ **Feature-rich:** Pagination, infinite scroll, prefetching
- ✅ **Offline:** Built-in offline support
- ✅ **DevTools:** Best-in-class debugging
- ✅ **Framework agnostic:** Works with React, Vue, Svelte

### Why shadcn/ui over Material-UI/Chakra?

**shadcn/ui wins because:**

- ✅ **You own the code:** Copy components, customize freely
- ✅ **Unstyled:** Full control with Tailwind
- ✅ **Accessible:** Built on Radix UI primitives
- ✅ **Tree-shakeable:** Only bundle what you use
- ✅ **Modern:** Built for 2025+ (RSC, App Router)

### Why React Router v7 over Next.js?

**React Router v7 wins for this project because:**

- ✅ **SPA-first:** We're deploying to S3+CloudFront (not Vercel)
- ✅ **File-based routing:** Same DX as Next.js App Router
- ✅ **Framework-agnostic:** Can add SSR later if needed
- ✅ **Smaller bundle:** No server runtime needed
- ✅ **Backend separate:** API is AWS Lambda, not Next.js API routes

---

## Useful Links

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Zod Documentation](https://zod.dev/)
- [DynamoDB SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/)
- [Turborepo Docs](https://turbo.build/repo/docs)
