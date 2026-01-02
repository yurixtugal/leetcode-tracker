import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateTrackerSchema } from "@leetcode-tracker/shared-types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const updateTrackerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // Get userId from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized - No user ID found" }),
      };
    }

    // Get trackerId from path parameters
    const trackerId = event.pathParameters?.id;

    if (!trackerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing tracker ID in path" }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const rawBody = JSON.parse(event.body);

    // Validate with Zod (partial schema allows all fields optional)
    const validatedBody = UpdateTrackerSchema.parse(rawBody);

    // Build UpdateExpression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    // Always update updatedAt
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    // Add other fields if provided
    Object.entries(validatedBody).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Update item in DynamoDB
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TRACK#${trackerId}`,
        },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Tracker updated successfully",
        tracker: result.Attributes,
      }),
    };
  } catch (error: unknown) {
    // Handle Zod validation errors (check for errors array property)
    if (
      error &&
      typeof error === "object" &&
      "errors" in error &&
      Array.isArray((error as any).errors)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Validation error",
          errors: (error as any).errors.map(
            (e: { path: (string | number)[]; message: string }) => ({
              path: e.path.join("."),
              message: e.message,
            }),
          ),
        }),
      };
    }

    console.error("Error updating tracker:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
