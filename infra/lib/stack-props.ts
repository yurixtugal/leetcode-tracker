import { StackProps } from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";

export interface AppStackProps extends StackProps {
    environment: 'dev' | 'prod';
    userPool?: UserPool;
}