import { useCallback } from "react";
import { YouTubeSubscriptionItem } from "../../shared/types";

const CACHE_KEY = "subs_cache";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const useCache = () => {
  const getCachedData = useCallback(async (getStorageData: (keys: string[]) => Promise<any>) => {
    const vals = await getStorageData([CACHE_KEY]);
    const cache = vals[CACHE_KEY] as { ts: number; data: YouTubeSubscriptionItem[] } | undefined;
    
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return cache.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback(async (
    setStorageData: (data: Record<string, any>) => Promise<void>,
    data: YouTubeSubscriptionItem[]
  ) => {
    await setStorageData({ [CACHE_KEY]: { ts: Date.now(), data } });
  }, []);

  return {
    getCachedData,
    setCachedData
  };
};