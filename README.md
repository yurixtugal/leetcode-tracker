# LeetCode Progress Tracker

Serverless system to track your LeetCode progress while practicing for technical interviews.

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** AWS Lambda (Node.js/TypeScript)
- **Infrastructure:** AWS CDK
- **Database:** DynamoDB
- **Auth:** AWS Cognito
- **Monorepo:** Turborepo + pnpm

## Project Structure

```
leetcode-tracker/
├── apps/
│   ├── web/           # React + Vite frontend
│   └── backend/       # Lambda handlers
├── infra/             # AWS CDK stacks
├── packages/
│   └── shared-types/  # Shared TypeScript types
├── turbo.json         # Turborepo config
└── pnpm-workspace.yaml
```

## Requirements

- Node.js >= 18
- pnpm 9.0.0

## Installation

```bash
# Clone repository
git clone <repo-url>
cd leetcode-tracker

# Install all dependencies
pnpm install
```

## Development Commands

### Development
```bash
# Start all dev servers
pnpm dev

# Frontend only
pnpm --filter @leetcode-tracker/web dev

# Backend only
pnpm --filter @leetcode-tracker/backend dev
```

### Build
```bash
# Build everything
pnpm build

# Build specific workspace
pnpm --filter @leetcode-tracker/web build
```

### Linting
```bash
# Lint everything
pnpm lint

# Lint specific workspace
pnpm --filter @leetcode-tracker/web lint
```

### Format
```bash
# Format code with Prettier
pnpm format
```

## Workspaces

### `apps/web`
Frontend with React + Vite. Dashboard to visualize progress, CRUD operations for problems.

**Stack:** React 19, Vite 7, TypeScript, Tailwind CSS

**Scripts:**
- `pnpm dev` - Dev server at http://localhost:5173
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint

### `apps/backend`
Lambda functions for REST API.

**Stack:** TypeScript, AWS SDK

**Handlers:**
- `createProblem` - POST /problems
- `listProblems` - GET /problems
- `getProblem` - GET /problems/{id}
- `updateProblem` - PUT /problems/{id}
- `deleteProblem` - DELETE /problems/{id}

### `infra`
Infrastructure as Code with AWS CDK.

**Stacks:**
- `AuthStack` - Cognito User Pool
- `DatabaseStack` - DynamoDB + GSIs
- `BackendStack` - Lambda + API Gateway
- `FrontendStack` - S3 + CloudFront

### `packages/shared-types`
Shared TypeScript types between frontend and backend.

## Deploy

```bash
# Dev environment
pnpm deploy:dev

# Production
pnpm deploy
```

## Architecture

```
┌─────────────┐
│  Frontend   │ (S3 + CloudFront)
│  React +    │
│  Vite       │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│ API Gateway │ (REST API + Cognito Auth)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5 Lambdas  │ (TypeScript handlers)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DynamoDB   │ (NoSQL + GSIs)
└─────────────┘
```

## Features

- ✅ Authentication with Cognito
- ✅ CRUD operations for LeetCode problems
- ✅ Dashboard with statistics
- ✅ Filters by difficulty and category
- ✅ Progress visualizations
- ✅ 100% serverless architecture

## License

MIT
