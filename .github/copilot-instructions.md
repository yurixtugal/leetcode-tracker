# GitHub Copilot Instructions - LeetCode Tracker

## Project Context

**LeetCode Progress Tracker** - Serverless application for tracking coding interview practice.

## Stack

- React 19 + Vite 7 + TypeScript
- AWS Lambda + API Gateway + Cognito + DynamoDB
- AWS CDK v2 for infrastructure
- Zod for runtime validation
- Turborepo + pnpm monorepo

## Workspaces

1. `apps/backend` - Lambda handlers (TypeScript + Zod + DynamoDB)
2. `apps/web` - React frontend (UI pending)
3. `infra` - AWS CDK stacks
4. `packages/shared-types` - Zod schemas + types

## Commands

```bash
pnpm install                              # Install all
pnpm dev                                  # Dev mode
pnpm --filter @leetcode-tracker/web dev  # Frontend dev
cd infra && npx cdk deploy --all         # Deploy AWS
```

## Code Style

- **TypeScript:** Strict mode, explicit types
- **Validation:** Zod for all inputs
- **AWS:** SDK v3 with modular imports
- **React:** Functional components only
- **Errors:** Structured responses with status codes

## Guidelines

- Validate all request bodies with Zod before database operations
- Use `event.requestContext.authorizer.claims.sub` for user ID
- Return proper HTTP status codes (400, 401, 404, 500)
- Follow single-table DynamoDB design (PK: USER#id, SK: TRACK#id)
- Use CloudFront URL for CORS configuration

## API Endpoints

Base: `https://<API_ID>.execute-api.us-east-1.amazonaws.com/<STAGE>/`
Auth: `Authorization: Bearer <JWT_TOKEN>`

- POST /trackers
- GET /trackers
- GET /trackers/{id}
- PUT /trackers/{id}
- DELETE /trackers/{id}

## Current Status

✅ Backend: 100%
✅ Infrastructure: 100%
🚧 Frontend UI: 0%

## Next Tasks

1. Implement Cognito auth flow
2. Build dashboard UI
3. Create forms with Zod validation
4. Add filters and charts

## Important

- Never commit credentials or `.env` files
- Always test CDK changes with `npx cdk diff`
- Use Zod schemas from `shared-types` package
- Follow AWS best practices for Lambda and DynamoDB
