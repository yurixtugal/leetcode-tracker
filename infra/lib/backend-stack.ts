import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // lambda functions and API Gateway resources would be defined here
    const createTrackerFn = new lambda.Function(this, "CreateTrackerFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/create-tracker.createTrackerHandler",
      code: lambda.Code.fromAsset("../apps/backend/dist"),
      functionName: "leetcode-tracker-create",
      timeout: cdk.Duration.seconds(10),
    });

    const api = new apigateway.RestApi(this, "LeetCodeTrackerAPI", {
        restApiName: "LeetCode Tracker API",
        description: "API for LeetCode progress tracking application",
        deployOptions: {
            stageName: "dev",
        }
    });

    const trackers = api.root.addResource("trackers");

    trackers.addMethod('POST', new apigateway.LambdaIntegration(createTrackerFn));
  }
}
