import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../utils/cors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const deleteTrackerHandler = async (
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

    // Delete item from DynamoDB
    const dynamoStartTime = Date.now();
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TRACK#${trackerId}`,
        },
      }),
    );
    const dynamoDuration = Date.now() - dynamoStartTime;

    console.log(`[PERFORMANCE] DynamoDB DeleteItem took: ${dynamoDuration}ms`);
    console.log(
      `[PERFORMANCE] Total Lambda execution time: ${Date.now() - startTime}ms`,
    );

    return createResponse(200, {
      message: "Tracker deleted successfully",
      trackerId,
      _metadata: {
        dynamoDbDeleteTimeMs: dynamoDuration,
        totalExecutionTimeMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Error deleting tracker:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
