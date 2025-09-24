import { getAuthToken } from "../auth";
import { charge, QuotaCosts } from "../quota";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export async function subscribeToChannel(channelId: string): Promise<void> {
  const token = await getAuthToken();
  await charge(QuotaCosts.ACTION_COST);
  const res = await fetch(`${API_BASE}/subscriptions?part=snippet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        resourceId: { kind: "youtube#channel", channelId },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Subscribe failed: ${res.status} ${text}`);
  }
}



