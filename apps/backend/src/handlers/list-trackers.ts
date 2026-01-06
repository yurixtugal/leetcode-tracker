import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../utils/cors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const listTrackersHandler = async (
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

    // Query all trackers for this user
    const dynamoStartTime = Date.now();
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :track)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":track": "TRACK#",
        },
      }),
    );
    const dynamoEndTime = Date.now();
    const dynamoDuration = dynamoEndTime - dynamoStartTime;

    console.log(`[PERFORMANCE] DynamoDB Query took: ${dynamoDuration}ms`);
    console.log(`[PERFORMANCE] Items returned: ${result.Count || 0}`);
    console.log(
      `[PERFORMANCE] Total Lambda execution time: ${Date.now() - startTime}ms`,
    );

    return createResponse(200, {
      message: "Trackers retrieved successfully",
      trackers: result.Items || [],
      count: result.Count || 0,
      _metadata: {
        dynamoDbQueryTimeMs: dynamoDuration,
        totalExecutionTimeMs: Date.now() - startTime,
        itemCount: result.Count || 0,
      },
    });
  } catch (error) {
    console.error("Error listing trackers:", error);
    console.log(`[PERFORMANCE] Failed after: ${Date.now() - startTime}ms`);
    return createResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
