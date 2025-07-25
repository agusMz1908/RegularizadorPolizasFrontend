import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'md',
  isDarkMode = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 rounded-full animate-spin`}></div>
        <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
      </div>
      <p className={`mt-4 ${textSizeClasses[size]} ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {message}
      </p>
    </div>
  );
};

// ✅ Variante inline para usar dentro de botones
interface InlineLoadingSpinnerProps {
  className?: string;
}

export const InlineLoadingSpinner: React.FC<InlineLoadingSpinnerProps> = ({ 
  className = 'w-5 h-5' 
}) => (
  <Loader2 className={`animate-spin ${className}`} />
);

export default LoadingSpinner;