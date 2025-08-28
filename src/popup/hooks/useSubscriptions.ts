import { useState, useEffect } from "react";
import {
  YouTubeSubscriptionItem,
  BackgroundResponse,
  BackgroundMessage
} from "../../background/types";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<YouTubeSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = (maxResults?: number) => {
    console.log("Popup: Fetching subscriptions...");
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
        } else {
          setError(res.error || "Unknown error");
        }
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    console.log("Popup: Component mounted, fetching data...");
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions
  };
}
