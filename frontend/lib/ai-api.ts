// AI API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface CategorySuggestion {
  suggested_category: string;
  confidence: number;
  matched_keyword: string | null;
}

export const aiApi = {
  chat: async (token: string, message: string, sessionId?: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to get AI response");
    }

    return response.json();
  },

  suggestCategory: async (token: string, description: string): Promise<CategorySuggestion> => {
    const response = await fetch(`${API_BASE_URL}/ai/suggest-category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error("Failed to get category suggestion");
    }

    return response.json();
  },

  getInsights: async (token: string): Promise<{ insights: string }> => {
    const response = await fetch(`${API_BASE_URL}/ai/insights`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get insights");
    }

    return response.json();
  },
};
