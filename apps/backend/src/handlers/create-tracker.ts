import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { CreateTrackerSchema } from "@leetcode-tracker/shared-types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const createTrackerHandler = async (
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

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const rawBody = JSON.parse(event.body);

    // Validate with Zod
    const validatedBody = CreateTrackerSchema.parse(rawBody);

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
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Tracker created successfully",
        tracker: item,
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

    console.error("Error creating tracker:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
