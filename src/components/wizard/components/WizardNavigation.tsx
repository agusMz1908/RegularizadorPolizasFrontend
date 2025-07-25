// src/components/wizard/components/WizardNavigation.tsx

import React from 'react';
import { WizardStepId } from '../../../types/wizard';
import { 
  ArrowLeft, 
  ArrowRight, 
  SkipForward, // ✅ CORREGIDO - usar SkipForward en lugar de Skip
  AlertTriangle, 
  CheckCircle,
  Loader2
} from 'lucide-react';

interface WizardNavigationProps {
  currentStep: WizardStepId;
  canGoBack: boolean;
  canGoNext: boolean;
  isComplete: boolean;
  isProcessing: boolean;
  onBack: () => void;
  onNext: () => Promise<boolean>;
  onSkip: () => Promise<boolean>;
  onComplete: () => void;
  validationErrors: string[];
  isDarkMode: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  canGoBack,
  canGoNext,
  isComplete,
  isProcessing,
  onBack,
  onNext,
  onSkip,
  onComplete,
  validationErrors,
  isDarkMode
}) => {

  const hasErrors = validationErrors.length > 0;

  /**
   * Obtiene el texto del botón siguiente según el paso
   */
  const getNextButtonText = () => {
    switch (currentStep) {
      case 'cliente':
        return 'Seleccionar Compañía';
      case 'company':
        return 'Elegir Sección';
      case 'seccion':
        return 'Tipo de Operación';
      case 'operacion':
        return 'Subir Documentos';
      case 'upload':
        return 'Procesar con IA';
      case 'extract':
        return 'Completar Formulario';
      case 'form':
        return 'Finalizar Póliza';
      case 'success':
        return 'Nueva Póliza';
      default:
        return 'Continuar';
    }
  };

  /**
   * Obtiene el texto del botón atrás según el paso
   */
  const getBackButtonText = () => {
    switch (currentStep) {
      case 'company':
        return 'Volver a Cliente';
      case 'seccion':
        return 'Volver a Compañía';
      case 'operacion':
        return 'Volver a Sección';
      case 'upload':
        return 'Volver a Operación';
      case 'extract':
        return 'Volver a Documentos';
      case 'form':
        return 'Volver a Extracción';
      case 'success':
        return 'Volver a Formulario';
      default:
        return 'Atrás';
    }
  };

  /**
   * Verifica si el paso actual es salteable
   */
  const canSkipCurrentStep = () => {
    return ['extract'].includes(currentStep); // Solo algunos pasos son salteables
  };

  /**
   * Maneja el click del botón siguiente
   */
  const handleNext = async () => {
    if (isComplete) {
      onComplete();
    } else {
      await onNext();
    }
  };

  return (
    <div className={`mt-8 border-t pt-6 transition-colors duration-300 ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      
      {/* Errores de Validación */}
      {hasErrors && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-700 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium mb-2">
                {validationErrors.length === 1 
                  ? 'Hay un error que corregir:' 
                  : `Hay ${validationErrors.length} errores que corregir:`
                }
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Botones de Navegación */}
      <div className="flex items-center justify-between">
        
        {/* Botón Atrás */}
        <button
          onClick={onBack}
          disabled={!canGoBack || isProcessing}
          className={`
            inline-flex items-center px-6 py-3 rounded-xl font-medium
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${isDarkMode 
              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' 
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'
            }
            ${canGoBack && !isProcessing ? 'hover:scale-105 hover:shadow-lg' : ''}
          `}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {getBackButtonText()}
        </button>

        {/* Área Central */}
        <div className="flex items-center space-x-4">
          
          {/* Botón Skip (solo en pasos salteables) */}
          {canSkipCurrentStep() && !isComplete && (
            <button
              onClick={onSkip}
              disabled={isProcessing}
              className={`
                inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Saltar paso
            </button>
          )}

          {/* Indicador de procesamiento */}
          {isProcessing && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando...</span>
            </div>
          )}
        </div>

        {/* Botón Siguiente/Completar */}
        <button
          onClick={handleNext}
          disabled={(!canGoNext && !isComplete) || isProcessing || hasErrors}
          className={`
            inline-flex items-center px-8 py-3 rounded-xl font-medium
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg
            ${isComplete
              ? (isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white')
              : hasErrors
              ? (isDarkMode
                  ? 'bg-gray-600 text-gray-400'
                  : 'bg-gray-300 text-gray-500')
              : (canGoNext || isComplete) && !isProcessing
              ? (isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white')
              : (isDarkMode
                  ? 'bg-gray-600 text-gray-400'
                  : 'bg-gray-300 text-gray-500')
            }
            ${(canGoNext || isComplete) && !isProcessing && !hasErrors 
              ? 'hover:scale-105 hover:shadow-xl' 
              : ''
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : isComplete ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Completar
            </>
          ) : (
            <>
              {getNextButtonText()}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>

      {/* Información adicional del paso */}
      <div className={`mt-4 text-center text-sm ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {currentStep === 'form' && (
          <p>💡 Tip: Revisa todos los campos antes de finalizar la póliza</p>
        )}
        {currentStep === 'upload' && (
          <p>📁 Formatos soportados: PDF, JPG, PNG (máx. 10MB)</p>
        )}
        {currentStep === 'extract' && (
          <p>🤖 La IA está procesando tu documento para extraer los datos automáticamente</p>
        )}
        {isComplete && (
          <p>🎉 ¡Felicitaciones! Tu póliza ha sido procesada exitosamente</p>
        )}
      </div>
    </div>
  );
};

export default WizardNavigation;