import { APIGatewayProxyResult } from "aws-lambda";

/**
 * CORS headers for API Gateway responses
 * Must match the allowedOrigins in backend-stack.ts
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Will be more specific in production
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

/**
 * Helper function to create API Gateway response with CORS headers
 */
export function createResponse(
  statusCode: number,
  body: object | string,
  additionalHeaders: Record<string, string> = {},
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      ...additionalHeaders,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}
