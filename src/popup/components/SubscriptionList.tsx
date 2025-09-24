import React from "react";
import { YouTubeSubscriptionItem } from "../../background/types";

interface Props {
  subscriptions: YouTubeSubscriptionItem[];
  onSubscribe?: (channelId: string) => void;
  onUnsubscribe?: (subscriptionId: string) => void;
  canAct?: boolean;
  unsubscribedIds?: Set<string>;
  selectedIds?: Set<string>;
  onToggleSelection?: (subscriptionId: string) => void;
}

export const SubscriptionList: React.FC<Props> = ({ 
  subscriptions, 
  onSubscribe, 
  onUnsubscribe, 
  canAct = true, 
  unsubscribedIds = new Set(),
  selectedIds = new Set(),
  onToggleSelection
}) => {
  return (
    <div>
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {onToggleSelection && !unsubscribedIds.has(sub.id) && (
            <div style={{ marginRight: '8px' }}>
              <input
                type="checkbox"
                checked={selectedIds.has(sub.id)}
                onChange={() => onToggleSelection(sub.id)}
                style={{ margin: 0, transform: 'scale(1.1)' }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub.snippet.title}
            </div>
            {sub.snippet.thumbnails?.default && (
              <img
                src={sub.snippet.thumbnails.default.url}
                alt={sub.snippet.title}
                style={{ width: '32px', height: '32px', borderRadius: '50%', marginTop: '5px' }}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {unsubscribedIds.has(sub.id) ? (
              // Show Subscribe button if unsubscribed
              onSubscribe && (
                <button 
                  disabled={!canAct} 
                  onClick={() => onSubscribe(sub.snippet.resourceId.channelId)}
                >
                  Subscribe
                </button>
              )
            ) : (
              // Show Unsubscribe button if subscribed
              onUnsubscribe && (
                <button 
                  disabled={!canAct} 
                  onClick={() => onUnsubscribe(sub.id)}
                >
                  Unsubscribe
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
