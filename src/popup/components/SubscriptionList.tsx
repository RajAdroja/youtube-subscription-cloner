import React from 'react';
import { YouTubeSubscriptionItem } from '../../shared/types';
import { SubscriptionItem } from './subscription/SubscriptionItem';

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
        <SubscriptionItem
          key={sub.id}
          subscription={sub}
          isSelected={selectedIds.has(sub.id)}
          isUnsubscribed={unsubscribedIds.has(sub.id)}
          canAct={canAct}
          onSubscribe={onSubscribe}
          onUnsubscribe={onUnsubscribe}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  );
};