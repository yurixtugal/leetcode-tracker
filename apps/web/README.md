# @leetcode-tracker/web

Frontend application for LeetCode Progress Tracker built with React, Vite, and TypeScript.

## Status

🚧 **Work in Progress** - Frontend not yet implemented. Currently showing Vite template.

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **TypeScript 5.9** - Type safety
- **Tailwind CSS** - Styling (to be configured)
- **AWS Amplify** - Cognito auth integration (to be configured)
- **@leetcode-tracker/shared-types** - Zod schemas for validation

## Development

```bash
# Start dev server (from root)
pnpm --filter @leetcode-tracker/web dev

# Or from this directory
pnpm dev
```

Server runs at http://localhost:5173

## Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Linting

```bash
# Run ESLint
pnpm lint
```

## Planned Project Structure

```
src/
├── pages/          # Page components
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   └── TrackerList.tsx
├── components/     # Reusable components
│   ├── TrackerCard.tsx
│   ├── TrackerForm.tsx
│   └── ProtectedRoute.tsx
├── services/       # API client and services
│   ├── api.ts      # Axios/fetch wrapper
│   ├── auth.ts     # Cognito auth methods
│   └── trackers.ts # Tracker CRUD operations
├── hooks/          # Custom React hooks
│   ├── useAuth.ts
│   ├── useTrackers.ts
│   └── useForm.ts
├── types/          # TypeScript type definitions
│   └── index.ts    # Re-export from shared-types
├── lib/            # Utilities
│   ├── cognito.ts  # Amplify config
│   └── validation.ts # Zod validation helpers
├── App.tsx         # Root component with routing
└── main.tsx        # Entry point
```

## Features (To Be Implemented)

### Phase 1: Authentication

- [ ] Login page with Cognito
- [ ] Signup page with Cognito
- [ ] JWT token management
- [ ] Protected routes
- [ ] Logout functionality

### Phase 2: Dashboard

- [ ] Dashboard with statistics
  - Total problems solved
  - Breakdown by difficulty
  - Breakdown by status
  - Time spent statistics

### Phase 3: Tracker CRUD

- [ ] Tracker list with filters
  - Filter by difficulty
  - Filter by status
  - Search by problem name
- [ ] Add tracker form (with Zod validation)
- [ ] Edit tracker form (with Zod validation)
- [ ] Delete tracker confirmation
- [ ] Optimistic UI updates

### Phase 4: Polish

- [ ] Loading states
- [ ] Error handling with toast notifications
- [ ] Responsive design (mobile-first)
- [ ] Dark mode toggle
- [ ] Progress visualizations (charts)

## Environment Variables

Create a `.env.local` file in this directory:

```env
# API Configuration
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/

# Cognito Configuration
VITE_COGNITO_USER_POOL_ID=<region>_<pool-id>
VITE_COGNITO_CLIENT_ID=<client-id>
VITE_COGNITO_REGION=us-east-1
```

## Dependencies to Install

### Core Libraries

```bash
pnpm add aws-amplify @aws-amplify/ui-react
pnpm add react-router-dom
pnpm add axios
pnpm add @tanstack/react-query
```

### Form & Validation

```bash
pnpm add react-hook-form
pnpm add @hookform/resolvers
# Zod already in shared-types workspace
```

### UI Components

```bash
pnpm add tailwindcss postcss autoprefixer
pnpm add lucide-react # Icons
pnpm add sonner # Toast notifications
pnpm add recharts # Charts for statistics
```

## Usage with Backend

### 1. Authentication Flow

```typescript
// src/services/auth.ts
import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";

// Login
const user = await signIn({ username, password });

// Get JWT token
const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();
```

### 2. API Calls

```typescript
// src/services/api.ts
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";

const createTracker = async (data: unknown) => {
  // Validate with Zod before sending
  const validated = CreateTrackerSchema.parse(data);

  const response = await fetch(`${API_URL}/trackers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validated),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### 3. Form Validation

```typescript
// src/components/TrackerForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";

const form = useForm({
  resolver: zodResolver(CreateTrackerSchema),
  defaultValues: {
    problem: "",
    difficulty: "Easy",
    status: "Solved",
    notes: "",
    attempts: 0,
    timeSpent: 0,
  },
});
```

## Testing User

Use these credentials for testing:

- **Email:** testuser@example.com
- **Password:** TestPass123!

## Notes

- This is part of a Turborepo monorepo
- Dependencies are managed from the root level with pnpm workspaces
- Shared types from `@leetcode-tracker/shared-types` are automatically available
- Backend API requires authentication (JWT token in Authorization header)

## Next Steps

1. Install dependencies (Amplify, React Router, etc.)
2. Configure Amplify with Cognito credentials
3. Create authentication pages (Login/Signup)
4. Build Dashboard with statistics
5. Implement Tracker CRUD UI
6. Add form validation with Zod schemas
7. Style with Tailwind CSS
8. Deploy to S3 + CloudFront

## Resources

- [AWS Amplify Docs](https://docs.amplify.aws/react/)
- [React Router Docs](https://reactrouter.com/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## License

MIT
