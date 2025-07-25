// src/components/wizard/shared/NavigationButtons.tsx

import React from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  loading?: boolean;
  nextVariant?: 'primary' | 'success' | 'warning' | 'danger';
  backVariant?: 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isDarkMode?: boolean;
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  backLabel = 'Atrás',
  nextLabel = 'Continuar',
  nextDisabled = false,
  backDisabled = false,
  loading = false,
  nextVariant = 'primary',
  backVariant = 'secondary',
  size = 'md',
  fullWidth = false,
  isDarkMode = false,
  className = ''
}) => {
  // ✅ Configuración de tamaños
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // ✅ Variantes de botón "Siguiente"
  const getNextVariantClasses = (): string => {
    const disabled = nextDisabled || loading;
    
    if (disabled) {
      return isDarkMode 
        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    const variants = {
      primary: isDarkMode 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg',
      success: isDarkMode 
        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg'
        : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg',
      warning: isDarkMode 
        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg'
        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg',
      danger: isDarkMode 
        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg'
        : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg'
    };

    return variants[nextVariant];
  };

  // ✅ Variantes de botón "Atrás"
  const getBackVariantClasses = (): string => {
    const disabled = backDisabled || loading;
    
    if (disabled) {
      return isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
        : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
    }

    const variants = {
      secondary: isDarkMode 
        ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
      ghost: isDarkMode 
        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    };

    return variants[backVariant];
  };

  return (
    <div className={`flex ${fullWidth ? 'w-full' : 'justify-between'} items-center space-x-4 ${className}`}>
      {/* Botón Atrás */}
      {onBack ? (
        <button
          onClick={onBack}
          disabled={backDisabled || loading}
          className={`
            inline-flex items-center rounded-xl transition-all duration-200 font-medium
            ${sizeClasses[size]}
            ${getBackVariantClasses()}
            ${fullWidth ? 'flex-1 justify-center' : ''}
          `}
        >
          <ArrowLeft className={`${iconSizes[size]} mr-2`} />
          {backLabel}
        </button>
      ) : (
        <div />
      )}

      {/* Botón Siguiente */}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled || loading}
          className={`
            inline-flex items-center rounded-xl transition-all duration-200 font-medium
            ${sizeClasses[size]}
            ${getNextVariantClasses()}
            ${fullWidth ? 'flex-1 justify-center' : ''}
          `}
        >
          {loading ? (
            <>
              <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
              Procesando...
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight className={`${iconSizes[size]} ml-2`} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ✅ Componente especializado para pasos del wizard
interface WizardNavigationProps extends Omit<NavigationButtonsProps, 'onBack' | 'onNext'> {
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  stepNumber?: number;
  totalSteps?: number;
  showProgress?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = false,
  stepNumber,
  totalSteps,
  showProgress = false,
  ...props
}) => {
  return (
    <div className={`p-6 border-t ${
      props.isDarkMode 
        ? 'bg-gray-900/50 border-gray-700' 
        : 'bg-gray-50 border-gray-100'
    }`}>
      {/* Indicador de progreso opcional */}
      {showProgress && stepNumber && totalSteps && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              props.isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Paso {stepNumber} de {totalSteps}
            </span>
            <span className={`text-sm ${
              props.isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {Math.round((stepNumber / totalSteps) * 100)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${
            props.isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      <NavigationButtons
        onBack={canGoBack ? onBack : undefined}
        onNext={canGoNext ? onNext : undefined}
        nextDisabled={!canGoNext}
        backDisabled={!canGoBack}
        {...props}
      />
    </div>
  );
};

export default NavigationButtons;