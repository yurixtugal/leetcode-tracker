#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack";
import { BackendStack } from "../lib/backend-stack";
import { DatabaseStack } from "../lib/database-stack";
import { FrontendStack } from "../lib/frontend-stack";
const app = new cdk.App();
const environment = app.node.tryGetContext("environment") || "dev";
const authStack = new AuthStack(app, "AuthStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  environment,
});

const databaseStack = new DatabaseStack(app, "DatabaseStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  environment,
});

const backendStack = new BackendStack(app, "BackendStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  environment,
  userPool: authStack.userPool,
  tableDynamo: databaseStack.trackersTable,
});

const frontendStack = new FrontendStack(app, "FrontendStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  environment,
}); 
