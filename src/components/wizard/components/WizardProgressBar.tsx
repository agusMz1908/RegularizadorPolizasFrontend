// src/components/wizard/components/WizardProgressBar.tsx

import React from 'react';
import { WizardStepId } from '../../../types/wizard';

interface WizardProgressBarProps {
  progress: {
    percentage: number;
    currentStepIndex: number;
    totalSteps: number;
    completedSteps: number;
  };
  currentStep: WizardStepId;
  completedSteps: Set<WizardStepId>;
  isDarkMode: boolean;
}

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({
  progress,
  currentStep,
  completedSteps,
  isDarkMode
}) => {
  
  return (
    <div className={`border-b transition-colors duration-300 ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barra de Progreso Principal */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Progreso general
            </span>
            <span className={`text-sm font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {progress.percentage}%
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          {/* Información detallada */}
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {progress.completedSteps} de {progress.totalSteps} pasos completados
            </span>
            
            {/* Estimación de tiempo (placeholder) */}
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {progress.percentage < 100 
                ? `~${Math.max(1, Math.round((100 - progress.percentage) / 20))} min restantes`
                : '¡Completado!'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardProgressBar;