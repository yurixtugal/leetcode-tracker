import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const listTrackersHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "List Trackers Handler" }),
  };
};
