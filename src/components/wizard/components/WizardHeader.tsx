// src/components/wizard/components/WizardHeader.tsx

import React from 'react';
import { WizardStepId, WizardStep, WizardProgress } from '../../../types/wizard';
import { 
  User, 
  Building2, 
  Navigation, 
  Settings, 
  Upload, 
  Bot, 
  FileText, 
  CheckCircle 
} from 'lucide-react';

interface WizardHeaderProps {
  currentStep: WizardStepId;
  steps: WizardStep[];
  progress: WizardProgress;
  isDarkMode: boolean;
  onStepClick: (stepId: WizardStepId) => void;
}

// Iconos por tipo de paso
const STEP_ICONS = {
  cliente: User,
  company: Building2,
  seccion: Navigation,
  operacion: Settings,
  upload: Upload,
  extract: Bot,
  form: FileText,
  success: CheckCircle
};

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  steps,
  progress,
  isDarkMode,
  onStepClick
}) => {
  
  /**
   * Obtiene el estado visual de un paso
   */
  const getStepStatus = (step: WizardStep) => {
    if (step.id === currentStep) return 'current';
    if (progress.completedSteps > steps.findIndex(s => s.id === step.id)) return 'completed';
    return 'pending';
  };

  /**
   * Verifica si un paso es clickeable
   */
  const isStepClickable = (step: WizardStep) => {
    const stepIndex = steps.findIndex(s => s.id === step.id);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    // Se puede hacer click en pasos completados o el actual
    return stepIndex <= currentIndex || getStepStatus(step) === 'completed';
  };

  return (
    <div className={`border-b transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título y Progreso General */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Wizard de Pólizas
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Paso {progress.currentStepIndex} de {progress.totalSteps} • {progress.percentage}% completado
              </p>
            </div>
            
            {/* Indicador de progreso circular */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className={`${isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'}`}
                  strokeDasharray="100, 100"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-blue-600"
                  strokeDasharray={`${progress.percentage}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {progress.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Steps Horizontales */}
          <div className="relative">
            {/* Línea de conexión */}
            <div className={`absolute top-6 left-6 right-6 h-0.5 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
            
            {/* Línea de progreso */}
            <div 
              className="absolute top-6 left-6 h-0.5 bg-blue-600 transition-all duration-500"
              style={{ 
                width: `${Math.max(0, (progress.currentStepIndex - 1) / Math.max(1, steps.length - 1) * 100)}%` 
              }}
            />

            {/* Pasos */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS] || FileText;
                const stepStatus = getStepStatus(step);
                const isClickable = isStepClickable(step);

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center group ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => isClickable && onStepClick(step.id)}
                  >
                    {/* Círculo del paso */}
                    <div className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center
                      transition-all duration-200 z-10 relative
                      ${stepStatus === 'completed' 
                        ? 'bg-green-600 border-green-600' 
                        : stepStatus === 'current'
                        ? (isDarkMode 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-blue-600 border-blue-600')
                        : (isDarkMode 
                            ? 'bg-gray-800 border-gray-600' 
                            : 'bg-white border-gray-300')
                      }
                      ${isClickable && stepStatus !== 'current' 
                        ? 'group-hover:scale-110 group-hover:shadow-lg' 
                        : ''
                      }
                    `}>
                      {stepStatus === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${
                          stepStatus === 'current' 
                            ? 'text-white' 
                            : isDarkMode 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`} />
                      )}
                    </div>

                    {/* Etiqueta del paso */}
                    <div className="mt-3 text-center min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        stepStatus === 'current' 
                          ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                          : stepStatus === 'completed'
                          ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                          : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                      }`}>
                        {step.name}
                      </div>
                      
                      {/* Descripción solo en paso actual */}
                      {stepStatus === 'current' && (
                        <div className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </div>
                      )}
                    </div>

                    {/* Indicador de paso requerido */}
                    {step.required && stepStatus === 'pending' && (
                      <div className={`w-2 h-2 rounded-full mt-1 ${
                        isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardHeader;