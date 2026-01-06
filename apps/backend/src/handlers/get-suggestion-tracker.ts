import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../utils/cors";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

interface TrackerContext {
  problem: string;
  difficulty: string;
  status: string;
  attempts: number;
  timeSpent: number;
  notes: string;
}

export const getSuggestionTrackerHandler = async (
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

    // Get item from DynamoDB
    const dynamoStartTime = Date.now();
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `TRACK#${trackerId}`,
        },
      }),
    );
    const dynamoDuration = Date.now() - dynamoStartTime;

    console.log(`[PERFORMANCE] DynamoDB GetItem took: ${dynamoDuration}ms`);
    console.log(
      `[PERFORMANCE] Total Lambda execution time: ${Date.now() - startTime}ms`,
    );

    if (!result.Item) {
      return createResponse(404, { message: "Tracker not found" });
    }

    // Prepare context for suggestion generation
    const trackerContext = {
      problem: result.Item.problem,
      difficulty: result.Item.difficulty,
      status: result.Item.status,
      attempts: result.Item.attempts || 0,
      timeSpent: result.Item.timeSpent || 0,
      notes: result.Item.notes || "",
    };
    console.log(`Generating suggestions for: ${trackerContext.problem}`);
    console.log(
      `Difficulty: ${trackerContext.difficulty}, Attempts: ${trackerContext.attempts}`,
    );

    // Generate suggestions using Bedrock
    const bedrockStartTime = Date.now();
    const suggestions = await generateSuggestions(trackerContext);
    const bedrockDuration = Date.now() - bedrockStartTime;

    console.log(`[PERFORMANCE] Bedrock invocation took: ${bedrockDuration}ms`);
    console.log(
      `[PERFORMANCE] Total Lambda execution time: ${Date.now() - startTime}ms`,
    );

    return createResponse(200, {
      message: "Suggestions generated successfully",
      trackerId: trackerId,
      problem: trackerContext.problem,
      suggestions: suggestions,
      _metadata: {
        dynamoDbGetTimeMs: dynamoDuration,
        bedrockInvokeTimeMs: bedrockDuration,
        totalExecutionTimeMs: Date.now() - startTime,
      },
    });
  } catch (error: unknown) {
    console.error("Error getting tracker:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const generateSuggestions = async (
  context: TrackerContext,
): Promise<{
  hints: string[];
  approaches: string[];
  resources: string[];
}> => {
  try {
    const prompt = `You are a helpful coding mentor. For the LeetCode problem "${context.problem}" (Difficulty: ${context.difficulty}), provide exactly 3 specific hints, 2 solution approaches, and 2 learning resources with REAL WORKING URLs (not placeholders).

Requirements:
- hints: 3 progressive hints that don't give away the solution
- approaches: 2 different algorithmic approaches with time complexity
- resources: 2 REAL URLs to articles, videos, or documentation (use actual leetcode.com, youtube.com, geeksforgeeks.org links)

Response must be ONLY valid JSON, no markdown, no extra text:
{"hints":["hint 1","hint 2","hint 3"],"approaches":["approach 1","approach 2"],"resources":["https://real-url-1.com","https://real-url-2.com"]}`;

    // Use Amazon Nova Micro - newer, faster, more consistent than Titan
    const payload = {
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-micro-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log("[BEDROCK] Response received from Nova");

    // Extract text from Nova's response format
    const suggestionsText =
      responseBody.output?.message?.content?.[0]?.text || "";

    if (!suggestionsText) {
      throw new Error("Empty response from Bedrock");
    }

    console.log("[BEDROCK] Raw output:", suggestionsText);

    // Nova usually returns clean JSON, but sometimes wraps it in markdown
    // Remove markdown code blocks if present
    let cleanedText = suggestionsText.trim();
    const markdownMatch = cleanedText.match(
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
    );
    if (markdownMatch) {
      cleanedText = markdownMatch[1];
    }

    // Parse and validate the JSON response
    const suggestions = JSON.parse(cleanedText);

    // Validate structure
    if (
      !suggestions.hints ||
      !suggestions.approaches ||
      !suggestions.resources
    ) {
      throw new Error("Invalid suggestion format from Bedrock");
    }

    console.log("[BEDROCK] Successfully parsed suggestions");
    return suggestions;
  } catch (error: unknown) {
    console.error("[BEDROCK] Error generating suggestions:", error);

    // Fallback suggestions if Bedrock fails
    return {
      hints: [
        "Try breaking down the problem into smaller subproblems",
        "Consider the time and space complexity constraints",
        "Look for patterns in the examples provided",
      ],
      approaches: [
        "Consider using a hashmap for O(1) lookups",
        "Think about whether dynamic programming could help",
      ],
      resources: [
        "https://leetcode.com/explore/",
        "https://www.geeksforgeeks.org/",
      ],
    };
  }
};
