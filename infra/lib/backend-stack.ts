import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { AppStackProps } from "./stack-props";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const lambdaEnvironment = {
      TABLE_NAME: props.tableDynamo ? props.tableDynamo.tableName : "",
    };

    const bundlingOptions = {
      minify: true,
      sourceMap: true,
      target: "es2020",
      format: OutputFormat.CJS,
      mainFields: ["module", "main"],
      externalModules: ["aws-sdk"], // AWS SDK v2 is already in Lambda runtime
    };

    // Lambda Functions with NodejsFunction (auto-bundles with esbuild)
    const createTrackerFn = new NodejsFunction(this, "CreateTrackerFunction", {
      functionName: `leetcode-tracker-create-${props.environment}`,
      entry: path.join(
        __dirname,
        "../../apps/backend/src/handlers/create-tracker.ts",
      ),
      handler: "createTrackerHandler",
      timeout: cdk.Duration.seconds(10),
      environment: lambdaEnvironment,
      bundling: bundlingOptions,
    });

    const listTrackersFn = new NodejsFunction(this, "ListTrackersFunction", {
      functionName: `leetcode-tracker-list-${props.environment}`,
      entry: path.join(
        __dirname,
        "../../apps/backend/src/handlers/list-trackers.ts",
      ),
      handler: "listTrackersHandler",
      timeout: cdk.Duration.seconds(10),
      environment: lambdaEnvironment,
      bundling: bundlingOptions,
    });

    const getTrackerFn = new NodejsFunction(this, "GetTrackerFunction", {
      functionName: `leetcode-tracker-get-${props.environment}`,
      entry: path.join(
        __dirname,
        "../../apps/backend/src/handlers/get-tracker.ts",
      ),
      handler: "getTrackerHandler",
      timeout: cdk.Duration.seconds(10),
      environment: lambdaEnvironment,
      bundling: bundlingOptions,
    });

    const updateTrackerFn = new NodejsFunction(this, "UpdateTrackerFunction", {
      functionName: `leetcode-tracker-update-${props.environment}`,
      entry: path.join(
        __dirname,
        "../../apps/backend/src/handlers/update-tracker.ts",
      ),
      handler: "updateTrackerHandler",
      timeout: cdk.Duration.seconds(10),
      environment: lambdaEnvironment,
      bundling: bundlingOptions,
    });

    const deleteTrackerFn = new NodejsFunction(this, "DeleteTrackerFunction", {
      functionName: `leetcode-tracker-delete-${props.environment}`,
      entry: path.join(
        __dirname,
        "../../apps/backend/src/handlers/delete-tracker.ts",
      ),
      handler: "deleteTrackerHandler",
      timeout: cdk.Duration.seconds(10),
      environment: lambdaEnvironment,
      bundling: bundlingOptions,
    });

    // grant DynamoDB permissions to Lambda functions
    if (props.tableDynamo) {
      props.tableDynamo.grantReadWriteData(createTrackerFn);
      props.tableDynamo.grantReadData(listTrackersFn);
      props.tableDynamo.grantReadData(getTrackerFn);
      props.tableDynamo.grantReadWriteData(updateTrackerFn);
      props.tableDynamo.grantReadWriteData(deleteTrackerFn);
    }

    // API Gateway REST API
    const api = new apigateway.RestApi(
      this,
      `LeetCodeTrackerAPI-${props.environment}`,
      {
        restApiName: `LeetCode Tracker API (${props.environment})`,
        description: "API for LeetCode progress tracking application",
        deployOptions: {
          stageName: props.environment,
        },
        defaultCorsPreflightOptions: {
          allowOrigins: [
            ...(props.cloudFrontUrl ? [`https://${props.cloudFrontUrl}`] : []),
            "http://localhost:5173", // Local development (Vite default port)
          ],
          allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowHeaders: [
            "Content-Type",
            "Authorization",
            "X-Amz-Date",
            "X-Api-Key",
            "X-Amz-Security-Token",
          ],
          allowCredentials: true,
        },
      },
    );

    // Validate userPool is provided
    if (!props.userPool) {
      throw new Error("userPool is required for BackendStack");
    }

    const auth = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      `CognitoAuthorizer-${props.environment}`,
      {
        cognitoUserPools: [props.userPool],
        authorizerName: `LeetCodeTrackerAuthorizer-${props.environment}`,
      },
    );

    // API Resources and Methods
    const trackers = api.root.addResource("trackers");

    // POST /trackers - Create a new tracker
    trackers.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createTrackerFn),
      {
        authorizer: auth,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );

    // GET /trackers - List all trackers
    trackers.addMethod(
      "GET",
      new apigateway.LambdaIntegration(listTrackersFn),
      {
        authorizer: auth,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );

    // /trackers/{id} resource for single tracker operations
    const tracker = trackers.addResource("{id}");

    // GET /trackers/{id} - Get a specific tracker
    tracker.addMethod("GET", new apigateway.LambdaIntegration(getTrackerFn), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // PUT /trackers/{id} - Update a specific tracker
    tracker.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(updateTrackerFn),
      {
        authorizer: auth,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );

    // DELETE /trackers/{id} - Delete a specific tracker
    tracker.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteTrackerFn),
      {
        authorizer: auth,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );

    // Output the API endpoint
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,
      description: "LeetCode Tracker API endpoint",
    });
  }
}
