import { fetchAllSubscriptions } from "./youtube/fetchSubscriptions";
import { subscribeToChannel } from "./youtube/subscribe";
import { unsubscribeBySubscriptionId } from "./youtube/unsubscribe";
import { remainingUnits } from "./quota";

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
            const subs = await fetchAllSubscriptions();
            console.log("Subscriptions fetched:", subs);
            sendResponse({ success: true, data: subs });
            break;
          }
          case "subscribe": {
            await subscribeToChannel(msg.channelId);
            sendResponse({ success: true });
            break;
          }
          case "unsubscribe": {
            await unsubscribeBySubscriptionId(msg.subscriptionId);
            sendResponse({ success: true });
            break;
          }
          case "quotaRemaining": {
            sendResponse({ success: true, data: await remainingUnits() });
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
