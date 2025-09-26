import { useCallback } from "react";

const sendChromeMessage = <T>(message: any): Promise<{ success: boolean; data?: T; error?: string }> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
};

export const useChromeApi = () => {
  const getSubscriptions = useCallback((maxResults?: number) => {
    return sendChromeMessage({ action: 'getSubscriptions', maxResults });
  }, []);

  const subscribeToChannel = useCallback((channelId: string) => {
    return sendChromeMessage({ action: 'subscribe', channelId });
  }, []);

  const unsubscribeFromChannel = useCallback((subscriptionId: string) => {
    return sendChromeMessage({ action: 'unsubscribe', subscriptionId });
  }, []);

  const getQuotaRemaining = useCallback(() => {
    return sendChromeMessage<number>({ action: 'quotaRemaining' });
  }, []);

  const getStorageData = useCallback((keys: string[]): Promise<any> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (data) => {
        resolve(data);
      });
    });
  }, []);

  const setStorageData = useCallback((data: Record<string, any>): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  }, []);

  return {
    getSubscriptions,
    subscribeToChannel,
    unsubscribeFromChannel,
    getQuotaRemaining,
    getStorageData,
    setStorageData
  };
};