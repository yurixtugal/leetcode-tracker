# LeetCode Progress Tracker

Serverless system to track your LeetCode progress while practicing for technical interviews.

## Tech Stack

- **Frontend:** React 19 + Vite 7 + TypeScript
- **Backend:** AWS Lambda (Node.js 20 + TypeScript)
- **Infrastructure:** AWS CDK v2 (TypeScript)
- **Database:** DynamoDB (Single-table design)
- **Validation:** Zod v3.23.8 (Runtime validation)
- **Auth:** AWS Cognito (JWT tokens)
- **Monorepo:** Turborepo + pnpm 9.0.0

## Project Structure

```
tracker-gym/
├── apps/
│   ├── web/              # React + Vite frontend (pending)
│   └── backend/          # Lambda handlers (TypeScript)
│       └── src/handlers/
│           ├── create-tracker.ts
│           ├── list-trackers.ts
│           ├── get-tracker.ts
│           ├── update-tracker.ts
│           └── delete-tracker.ts
├── infra/                # AWS CDK stacks
│   ├── bin/infra.ts
│   └── lib/
│       ├── auth-stack.ts       # Cognito User Pool
│       ├── database-stack.ts   # DynamoDB TableV2
│       ├── backend-stack.ts    # API Gateway + Lambdas
│       └── stack-props.ts      # Shared props interface
├── packages/
│   └── shared-types/     # Zod schemas + TypeScript types
│       ├── src/
│       │   ├── index.ts
│       │   └── tracker.ts
│       └── package.json
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # pnpm workspaces
```

## Requirements

- Node.js >= 18
- pnpm 9.0.0
- AWS CLI configured
- AWS Account with credentials

## Installation

```bash
# Clone repository
git clone git@github.com:yurixtugal/leetcode-tracker.git
cd tracker-gym

# Install all dependencies
pnpm install

# Bootstrap AWS CDK (first time only)
cd infra
npx cdk bootstrap
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

### `apps/backend`

Lambda functions for REST API with full CRUD operations.

**Stack:** TypeScript, AWS SDK v3, Zod validation

**Handlers:**

- `create-tracker.ts` - POST /trackers (with Zod validation)
- `list-trackers.ts` - GET /trackers
- `get-tracker.ts` - GET /trackers/{id}
- `update-tracker.ts` - PUT /trackers/{id} (with Zod validation)
- `delete-tracker.ts` - DELETE /trackers/{id}

**Features:**

- Runtime validation with Zod
- DynamoDB integration
- Cognito JWT authentication
- Error handling with structured responses

### `apps/web`

Frontend with React + Vite. Dashboard to visualize progress, CRUD operations for trackers.

**Stack:** React 19, Vite 7, TypeScript

**Status:** 🚧 Pending implementation

**Scripts:**

- `pnpm dev` - Dev server at http://localhost:5173
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint

### `infra`

Infrastructure as Code with AWS CDK v2.

**Stacks:**

- `AuthStack` - Cognito User Pool + Client
- `DatabaseStack` - DynamoDB TableV2 (single-table design)
- `BackendStack` - API Gateway + 5 Lambda Functions (NodejsFunction with esbuild)

**Commands:**

```bash
cd infra

# Deploy all stacks
npx cdk deploy --all

# Deploy specific stack
npx cdk deploy BackendStack

# See changes before deploy
npx cdk diff BackendStack

# Destroy stacks
npx cdk destroy --all
```

### `packages/shared-types`

Shared Zod schemas and TypeScript types between frontend and backend.

**Features:**

- Zod schemas for runtime validation
- Type inference for TypeScript
- Shared between backend handlers and frontend forms
- Single source of truth for data validation

**Schemas:**

- `CreateTrackerSchema` - Validation for creating trackers
- `UpdateTrackerSchema` - Partial validation for updates
- `TrackerSchema` - Full entity with DynamoDB keys
- `DifficultyEnum` - "Easy" | "Medium" | "Hard"
- `StatusEnum` - "Solved" | "Attempted" | "To Review"

## Deploy

```bash
# Deploy to development (default)
cd infra
npx cdk deploy --all

# Deploy to production
npx cdk deploy --all -c environment=prod

# Deploy specific stack
npx cdk deploy BackendStack
```

## Architecture

```
┌─────────────────┐
│   Frontend      │ (React + Vite - Pending)
│   S3 + CF       │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │ (REST API)
│  + Cognito Auth │ (JWT Authorizer)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   5 Lambdas     │ (NodejsFunction + esbuild)
│   Node.js 20    │ (Zod validation + DynamoDB SDK)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DynamoDB      │ (Single-table design)
│   On-demand     │ (PK: USER#id, SK: TRACK#id)
└─────────────────┘
```

### Data Flow

1. **Authentication**: User logs in via Cognito → Receives JWT token
2. **API Request**: Frontend sends request with `Authorization: Bearer <token>`
3. **Authorization**: API Gateway validates JWT with Cognito
4. **Validation**: Lambda validates request body with Zod schemas
5. **Database**: Lambda performs CRUD operation on DynamoDB
6. **Response**: Structured JSON response (400 for validation errors, 201/200 for success)

## Features

### ✅ Completed (Backend)

- ✅ Authentication with AWS Cognito (JWT tokens)
- ✅ CRUD operations for LeetCode trackers (DynamoDB)
- ✅ Runtime validation with Zod schemas
- ✅ Multi-environment support (dev/prod)
- ✅ API Gateway with Cognito Authorizer
- ✅ Lambda bundling with esbuild (optimized)
- ✅ Single-table DynamoDB design
- ✅ Structured error responses (400 for validation, 401 for auth)

### 🚧 In Progress (Frontend)

- 🚧 Dashboard with statistics
- 🚧 Tracker list with filters (difficulty, status)
- 🚧 Add/Edit tracker forms with Zod validation
- 🚧 Progress visualizations
- 🚧 Cognito authentication flow

## Current Status

**Backend:** 100% Complete ✅  
**Frontend:** 0% Complete 🚧  
**Infrastructure:** 100% Complete ✅

## API Endpoints

Base URL: `https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/`

All endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

### Create Tracker

```bash
POST /trackers
Content-Type: application/json

{
  "problem": "Two Sum",
  "difficulty": "Easy",
  "status": "Solved",
  "notes": "Used hash map approach",
  "attempts": 1,
  "timeSpent": 30
}
```

### List Trackers

```bash
GET /trackers
```

### Get Tracker

```bash
GET /trackers/{trackerId}
```

### Update Tracker

```bash
PUT /trackers/{trackerId}
Content-Type: application/json

{
  "status": "To Review",
  "notes": "Need to optimize solution"
}
```

### Delete Tracker

```bash
DELETE /trackers/{trackerId}
```

### Delete Tracker

```bash
DELETE /trackers/{trackerId}
```

## Environment Variables

### Backend (Lambda)

Set automatically by CDK:

- `TABLE_NAME` - DynamoDB table name

### Frontend (Vite - Pending)

Create `.env.local` in `apps/web/`:

```env
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/
VITE_COGNITO_USER_POOL_ID=<region>_<pool-id>
VITE_COGNITO_CLIENT_ID=<client-id>
VITE_COGNITO_REGION=us-east-1
```

## Testing

### Test User Credentials

- Email: `testuser@example.com`
- Password: `TestPass123!`

### Login with AWS CLI

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <client-id> \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPass123! \
  --query 'AuthenticationResult.IdToken' \
  --output text
```

### Test API with curl

```bash
# Get token
TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <client-id> \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPass123! \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Create tracker
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/trackers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"problem":"Two Sum","difficulty":"Easy","status":"Solved"}'

# List trackers
curl -H "Authorization: Bearer $TOKEN" \
  https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/trackers
```

## AWS Resources

### Deployed Resources

- **Region:** us-east-1
- **Account:** <account-id>
- **User Pool:** `leetcode-tracker-users-dev` (<region>_<pool-id>)
- **DynamoDB Table:** `leetcode-trackers-dev`
- **API Gateway:** <api-id>
- **Lambda Functions:** 5 (create, list, get, update, delete)

### CloudFormation Stacks

- `AuthStack` - Cognito resources
- `DatabaseStack` - DynamoDB table
- `BackendStack` - API Gateway + Lambdas

## Contributing

This is a personal portfolio project. Not accepting contributions at this time.

## License

MIT
