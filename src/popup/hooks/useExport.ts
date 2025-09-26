import { useCallback } from "react";
import { YouTubeSubscriptionItem } from "../../shared/types";

const downloadFile = (content: string, mimeType: string, format: 'csv' | 'json') => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `youtube-subscriptions-${new Date().toISOString().split('T')[0]}.${format}`;
  link.click();
};

export const useExport = (subscriptions: YouTubeSubscriptionItem[]) => {
  const exportToCSV = useCallback(() => {
    const data = subscriptions.map(sub => ({
      channelName: sub.snippet.title,
      channelId: sub.snippet.resourceId.channelId,
      subscriptionId: sub.id,
      subscribedDate: sub.snippet.publishedAt,
      thumbnailUrl: sub.snippet.thumbnails?.default?.url || '',
      thumbnailHighUrl: sub.snippet.thumbnails?.high?.url || ''
    }));

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

    downloadFile(csvContent, 'text/csv;charset=utf-8;', 'csv');
  }, [subscriptions]);

  const exportToJSON = useCallback(() => {
    const data = subscriptions.map(sub => ({
      channelName: sub.snippet.title,
      channelId: sub.snippet.resourceId.channelId,
      subscriptionId: sub.id,
      subscribedDate: sub.snippet.publishedAt,
      thumbnailUrl: sub.snippet.thumbnails?.default?.url || '',
      thumbnailHighUrl: sub.snippet.thumbnails?.high?.url || ''
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'application/json;charset=utf-8;', 'json');
  }, [subscriptions]);

  const exportSubscriptions = useCallback((format: 'csv' | 'json' = 'csv') => {
    if (subscriptions.length === 0) {
      throw new Error("No subscriptions to export");
    }

    if (format === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
  }, [subscriptions, exportToCSV, exportToJSON]);

  return {
    exportToCSV,
    exportToJSON,
    exportSubscriptions
  };
};