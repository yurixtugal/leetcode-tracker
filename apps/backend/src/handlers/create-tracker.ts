import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";
import { createResponse } from "../utils/cors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const createTrackerHandler = async (
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

    // Parse request body
    if (!event.body) {
      return createResponse(400, { message: "Missing request body" });
    }

    const rawBody = JSON.parse(event.body);

    // Validate with Zod
    const validationStartTime = Date.now();
    const validatedBody = CreateTrackerSchema.parse(rawBody);
    const validationDuration = Date.now() - validationStartTime;

    // Generate tracker ID
    const trackerId = randomUUID();
    const now = new Date().toISOString();

    // Create DynamoDB item
    const item = {
      PK: `USER#${userId}`,
      SK: `TRACK#${trackerId}`,
      trackerId,
      ...validatedBody,
      createdAt: now,
      updatedAt: now,
    };

    // Put item in DynamoDB
    const dynamoStartTime = Date.now();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );
    const dynamoDuration = Date.now() - dynamoStartTime;

    console.log(`[PERFORMANCE] Zod validation took: ${validationDuration}ms`);
    console.log(`[PERFORMANCE] DynamoDB PutItem took: ${dynamoDuration}ms`);
    console.log(
      `[PERFORMANCE] Total Lambda execution time: ${Date.now() - startTime}ms`,
    );

    return createResponse(201, {
      message: "Tracker created successfully",
      tracker: item,
      _metadata: {
        validationTimeMs: validationDuration,
        dynamoDbPutTimeMs: dynamoDuration,
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

    console.error("Error creating tracker:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
