import { getAuthToken } from "../auth";
import {
  YouTubeSubscriptionsResponse,
  YouTubeSubscriptionItem,
} from "../types";
import { charge, QuotaCosts } from "../quota";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchSubscriptionsPage(
  maxResults: number = 50,
  pageToken?: string
): Promise<YouTubeSubscriptionsResponse> {
  const token = await getAuthToken();

  const url = new URL(`${API_BASE}/subscriptions`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("mine", "true");
  url.searchParams.set("maxResults", String(Math.min(50, Math.max(1, maxResults))));
  url.searchParams.set("order", "alphabetical");
  
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  await charge(QuotaCosts.LIST_COST);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`YouTube API error: ${res.status} - ${errorText}`);
  }
  
  return (await res.json()) as YouTubeSubscriptionsResponse;
}

export async function fetchAllSubscriptions(): Promise<YouTubeSubscriptionItem[]> {
  const items: YouTubeSubscriptionItem[] = [];
  let pageToken: string | undefined;
  do {
    const page = await fetchSubscriptionsPage(50, pageToken);
    items.push(...page.items);
    pageToken = page.nextPageToken;
  } while (pageToken);
  return items;
}
