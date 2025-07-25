// src/components/wizard/PolizaWizard.tsx - INTEGRADO CON HOOKS

import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme'; // ✅ RUTA CORREGIDA
import { useWizardNavigation } from '../../hooks/wizard/useWizardNavigation'; // ✅ NUEVO
import { useWizardPersistence } from '../../hooks/wizard/useWizardPersistence'; // ✅ NUEVO
import { useStepTransitions } from '../../hooks/ui/useStepTransitions'; // ✅ NUEVO

// Componentes de pasos
import { ClienteStep } from './steps/ClienteStep';
import { CompanyStep } from './steps/CompanyStep';
import { SeccionStep } from './steps/SeccionStep';
import { OperacionStep } from './steps/OperationStep';
import { UploadStep } from './steps/UploadStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { FormStep } from './steps/FormStep';
import { SuccessStep } from './steps/SuccessStep';

// Componentes de UI
import { WizardHeader } from './components/WizardHeader';
import { WizardProgressBar } from './components/WizardProgressBar';
import { WizardNavigation } from './components/WizardNavigation';

// Icons
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';

// ============================================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================================

export const PolizaWizard: React.FC = () => {
  const { effectiveTheme } = useTheme(); // ✅ CAMBIADO
  const isDarkMode = effectiveTheme === 'dark'; // ✅ DERIVADO

  // ============================================================================
  // 🎪 HOOKS INTEGRADOS
  // ============================================================================

  // Hook de navegación principal
  const navigation = useWizardNavigation({
    initialStep: 'cliente',
    enablePersistence: true,
    enableValidation: true,
    enableLogging: true,
    onStepChange: (step, previousStep) => {
      console.log(`📍 Navegando de ${previousStep} → ${step}`);
      
      // Iniciar transición animada
      if (previousStep) {
        const direction = navigation.getCurrentStepIndex() > 
          (navigation.steps.findIndex(s => s.id === previousStep) || 0) ? 'forward' : 'backward';
        
        transitions.startTransition(previousStep, step, direction);
      }
    },
    onStepComplete: (step, data) => {
      console.log(`✅ Paso ${step} completado:`, data);
      
      // Guardar estado automáticamente
      persistence.saveState(navigation.wizardState, data);
    },
    onWizardComplete: (data) => {
      console.log(`🎉 Wizard completado:`, data);
    },
    onValidationError: (step, errors) => {
      console.error(`❌ Errores de validación en ${step}:`, errors);
    }
  });

  // Hook de persistencia
  const persistence = useWizardPersistence({
    keyPrefix: 'poliza_wizard',
    autoSave: true,
    autoSaveInterval: 30000, // 30 segundos
    includeFormData: true,
    includeStepData: true,
    onSave: (data) => {
      console.log('💾 Estado guardado automáticamente');
    },
    onLoad: (data) => {
      console.log('📂 Estado cargado:', data);
    },
    onExpired: (sessionId) => {
      console.log('⏰ Sesión expirada:', sessionId);
    }
  });

  // Hook de transiciones
  const transitions = useStepTransitions({
    duration: 300,
    direction: 'horizontal',
    enablePreload: true,
    respectReducedMotion: true,
    onTransitionStart: (from, to) => {
      console.log(`🎬 Iniciando transición: ${from} → ${to}`);
    },
    onTransitionEnd: (from, to) => {
      console.log(`✨ Transición completada: ${from} → ${to}`);
    }
  });

  // ============================================================================
  // 🔄 EFECTOS Y SINCRONIZACIÓN
  // ============================================================================

  // Cargar estado persistido al montar
  useEffect(() => {
    const loadPersistedState = async () => {
      const persistedData = await persistence.loadState();
      
      if (persistedData && persistedData.wizardState) {
        // Si hay datos persistidos, sincronizar con navegación
        console.log('🔄 Restaurando estado persistido');
        
        // Aquí podrías restaurar el estado del navigation si fuera necesario
        // Por ahora, el useWizardNavigation ya maneja su propia persistencia
      }
    };

    loadPersistedState();
  }, []);

  // Auto-guardar cuando cambie el estado del wizard
  useEffect(() => {
    if (navigation.wizardState && !navigation.isProcessing) {
      persistence.saveState(navigation.wizardState);
    }
  }, [navigation.wizardState, navigation.isProcessing]);

  // ============================================================================
  // 🎨 FUNCIONES DE RENDERIZADO
  // ============================================================================

  /**
   * Renderiza el paso actual según el estado de navegación
   */
  const renderCurrentStep = () => {
    const stepProps = {
      onNext: navigation.goNext,
      onBack: navigation.goBack,
      onComplete: (data: any) => navigation.completeStep(navigation.currentStep, data),
      wizardData: navigation.wizardState.stepData,
      isTransitioning: transitions.isTransitioning
    };

    switch (navigation.currentStep) {
      case 'cliente':
        return <ClienteStep {...stepProps} />;
      
      case 'company':
        return <CompanyStep {...stepProps} />;
      
      case 'seccion':
        return <SeccionStep {...stepProps} />;
      
      case 'operacion':
        return <OperacionStep {...stepProps} />;
      
      case 'upload':
        return <UploadStep {...stepProps} />;
      
      case 'extract':
        return <ProcessingStep {...stepProps} />;
      
      case 'form':
        return <FormStep {...stepProps} />;
      
      case 'success':
        return <SuccessStep {...stepProps} />;
      
      default:
        return (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Paso no encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              El paso "{navigation.currentStep}" no existe
            </p>
            <button
              onClick={() => navigation.goToStep('cliente')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ir al inicio
            </button>
          </div>
        );
    }
  };

  /**
   * Renderiza información de persistencia y estado
   */
  const renderWizardStatus = () => {
    if (!persistence.hasPersistedData && !navigation.isProcessing) return null;

    return (
      <div className={`mb-4 p-3 rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600 text-gray-300' 
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {persistence.isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Guardando...</span>
              </>
            ) : persistence.hasPersistedData ? (
              <>
                <Save className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  Guardado {persistence.lastSaved?.toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>

          {persistence.hasPersistedData && (
            <button
              onClick={() => {
                persistence.clearState();
                navigation.resetWizard();
              }}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // 🎨 RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header del Wizard */}
      <WizardHeader
        currentStep={navigation.currentStep}
        steps={navigation.steps}
        progress={navigation.progress}
        isDarkMode={isDarkMode}
        onStepClick={(stepId) => {
          if (navigation.canNavigateTo(stepId)) {
            navigation.goToStep(stepId);
          }
        }}
      />

      {/* Barra de Progreso */}
      <WizardProgressBar
        progress={navigation.progress}
        currentStep={navigation.currentStep}
        completedSteps={navigation.completedSteps}
        isDarkMode={isDarkMode}
      />

      {/* Contenedor Principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Estado del Wizard */}
        {renderWizardStatus()}

        {/* Contenedor de Pasos con Transiciones */}
        <div 
          {...transitions.getContainerProps()}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Contenido del Paso Actual */}
          <div
            style={transitions.getTransitionStyles(navigation.currentStep)}
            className="transition-all duration-300 ease-in-out"
          >
            {renderCurrentStep()}
          </div>

          {/* Overlay de Transición */}
          {transitions.isTransitioning && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600 dark:text-gray-300">
                  Cambiando paso...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navegación del Wizard */}
        <WizardNavigation
          currentStep={navigation.currentStep}
          canGoBack={navigation.canGoBack}
          canGoNext={navigation.canGoNext}
          isComplete={navigation.isComplete}
          isProcessing={navigation.isProcessing || transitions.isTransitioning}
          onBack={navigation.goBack}
          onNext={navigation.goNext}
          onSkip={() => navigation.skipStep()}
          onComplete={() => {
            // Lógica de finalización
            console.log('🎉 Completando wizard...');
          }}
          validationErrors={navigation.getValidationErrors()}
          isDarkMode={isDarkMode}
        />

      </div>

      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
          <div className="space-y-1">
            <div><strong>Paso:</strong> {navigation.currentStep}</div>
            <div><strong>Progreso:</strong> {navigation.progress.percentage}%</div>
            <div><strong>Completados:</strong> {Array.from(navigation.completedSteps).join(', ')}</div>
            <div><strong>Persistencia:</strong> {persistence.hasPersistedData ? '✅' : '❌'}</div>
            <div><strong>Transición:</strong> {transitions.isTransitioning ? '🎬' : '✨'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolizaWizard;