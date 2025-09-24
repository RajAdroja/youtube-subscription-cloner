const DAILY_LIMIT_UNITS = 10000;
const ACTION_COST = 50; // insert/delete subscription
const LIST_COST = 1; // subscriptions.list

type QuotaState = { used: number; lastReset: number };

async function getState(): Promise<QuotaState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["quota"], (data) => {
      const now = Date.now();
      const q: QuotaState = data.quota || { used: 0, lastReset: now };
      const sameDay = new Date(q.lastReset).toDateString() === new Date(now).toDateString();
      resolve(sameDay ? q : { used: 0, lastReset: now });
    });
  });
}

async function setState(q: QuotaState) {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ quota: q }, () => resolve());
  });
}

export async function charge(units: number): Promise<void> {
  const q = await getState();
  if (q.used + units > DAILY_LIMIT_UNITS) {
    throw new Error("Daily quota budget exceeded");
  }
  q.used += units;
  await setState(q);
}

export async function remainingUnits(): Promise<number> {
  const q = await getState();
  return Math.max(0, DAILY_LIMIT_UNITS - q.used);
}

export const QuotaCosts = { ACTION_COST, LIST_COST } as const;



