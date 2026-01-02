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

**Purpose:** React frontend (UI pending implementation)  
**Stack:** React 19 + Vite 7 + TypeScript

**Status:** 🚧 Infrastructure deployed (S3 + CloudFront), UI at 0%

**Common Tasks:**

```bash
pnpm --filter @leetcode-tracker/web dev    # http://localhost:5173
pnpm --filter @leetcode-tracker/web build
```

**Next Steps:**

- Implement Cognito authentication flow
- Build dashboard with tracker list
- Add forms using Zod schemas from `shared-types`

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

## Useful Links

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Zod Documentation](https://zod.dev/)
- [DynamoDB SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/)
- [Turborepo Docs](https://turbo.build/repo/docs)
