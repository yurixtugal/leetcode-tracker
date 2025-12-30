# @leetcode-tracker/web

Frontend application for LeetCode Progress Tracker built with React, Vite, and TypeScript.

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **TypeScript 5.9** - Type safety
- **Tailwind CSS** - Styling (to be configured)
- **AWS Amplify** - Cognito auth integration (to be configured)

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

## Project Structure

```
src/
├── pages/          # Page components
├── components/     # Reusable components
├── services/       # API client and services
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── App.tsx         # Root component
└── main.tsx        # Entry point
```

## Features (Planned)

- Dashboard with statistics
- Problem list with filters
- Add/Edit problem forms
- Authentication with AWS Cognito
- Progress visualizations with charts

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=https://your-api-gateway-url
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```

## Notes

This is part of a Turborepo monorepo. Dependencies are managed from the root level with pnpm workspaces.
