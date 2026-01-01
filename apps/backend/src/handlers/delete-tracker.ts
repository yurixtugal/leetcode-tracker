import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const deleteTrackerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Delete Tracker Handler" }),
  };
};
