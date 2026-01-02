import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStackProps } from "./stack-props";
import { Billing, TableV2, AttributeType } from "aws-cdk-lib/aws-dynamodb";

export class DatabaseStack extends cdk.Stack {
  public readonly trackersTable: TableV2;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    this.trackersTable = new TableV2(this, "TrackersTable", {
      tableName: `leetcode-trackers-${props.environment}`,
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy:
        props.environment === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Output table name for easy reference
    new cdk.CfnOutput(this, "TrackersTableName", {
      value: this.trackersTable.tableName,
      description: "DynamoDB table name for trackers",
      exportName: `TrackersTableName-${props.environment}`,
    });

    new cdk.CfnOutput(this, "TrackersTableArn", {
      value: this.trackersTable.tableArn,
      description: "DynamoDB table ARN for trackers",
      exportName: `TrackersTableArn-${props.environment}`,
    });
  }
}
