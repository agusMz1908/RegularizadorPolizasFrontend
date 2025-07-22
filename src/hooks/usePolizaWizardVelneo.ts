// src/hooks/usePolizaWizardVelneo.ts
// 🔧 HOOK CORREGIDO - ERRORES Number SOLUCIONADOS

import { useState, useEffect, useCallback } from 'react';
import { azureDocumentServiceVelneo } from '../services/azureDocumentServiceVelneo';
import { 
  DocumentProcessResultVelneo, 
  PolizaFormDataComplete,
  Cliente,
  Company,
  WizardStep,
  WizardStateVelneo,
} from '../types/azure-document-velneo';

// ================================
// INTERFACES EXTENDIDAS
// ================================

/**
 * Interface para búsqueda de clientes con paginación
 */
interface ClienteSearchResult {
  clientes: Cliente[];
  total: number;
  hasMore: boolean;
  loading: boolean;
}

/**
 * Interface para configuración del wizard
 */
interface WizardConfig {
  autoAdvanceSteps: boolean;
  validateOnStepChange: boolean;
  enableDebugMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

/**
 * Interface para métricas del wizard
 */
interface WizardMetrics {
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  stepsCompleted: number;
  documentsProcessed: number;
  averageProcessingTime: number;
  errorsEncountered: number;
}

// ================================
// CONFIGURACIÓN INICIAL
// ================================

const initialState: WizardStateVelneo = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,
};

const defaultConfig: WizardConfig = {
  autoAdvanceSteps: false,
  validateOnStepChange: true,
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760', 10), // ✅ CORREGIDO
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['application/pdf'],
};

// ================================
// HOOK PRINCIPAL
// ================================

export const usePolizaWizardVelneo = (config: Partial<WizardConfig> = {}) => {
  // 🏗️ CONFIGURACIÓN
  const finalConfig = { ...defaultConfig, ...config };

  // 🏗️ ESTADOS PRINCIPALES
  const [state, setState] = useState<WizardStateVelneo>(initialState);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 🔍 ESTADOS DE BÚSQUEDA DE CLIENTES
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<ClienteSearchResult>({
    clientes: [],
    total: 0,
    hasMore: false,
    loading: false
  });
  
  // 🏢 ESTADOS DE COMPAÑÍAS
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // 📊 MÉTRICAS Y DEBUGGING
  const [metrics, setMetrics] = useState<WizardMetrics>({
    startTime: new Date(),
    stepsCompleted: 0,
    documentsProcessed: 0,
    averageProcessingTime: 0,
    errorsEncountered: 0
  });

  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // 🚀 INICIALIZACIÓN
  useEffect(() => {
    initializeWizard();
  }, []);

  // ================================
  // FUNCIONES DE INICIALIZACIÓN
  // ================================

  const initializeWizard = async () => {
    try {
      addDebugLog('🚀 Inicializando wizard Velneo...');
      
      setMetrics(prev => ({
        ...prev,
        startTime: new Date()
      }));

      await Promise.all([
        loadCompanies(),
        validateEnvironment()
      ]);

      addDebugLog('✅ Wizard inicializado correctamente');
    } catch (error: any) {
      console.error('Error inicializando wizard:', error);
      setError(`Error de inicialización: ${error.message}`);
      addDebugLog(`❌ Error inicialización: ${error.message}`);
    }
  };

  const validateEnvironment = () => {
    const requiredEnvVars = ['VITE_API_URL', 'VITE_AZURE_DOC_ENDPOINT'];
    const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
    }

    addDebugLog(`✅ Variables de entorno validadas: ${requiredEnvVars.join(', ')}`);
  };

  // ================================
  // 🏢 FUNCIONES DE COMPAÑÍAS
  // ================================

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    addDebugLog('🏢 Cargando compañías...');
    
    try {
      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const apiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10); // ✅ CORREGIDO

      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(apiTimeout) // ✅ CORREGIDO
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const companiesData = await response.json();
      setCompanies(companiesData);
      addDebugLog(`✅ ${companiesData.length} compañías cargadas`);
    } catch (error: any) {
      console.error('Error cargando compañías:', error);
      setError(`Error cargando compañías: ${error.message}`);
      addDebugLog(`❌ Error cargando compañías: ${error.message}`);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // ================================
  // 👤 FUNCIONES DE CLIENTES  
  // ================================

  const searchClientes = useCallback(async (searchTerm: string, reset: boolean = true) => {
    if (!searchTerm.trim()) {
      setClienteResults({
        clientes: [],
        total: 0,
        hasMore: false,
        loading: false
      });
      return;
    }

    if (reset) {
      setClienteResults(prev => ({ ...prev, loading: true }));
    }

    addDebugLog(`🔍 Buscando clientes: "${searchTerm}"`);

    try {
      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const searchTimeout = parseInt(import.meta.env.VITE_SEARCH_TIMEOUT || '15000', 10); // ✅ CORREGIDO

      const response = await fetch(`${import.meta.env.VITE_API_URL}/clientes/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(searchTimeout) // ✅ CORREGIDO
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const results = await response.json();
      
      setClienteResults({
        clientes: results.data || results,
        total: results.total || results.length,
        hasMore: results.hasMore || false,
        loading: false
      });

      addDebugLog(`✅ ${results.length || 0} clientes encontrados`);
    } catch (error: any) {
      console.error('Error buscando clientes:', error);
      setError(`Error buscando clientes: ${error.message}`);
      addDebugLog(`❌ Error buscando clientes: ${error.message}`);
      
      setClienteResults({
        clientes: [],
        total: 0,
        hasMore: false,
        loading: false
      });
    }
  }, []);

  // Debounce para búsqueda de clientes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (clienteSearch.trim()) {
        searchClientes(clienteSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [clienteSearch, searchClientes]);

  // ================================
  // 🎯 FUNCIONES DEL WIZARD
  // ================================

  const selectCliente = (cliente: Cliente) => {
    setState(prev => ({
      ...prev,
      selectedCliente: cliente,
      currentStep: finalConfig.autoAdvanceSteps ? 'company' : prev.currentStep
    }));
    
    setError(null);
    addDebugLog(`👤 Cliente seleccionado: ${cliente.clinom} (ID: ${cliente.id})`);
    
    updateMetrics('stepCompleted', 'cliente');
  };

  const selectCompany = (company: Company) => {
    setState(prev => ({
      ...prev,
      selectedCompany: company,
      currentStep: finalConfig.autoAdvanceSteps ? 'upload' : prev.currentStep
    }));
    
    setError(null);
    addDebugLog(`🏢 Compañía seleccionada: ${company.comnom} (ID: ${company.id})`);
    
    updateMetrics('stepCompleted', 'company');
  };

  const uploadFile = async (file: File) => {
    try {
      // Validaciones del archivo
      validateUploadedFile(file);

      setState(prev => ({
        ...prev,
        uploadedFile: file,
        currentStep: 'extract'
      }));

      setProcessing(true);
      setError(null);
      setProcessingProgress(0);

      addDebugLog(`📄 Iniciando procesamiento: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      const startTime = performance.now();

      const result = await azureDocumentServiceVelneo.processDocument(
        file,
        (progress) => {
          setProcessingProgress(progress);
          if (progress % 20 === 0) { // Log cada 20%
            addDebugLog(`⏳ Progreso: ${progress}%`);
          }
        }
      );

      const processingTime = performance.now() - startTime;

      addDebugLog(`✅ Procesamiento completado en ${Math.round(processingTime)}ms`);
      addDebugLog(`📊 Resultados: ${result.porcentajeCompletitud}% completitud, ${result.datosVelneo.metricas.camposExtraidos} campos extraídos`);

      setState(prev => ({
        ...prev,
        extractedData: result,
        currentStep: finalConfig.autoAdvanceSteps ? 'form' : 'form'
      }));

      updateMetrics('documentProcessed', processingTime);

    } catch (error: any) {
      console.error('❌ Error en procesamiento:', error);
      setError(error.message || 'Error procesando documento');
      addDebugLog(`❌ Error procesamiento: ${error.message}`);
      
      setState(prev => ({
        ...prev,
        currentStep: 'upload'
      }));

      updateMetrics('errorEncountered');
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  };

  const submitForm = async (formData: PolizaFormDataComplete): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      addDebugLog('📤 Enviando formulario a Velneo...');

      const createRequest = {
        clienteId: state.selectedCliente!.id,
        companiaId: state.selectedCompany!.id,
        datosPoliza: formData,
        archivoOriginal: state.uploadedFile!.name,
        procesadoConIA: true,
        datosOriginales: state.extractedData!.datosVelneo,
        porcentajeCompletitud: state.extractedData!.porcentajeCompletitud,
        tiempoProcesamiento: state.extractedData!.tiempoProcesamiento,
        observaciones: `Procesado automáticamente con Azure Document Intelligence. Completitud: ${state.extractedData!.porcentajeCompletitud}%`
      };

      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const apiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10); // ✅ CORREGIDO

      const response = await fetch(`${import.meta.env.VITE_API_URL}/polizas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createRequest),
        signal: AbortSignal.timeout(apiTimeout) // ✅ CORREGIDO
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      addDebugLog(`✅ Póliza creada exitosamente: ${result.numeroPoliza || 'N/A'} (ID: ${result.id || 'N/A'})`);

      setState(prev => ({
        ...prev,
        currentStep: 'success',
        isComplete: true
      }));

      updateMetrics('stepCompleted', 'form');
      finalizeMetrics();

      // ✅ NO RETORNAR NADA, SOLO Promise<void>
      
    } catch (error: any) {
      console.error('❌ Error creando póliza:', error);
      setError(error.message || 'Error creando póliza');
      addDebugLog(`❌ Error creando póliza: ${error.message}`);
      updateMetrics('errorEncountered');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 🔄 FUNCIONES DE NAVEGACIÓN
  // ================================

  const goToStep = (step: WizardStep) => {
    if (finalConfig.validateOnStepChange && !canNavigateToStep(step)) {
      setError(`No se puede navegar al paso ${step}. Completa los pasos anteriores.`);
      return;
    }

    setState(prev => ({
      ...prev,
      currentStep: step
    }));
    
    setError(null);
    addDebugLog(`🎯 Navegando a paso: ${step}`);
  };

  const goBack = () => {
    const stepOrder: WizardStep[] = ['cliente', 'company', 'upload', 'extract', 'form', 'success'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setState(prev => ({
        ...prev,
        currentStep: previousStep
      }));
      
      addDebugLog(`⬅️ Retrocediendo a paso: ${previousStep}`);
    }
    
    setError(null);
  };

  const goNext = () => {
    const stepOrder: WizardStep[] = ['cliente', 'company', 'upload', 'extract', 'form', 'success'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    
    if (currentIndex < stepOrder.length - 1 && canProceed()) {
      const nextStep = stepOrder[currentIndex + 1];
      setState(prev => ({
        ...prev,
        currentStep: nextStep
      }));
      
      addDebugLog(`➡️ Avanzando a paso: ${nextStep}`);
    }
  };

  const reset = () => {
    setState(initialState);
    setClienteSearch('');
    setClienteResults({
      clientes: [],
      total: 0,
      hasMore: false,
      loading: false
    });
    setError(null);
    setProcessingProgress(0);
    setProcessing(false);
    setLoading(false);
    setDebugLogs([]);
    
    setMetrics({
      startTime: new Date(),
      stepsCompleted: 0,
      documentsProcessed: 0,
      averageProcessingTime: 0,
      errorsEncountered: 0
    });

    addDebugLog('🔄 Wizard reseteado completamente');
  };

  // ================================
  // 📊 FUNCIONES DE VALIDACIÓN
  // ================================

  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 'cliente':
        return !!state.selectedCliente;
      case 'company':
        return !!state.selectedCompany;
      case 'upload':
        return !!state.uploadedFile;
      case 'extract':
        return !!state.extractedData && !processing;
      case 'form':
        return !!state.extractedData;
      default:
        return false;
    }
  }, [state, processing]);

  const canNavigateToStep = (step: WizardStep): boolean => {
    const stepOrder: WizardStep[] = ['cliente', 'company', 'upload', 'extract', 'form', 'success'];
    const targetIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(state.currentStep);
    
    if (targetIndex <= currentIndex) return true;
    
    for (let i = 0; i < targetIndex; i++) {
      const checkStep = stepOrder[i];
      switch (checkStep) {
        case 'cliente':
          if (!state.selectedCliente) return false;
          break;
        case 'company':
          if (!state.selectedCompany) return false;
          break;
        case 'upload':
          if (!state.uploadedFile) return false;
          break;
        case 'extract':
          if (!state.extractedData) return false;
          break;
      }
    }
    
    return true;
  };

  const validateUploadedFile = (file: File) => {
    if (!file) {
      throw new Error('No se ha seleccionado ningún archivo');
    }

    if (file.size > finalConfig.maxFileSize) {
      throw new Error(`El archivo es demasiado grande. Máximo permitido: ${(finalConfig.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    if (!finalConfig.allowedFileTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no válido. Solo se permiten: ${finalConfig.allowedFileTypes.join(', ')}`);
    }

    if (file.name.length > 100) {
      throw new Error('El nombre del archivo es demasiado largo (máximo 100 caracteres)');
    }
  };

  // ================================
  // 📈 FUNCIONES DE MÉTRICAS
  // ================================

  const updateMetrics = (action: 'stepCompleted' | 'documentProcessed' | 'errorEncountered', data?: any) => {
    setMetrics(prev => {
      const updated = { ...prev };
      
      switch (action) {
        case 'stepCompleted':
          updated.stepsCompleted += 1;
          addDebugLog(`📊 Paso completado: ${data}. Total: ${updated.stepsCompleted}`);
          break;
          
        case 'documentProcessed':
          updated.documentsProcessed += 1;
          updated.averageProcessingTime = (
            (prev.averageProcessingTime * (prev.documentsProcessed - 1) + data) / 
            prev.documentsProcessed
          );
          addDebugLog(`📊 Documento procesado. Total: ${updated.documentsProcessed}, Promedio: ${Math.round(updated.averageProcessingTime)}ms`);
          break;
          
        case 'errorEncountered':
          updated.errorsEncountered += 1;
          addDebugLog(`📊 Error registrado. Total errores: ${updated.errorsEncountered}`);
          break;
      }
      
      return updated;
    });
  };

  const finalizeMetrics = () => {
    setMetrics(prev => ({
      ...prev,
      endTime: new Date(),
      totalDuration: new Date().getTime() - prev.startTime.getTime()
    }));
  };

  // ================================
  // 🐛 FUNCIONES DE DEBUG
  // ================================

  const addDebugLog = (message: string) => {
    if (finalConfig.enableDebugMode) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      
      console.log(logEntry);
      setDebugLogs(prev => [...prev.slice(-49), logEntry]);
    }
  };

  // ================================
  // 📊 GETTERS COMPUTADOS
  // ================================

  const stepProgress = useCallback(() => {
    const steps: WizardStep[] = ['cliente', 'company', 'upload', 'extract', 'form', 'success'];
    const currentIndex = steps.indexOf(state.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  }, [state.currentStep]);

  const getStepStatus = useCallback((step: WizardStep) => {
    const currentStepIndex = ['cliente', 'company', 'upload', 'extract', 'form', 'success'].indexOf(state.currentStep);
    const stepIndex = ['cliente', 'company', 'upload', 'extract', 'form', 'success'].indexOf(step);
    
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  }, [state.currentStep]);

  // ================================
  // 📤 RETURN INTERFACE
  // ================================

  return {
    // Estados principales
    ...state,
    loading,
    processing,
    processingProgress,
    error,

    // Estados de búsqueda
    clienteSearch,
    clienteResults,
    companies,
    loadingCompanies,

    // Configuración
    config: finalConfig,

    // Acciones principales
    selectCliente,
    selectCompany,
    uploadFile,
    submitForm,

    // Navegación
    goToStep,
    goBack,
    goNext,
    reset,

    // Búsquedas
    searchClientes,
    setClienteSearch,

    // Getters
    canProceed: canProceed(),
    stepProgress: stepProgress(),
    getStepStatus,
    canNavigateToStep,

    // Métricas y debugging
    metrics,
    debugLogs,

    // Utilidades
    clearError: () => setError(null),
    addDebugLog,
    
    // Estados de conveniencia
    hasSelectedCliente: !!state.selectedCliente,
    hasSelectedCompany: !!state.selectedCompany,
    hasUploadedFile: !!state.uploadedFile,
    hasExtractedData: !!state.extractedData,
    isProcessingComplete: !processing && !!state.extractedData,
    isReadyForVelneo: state.extractedData?.listoParaVelneo || false,
  };
};

export default usePolizaWizardVelneo;