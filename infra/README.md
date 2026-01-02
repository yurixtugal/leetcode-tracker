# Infrastructure - LeetCode Tracker

AWS CDK infrastructure for LeetCode Progress Tracker.

## Overview

This directory contains AWS CDK v2 code to deploy the complete serverless infrastructure.

## Tech Stack

- **AWS CDK:** v2 (TypeScript)
- **Node.js:** 20
- **TypeScript:** 5.9
- **esbuild:** For Lambda bundling

## Architecture

```
┌──────────────────┐
│   AuthStack      │ → Cognito User Pool + Client
└──────────────────┘

┌──────────────────┐
│ DatabaseStack    │ → DynamoDB TableV2 (single-table)
└──────────────────┘

┌──────────────────┐
│ FrontendStack    │ → S3 Bucket + CloudFront Distribution
│                  │   (Static website hosting with OAC)
└──────────────────┘

┌──────────────────┐
│  BackendStack    │ → API Gateway + 5 Lambda Functions + CORS
│                  │   (NodejsFunction with esbuild bundling)
└──────────────────┘
```

## Stacks

### 1. AuthStack

**Purpose:** Authentication with AWS Cognito

**Resources:**

- Cognito User Pool: `leetcode-tracker-users-{env}`
- User Pool Client: `leetcode-tracker-web-client-{env}`

**Configuration:**

- Email-based sign-in
- Self sign-up enabled
- Password policy: min 8 chars (lowercase, uppercase, digits, symbols)
- Auto-verify email
- RemovalPolicy: RETAIN (protects user data)

**Exports:**

- `userPool` - Shared with BackendStack for authorizer

---

### 2. DatabaseStack

**Purpose:** Data persistence with DynamoDB

**Resources:**

- DynamoDB TableV2: `leetcode-trackers-{env}`

**Configuration:**

- **Keys:**
  - Partition Key (PK): String - `USER#<userId>`
  - Sort Key (SK): String - `TRACK#<trackerId>`
- Billing: On-demand (auto-scaling)
- Point-in-time recovery: Enabled
- RemovalPolicy: RETAIN (protects data)

**Single-table Design:**

```
PK                  SK                          Attributes
USER#<userId>      TRACK#<trackerId>           problem, difficulty, status, ...
```

**Exports:**

- `tableName` - Passed to Lambda environment variables
- `tableArn` - For IAM permissions

---

### 3. FrontendStack

**Purpose:** Static website hosting with S3 + CloudFront

**Resources:**

- S3 Bucket: `leetcode-tracker-web-{env}`
- CloudFront Distribution with Origin Access Control (OAC)

**Configuration:**

- **S3 Bucket:**
  - Website hosting enabled (`index.html` for SPA)
  - Block all public access (CloudFront handles access via OAC)
  - Auto-delete objects on stack deletion (dev only)
  - RemovalPolicy: DESTROY (careful in prod!)

- **CloudFront Distribution:**
  - HTTPS redirect (ViewerProtocolPolicy.REDIRECT_TO_HTTPS)
  - Price Class: PRICE_CLASS_100 (USA, Canada, Europe)
  - Default root object: `index.html`
  - Error responses: 404/403 → `/index.html` (React Router support)
  - Origin Access Control (OAC) - more secure than OAI
  - Cache policy: GET_HEAD_OPTIONS only

- **Automatic Deployment:**
  - Deploys `apps/web/dist` to S3 on every `cdk deploy`
  - Invalidates CloudFront cache automatically (`/*`)

**Exports:**

- `distribution` - CloudFront distribution (passed to BackendStack for CORS)
- `distributionDomainName` - CloudFront URL

**Output:**

```
CloudFrontURL: <distribution-id>.cloudfront.net
```

---

### 4. BackendStack

**Purpose:** API + Lambda handlers

**Resources:**

- **API Gateway REST API:** `LeetCode Tracker API ({env})`
- **5 Lambda Functions** (NodejsFunction with esbuild):
  1. `leetcode-tracker-create-{env}` - POST /trackers
  2. `leetcode-tracker-list-{env}` - GET /trackers
  3. `leetcode-tracker-get-{env}` - GET /trackers/{id}
  4. `leetcode-tracker-update-{env}` - PUT /trackers/{id}
  5. `leetcode-tracker-delete-{env}` - DELETE /trackers/{id}
- **Cognito Authorizer:** Validates JWT tokens on all endpoints

**Lambda Configuration:**

- Runtime: Node.js 20
- Timeout: 10 seconds
- Bundling: esbuild (minify, source maps, ES2020)
- Environment: `TABLE_NAME` from DatabaseStack
- Permissions: DynamoDB read/write via IAM role

**esbuild Configuration:**

```typescript
{
  minify: true,
  sourceMap: true,
  target: 'es2020',
  format: OutputFormat.CJS,
  mainFields: ['module', 'main'],
  externalModules: ['aws-sdk'],
}
```

**API Endpoints:**

- `POST /trackers` → CreateTrackerFunction (Zod validation)
- `GET /trackers` → ListTrackersFunction
- `GET /trackers/{id}` → GetTrackerFunction
- `PUT /trackers/{id}` → UpdateTrackerFunction (Zod validation)
- `DELETE /trackers/{id}` → DeleteTrackerFunction

**CORS Configuration:**

- Dynamic origin from FrontendStack CloudFront URL
- Localhost support for development (`http://localhost:5173`)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Amz-\*
- Credentials: enabled (required for Cognito JWT)

```typescript
defaultCorsPreflightOptions: {
  allowOrigins: [
    `https://${props.cloudFrontUrl}`, // Dynamic from FrontendStack
    'http://localhost:5173',          // Local development
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowCredentials: true,
}
```

---

## Multi-Environment Support

All stacks use `AppStackProps` interface with type-safe environment:

```typescript
interface AppStackProps extends StackProps {
  environment: "dev" | "prod";
  userPool?: UserPool;
  tableDynamo?: TableV2;
  cloudFrontUrl?: string; // Dynamic from FrontendStack
}
```

**Resource Naming Convention:**

```
{service}-{resource}-{environment}

Examples:
- leetcode-tracker-users-dev
- leetcode-tracker-create-prod
- leetcode-trackers-dev
```

## Commands

### Setup (First Time)

```bash
# Install dependencies
pnpm install

# Bootstrap CDK (first time only)
npx cdk bootstrap
```

### Deploy

```bash
# Deploy all stacks (dev)
npx cdk deploy --all

# Deploy specific stack
npx cdk deploy BackendStack

# Deploy to production
npx cdk deploy --all -c environment=prod

# Deploy with auto-approval
npx cdk deploy --all --require-approval never
```

### Development

```bash
# See changes before deploy
npx cdk diff BackendStack

# Synthesize CloudFormation templates
npx cdk synth

# List all stacks
npx cdk list

# Watch mode (auto-deploy on changes)
npx cdk watch BackendStack
```

### Cleanup

```bash
# Destroy all stacks (WARNING: Deletes resources)
npx cdk destroy --all

# Destroy specific stack
npx cdk destroy BackendStack
```

## Stack Dependencies

```
AuthStack (independent)
    ↓
DatabaseStack (independent)
    ↓
FrontendStack (independent)
    ↓ (provides cloudFrontUrl)
BackendStack (depends on AuthStack + DatabaseStack + FrontendStack)
```

**Important:** FrontendStack must be deployed before BackendStack because BackendStack uses the CloudFront URL for CORS configuration.

CDK automatically handles deployment order based on dependencies.

## Outputs

After deployment, important values are exported:

### AuthStack

```json
{
  "UserPoolId": "<region>_<pool-id>",
  "UserPoolClientId": "<client-id>"
}
```

### DatabaseStack

```json
{
  "TrackersTableName": "leetcode-trackers-<env>",
  "TrackersTableArn": "arn:aws:dynamodb:<region>:<account-id>:table/leetcode-trackers-<env>"
}
```

### BackendStack

```json
{
  "ApiEndpoint": "https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/"
}
```

### FrontendStack

```json
{
  "CloudFrontURL": "<distribution-id>.cloudfront.net",
  "WebsiteBucketName": "leetcode-tracker-web-<env>"
}
```

## Cost Estimation

### Development Environment (Typical Usage)

- **Cognito:** Free tier (50,000 MAUs)
- **DynamoDB:** ~$0.25/month (on-demand, light usage)
- **Lambda:** Free tier (1M requests/month)
- **API Gateway:** Free tier (1M requests/month)
- **CloudFront:** Free tier (1TB data transfer/month, 10M requests)
- **S3:** ~$0.10/month (storage + requests)
- **S3 (CDK Assets):** ~$0.10/month

**Total Estimated Cost:** ~$0.45/month (within free tier limits)

### Production Environment (Moderate Usage)

- Cognito: $0.0055 per MAU after free tier
- DynamoDB: Pay per request (on-demand)
- Lambda: $0.20 per 1M requests after free tier
- API Gateway: $3.50 per 1M requests after free tier
- CloudFront: $0.085 per GB after free tier
- S3: $0.023 per GB storage + $0.005 per 1K requests

## Troubleshooting

### CDK Bootstrap Error

```bash
# If you see "CDK Toolkit stack not found"
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Lambda Deployment Fails

```bash
# Clean and rebuild
rm -rf node_modules
pnpm install
cd ../apps/backend && pnpm build
cd ../../infra && npx cdk deploy BackendStack
```

### Stack Update Rollback

```bash
# Check CloudFormation console for detailed error
# Often caused by IAM permission issues or resource conflicts
```

## Development Notes

### Why NodejsFunction?

- Automatically bundles workspace dependencies (`@leetcode-tracker/shared-types`)
- Includes esbuild optimization (minify, tree-shaking)
- Generates unique S3 assets per function
- Better than `lambda.Function` for TypeScript monorepos

### Why Single-table DynamoDB?

- Reduces cost (one table vs multiple)
- Faster queries (single table scan)
- Scales better for this use case
- AWS best practice for simple applications

### Why REST API instead of HTTP API?

- Better Cognito Authorizer integration
- More features available
- Clearer documentation and examples

### Why CloudFront + S3 instead of Amplify Hosting?

- More control over caching and distribution
- Better integration with CDK
- Lower cost for static sites
- Industry-standard architecture

### Why Origin Access Control (OAC) instead of OAI?

- OAC is the modern replacement for Origin Access Identity (OAI)
- Better security model
- Required for some S3 features
- AWS recommends OAC for new distributions

### Dynamic CORS Configuration

The BackendStack receives the CloudFront URL from FrontendStack at synth time, ensuring CORS is always correctly configured for the deployed frontend. This eliminates hardcoded URLs and supports multi-environment deployments seamlessly.

## Security

### IAM Permissions

- Lambda functions have least-privilege access
- Only DynamoDB read/write permissions granted
- No cross-account access

### API Security

- All endpoints protected with Cognito JWT
- 401 returned for missing/invalid tokens
- User data isolated by userId from JWT claims

### Data Protection

- DynamoDB encryption at rest (default)
- API Gateway uses HTTPS only
- Point-in-time recovery enabled

## Related Files

- `bin/infra.ts` - CDK app entry point (stack initialization order)
- `lib/auth-stack.ts` - Cognito stack
- `lib/database-stack.ts` - DynamoDB stack
- `lib/frontend-stack.ts` - S3 + CloudFront stack
- `lib/backend-stack.ts` - API + Lambda stack + CORS
- `lib/stack-props.ts` - Shared props interface
- `cdk.json` - CDK configuration
- `.gitignore` - Excludes `outputs.json` (sensitive data)

## Support

For issues with infrastructure, check:

1. CloudFormation console for stack events
2. CloudWatch Logs for Lambda errors
3. AWS CDK documentation: https://docs.aws.amazon.com/cdk/

## License

MIT
