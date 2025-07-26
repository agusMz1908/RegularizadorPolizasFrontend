// src/components/wizard/PolizaWizard.tsx
// ✅ VERSIÓN CORREGIDA - Sin bucles infinitos y búsqueda de clientes funcional

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

// ✅ Hook principal del wizard
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { useFormValidation } from '../../hooks/wizard/useFormValidation';

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
import { DocumentProcessResult } from '../../types/ui/wizard';

// ✅ Icons
import { AlertTriangle, RotateCcw } from 'lucide-react';

// ============================================================================
// 🎯 COMPONENTE PRINCIPAL CORREGIDO
// ============================================================================

export const PolizaWizard: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Estados locales
  const [formData, setFormData] = useState<PolizaFormData>({} as PolizaFormData);
  const [saving, setSaving] = useState(false);

  // ✅ Refs para manejar timeouts y evitar bucles
  const searchTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // ✅ Hook principal del wizard
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
    
    // Funciones principales
    selectCliente,
    selectCompany,
    selectSeccion,
    selectOperacion,
    setUploadedFile,
    processDocument,
    createPoliza,
    retryProcessing,
    
    // Navegación
    goBack,
    reset,
    
    // Utilidades
    setError,
    validateCurrentStep,
    getAuthToken
  } = usePolizaWizard();

  // ✅ Hook de validación
  const formValidation = useFormValidation();

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
    }, 500); // Aumentamos a 500ms para evitar demasiadas llamadas

  }, [setClienteSearch, searchClientes]);

  // ✅ CARGAR COMPAÑÍAS SOLO UNA VEZ
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('🚀 Inicializando PolizaWizard - Cargando compañías...');
      loadCompanies();
      isInitializedRef.current = true;
    }
  }, []);

  // ✅ CARGAR SECCIONES CUANDO SE SELECCIONA COMPAÑÍA
  useEffect(() => {
    if (selectedCompany && currentStep === 'seccion') {
      console.log('🔍 Compañía seleccionada, cargando secciones para:', selectedCompany.comnom);
      loadSecciones();
    }
  }, [selectedCompany?.id, currentStep]);

  // ✅ CLEANUP DE TIMEOUTS
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Función para manejar envío final de póliza
  const handlePolizaSubmit = async (finalFormData: PolizaFormData) => {
    setSaving(true);
    
    try {
      console.log('📝 Enviando póliza a Velneo:', finalFormData);
      await createPoliza(finalFormData);
      console.log('✅ Póliza creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando póliza:', error);
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
            
            // ✅ BÚSQUEDA MEJORADA - Sin timeouts conflictivos
            onSearchChange={handleClienteSearch}
            
            onClienteSelect={(cliente) => {
              console.log('🎯 Cliente seleccionado:', cliente);
              selectCliente(cliente);
            }}
            
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
            
            onCompanySelect={(company) => {
              console.log('🏢 Compañía seleccionada:', company);
              selectCompany(company);
            }}
            
            // ✅ Función estable - ya memoizada en el hook
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
              return Promise.resolve(true);
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
            
            onOperacionSelect={(operacion) => {
              console.log('⚙️ Operación seleccionada:', operacion);
              selectOperacion(operacion);
            }}
            
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
              console.log('📄 Archivo seleccionado:', file?.name);
              setUploadedFile(file);
            }}
            
            onProcess={async (file) => {
              if (file) {
                try {
                  await processDocument(file);
                } catch (error) {
                  console.error('Error procesando documento:', error);
                  setError('Error procesando el documento');
                }
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

      case 'extract':
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