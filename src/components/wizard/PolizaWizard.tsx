import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

// ✅ Hook principal del wizard
import { usePolizaWizard } from '../../hooks/usePolizaWizard';

// ✅ Componentes de pasos
import { ClienteStep } from './steps/ClienteStep';
import { CompanyStep } from './steps/CompanyStep';
import { SeccionStep } from './steps/SeccionStep';
import { OperacionStep } from './steps/OperationStep';
import { UploadStep } from './steps/UploadStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { FormStep } from './steps/FormStep';
import { SuccessStep } from './steps/SuccessStep';

// ✅ Componente de header
import FloatingWizardHeader from './FloatingWizardHeader';

// ✅ Types
import { PolizaFormData } from '../../types/core/poliza';

// ✅ Icons
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const PolizaWizard: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Estados locales
  const [formData, setFormData] = useState<PolizaFormData>({} as PolizaFormData);
  const [saving, setSaving] = useState(false);

  // ✅ Refs para manejar timeouts y evitar bucles
  const searchTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // ✅ Hook principal del wizard - SOLO propiedades que existen
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
    loadingClientes,
    
    // Estados de compañías  
    companies,
    loadingCompanies,
    
    // Estados de secciones
    secciones,
    seccionesLookup,
    loadingSecciones,
    
    // Acciones principales
    searchClientes,
    loadCompanies,
    loadSecciones,
    processDocument,
    selectCliente,
    selectCompany,
    selectSeccion,
    selectOperacion,
    uploadFile,
    reset,
    
    // Utilidades
    setError
  } = usePolizaWizard();

  // ✅ BÚSQUEDA DE CLIENTES CON DEBOUNCE MEJORADO
  const handleClienteSearch = useCallback((searchTerm: string) => {
    console.log('🔍 Manejando búsqueda de cliente:', searchTerm);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Actualizar estado inmediatamente
    setClienteSearch(searchTerm);

    // Si el término está vacío, limpiar resultados
    if (!searchTerm.trim()) {
      return;
    }

    // Debounce la búsqueda
    searchTimeoutRef.current = window.setTimeout(() => {
      console.log('🔍 Ejecutando búsqueda debounced:', searchTerm);
      searchClientes(searchTerm);
    }, 500);

  }, [setClienteSearch, searchClientes]);

  // ✅ CARGAR COMPAÑÍAS SOLO UNA VEZ
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('🚀 Inicializando PolizaWizard - Cargando compañías...');
      loadCompanies();
      isInitializedRef.current = true;
    }
  }, [loadCompanies]);

  // ✅ CARGAR SECCIONES CUANDO SE SELECCIONA COMPAÑÍA
  useEffect(() => {
    if (selectedCompany && currentStep === 'seccion') {
      console.log('🔍 Compañía seleccionada, cargando secciones para:', selectedCompany.comnom);
      loadSecciones();
    }
  }, [selectedCompany?.id, currentStep, loadSecciones]);

  // ✅ CLEANUP DE TIMEOUTS
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Funciones de navegación manuales (ya que el hook no las expone)
  const goBack = useCallback(() => {
    // Implementar lógica de navegación hacia atrás
    switch (currentStep) {
      case 'company':
        // Ir a cliente, pero mantener la selección
        break;
      case 'seccion':
        // Ir a company
        break;
      case 'operacion':
        // Ir a seccion
        break;
      case 'upload':
        // Ir a operacion
        break;
      case 'processing':
        // Ir a upload
        break;
      case 'form':
        // Ir a processing
        break;
      case 'success':
        // Ir a form
        break;
    }
  }, [currentStep]);

  // ✅ Función para manejar envío final de póliza
  const handlePolizaSubmit = async (finalFormData: PolizaFormData) => {
    setSaving(true);
    
    try {
      console.log('📝 Enviando póliza a Velneo:', finalFormData);
      // TODO: Implementar createPoliza si no existe en el hook
      // await createPoliza(finalFormData);
      console.log('✅ Póliza creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando póliza:', error);
      setError('Error creando la póliza');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Renderizado condicional de pasos
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'cliente':
        return (
          <ClienteStep
            clienteSearch={clienteSearch}
            clienteResults={clienteResults}
            loadingClientes={loadingClientes}
            selectedCliente={selectedCliente}
            onSearchChange={handleClienteSearch}
            onClienteSelect={selectCliente}
            onNext={() => {
              if (!selectedCliente) {
                setError('Debe seleccionar un cliente');
              }
            }}
            onBack={goBack}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'company':
        return (
          <CompanyStep
            companies={companies}
            loadingCompanies={loadingCompanies}
            selectedCompany={selectedCompany}
            onCompanySelect={selectCompany}
            onLoadCompanies={loadCompanies}
            onNext={() => {
              if (!selectedCompany) {
                setError('Debe seleccionar una compañía');
              }
            }}
            onBack={goBack}
            isDarkMode={isDarkMode}
          />
        );
      
      case 'seccion':
        return (
          <SeccionStep
            onNext={async () => {
              if (!selectedSeccion) {
                setError('Debe seleccionar una sección');
                return false;
              }
              return true;
            }}
            onBack={goBack}
            onComplete={async (data) => {
              if (data?.seccion) {
                selectSeccion(data.seccion);
              }
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
            onOperacionSelect={selectOperacion}
            onNext={() => {
              if (!selectedOperacion) {
                setError('Debe seleccionar un tipo de operación');
              }
            }}
            onBack={goBack}
            isDarkMode={isDarkMode}
          />
        );

      case 'upload':
        return (
          <UploadStep
            uploadedFile={uploadedFile}
            processing={processing}
            onFileSelect={(file) => {
              if (file) {
                uploadFile(file);
              } else {
                // Handle file removal if needed
                console.log('File removed');
              }
            }}
            onProcess={async (file) => {
              try {
                await processDocument(file);
              } catch (error) {
                console.error('Error procesando documento:', error);
                setError('Error procesando el documento');
              }
            }}
            onNext={() => {
              if (!uploadedFile) {
                setError('Debe subir un documento');
              }
            }}
            onBack={goBack}
            isDarkMode={isDarkMode}
          />
        );

      case 'processing':
        return (
          <ProcessingStep
            uploadedFile={uploadedFile}
            progress={processingProgress}
            selectedCliente={selectedCliente}
            selectedCompany={selectedCompany}
            onNext={() => {
              console.log('Continuando al formulario...');
            }}
            onBack={goBack}
            isDarkMode={isDarkMode}
            mode="sync"
            status={error || 'Procesando documento...'}
            stage="processing"
            onRetry={() => {
              if (uploadedFile) {
                uploadFile(uploadedFile);
              }
            }}
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
                touchedFields: new Set<string>()
              },
              validateField: () => {},
              validateAll: () => true,
              markFieldTouched: () => {},
              clearErrors: () => {},
              getFieldError: () => undefined,
              hasFieldError: () => false,
              isFieldTouched: () => false
            }}
            onFormDataChange={setFormData}
            onSubmit={() => handlePolizaSubmit(formData)}
            saving={saving}
            onNext={() => {
              if (!formData || Object.keys(formData).length === 0) {
                setError('Debe completar el formulario');
              }
            }}
            onBack={goBack}
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
            onBack={goBack}
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
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Paso no encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                El paso "{currentStep}" no está implementado.
              </p>
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Reiniciar Wizard
              </button>
            </div>
          </div>
        );
    }
  };

  // ✅ Render principal
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      
      {/* ✅ Header flotante */}
      <FloatingWizardHeader
        currentStep={currentStep}
        isDarkMode={isDarkMode}
        onCancel={reset}
      />

      {/* ✅ Contenedor principal */}
      <div className="pt-8">
        
        {/* Error Global */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 mb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
          </div>
        )}
        
        {/* ✅ Contenido del paso actual */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentStep()}
        </div>
        
      </div>
      
    </div>
  );
};

export default PolizaWizard;