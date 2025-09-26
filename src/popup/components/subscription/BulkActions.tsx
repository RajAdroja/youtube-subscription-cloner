import React from 'react';
import { Button } from '../common/Button';

interface BulkActionsProps {
  selectedCount: number;
  totalSubscribed: number;
  onSelectAll: () => void;
  onUnsubscribeSelected: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalSubscribed,
  onSelectAll,
  onUnsubscribeSelected
}) => {
  const isAllSelected = selectedCount > 0 && selectedCount === totalSubscribed;

  return (
    <div className="selection-controls">
      <label className="select-all-label">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="select-all-checkbox"
        />
        Select All
      </label>
      
      {selectedCount > 0 && (
        <div className="selection-info">
          <span className="selection-count">
            {selectedCount} selected
          </span>
          <Button
            onClick={onUnsubscribeSelected}
            variant="danger"
            size="small"
            className="unsubscribe-selected-btn"
          >
            Unsubscribe Selected ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  );
};