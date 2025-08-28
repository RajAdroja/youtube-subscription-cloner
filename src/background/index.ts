import { fetchSubscriptions } from "./youtube/fetchSubscriptions";

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
            
            const subs = await fetchSubscriptions(msg.maxResults || 5);
            console.log("Subscriptions fetched:", subs);
            sendResponse({ success: true, data: subs });
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
