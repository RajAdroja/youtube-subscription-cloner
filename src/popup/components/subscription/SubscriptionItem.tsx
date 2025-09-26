import React from 'react';
import { YouTubeSubscriptionItem } from '../../../shared/types/index';

interface SubscriptionItemProps {
  subscription: YouTubeSubscriptionItem;
  isSelected?: boolean;
  isUnsubscribed?: boolean;
  canAct?: boolean;
  onSubscribe?: (channelId: string) => void;
  onUnsubscribe?: (subscriptionId: string) => void;
  onToggleSelection?: (subscriptionId: string) => void;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  subscription,
  isSelected = false,
  isUnsubscribed = false,
  canAct = true,
  onSubscribe,
  onUnsubscribe,
  onToggleSelection
}) => {
  return (
    <div className="subscription-item">
      {onToggleSelection && !isUnsubscribed && (
        <div className="subscription-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(subscription.id)}
          />
        </div>
      )}
      
      <div className="subscription-content">
        <div className="subscription-title">
          {subscription.snippet.title}
        </div>
        {subscription.snippet.thumbnails?.default && (
          <img
            src={subscription.snippet.thumbnails.default.url}
            alt={subscription.snippet.title}
            className="subscription-thumbnail"
          />
        )}
      </div>
      
      <div className="subscription-actions">
        {isUnsubscribed ? (
          onSubscribe && (
            <button 
              disabled={!canAct} 
              onClick={() => onSubscribe(subscription.snippet.resourceId.channelId)}
            >
              Subscribe
            </button>
          )
        ) : (
          onUnsubscribe && (
            <button 
              disabled={!canAct} 
              onClick={() => onUnsubscribe(subscription.id)}
            >
              Unsubscribe
            </button>
          )
        )}
      </div>
    </div>
  );
};