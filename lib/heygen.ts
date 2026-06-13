import type { HeyGenAvatar, HeyGenVideo, HeyGenError } from "./types";

const HEYGEN_BASE_URL = "https://api.heygen.com/v2";
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

interface HeyGenApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

interface HeyGenListAvatarsResponse {
  list: Array<{
    avatar_id: string;
    avatar_name: string;
    avatar_thumb_url: string;
    gender?: string;
    language?: string;
  }>;
}

interface HeyGenGenerateVideoRequest {
  input_text?: string;
  avatar_id?: string;
  template_id?: string;
}

interface HeyGenGenerateVideoResponse {
  video_id: string;
  status: string;
}

interface HeyGenGetVideoStatusResponse {
  video_id: string;
  status: string;
  video_url?: string;
  thumbnail_url?: string;
}

export class HeyGenClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || HEYGEN_API_KEY || "";
    this.baseUrl = HEYGEN_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HeyGenApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "X-Api-Key": this.apiKey,
      ...options.headers,
    };

    console.log(
      `[HeyGen] Request: ${options.method || "GET"} ${url}`,
      options.body && typeof options.body === "string" ? `Body size: ${options.body.length} bytes` : ""
    );

    const response = await fetch(url, { ...options, headers });
    const responseData = await response.json();
    console.log(
      `[HeyGen] Response: ${response.status} for ${url}`,
      responseData
    );

    if (!response.ok) {
      const error: HeyGenError = {
        code: String(response.status),
        message:
          responseData.message ||
          `HeyGen API request failed with status ${response.status}`,
        details: responseData,
      };
      console.error("[HeyGen] Error:", error);
      throw error;
    }

    return responseData;
  }

  async listAvatars(): Promise<HeyGenAvatar[]> {
    const response = await this.request<HeyGenListAvatarsResponse>("/avatars");
    return response.data.list.map((a) => ({
      id: a.avatar_id,
      name: a.avatar_name,
      thumbnailUrl: a.avatar_thumb_url,
      gender: a.gender,
      language: a.language,
    }));
  }

  async generateVideo(
    prompt: string,
    avatarId?: string,
    templateId?: string,
    title?: string
  ): Promise<string> {
    const body: HeyGenGenerateVideoRequest = {
      input_text: prompt,
      avatar_id: avatarId,
      template_id: templateId,
    };
    const response = await this.request<HeyGenGenerateVideoResponse>(
      "/videos",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return response.data.video_id;
  }

  async getVideoStatus(videoId: string): Promise<HeyGenVideo> {
    const response = await this.request<HeyGenGetVideoStatusResponse>(
      `/videos/${videoId}`
    );
    return {
      id: response.data.video_id,
      status: mapHeyGenStatus(response.data.status),
      videoUrl: response.data.video_url,
      thumbnailUrl: response.data.thumbnail_url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

function mapHeyGenStatus(status: string): HeyGenVideo["status"] {
  switch (status.toLowerCase()) {
    case "pending":
      return "pending";
    case "processing":
      return "processing";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "pending";
  }
}

// Singleton instance
export const heygenClient = new HeyGenClient();
