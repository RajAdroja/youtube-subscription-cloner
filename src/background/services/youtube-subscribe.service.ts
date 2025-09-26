import { YouTubeBaseService } from './youtube-base.service';
import { QuotaService } from './quota.service';

export class YouTubeSubscribeService {
  static async subscribeToChannel(channelId: string): Promise<void> {
    const url = `${YouTubeBaseService.API_BASE}/subscriptions?part=snippet`;
    
    await YouTubeBaseService.makeRequestWithQuota(
      url,
      QuotaService.costs.ACTION_COST,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            resourceId: { kind: "youtube#channel", channelId },
          },
        }),
      }
    );
  }

  static async unsubscribeBySubscriptionId(subscriptionId: string): Promise<void> {
    const url = new URL(`${YouTubeBaseService.API_BASE}/subscriptions`);
    url.searchParams.set("id", subscriptionId);
    
    await YouTubeBaseService.makeRequestWithQuota(
      url.toString(),
      QuotaService.costs.ACTION_COST,
      {
        method: "DELETE",
      }
    );
  }
}