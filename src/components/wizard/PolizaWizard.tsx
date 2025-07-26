// src/components/wizard/PolizaWizard.tsx
// ✅ VERSIÓN CORREGIDA - USANDO useFormValidation REAL

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

// ✅ Hook principal del wizard
import { usePolizaWizard } from '../../hooks/usePolizaWizard';

// ✅ Hook de validación REAL
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

// ✅ Types - Usando el enfoque que funciona
import type { PolizaFormData } from '../../types/core/poliza';
import { WizardStep, createStepData } from '../../types/ui/wizard';

// ✅ Icons
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const PolizaWizard: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Estados locales
  const [formData, setFormData] = useState<PolizaFormData>({} as PolizaFormData);
  const [saving, setSaving] = useState(false);

  // ✅ Hook de validación REAL
  const formValidation = useFormValidation();

  // ✅ Refs para manejar timeouts
  const searchTimeoutRef = useRef<number | null>(null);

  // ✅ Hook principal del wizard
  const {
    // Estado del wizard
    currentStep,
    selectedCliente,
    selectedCompany,
    selectedSeccion,
    selectedOperacion,
    uploadedFile,
    extractedData,
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
    loadingSecciones,
    
    // Acciones principales
    searchClientes,
    loadCompanies,
    selectCliente,
    selectCompany,
    selectSeccion,
    selectOperacion,
    uploadFile,
    reset,
    
    // Utilidades
    setError
  } = usePolizaWizard();

  // ✅ Búsqueda de clientes con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (clienteSearch.trim().length >= 2) {
      searchTimeoutRef.current = window.setTimeout(() => {
        searchClientes(clienteSearch);
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [clienteSearch, searchClientes]);

  // ✅ Validar formulario cuando cambie formData
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      formValidation.validateAll(formData);
    }
  }, [formData, formValidation]);

  // ✅ Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Handlers adaptados a las interfaces
  const handleNext = () => {
    // Navegación se maneja automáticamente en el hook
    console.log('Next step...');
  };

  const handleBack = () => {
    // Navegación hacia atrás
    console.log('Previous step...');
  };

  const handleComplete = async (data: any): Promise<boolean> => {
    try {
      // Lógica de completado
      console.log('Completing with data:', data);
      return true;
    } catch (error) {
      console.error('Error completing:', error);
      return false;
    }
  };

  // ✅ Handler para cambios en formData con validación
  const handleFormDataChange = (newFormData: PolizaFormData) => {
    setFormData(newFormData);
    // La validación se ejecuta automáticamente en el useEffect
  };

  // ✅ Handler para envío del formulario
  const handleFormSubmit = async () => {
    setSaving(true);
    try {
      // Validar antes de enviar
      const isValid = formValidation.validateAll(formData);
      
      if (!isValid) {
        console.warn('❌ Formulario tiene errores, no se puede enviar');
        setSaving(false);
        return;
      }

      console.log('📝 Enviando póliza a Velneo:', formData);
      
      // TODO: Implementar lógica real de envío
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular envío
      
      console.log('✅ Póliza enviada exitosamente');
    } catch (error) {
      console.error('❌ Error enviando póliza:', error);
      setError('Error enviando la póliza a Velneo');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Datos del wizard consolidados
  const wizardData = {
    cliente: selectedCliente,
    company: selectedCompany,
    seccion: selectedSeccion,
    operacion: selectedOperacion,
    uploadedFile,
    extractedData,
    formData
  };

  // ✅ Renderizar paso actual - PROPS ADAPTADAS A CADA INTERFAZ
  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 'cliente':
        return (
          <ClienteStep
            clienteSearch={clienteSearch}
            clienteResults={clienteResults}
            loadingClientes={loadingClientes}
            selectedCliente={selectedCliente}
            onSearchChange={setClienteSearch}
            onClienteSelect={selectCliente}
            onNext={handleNext}
            onBack={handleBack}
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
            onNext={handleNext}
            onBack={handleBack}
            isDarkMode={isDarkMode}
          />
        );

      case 'seccion':
        return (
          <SeccionStep
            secciones={secciones}
            selectedSeccion={selectedSeccion}
            onSeccionSelect={selectSeccion}
            loadingSecciones={loadingSecciones}
            onNext={async () => true}
            onBack={handleBack}
            onComplete={handleComplete}
            wizardData={wizardData}
            isTransitioning={false}
            isDarkMode={isDarkMode}
          />
        );

      case 'operacion':
        return (
          <OperacionStep
            selectedOperacion={selectedOperacion}
            onOperacionSelect={selectOperacion}
            onNext={handleNext}
            onBack={handleBack}
            isDarkMode={isDarkMode}
          />
        );

      case 'upload':
        return (
          <UploadStep
            uploadedFile={uploadedFile}
            processing={processing}
            onFileSelect={(file) => file && uploadFile(file)}
            onProcess={async (file) => await uploadFile(file)}
            onNext={handleNext}
            onBack={handleBack}
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
            onNext={handleNext}
            onBack={handleBack}
            isDarkMode={isDarkMode}
            mode="sync"
            status="Procesando documento..."
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
            validation={formValidation}
            onFormDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
            saving={saving}
            onNext={handleNext}
            onBack={handleBack}
            isDarkMode={isDarkMode}
            wizardState={{
              currentStep,
              selectedCliente,
              selectedCompany,
              selectedSeccion,
              selectedOperacion,
              uploadedFile,
              extractedData,
              isComplete,
              stepData: createStepData(
                selectedCliente,
                selectedCompany,
                selectedSeccion,
                selectedOperacion,
                uploadedFile,
                extractedData,
                formData
              )
            }}
          />
        );

      case 'success':
        return (
          <SuccessStep
            onNext={async () => true}
            onBack={handleBack}
            onComplete={handleComplete}
            wizardData={wizardData}
            isTransitioning={false}
          />
        );

      default:
        return <div>Paso no encontrado</div>;
    }
  }, [
    currentStep,
    selectedCliente,
    selectedCompany,
    selectedSeccion,
    selectedOperacion,
    uploadedFile,
    extractedData,
    formData,
    clienteSearch,
    setClienteSearch,
    clienteResults,
    loadingClientes,
    companies,
    loadingCompanies,
    secciones,
    loadingSecciones,
    processing,
    processingProgress,
    saving,
    selectCliente,
    selectCompany,
    selectSeccion,
    selectOperacion,
    uploadFile,
    loadCompanies,
    isDarkMode,
    wizardData,
    formValidation
  ]);

  // ✅ Render principal
  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header flotante */}
      <FloatingWizardHeader 
        currentStep={currentStep as string}
        isDarkMode={isDarkMode}
        onCancel={reset}
      />

      {/* Contenido principal */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Error global */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            isDarkMode 
              ? 'bg-red-900/20 border border-red-800 text-red-300' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className={`ml-auto p-1 rounded-md hover:bg-black/10 transition-colors ${
                isDarkMode ? 'text-red-300' : 'text-red-600'
              }`}
            >
              ×
            </button>
          </div>
        )}

        {/* Paso actual */}
        <div className="max-w-4xl mx-auto">
          {renderCurrentStep()}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Cargando...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolizaWizard;