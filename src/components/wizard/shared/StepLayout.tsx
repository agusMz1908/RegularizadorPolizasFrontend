import React from 'react';
import { LucideIcon, ArrowLeft, ArrowRight } from 'lucide-react';

interface StepLayoutProps {
  // Header
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'indigo' | 'emerald';
  
  // Navegación
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  
  // UI
  isDarkMode: boolean;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  
  // Estados especiales
  loading?: boolean;
  error?: string;
}

export const StepLayout: React.FC<StepLayoutProps> = ({
  title,
  description,
  icon: Icon,
  color,
  onNext,
  onBack,
  nextLabel = 'Continuar',
  backLabel = 'Atrás',
  nextDisabled = false,
  isDarkMode,
  children,
  maxWidth = '6xl',
  loading = false,
  error
}) => {
  const colorClasses = getColorClasses(color, isDarkMode);
  const maxWidthClass = `max-w-${maxWidth}`;

  return (
    <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
      {/* Header */}
      <StepHeader
        title={title}
        description={description}
        icon={Icon}
        colorClasses={colorClasses}
        isDarkMode={isDarkMode}
      />

      {/* Card principal */}
      <div className={`rounded-3xl shadow-xl border overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        {/* Contenido */}
        <div className="relative">
          {loading && <LoadingOverlay isDarkMode={isDarkMode} />}
          {children}
        </div>

        {/* Navegación */}
        {(onNext || onBack) && (
          <StepNavigation
            onNext={onNext}
            onBack={onBack}
            nextLabel={nextLabel}
            backLabel={backLabel}
            nextDisabled={nextDisabled || loading}
            color={color}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Error notification */}
      {error && (
        <ErrorNotification message={error} isDarkMode={isDarkMode} />
      )}
    </div>
  );
};

// ✅ Sub-componente: Header del paso
interface StepHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClasses: ColorClasses;
  isDarkMode: boolean;
}

const StepHeader: React.FC<StepHeaderProps> = ({
  title,
  description,
  icon: Icon,
  colorClasses,
  isDarkMode
}) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.iconBg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

// ✅ Sub-componente: Navegación
interface StepNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel: string;
  backLabel: string;
  nextDisabled: boolean;
  color: string;
  isDarkMode: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onBack,
  nextLabel,
  backLabel,
  nextDisabled,
  color,
  isDarkMode
}) => {
  const colorClasses = getColorClasses(color, isDarkMode);

  return (
    <div className={`flex justify-between items-center p-8 ${
      isDarkMode 
        ? 'bg-gray-900/50 border-t border-gray-700' 
        : 'bg-gray-50 border-t border-gray-100'
    }`}>
      {onBack ? (
        <button
          onClick={onBack}
          className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
            isDarkMode 
              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {backLabel}
        </button>
      ) : <div />}

      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
            nextDisabled
              ? 'bg-gray-300 text-gray-500'
              : colorClasses.button
          }`}
        >
          {nextLabel}
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      )}
    </div>
  );
};

// ✅ Sub-componente: Loading overlay
interface LoadingOverlayProps {
  isDarkMode: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isDarkMode }) => (
  <div className={`absolute inset-0 z-10 flex items-center justify-center ${
    isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
  } backdrop-blur-sm`}>
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Cargando...
      </p>
    </div>
  </div>
);

// ✅ Sub-componente: Error notification
interface ErrorNotificationProps {
  message: string;
  isDarkMode: boolean;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, isDarkMode }) => (
  <div className={`mt-4 p-4 rounded-xl border-2 ${
    isDarkMode 
      ? 'bg-red-900/20 border-red-800 text-red-300' 
      : 'bg-red-50 border-red-200 text-red-700'
  }`}>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ✅ Función auxiliar: Clases de color
interface ColorClasses {
  iconBg: string;
  button: string;
}

const getColorClasses = (color: string, isDarkMode: boolean): ColorClasses => {
  const colorMap = {
    blue: {
      iconBg: isDarkMode 
        ? 'bg-gradient-to-br from-blue-700 to-purple-800' 
        : 'bg-gradient-to-br from-blue-500 to-purple-600',
      button: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
    },
    purple: {
      iconBg: isDarkMode 
        ? 'bg-gradient-to-br from-purple-700 to-pink-800' 
        : 'bg-gradient-to-br from-purple-500 to-pink-600',
      button: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
    },
    green: {
      iconBg: isDarkMode 
        ? 'bg-gradient-to-br from-emerald-700 to-blue-800' 
        : 'bg-gradient-to-br from-emerald-500 to-blue-600',
      button: 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700'
    },
    emerald: {
      iconBg: isDarkMode 
        ? 'bg-gradient-to-br from-emerald-700 to-green-800' 
        : 'bg-gradient-to-br from-emerald-500 to-green-600',
      button: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700'
    },
    orange: {
      iconBg: isDarkMode 
        ? 'bg-gradient-to-br from-orange-700 to-red-800' 
        : 'bg-gradient-to-br from-orange-500 to-red-600',
      button: 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
    },
    indigo: {
      iconBg: isDarkMode 
        ? 'bg-gradient-to-br from-indigo-700 to-purple-800' 
        : 'bg-gradient-to-br from-indigo-500 to-purple-600',
      button: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
    }
  };

  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

export default StepLayout;