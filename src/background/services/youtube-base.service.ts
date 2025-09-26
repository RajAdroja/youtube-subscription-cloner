import { AuthService } from './auth.service';
import { QuotaService } from './quota.service';

export class YouTubeBaseService {
  static readonly API_BASE = "https://www.googleapis.com/youtube/v3";

  static async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    const token = await AuthService.getAuthToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }

    return response;
  }

  static async makeRequestWithQuota(url: string, quotaCost: number, options: RequestInit = {}) {
    await QuotaService.charge(quotaCost);
    return this.makeAuthenticatedRequest(url, options);
  }
}