import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { AppStackProps } from "./stack-props";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Lambda code asset (shared by all functions)
    const lambdaCode = lambda.Code.fromAsset("../apps/backend/dist");

    // Lambda Functions
    const createTrackerFn = new lambda.Function(this, "CreateTrackerFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/create-tracker.createTrackerHandler",
      code: lambdaCode,
      functionName: `leetcode-tracker-create-${props.environment}`,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: props.tableDynamo ? props.tableDynamo.tableName : "",
      },
    });

    const listTrackersFn = new lambda.Function(this, "ListTrackersFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/list-trackers.listTrackersHandler",
      code: lambdaCode,
      functionName: `leetcode-tracker-list-${props.environment}`,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: props.tableDynamo ? props.tableDynamo.tableName : "",
      },
    });

    const getTrackerFn = new lambda.Function(this, "GetTrackerFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/get-tracker.getTrackerHandler",
      code: lambdaCode,
      functionName: `leetcode-tracker-get-${props.environment}`,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: props.tableDynamo ? props.tableDynamo.tableName : "",
      },
    });

    const updateTrackerFn = new lambda.Function(this, "UpdateTrackerFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/update-tracker.updateTrackerHandler",
      code: lambdaCode,
      functionName: `leetcode-tracker-update-${props.environment}`,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: props.tableDynamo ? props.tableDynamo.tableName : "",
      },
    });

    const deleteTrackerFn = new lambda.Function(this, "DeleteTrackerFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/delete-tracker.deleteTrackerHandler",
      code: lambdaCode,
      functionName: `leetcode-tracker-delete-${props.environment}`,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: props.tableDynamo ? props.tableDynamo.tableName : "",
      },
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
