import { YouTubeFetchService } from "./services/youtube-fetch.service";
import { YouTubeSubscribeService } from "./services/youtube-subscribe.service";
import { QuotaService } from "./services/quota.service";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background worker running!");
});

chrome.runtime.onMessage.addListener(
  (msg, _sender, sendResponse) => {
    console.log("Background received message:", msg);
    
    (async () => {
      try {
        switch (msg.action) {
          case "getSubscriptions": {
            console.log("Fetching subscriptions...");
            const subs = await YouTubeFetchService.fetchAllSubscriptions();
            console.log("Subscriptions fetched:", subs);
            sendResponse({ success: true, data: subs });
            break;
          }
          case "subscribe": {
            await YouTubeSubscribeService.subscribeToChannel(msg.channelId);
            sendResponse({ success: true });
            break;
          }
          case "unsubscribe": {
            await YouTubeSubscribeService.unsubscribeBySubscriptionId(msg.subscriptionId);
            sendResponse({ success: true });
            break;
          }
          case "quotaRemaining": {
            sendResponse({ success: true, data: await QuotaService.remainingUnits() });
            break;
          }
          default: {
            console.log("Unknown action:", msg.action);
            sendResponse({ success: false, error: "Unknown action" });
          }
        }
      } catch (err) {
        console.error("Background error:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        sendResponse({ success: false, error: errorMessage });
      }
    })();

    return true;
  }
);