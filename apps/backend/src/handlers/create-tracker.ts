import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const createTrackerHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Create Tracker Handler" }),
    };
};