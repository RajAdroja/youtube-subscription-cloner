import React from "react";
import { YouTubeSubscriptionItem } from "../../background/types";

interface Props {
  subscriptions: YouTubeSubscriptionItem[];
}

export const SubscriptionList: React.FC<Props> = ({ subscriptions }) => {
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub.snippet.title}
            </div>
            <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub.snippet.resourceId.channelId}
            </div>
            {sub.snippet.thumbnails?.default && (
              <img
                src={sub.snippet.thumbnails.default.url}
                alt={sub.snippet.title}
                style={{ width: '32px', height: '32px', borderRadius: '50%', marginTop: '5px' }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
