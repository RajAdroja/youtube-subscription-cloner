import { YouTubeBaseService } from './youtube-base.service';
import { QuotaService } from './quota.service';
import {
  YouTubeSubscriptionsResponse,
  YouTubeSubscriptionItem,
} from '../../shared/types';

export class YouTubeFetchService {
  static async fetchSubscriptionsPage(
    maxResults: number = 50,
    pageToken?: string
  ): Promise<YouTubeSubscriptionsResponse> {
    const url = new URL(`${YouTubeBaseService.API_BASE}/subscriptions`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("mine", "true");
    url.searchParams.set("maxResults", String(Math.min(50, Math.max(1, maxResults))));
    url.searchParams.set("order", "alphabetical");
    
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await YouTubeBaseService.makeRequestWithQuota(
      url.toString(),
      QuotaService.costs.LIST_COST
    );
    
    return (await response.json()) as YouTubeSubscriptionsResponse;
  }

  static async fetchAllSubscriptions(): Promise<YouTubeSubscriptionItem[]> {
    const items: YouTubeSubscriptionItem[] = [];
    let pageToken: string | undefined;
    
    do {
      const page = await this.fetchSubscriptionsPage(50, pageToken);
      items.push(...page.items);
      pageToken = page.nextPageToken;
    } while (pageToken);
    
    return items;
  }
}