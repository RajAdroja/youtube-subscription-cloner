import { QuotaState, QuotaCosts } from '../../shared/types';

const DAILY_LIMIT_UNITS = 10000;

export class QuotaService {
  private static async getState(): Promise<QuotaState> {
    return new Promise((resolve) => {
      chrome.storage.local.get(["quota"], (data) => {
        const now = Date.now();
        const q: QuotaState = data.quota || { used: 0, lastReset: now };
        const sameDay = new Date(q.lastReset).toDateString() === new Date(now).toDateString();
        resolve(sameDay ? q : { used: 0, lastReset: now });
      });
    });
  }

  private static async setState(q: QuotaState) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ quota: q }, () => resolve());
    });
  }

  static async charge(units: number): Promise<void> {
    const q = await this.getState();
    if (q.used + units > DAILY_LIMIT_UNITS) {
      throw new Error("Daily quota budget exceeded");
    }
    q.used += units;
    await this.setState(q);
  }

  static async remainingUnits(): Promise<number> {
    const q = await this.getState();
    return Math.max(0, DAILY_LIMIT_UNITS - q.used);
  }

  static get costs() {
    return QuotaCosts;
  }
}