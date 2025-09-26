import { useState, useEffect, useRef, useCallback } from "react";
import { YouTubeSubscriptionItem } from "../../shared/types";
import { useChromeApi } from "./useChromeApi";
import { useExport } from "./useExport";
import { useSelection } from "./useSelection";
import { useCache } from "./useCache";

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<YouTubeSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingUnits, setRemainingUnits] = useState<number>(0);
  const [unsubscribedIds, setUnsubscribedIds] = useState<Set<string>>(new Set());
  const lastFetchRef = useRef<number>(0);

  const chromeApi = useChromeApi();
  const exportUtils = useExport(subscriptions);
  const selection = useSelection(subscriptions, unsubscribedIds);
  const cache = useCache();

  const fetchSubscriptions = useCallback(async (maxResults?: number) => {
    console.log("Popup: Fetching subscriptions...");
    if (Date.now() - lastFetchRef.current < 3000) {
      return; // debounce 3s
    }
    lastFetchRef.current = Date.now();
    setLoading(true);
    setError(null);

    try {
      const response = await chromeApi.getSubscriptions(maxResults);
      if (response.success && response.data && Array.isArray(response.data)) {
        setSubscriptions(response.data);
        setUnsubscribedIds(new Set());
        selection.clearSelection();
        // Cache the data
        await cache.setCachedData(chromeApi.setStorageData, response.data);
      } else {
        setError(response.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }, [chromeApi, cache, selection]);

  const refreshQuota = useCallback(async () => {
    try {
      const response = await chromeApi.getQuotaRemaining();
      if (response.success && typeof response.data === "number") {
        setRemainingUnits(response.data);
      }
    } catch (err) {
      console.error("Failed to refresh quota:", err);
    }
  }, [chromeApi]);

  useEffect(() => {
    console.log("Popup: Component mounted, fetching data...");
    
    // Try cache first
    cache.getCachedData(chromeApi.getStorageData).then((cachedData) => {
      if (cachedData) {
        setSubscriptions(cachedData);
      } else {
        fetchSubscriptions();
      }
    });
    
    // Get remaining units
    refreshQuota();
  }, [fetchSubscriptions, refreshQuota, cache, chromeApi]);

  const subscribe = useCallback(async (channelId: string) => {
    if (remainingUnits < 50) {
      setError("Not enough daily quota remaining for this action.");
      return;
    }
    setError(null);
    
    // Update UI immediately for better UX
    const subscription = subscriptions.find(sub => sub.snippet.resourceId.channelId === channelId);
    if (subscription) {
      setUnsubscribedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscription.id);
        return newSet;
      });
    }
    
    try {
      const response = await chromeApi.subscribeToChannel(channelId);
      if (!response.success) {
        // Handle duplicate subscription error gracefully
        if (response.error?.includes("400") || response.error?.includes("subscriptionDuplicate")) {
          console.log("Already subscribed to this channel");
        } else {
          // Revert UI change on error
          if (subscription) {
            setUnsubscribedIds(prev => {
              const newSet = new Set(prev);
              newSet.add(subscription.id);
              return newSet;
            });
          }
          setError(response.error || "Subscribe failed");
        }
      }
    } catch (err) {
      // Revert UI change on error
      if (subscription) {
        setUnsubscribedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(subscription.id);
          return newSet;
        });
      }
      setError("Subscribe failed");
    }
    
    refreshQuota();
  }, [remainingUnits, subscriptions, refreshQuota, chromeApi]);

  const unsubscribe = useCallback(async (subscriptionId: string) => {
    if (remainingUnits < 50) {
      setError("Not enough daily quota remaining for this action.");
      return;
    }
    setError(null);
    
    // Update UI immediately for better UX
    setUnsubscribedIds(prev => new Set(prev).add(subscriptionId));
    
    try {
      const response = await chromeApi.unsubscribeFromChannel(subscriptionId);
      if (!response.success) {
        // Handle 404 error gracefully (subscription already deleted)
        if (response.error?.includes("404") || response.error?.includes("subscriptionNotFound")) {
          console.log("Already unsubscribed from this channel");
        } else {
          // Revert UI change on error
          setUnsubscribedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(subscriptionId);
            return newSet;
          });
          setError(response.error || "Unsubscribe failed");
        }
      }
    } catch (err) {
      // Revert UI change on error
      setUnsubscribedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriptionId);
        return newSet;
      });
      setError("Unsubscribe failed");
    }
    
    refreshQuota();
  }, [remainingUnits, refreshQuota, chromeApi]);

  const unsubscribeSelected = useCallback(async () => {
    if (selection.selectedIds.size === 0) {
      setError("No channels selected");
      return;
    }

    const requiredUnits = selection.selectedIds.size * 50;
    if (remainingUnits < requiredUnits) {
      setError(`Not enough quota. Need ${requiredUnits} units, have ${remainingUnits}`);
      return;
    }

    setError(null);
    
    // Update UI immediately for all selected channels
    setUnsubscribedIds(prev => {
      const newSet = new Set(prev);
      selection.selectedIds.forEach(id => newSet.add(id));
      return newSet;
    });

    // Clear selection
    selection.clearSelection();

    // Process each unsubscribe
    let completed = 0;
    let errors = 0;
    
    for (const subscriptionId of selection.selectedIds) {
      try {
        const response = await chromeApi.unsubscribeFromChannel(subscriptionId);
        completed++;
        if (!response.success) {
          errors++;
          if (!response.error?.includes("404") && !response.error?.includes("subscriptionNotFound")) {
            // Only show error for non-404 errors
            setError(`Failed to unsubscribe from some channels: ${response.error}`);
          }
        }
      } catch (err) {
        completed++;
        errors++;
        setError("Failed to unsubscribe from some channels");
      }
    }
    
    // Refresh quota after all requests complete
    await refreshQuota();
    if (errors > 0 && errors < selection.selectedIds.size) {
      console.log(`${errors} channels failed to unsubscribe`);
    }
  }, [selection, remainingUnits, refreshQuota, chromeApi]);

  const exportSubscriptions = useCallback((format: 'csv' | 'json' = 'csv') => {
    try {
      exportUtils.exportSubscriptions(format);
    } catch (err) {
      setError("Export failed");
    }
  }, [exportUtils]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    remainingUnits,
    subscribe,
    unsubscribe,
    unsubscribedIds,
    exportSubscriptions,
    selectedIds: selection.selectedIds,
    toggleSelection: selection.toggleSelection,
    toggleSelectAll: selection.toggleSelectAll,
    unsubscribeSelected
  };
};