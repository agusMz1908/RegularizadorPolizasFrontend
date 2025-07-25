// src/components/wizard/PolizaWizard.tsx - CON TODAS LAS INTERFACES REALES

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useWizardNavigation } from '../../hooks/wizard/useWizardNavigation';
import { useWizardPersistence } from '../../hooks/wizard/useWizardPersistence';
import { useStepTransitions } from '../../hooks/ui/useStepTransitions';

// Componentes de pasos con sus interfaces REALES
import { ClienteStep } from './steps/ClienteStep';
import { CompanyStep } from './steps/CompanyStep';
import { SeccionStep } from './steps/SeccionStep';
import { OperacionStep } from './steps/OperationStep';
import { UploadStep } from './steps/UploadStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { FormStep } from './steps/FormStep';
import { SuccessStep } from './steps/SuccessStep';

// Types necesarios
import { PolizaFormData } from '../../types/core/poliza';
import { DocumentProcessResult } from '../../types/ui/wizard';

// Icons
import { 
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';

// ============================================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================================

export const PolizaWizard: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Estados adicionales para los pasos complejos
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<PolizaFormData>({} as PolizaFormData);
  const [extractedData, setExtractedData] = useState<DocumentProcessResult | null>(null);
  const [saving, setSaving] = useState(false);

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
        const currentIndex = navigation.getCurrentStepIndex();
        const previousIndex = navigation.steps.findIndex(s => s.id === previousStep);
        const direction = currentIndex > previousIndex ? 'forward' : 'backward';
        
        transitions.transitionToStep(step, direction);
      }
    },
    onStepComplete: (step, data) => {
      console.log(`✅ Paso ${step} completado:`, data);
      persistence.saveState(navigation.wizardState, undefined, data);
    },
    onWizardComplete: (data) => {
      console.log(`🎉 Wizard completado:`, data);
    },
    onValidationError: (step, errors) => {
      console.error(`❌ Errores de validación en ${step}:`, errors);
    }
  });
  
  useEffect(() => {
    if (navigation.currentStep === 'extract' && uploadedFile && !processing) {
      const timer = setTimeout(() => {
        // Simular datos extraídos
        const mockExtractedData: DocumentProcessResult = {
          documentId: 'doc-123',
          estadoProcesamiento: 'completed',
          extractedFields: [],
          polizaData: {},
          readyForVelneo: true
        };
        
        setExtractedData(mockExtractedData);
        navigation.completeStep('extract', mockExtractedData);
        navigation.goNext();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigation.currentStep, uploadedFile, processing]); 


  // Hook de persistencia
  const persistence = useWizardPersistence({
    keyPrefix: 'poliza_wizard',
    autoSave: true,
    autoSaveInterval: 30000,
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

  // Hook de transiciones (usando la interfaz real)
  const transitions = useStepTransitions(navigation.currentStep, {
    type: 'slide-left',
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  });

  // ============================================================================
  // 🔄 EFECTOS Y SINCRONIZACIÓN
  // ============================================================================

  // Cargar estado persistido al montar
  useEffect(() => {
    const loadPersistedState = async () => {
      const persistedData = await persistence.loadState();
      
      if (persistedData && persistedData.wizardState) {
        console.log('🔄 Restaurando estado persistido');
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
   * USANDO LAS INTERFACES REALES DE CADA COMPONENTE
   */
  const renderCurrentStep = () => {
    switch (navigation.currentStep) {
      case 'cliente':
        return (
          <ClienteStep
            // Props según ClienteStep interface REAL
            clienteSearch=""
            clienteResults={[]}
            loadingClientes={false}
            selectedCliente={navigation.wizardState.stepData.cliente}
            onSearchChange={() => {}}
            onClienteSelect={(cliente) => {
              navigation.completeStep('cliente', { cliente });
              navigation.goNext();
            }}
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'company':
        return (
          <CompanyStep
            // Props según CompanyStep interface REAL
            companies={[]}
            loadingCompanies={false}
            selectedCompany={navigation.wizardState.stepData.company}
            onCompanySelect={(company) => {
              navigation.completeStep('company', { company });
              navigation.goNext();
            }}
            onLoadCompanies={() => {}}
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'seccion':
        return (
          <SeccionStep
            // Props según SeccionStep interface REAL (las props comunes)
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            onComplete={(data) => navigation.completeStep('seccion', data)}
            wizardData={navigation.wizardState.stepData}
            isTransitioning={transitions.transitionState.isTransitioning}
          />
        );
      
      case 'operacion':
        return (
          <OperacionStep
            // Props según OperacionStep interface REAL
            selectedOperacion={navigation.wizardState.stepData.operacion}
            onOperacionSelect={(operacion) => {
              navigation.completeStep('operacion', { operacion });
            }}
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'upload':
        return (
          <UploadStep
            // Props según UploadStep interface REAL
            uploadedFile={uploadedFile}
            processing={processing}
            onFileSelect={(file) => {
              setUploadedFile(file);
              if (file) {
                navigation.completeStep('upload', { file });
              }
            }}
            onProcess={(file) => {
              setProcessing(true);
              // Simular procesamiento
              setTimeout(() => {
                setProcessing(false);
                navigation.goNext();
              }, 2000);
            }}
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'extract':
        return (
          <ProcessingStep
            // Props según ProcessingStep interface REAL
            uploadedFile={uploadedFile}
            progress={processing ? 50 : 100}
            selectedCliente={navigation.wizardState.stepData.cliente}
            selectedCompany={navigation.wizardState.stepData.company}
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'form':
        return (
          <FormStep
            // Props según FormStep interface REAL
            formData={formData}
            extractedData={extractedData}
            validation={{
              validation: { 
                isValid: true, 
                errors: [], 
                warnings: [],
                touchedFields: new Set()
              },
              validateField: () => {},
              validateAll: () => true,
              markFieldTouched: () => {},
              clearErrors: () => {},
              getFieldError: () => undefined,
              hasFieldError: () => false,
              isFieldTouched: () => false
            }}
            onFormDataChange={(data) => {
              setFormData(data);
              navigation.completeStep('form', data);
            }}
            onSubmit={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                navigation.goNext();
              }, 1000);
            }}
            saving={saving}
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'success':
        return (
          <SuccessStep
            // Props según SuccessStep interface REAL (las props comunes)
            onNext={() => navigation.goNext()}
            onBack={() => navigation.goBack()}
            onComplete={(data) => navigation.completeStep('success', data)}
            wizardData={navigation.wizardState.stepData}
            isTransitioning={transitions.transitionState.isTransitioning}
          />
        );
      
      default:
        return (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Paso no encontrado
            </h3>
            <p className={`mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
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
              className={`text-sm flex items-center space-x-1 transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderiza una barra de progreso simple
   */
  const renderProgressBar = () => {
    return (
      <div className={`border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {navigation.steps.map((step, index) => {
              const isCompleted = navigation.completedSteps.has(step.id);
              const isCurrent = step.id === navigation.currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Paso */}
                  <div className="flex flex-col items-center">
                    {/* Círculo del paso */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-300 text-gray-600'
                      }
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    
                    {/* Label */}
                    <span className={`
                      mt-2 text-xs font-medium text-center
                      ${isCurrent
                        ? isDarkMode ? 'text-white' : 'text-gray-900'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }
                    `}>
                      {step.title}
                    </span>
                  </div>
                  
                  {/* Línea conectora */}
                  {index < navigation.steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${index < navigation.getCurrentStepIndex()
                        ? 'bg-green-500'
                        : isDarkMode
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                      }
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza botones de navegación simples
   */
  const renderNavigation = () => {
    return (
      <div className={`border-t transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Botón Atrás */}
            <button
              onClick={navigation.goBack}
              disabled={!navigation.canGoBack || navigation.isProcessing}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg transition-all
                ${navigation.canGoBack && !navigation.isProcessing
                  ? isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              ← Atrás
            </button>

            {/* Botón Siguiente */}
            <button
              onClick={navigation.goNext}
              disabled={!navigation.canGoNext || navigation.isProcessing}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                ${navigation.canGoNext && !navigation.isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {navigation.isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : navigation.isComplete ? (
                'Finalizar'
              ) : (
                <>
                  Siguiente →
                </>
              )}
            </button>
          </div>
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
      {/* Container principal del wizard */}
      <div className={`min-h-screen max-w-7xl mx-auto shadow-xl transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        {/* Header simple */}
        <div className={`border-b transition-colors ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="px-8 py-6">
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Crear Nueva Póliza
            </h1>
            <p className={`mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Paso {navigation.getCurrentStepIndex() + 1} de {navigation.getTotalSteps()}
            </p>
          </div>
        </div>

        {/* Barra de Progreso */}
        {renderProgressBar()}

        {/* Contenedor Principal */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Estado del Wizard */}
          {renderWizardStatus()}

          {/* Contenedor de Pasos con Transiciones */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
            
            {/* Contenido del Paso Actual */}
            <div 
              className={`transition-all duration-300 ease-in-out ${transitions.getStepClasses(navigation.currentStep)}`}
            >
              {renderCurrentStep()}
            </div>

            {/* Overlay de Transición */}
            {transitions.transitionState.isTransitioning && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Cambiando paso...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navegación del Wizard */}
          {renderNavigation()}

        </div>
      </div>

      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
          <div className="space-y-1">
            <div><strong>Paso:</strong> {navigation.currentStep}</div>
            <div><strong>Progreso:</strong> {navigation.progress.percentage}%</div>
            <div><strong>Completados:</strong> {Array.from(navigation.completedSteps).join(', ')}</div>
            <div>
              <strong>Persistencia:</strong> 
              {persistence.hasPersistedData ? ' ✅' : ' ❌'}
            </div>
            <div>
              <strong>Transición:</strong> 
              {transitions.transitionState.isTransitioning ? ' 🎬' : ' ✨'}
            </div>
            <div><strong>Errores:</strong> {navigation.getValidationErrors().length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolizaWizard;