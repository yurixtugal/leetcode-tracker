#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AuthStack } from "../lib/auth-stack";
import { BackendStack } from "../lib/backend-stack";
const app = new cdk.App();
const authStack = new AuthStack(app, "AuthStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
const backendStack = new BackendStack(app, "BackendStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
