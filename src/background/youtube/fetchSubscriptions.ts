import { getAuthToken } from "../auth";
import {
  YouTubeSubscriptionsResponse,
  YouTubeSubscriptionItem,
} from "../types";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchSubscriptions(
  maxResults: number = 5,
  pageToken?: string
): Promise<YouTubeSubscriptionItem[]> {
  const token = await getAuthToken();

  const url = new URL(`${API_BASE}/subscriptions`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("mine", "true");
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("order", "alphabetical");
  
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`YouTube API error: ${res.status} - ${errorText}`);
  }
  
  const data = (await res.json()) as YouTubeSubscriptionsResponse;
  return data.items;
}
