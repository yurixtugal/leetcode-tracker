import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const listTrackersHandler = async (
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

    // Query all trackers for this user
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Trackers retrieved successfully",
        trackers: result.Items || [],
        count: result.Count || 0,
      }),
    };
  } catch (error) {
    console.error("Error listing trackers:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
