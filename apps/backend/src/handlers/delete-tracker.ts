import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const deleteTrackerHandler = async (
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

    // Delete item from DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TRACK#${trackerId}`,
        },
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Tracker deleted successfully",
        trackerId,
      }),
    };
  } catch (error) {
    console.error("Error deleting tracker:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
