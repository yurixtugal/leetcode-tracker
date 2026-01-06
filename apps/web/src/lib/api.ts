import { fetchAuthSession } from "aws-amplify/auth";
import { config } from "./config";

// Using basic types to avoid shared-types import issues
export interface CreateTrackerDTO {
  problem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Attempted" | "To Review";
  notes?: string;
  dateCompleted?: string | null;
  attempts?: number;
  timeSpent?: number;
}

export interface UpdateTrackerDTO extends Partial<CreateTrackerDTO> {}

export interface Tracker extends CreateTrackerDTO {
  PK: string;
  SK: string;
  trackerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerSuggestion {
  hints: string[];
  approaches: string[];
  resources: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | undefined> {
    try {
      console.log("🔑 Fetching auth session...");
      const session = await fetchAuthSession();
      console.log("📦 Session object:", {
        hasTokens: !!session.tokens,
        hasIdToken: !!session.tokens?.idToken,
        hasAccessToken: !!session.tokens?.accessToken,
      });

      const token = session.tokens?.idToken?.toString();

      if (token) {
        console.log(
          "✅ Token retrieved successfully (length:",
          token.length,
          ")",
        );
        console.log("🎫 Token preview:", token.substring(0, 50) + "...");
      } else {
        console.warn("⚠️ No token found in session!");
      }

      return token;
    } catch (error) {
      console.error("❌ Failed to get auth token:", error);
      return undefined;
    }
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    console.log(
      "🌐 API Request:",
      options.method || "GET",
      `${this.baseUrl}${url}`,
    );

    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("✅ Authorization header added");
    } else {
      console.warn("⚠️ No token available - request will fail with 403");
    }

    console.log("📤 Request headers:", Object.keys(headers));

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    console.log("📥 Response:", response.status, response.statusText);

    if (!response.ok) {
      const responseText = await response.text();
      console.error("❌ API Error Response:", responseText);
    }

    return response;
  }

  // Tracker endpoints
  async getTrackers(): Promise<Tracker[]> {
    const response = await this.fetchWithAuth("/trackers");
    if (!response.ok) {
      throw new Error("Failed to fetch trackers");
    }
    const data = await response.json();
    return data.trackers || [];
  }

  async getTracker(id: string): Promise<Tracker> {
    const response = await this.fetchWithAuth(`/trackers/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tracker");
    }
    const data = await response.json();
    return data.tracker;
  }

  async createTracker(data: CreateTrackerDTO): Promise<Tracker> {
    const response = await this.fetchWithAuth("/trackers", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create tracker");
    }
    const result = await response.json();
    return result.tracker;
  }

  async updateTracker(id: string, data: UpdateTrackerDTO): Promise<Tracker> {
    const response = await this.fetchWithAuth(`/trackers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update tracker");
    }
    const result = await response.json();
    return result.tracker;
  }

  async deleteTracker(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/trackers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete tracker");
    }
  }

  async getTrackerSuggestion(id: string): Promise<TrackerSuggestion> {
    const response = await this.fetchWithAuth(`/trackers/${id}/suggestion`);
    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }
    const data = await response.json();
    return data.suggestions;
  }
}

export const apiClient = new ApiClient(config.apiUrl);
