import React from 'react';
import './ErrorMessage.css';

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
        <button className="dismiss-btn" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
};