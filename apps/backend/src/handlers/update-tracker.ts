import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const updateTrackerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Update Tracker Handler" }),
  };
};
