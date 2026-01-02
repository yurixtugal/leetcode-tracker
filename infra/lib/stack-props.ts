import { StackProps } from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";

export interface AppStackProps extends StackProps {
    environment: 'dev' | 'prod';
    userPool?: UserPool;
    tableDynamo?: TableV2;
}