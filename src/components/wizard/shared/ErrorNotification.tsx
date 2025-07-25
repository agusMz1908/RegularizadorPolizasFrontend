import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorNotificationProps {
  message: string;
  isDarkMode: boolean;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  position?: 'inline' | 'floating';
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  isDarkMode,
  onDismiss,
  type = 'error',
  position = 'floating'
}) => {
  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return isDarkMode 
          ? 'bg-gray-800 border-red-800 text-red-300' 
          : 'bg-white border-red-200 text-red-700';
      case 'warning':
        return isDarkMode 
          ? 'bg-gray-800 border-yellow-800 text-yellow-300' 
          : 'bg-white border-yellow-200 text-yellow-700';
      case 'info':
        return isDarkMode 
          ? 'bg-gray-800 border-blue-800 text-blue-300' 
          : 'bg-white border-blue-200 text-blue-700';
      default:
        return isDarkMode 
          ? 'bg-gray-800 border-red-800 text-red-300' 
          : 'bg-white border-red-200 text-red-700';
    }
  };

  const getGradientClasses = () => {
    switch (type) {
      case 'error':
        return isDarkMode 
          ? 'bg-gradient-to-r from-red-700 to-pink-700' 
          : 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'warning':
        return isDarkMode 
          ? 'bg-gradient-to-r from-yellow-700 to-orange-700' 
          : 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'info':
        return isDarkMode 
          ? 'bg-gradient-to-r from-blue-700 to-indigo-700' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default:
        return isDarkMode 
          ? 'bg-gradient-to-r from-red-700 to-pink-700' 
          : 'bg-gradient-to-r from-red-500 to-pink-500';
    }
  };

  const getIconBgClasses = () => {
    switch (type) {
      case 'error':
        return isDarkMode ? 'bg-red-900' : 'bg-red-100';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100';
      case 'info':
        return isDarkMode ? 'bg-blue-900' : 'bg-blue-100';
      default:
        return isDarkMode ? 'bg-red-900' : 'bg-red-100';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'warning':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'info':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      default:
        return isDarkMode ? 'text-red-400' : 'text-red-600';
    }
  };

  const getTitleText = () => {
    switch (type) {
      case 'error':
        return 'Error en el procesamiento';
      case 'warning':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return 'Error';
    }
  };

  if (position === 'inline') {
    return (
      <div className={`mt-4 p-4 rounded-xl border-2 ${getColorClasses()}`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgClasses()}`}>
            <AlertTriangle className={`w-4 h-4 ${getIconColor()}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-1">{getTitleText()}</h4>
            <p className="text-sm">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`w-6 h-6 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${getIconBgClasses()} hover:opacity-80`}
            >
              <X className={`w-4 h-4 ${getIconColor()}`} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Floating notification
  return (
    <div className={`fixed bottom-6 right-6 max-w-md rounded-2xl shadow-xl z-50 overflow-hidden border-2 ${getColorClasses()}`}>
      <div className={`h-1 ${getGradientClasses()}`}></div>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgClasses()}`}>
            <AlertTriangle className={`w-5 h-5 ${getIconColor()}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-1">{getTitleText()}</h4>
            <p className="text-sm">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${getIconBgClasses()} hover:opacity-80`}
            >
              <X className={`w-4 h-4 ${getIconColor()}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;