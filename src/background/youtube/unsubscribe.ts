import { getAuthToken } from "../auth";
import { charge, QuotaCosts } from "../quota";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export async function unsubscribeBySubscriptionId(subscriptionId: string): Promise<void> {
  const token = await getAuthToken();
  await charge(QuotaCosts.ACTION_COST);
  const url = new URL(`${API_BASE}/subscriptions`);
  url.searchParams.set("id", subscriptionId);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsubscribe failed: ${res.status} ${text}`);
  }
}



