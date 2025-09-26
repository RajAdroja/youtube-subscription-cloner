import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <span className="loading-text">{message}</span>
    </div>
  );
};