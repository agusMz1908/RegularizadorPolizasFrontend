// src/components/wizard/PolizaWizard.tsx - CON FUNCIÓN SELECTCLIENTE CORREGIDA

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

// Hook principal del wizard
import { usePolizaWizard } from '../../hooks/usePolizaWizard';

// Componentes de pasos
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

  // ✅ USAR EL HOOK PRINCIPAL QUE YA TIENE TODO IMPLEMENTADO
  const {
    // Estado del wizard
    selectedCliente,
    selectedCompany,
    selectedSeccion,
    selectedOperacion,
    uploadedFile,
    extractedData,
    currentStep,
    isComplete,
    
    // Estados de carga
    loading,
    processing,
    processingProgress,
    error,
    
    // Estados específicos del cliente
    clienteSearch,
    setClienteSearch,
    clienteResults,
    searchClientes,
    loadingClientes,
    
    // Estados de compañías
    companies,
    loadCompanies,
    loadingCompanies,
    
    // Estados de secciones
    secciones,
    loadSecciones,
    loadingSecciones,
    
    // Funciones principales - ✅ ESTAS SON LAS CORRECTAS
    selectCliente,        // ← Esta es la función correcta
    selectCompany,
    selectSeccion,
    selectOperacion,
    setUploadedFile,
    processDocument,
    createPoliza,
    retryProcessing,
    
    // Navegación
    goToStep,
    goBack,
    reset,
    
    // Utilidades
    setError,
    validateCurrentStep,
    getAuthToken
  } = usePolizaWizard();

  // Estados locales adicionales para el componente principal
  const [formData, setFormData] = useState<PolizaFormData>({} as PolizaFormData);
  const [saving, setSaving] = useState(false);

  // ============================================================================
  // 🎬 EFECTOS
  // ============================================================================

  // Cargar compañías al montar el componente
  useEffect(() => {
    loadCompanies();
  }, []);

  // Cargar secciones cuando se selecciona una compañía
  useEffect(() => {
    if (selectedCompany && currentStep === 'seccion') {
      console.log('🔍 Compañía seleccionada, cargando secciones...');
      loadSecciones();
    }
  }, [selectedCompany, currentStep]);

  // ============================================================================
  // 🎭 RENDERIZADO DE PASOS
  // ============================================================================

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'cliente':
        return (
          <ClienteStep
            clienteSearch={clienteSearch}
            clienteResults={clienteResults}
            loadingClientes={loadingClientes}
            selectedCliente={selectedCliente}
            
            onSearchChange={(search) => {
              setClienteSearch(search);
              
              // Debounce la búsqueda para evitar demasiadas llamadas
              const timeoutId = setTimeout(() => {
                searchClientes(search);
              }, 300);

              // Cleanup del timeout anterior
              return () => clearTimeout(timeoutId);
            }}
            
            // ✅ CORREGIDO: Usar la función correcta del hook
            onClienteSelect={(cliente) => {
              console.log('🎯 Cliente seleccionado en PolizaWizard:', cliente);
              selectCliente(cliente);  // ← Esta es la función correcta del hook
            }}
            
            onNext={() => {
              if (selectedCliente) {
                goToStep('company');
              } else {
                setError('Debe seleccionar un cliente');
              }
            }}
            onBack={() => goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'company':
        return (
          <CompanyStep
            companies={companies}
            loadingCompanies={loadingCompanies}
            selectedCompany={selectedCompany}
            
            onCompanySelect={(company) => {
              console.log('🏢 Compañía seleccionada en PolizaWizard:', company);
              selectCompany(company);  // ← Función correcta del hook
            }}
            
            onLoadCompanies={loadCompanies}
            onNext={() => {
              if (selectedCompany) {
                goToStep('seccion');
              } else {
                setError('Debe seleccionar una compañía');
              }
            }}
            onBack={() => goBack()}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'seccion':
        return (
          <SeccionStep
            onNext={async () => {
              if (selectedSeccion) {
                goToStep('operacion');
                return true;
              } else {
                setError('Debe seleccionar una sección');
                return false;
              }
            }}
            onBack={() => goBack()}
            onComplete={async (data) => {
              // Marcar paso como completado
              console.log('🎯 Sección completada:', data);
              return true;
            }}
            wizardData={{ seccion: selectedSeccion }}
            isTransitioning={false}
          />
        );

      case 'operacion':
        return (
          <OperacionStep
            selectedOperacion={selectedOperacion}
            
            onOperacionSelect={(operacion) => {
              console.log('⚙️ Operación seleccionada en PolizaWizard:', operacion);
              selectOperacion(operacion);  // ← Función correcta del hook
            }}
            
            onNext={() => {
              if (selectedOperacion) {
                goToStep('upload');
              } else {
                setError('Debe seleccionar un tipo de operación');
              }
            }}
            onBack={() => goBack()}
            isDarkMode={isDarkMode}
          />
        );

      case 'upload':
        return (
          <UploadStep
            uploadedFile={uploadedFile}
            processing={processing}
            
            onFileSelect={(file) => {
              console.log('📄 Archivo seleccionado en PolizaWizard:', file?.name);
              setUploadedFile(file);  // ← Función correcta del hook
            }}
            
            onProcess={async (file) => {
              if (file) {
                try {
                  await processDocument(file);
                  goToStep('extract');
                } catch (error) {
                  console.error('Error procesando documento:', error);
                  setError('Error procesando el documento');
                }
              }
            }}
            
            onNext={() => {
              if (uploadedFile) {
                goToStep('extract');
              } else {
                setError('Debe subir un documento');
              }
            }}
            onBack={() => goBack()}
            isDarkMode={isDarkMode}
          />
        );

      case 'extract':
        return (
          <ProcessingStep
            uploadedFile={uploadedFile}
            progress={processingProgress}
            selectedCliente={selectedCliente}
            selectedCompany={selectedCompany}
            onNext={() => {
              goToStep('form');
            }}
            onBack={() => goBack()}
            isDarkMode={isDarkMode}
          />
        );

      case 'form':
        return (
          <FormStep
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
            onFormDataChange={(data) => setFormData(data)}
            onSubmit={async () => {
              setSaving(true);
              try {
                await createPoliza(formData);
              } finally {
                setSaving(false);
              }
            }}
            saving={saving}
            onNext={() => {
              if (formData && Object.keys(formData).length > 0) {
                goToStep('success');
              } else {
                setError('Debe completar el formulario');
              }
            }}
            onBack={() => goBack()}
            isDarkMode={isDarkMode}
          />
        );

      case 'success':
        return (
          <SuccessStep
            onNext={async () => {
              reset();
              return true;
            }}
            onBack={() => goBack()}
            onComplete={async (data) => {
              console.log('🎉 Proceso completado:', data);
              return true;
            }}
            wizardData={{
              cliente: selectedCliente,
              company: selectedCompany,
              seccion: selectedSeccion,
              operacion: selectedOperacion,
              form: formData
            }}
            isTransitioning={false}
          />
        );

      default:
        return (
          <div className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Paso no encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              El paso "{currentStep}" no existe o no está implementado.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Reiniciar Wizard
            </button>
          </div>
        );
    }
  };

  // ============================================================================
  // 🎨 RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header del Wizard */}
        <div className={`sticky top-0 z-10 border-b ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Regularizador de Pólizas
                </h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Paso {currentStep} • {isComplete ? 'Completado' : 'En progreso'}
                </p>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center space-x-3">
                {error && (
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Limpiar error
                  </button>
                )}
                
                <button
                  onClick={reset}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 mr-2 inline" />
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Global */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  Error en el proceso
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Contenido del Paso Actual */}
        <div className="px-6 py-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default PolizaWizard;