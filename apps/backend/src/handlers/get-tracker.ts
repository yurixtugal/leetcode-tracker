import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const getTrackerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Get Tracker Handler" }),
  };
};
