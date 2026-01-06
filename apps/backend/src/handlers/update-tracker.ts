import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateTrackerSchema } from "@leetcode-tracker/shared-types";
import { createResponse } from "../utils/cors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const updateTrackerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();

  try {
    // Get userId from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims.sub;

    if (!userId) {
      return createResponse(401, {
        message: "Unauthorized - No user ID found",
      });
    }

    // Get trackerId from path parameters
    const trackerId = event.pathParameters?.id;

    if (!trackerId) {
      return createResponse(400, { message: "Missing tracker ID in path" });
    }

    // Parse request body
    if (!event.body) {
      return createResponse(400, { message: "Missing request body" });
    }

    const rawBody = JSON.parse(event.body);

    // Validate with Zod (partial schema allows all fields optional)
    const validationStartTime = Date.now();
    const validatedBody = UpdateTrackerSchema.parse(rawBody);
    const validationDuration = Date.now() - validationStartTime;

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
    const dynamoStartTime = Date.now();
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
    const dynamoDuration = Date.now() - dynamoStartTime;

    console.log(`[PERFORMANCE] Zod validation took: ${validationDuration}ms`);
    console.log(`[PERFORMANCE] DynamoDB UpdateItem took: ${dynamoDuration}ms`);
    console.log(
      `[PERFORMANCE] Total Lambda execution time: ${Date.now() - startTime}ms`,
    );

    return createResponse(200, {
      message: "Tracker updated successfully",
      tracker: result.Attributes,
      _metadata: {
        validationTimeMs: validationDuration,
        dynamoDbUpdateTimeMs: dynamoDuration,
        totalExecutionTimeMs: Date.now() - startTime,
      },
    });
  } catch (error: unknown) {
    // Handle Zod validation errors (check for errors array property)
    if (
      error &&
      typeof error === "object" &&
      "errors" in error &&
      Array.isArray((error as any).errors)
    ) {
      return createResponse(400, {
        message: "Validation error",
        errors: (error as any).errors.map(
          (e: { path: (string | number)[]; message: string }) => ({
            path: e.path.join("."),
            message: e.message,
          }),
        ),
      });
    }

    console.error("Error updating tracker:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
