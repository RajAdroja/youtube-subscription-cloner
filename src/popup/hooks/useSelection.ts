import { useState, useCallback } from "react";
import { YouTubeSubscriptionItem } from "../../shared/types";

export const useSelection = (subscriptions: YouTubeSubscriptionItem[], unsubscribedIds: Set<string>) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((subscriptionId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subscriptionId)) {
        newSet.delete(subscriptionId);
      } else {
        newSet.add(subscriptionId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
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
  }, [subscriptions, unsubscribedIds, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection
  };
};