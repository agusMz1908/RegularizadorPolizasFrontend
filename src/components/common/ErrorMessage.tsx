import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  details,
  onRetry,
  onDismiss,
  variant = 'error',
  className = '',
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertCircle className={`w-5 h-5 mt-0.5 ${iconClasses[variant]}`} />
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
          
          {details && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:underline">
                Ver detalles
              </summary>
              <p className="mt-1 text-xs font-mono bg-white bg-opacity-50 p-2 rounded">
                {details}
              </p>
            </details>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center space-x-1 text-xs px-3 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reintentar</span>
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs px-3 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
