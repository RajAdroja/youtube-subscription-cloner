import React from "react";
import { useSubscriptions } from "./hooks/useSubscriptions";
import { SubscriptionList } from "./components/SubscriptionList";

export const Popup: React.FC = () => {
  const {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
  } = useSubscriptions();

  return (
    <div style={{ width: '400px', maxHeight: '500px' }}>
      <div style={{ background: '#333', color: 'white', padding: '10px' }}>
        <h1 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>YouTube Subscriptions</h1>
        <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>Your subscribed channels (5 channels)</p>
      </div>

      <div style={{ padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #ccc', borderTop: '2px solid #333', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ marginLeft: '10px' }}>Loading...</span>
          </div>
        )}

        {error && (
          <div style={{ background: '#ffebee', border: '1px solid #f44336', color: '#c62828', padding: '10px', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        {!loading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '14px', margin: 0 }}>
                Subscriptions ({subscriptions.length}/5)
              </h2>
              <button onClick={() => fetchSubscriptions()}>
                Refresh
              </button>
            </div>

            {subscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p style={{ margin: '0 0 5px 0' }}>No subscriptions found</p>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  Make sure you're signed into YouTube and have subscriptions
                </p>
              </div>
            ) : (
              <SubscriptionList subscriptions={subscriptions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
