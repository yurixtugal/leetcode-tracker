import * as cdk from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { AppStackProps } from "./stack-props";

export class AuthStack extends cdk.Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, "LeetcodetrackerUserPool", {
      userPoolName: `leetcode-tracker-users-${props.environment}`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cdk.aws_cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    // The code that defines your Auth stack goes here
    this.userPoolClient = new UserPoolClient(this, "WebClient", {
      userPool: this.userPool,
      userPoolClientName: `leetcode-tracker-web-client-${props.environment}`,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      preventUserExistenceErrors: true,
    });
  }
}
