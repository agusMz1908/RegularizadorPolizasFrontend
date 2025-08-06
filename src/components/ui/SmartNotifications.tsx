import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Zap } from 'lucide-react';
import type { ValidationMessage } from '@/hooks/useRealTimeValidation';

interface SmartNotificationsProps {
  messages: ValidationMessage[];
  onDismiss: (index: number) => void;
  className?: string;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  messages,
  onDismiss,
  className = ''
}) => {
  const getIcon = (type: ValidationMessage['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getColors = (type: ValidationMessage['type']) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (messages.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`
            flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
            hover:shadow-sm ${getColors(message.type)}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(message.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{message.message}</p>
            
            {message.action && message.actionLabel && (
              <button
                onClick={message.action}
                className="mt-1 text-xs px-2 py-1 bg-white bg-opacity-70 rounded hover:bg-opacity-100 transition-colors"
              >
                <Zap className="w-3 h-3 inline mr-1" />
                {message.actionLabel}
              </button>
            )}
          </div>
          
          <button
            onClick={() => onDismiss(index)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};