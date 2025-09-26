import React from 'react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { SubscriptionList } from './components/SubscriptionList';
import { BulkActions } from './components/subscription/BulkActions';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorMessage } from './components/common/ErrorMessage';
import { Button } from './components/common/Button';
import './styles/globals.css';
import './styles/components.css';

export const Popup: React.FC = () => {
  const {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    remainingUnits,
    subscribe,
    unsubscribe,
    unsubscribedIds,
    exportSubscriptions,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    unsubscribeSelected
  } = useSubscriptions();

  const subscribedCount = subscriptions.filter(sub => !unsubscribedIds.has(sub.id)).length;

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>YouTube Subscriptions</h1>
        <p>Your subscribed channels ({subscribedCount} channels)</p>
      </div>

      <div className="popup-content">
        <div className="quota-display">
          Remaining daily units: <strong>{remainingUnits}</strong>
        </div>

        {loading && <LoadingSpinner />}

        {error && <ErrorMessage message={error} />}

        {!loading && (
          <div>
            <div className="subscriptions-header">
              <div className="subscriptions-title">
                <h2>Subscriptions ({subscriptions.length})</h2>
                <div className="action-buttons">
                  <Button 
                    onClick={() => exportSubscriptions('csv')} 
                    size="small"
                    className="action-button"
                  >
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => exportSubscriptions('json')} 
                    size="small"
                    className="action-button"
                  >
                    Export JSON
                  </Button>
                  <Button onClick={() => fetchSubscriptions()}>
                    Refresh
                  </Button>
                </div>
              </div>
              
              <BulkActions
                selectedCount={selectedIds.size}
                totalSubscribed={subscribedCount}
                onSelectAll={toggleSelectAll}
                onUnsubscribeSelected={unsubscribeSelected}
              />
            </div>

            {subscriptions.length === 0 ? (
              <div className="empty-state">
                <p>No subscriptions found</p>
                <p className="help-text">
                  Make sure you're signed into YouTube and have subscriptions
                </p>
              </div>
            ) : (
              <SubscriptionList 
                subscriptions={subscriptions} 
                onSubscribe={subscribe} 
                onUnsubscribe={unsubscribe}
                canAct={remainingUnits >= 50}
                unsubscribedIds={unsubscribedIds}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};