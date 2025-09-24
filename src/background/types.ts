export type BackgroundMessage =
  | { action: "getSubscriptions"; maxResults?: number }
  | { action: "subscribe"; channelId: string }
  | { action: "unsubscribe"; subscriptionId: string }
  | { action: "quotaRemaining" }

export interface BackgroundResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface YouTubeSubscriptionItem {
  id: string;
  snippet: {
    title: string;
    resourceId: {
      kind: "youtube#channel";
      channelId: string;
    };
    publishedAt: string;
    thumbnails?: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
}

export interface YouTubeSubscriptionsResponse {
  items: YouTubeSubscriptionItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}