import { useState, useEffect, useRef } from "react";
import {
  YouTubeSubscriptionItem,
  BackgroundResponse,
  BackgroundMessage
} from "../../background/types";

const CACHE_KEY = "subs_cache";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<YouTubeSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingUnits, setRemainingUnits] = useState<number>(0);
  const [unsubscribedIds, setUnsubscribedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastFetchRef = useRef<number>(0);

  const fetchSubscriptions = (maxResults?: number) => {
    console.log("Popup: Fetching subscriptions...");
    if (Date.now() - lastFetchRef.current < 3000) {
      return; // debounce 3s
    }
    lastFetchRef.current = Date.now();
    setLoading(true);
    setError(null);

    const msg: BackgroundMessage = { action: "getSubscriptions", maxResults };
    console.log("Popup: Sending message:", msg);

    chrome.runtime.sendMessage(
      msg,
      (res: BackgroundResponse<YouTubeSubscriptionItem[]>) => {
        console.log("Popup: Received response:", res);
        if (res.success && res.data) {
          setSubscriptions(res.data);
          // Clear unsubscribed state when refreshing
          setUnsubscribedIds(new Set());
          // Clear selected state when refreshing
          setSelectedIds(new Set());
          // cache
          const payload = { ts: Date.now(), data: res.data };
          chrome.storage.local.set({ [CACHE_KEY]: payload });
        } else {
          setError(res.error || "Unknown error");
        }
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    console.log("Popup: Component mounted, fetching data...");
    // try cache first
    chrome.storage.local.get([CACHE_KEY], (vals) => {
      const cache = vals[CACHE_KEY] as { ts: number; data: YouTubeSubscriptionItem[] } | undefined;
      if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
        setSubscriptions(cache.data);
      } else {
        fetchSubscriptions();
      }
    });
    // get remaining units
    chrome.runtime.sendMessage(
      { action: "quotaRemaining" } as BackgroundMessage,
      (res: BackgroundResponse<number>) => {
        if (res?.success && typeof res.data === "number") {
          setRemainingUnits(res.data);
        }
      }
    );
  }, []);

  const refreshRemainingUnits = () => {
    chrome.runtime.sendMessage(
      { action: "quotaRemaining" } as BackgroundMessage,
      (res: BackgroundResponse<number>) => {
        if (res?.success && typeof res.data === "number") {
          setRemainingUnits(res.data);
        }
      }
    );
  };

  const subscribe = (channelId: string) => {
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
    
    chrome.runtime.sendMessage(
      { action: "subscribe", channelId } as BackgroundMessage,
      (res: BackgroundResponse<void>) => {
        if (!res?.success) {
          // Handle duplicate subscription error gracefully
          if (res?.error?.includes("400") || res?.error?.includes("subscriptionDuplicate")) {
            // Already subscribed, UI is already correct
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
            setError(res?.error || "Subscribe failed");
          }
        }
        refreshRemainingUnits();
      }
    );
  };

  const unsubscribe = (subscriptionId: string) => {
    if (remainingUnits < 50) {
      setError("Not enough daily quota remaining for this action.");
      return;
    }
    setError(null);
    
    // Update UI immediately for better UX
    setUnsubscribedIds(prev => new Set(prev).add(subscriptionId));
    
    chrome.runtime.sendMessage(
      { action: "unsubscribe", subscriptionId } as BackgroundMessage,
      (res: BackgroundResponse<void>) => {
        if (!res?.success) {
          // Handle 404 error gracefully (subscription already deleted)
          if (res?.error?.includes("404") || res?.error?.includes("subscriptionNotFound")) {
            // Already unsubscribed, UI is already correct
            console.log("Already unsubscribed from this channel");
          } else {
            // Revert UI change on error
            setUnsubscribedIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(subscriptionId);
              return newSet;
            });
            setError(res?.error || "Unsubscribe failed");
          }
        }
        refreshRemainingUnits();
      }
    );
  };

  const exportSubscriptions = (format: 'csv' | 'json' = 'csv') => {
    if (subscriptions.length === 0) {
      setError("No subscriptions to export");
      return;
    }

    const data = subscriptions.map(sub => ({
      channelName: sub.snippet.title,
      channelId: sub.snippet.resourceId.channelId,
      subscriptionId: sub.id,
      subscribedDate: sub.snippet.publishedAt,
      thumbnailUrl: sub.snippet.thumbnails?.default?.url || '',
      thumbnailHighUrl: sub.snippet.thumbnails?.high?.url || ''
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Channel Name', 'Channel ID', 'Subscription ID', 'Subscribed Date', 'Thumbnail URL', 'High Res Thumbnail'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          `"${row.channelName}"`,
          `"${row.channelId}"`,
          `"${row.subscriptionId}"`,
          `"${row.subscribedDate}"`,
          `"${row.thumbnailUrl}"`,
          `"${row.thumbnailHighUrl}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `youtube-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      // Convert to JSON
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `youtube-subscriptions-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    }
  };

  const toggleSelection = (subscriptionId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subscriptionId)) {
        newSet.delete(subscriptionId);
      } else {
        newSet.add(subscriptionId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const allSubscribedIds = subscriptions
      .filter(sub => !unsubscribedIds.has(sub.id))
      .map(sub => sub.id);
    
    if (selectedIds.size === allSubscribedIds.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all subscribed channels
      setSelectedIds(new Set(allSubscribedIds));
    }
  };

  const unsubscribeSelected = () => {
    if (selectedIds.size === 0) {
      setError("No channels selected");
      return;
    }

    const requiredUnits = selectedIds.size * 50;
    if (remainingUnits < requiredUnits) {
      setError(`Not enough quota. Need ${requiredUnits} units, have ${remainingUnits}`);
      return;
    }

    setError(null);
    
    // Update UI immediately for all selected channels
    setUnsubscribedIds(prev => {
      const newSet = new Set(prev);
      selectedIds.forEach(id => newSet.add(id));
      return newSet;
    });

    // Clear selection
    setSelectedIds(new Set());

    // Process each unsubscribe
    let completed = 0;
    let errors = 0;
    
    selectedIds.forEach(subscriptionId => {
      chrome.runtime.sendMessage(
        { action: "unsubscribe", subscriptionId } as BackgroundMessage,
        (res: BackgroundResponse<void>) => {
          completed++;
          if (!res?.success) {
            errors++;
            if (!res?.error?.includes("404") && !res?.error?.includes("subscriptionNotFound")) {
              // Only show error for non-404 errors
              setError(`Failed to unsubscribe from some channels: ${res?.error}`);
            }
          }
          
          // Refresh quota after all requests complete
          if (completed === selectedIds.size) {
            refreshRemainingUnits();
            if (errors > 0 && errors < selectedIds.size) {
              console.log(`${errors} channels failed to unsubscribe`);
            }
          }
        }
      );
    });
  };

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
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    unsubscribeSelected
  };
}
