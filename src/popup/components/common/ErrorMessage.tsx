import React from 'react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss 
}) => {
  return (
    <div className="error-message">
      {message}
      {onDismiss && (
        <button onClick={onDismiss} style={{ float: 'right', marginLeft: '10px' }}>
          ×
        </button>
      )}
    </div>
  );
};