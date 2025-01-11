import React from 'react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => (
  <div className="error-message">
    <p>{message}</p>
    {onDismiss && (
      <button onClick={onDismiss} className="error-dismiss">
        Dismiss
      </button>
    )}
  </div>
);