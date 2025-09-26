export type BackgroundMessage =
  | { action: "getSubscriptions"; maxResults?: number }
  | { action: "subscribe"; channelId: string }
  | { action: "unsubscribe"; subscriptionId: string }
  | { action: "quotaRemaining" };

export type BackgroundResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type YouTubeSubscriptionsResponse = {
  items: YouTubeSubscriptionItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
};

export type YouTubeSubscriptionItem = {
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
};

export type QuotaState = {
  used: number;
  lastReset: number;
};

export const QuotaCosts = {
  ACTION_COST: 50,
  LIST_COST: 1
} as const;