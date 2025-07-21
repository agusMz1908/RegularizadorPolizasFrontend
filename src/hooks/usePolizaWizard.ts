import { useState, useEffect, useCallback } from 'react';
import { azureDocumentService, DocumentProcessResult } from '../services/azureDocumentService';

// 🎯 TIPOS DEL WIZARD
export type WizardStep = 'cliente' | 'company' | 'upload' | 'extract' | 'form' | 'success';

export interface Cliente {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  telefono?: string;
  cliemail?: string;
  clidir?: string;
  activo: boolean;
}

export interface Company {
  id: number;
  comnom: string;
  comalias: string;
  activo: boolean;
}

export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

const initialState: WizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,
};

export const usePolizaWizard = () => {
  // 🏗️ ESTADOS PRINCIPALES
  const [state, setState] = useState<WizardState>(initialState);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 🔍 ESTADOS DE BÚSQUEDA DE CLIENTES
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // 🏢 ESTADOS DE COMPAÑÍAS
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // 🚀 INICIALIZACIÓN
  useEffect(() => {
    loadCompanies();
    // ✅ NO cargar clientes al inicio - solo cuando busque
  }, []);

  // =====================================
  // 🔑 UTILIDADES DE AUTENTICACIÓN
  // =====================================

  const getAuthToken = useCallback((): string | null => {
    const tokenKey = import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token';
    return localStorage.getItem(tokenKey);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  }, [getAuthToken]);

  // =====================================
  // 🧭 NAVEGACIÓN DEL WIZARD
  // =====================================

  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
    setError(null);
  }, []);

  const goBack = useCallback(() => {
    setState((prev: WizardState) => {
      let newStep: WizardStep;
      let newState = { ...prev };
      
      switch (prev.currentStep) {
        case 'company':
          newStep = 'cliente';
          newState.selectedCliente = null;
          break;
        case 'upload':
          newStep = 'company';
          newState.selectedCompany = null;
          break;
        case 'extract':
          newStep = 'upload';
          newState.uploadedFile = null;
          setProcessing(false);
          setProcessingProgress(0);
          break;
        case 'form':
          newStep = 'extract';
          newState.extractedData = null;
          break;
        case 'success':
          newStep = 'form';
          break;
        default:
          return prev;
      }
      
      return { ...newState, currentStep: newStep };
    });
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setClienteSearch('');
    setClienteResults([]);
    setError(null);
    setLoading(false);
    setProcessing(false);
    setProcessingProgress(0);
  }, []);

  // =====================================
  // 👥 SELECCIONES
  // =====================================

  const selectCliente = useCallback((cliente: Cliente) => {
    setState((prev: WizardState) => ({ 
      ...prev, 
      selectedCliente: cliente, 
      currentStep: 'company' 
    }));
    setClienteSearch('');
    setClienteResults([]);
    setError(null);
    
    console.log('👤 Cliente seleccionado:', cliente);
  }, []);

  const selectCompany = useCallback((company: Company) => {
    setState((prev: WizardState) => ({ 
      ...prev, 
      selectedCompany: company, 
      currentStep: 'upload' 
    }));
    setError(null);
    
    console.log('🏢 Compañía seleccionada:', company);
  }, []);

  const setUploadedFile = useCallback((file: File | null) => {
    if (!file) {
      setState((prev: WizardState) => ({ 
        ...prev, 
        uploadedFile: null 
      }));
      return;
    }

    // Validar archivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos PDF.');
      return;
    }

    setState((prev: WizardState) => ({ 
      ...prev, 
      uploadedFile: file 
    }));
    setError(null);
    
    console.log('📄 Archivo seleccionado:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });
  }, []);

  // =====================================
  // 🤖 PROCESAMIENTO CON AZURE AI
  // =====================================

  const processDocument = useCallback(async (): Promise<void> => {
    // Validaciones previas
    if (!state.uploadedFile) {
      setError('No hay archivo para procesar');
      return;
    }

    if (!state.selectedCliente) {
      setError('Debe seleccionar un cliente primero');
      return;
    }

    if (!state.selectedCompany) {
      setError('Debe seleccionar una compañía primero');
      return;
    }

    // Verificar autenticación
    const token = getAuthToken();
    if (!token) {
      setError('No hay sesión activa. Por favor, inicia sesión.');
      return;
    }

    console.log('🚀 Iniciando procesamiento Azure AI...');
    console.log('📋 Contexto:', {
      archivo: state.uploadedFile.name,
      cliente: state.selectedCliente.clinom,
      compania: state.selectedCompany.comnom,
      token: token ? 'Presente' : 'Ausente'
    });
    
    setProcessing(true);
    setProcessingProgress(0);
    setError(null);

    // Cambiar al paso de extracción
    setState(prev => ({ ...prev, currentStep: 'extract' }));

    try {
      // 🤖 LLAMAR AL SERVICIO AZURE
      const result = await azureDocumentService.processDocument(
        state.uploadedFile,
        (progress) => {
          setProcessingProgress(progress);
          console.log(`📊 Progreso Azure AI: ${progress}%`);
        }
      );

      console.log('✅ Documento procesado exitosamente:', result);

      // Verificar que tenemos datos válidos
      if (!result || !result.datosFormateados) {
        throw new Error('No se pudieron extraer datos del documento');
      }

      // Actualizar estado con los datos extraídos
      setState(prev => ({
        ...prev,
        extractedData: result,
        currentStep: 'form'
      }));

      console.log('📝 Datos listos para formulario:', result.datosFormateados);

    } catch (err: any) {
      console.error('❌ Error procesando documento:', err);
      setError(err.message || 'Error procesando el documento');
      
      // Volver al paso anterior en caso de error
      setState(prev => ({ ...prev, currentStep: 'upload' }));
    } finally {
      setProcessing(false);
    }
  }, [state.uploadedFile, state.selectedCliente, state.selectedCompany, getAuthToken]);

  // =====================================
  // 📝 CREAR PÓLIZA FINAL
  // =====================================

  const createPoliza = useCallback(async (formData: any): Promise<void> => {
    if (!state.selectedCliente || !state.selectedCompany || !state.extractedData) {
      setError('Faltan datos para crear la póliza');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('No hay sesión activa. Por favor, inicia sesión.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💾 Creando póliza con datos:', {
        cliente: state.selectedCliente,
        company: state.selectedCompany,
        formData,
        extractedData: state.extractedData
      });

      // TODO: Implementar llamada real a tu API de pólizas
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/polizas`, {
      //   method: 'POST',
      //   headers: {
      //     ...getAuthHeaders(),
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     clienteId: state.selectedCliente.id,
      //     companiaId: state.selectedCompany.id,
      //     ...formData,
      //     documentData: state.extractedData
      //   })
      // });

      // Simular creación por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState(prev => ({
        ...prev,
        currentStep: 'success',
        isComplete: true
      }));

      console.log('✅ Póliza creada exitosamente');

    } catch (err: any) {
      console.error('❌ Error creando póliza:', err);
      setError(err.message || 'Error creando la póliza');
    } finally {
      setLoading(false);
    }
  }, [state.selectedCliente, state.selectedCompany, state.extractedData, getAuthToken, getAuthHeaders]);

  // =====================================
  // 🔍 BÚSQUEDA DE CLIENTES - ENDPOINT /all CORRECTO
  // =====================================

    const searchClientes = useCallback(async (searchTerm: string): Promise<void> => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setClienteResults([]);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('No hay sesión activa para buscar clientes');
      return;
    }

    setLoadingClientes(true);
    
    try {
      console.log('🔍 Buscando clientes con término:', searchTerm);

      // ✅ ENDPOINT CORRECTO QUE FUNCIONA: /api/clientes/all?search=termino
      const searchUrl = `${import.meta.env.VITE_API_URL}/clientes/all`;
      const response = await fetch(
        `${searchUrl}?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: getAuthHeaders(),
          signal: AbortSignal.timeout(30000) // 30 segundos para búsqueda
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error buscando clientes: ${response.status}`);
      }

      const data = await response.json();
      
      // 🔍 DEBUG: Ver estructura completa de la respuesta
      console.log('📥 Respuesta completa del backend:', data);
      console.log('📊 Metadata:', {
        totalCount: data.totalCount,
        dataSource: data.dataSource,
        filtered: data.filtered,
        itemsLength: data.items ? data.items.length : 'undefined'
      });
      
      // Extraer clientes de la respuesta
      const clientes = data.items || data || [];
      
      // 🔍 DEBUG: Verificar clientes extraídos
      console.log('📋 Clientes extraídos:', {
        cantidad: clientes.length,
        primeros3: clientes.slice(0, 3).map((c: any) => ({
          id: c.id,
          nombre: c.clinom,
          documento: c.cliced
        }))
      });
      
      setClienteResults(clientes);
      console.log(`✅ Búsqueda completada: ${clientes.length} clientes mostrados de ${data.totalCount} encontrados en Velneo`);
      
      // 🚨 ALERTA: Si hay discrepancia entre frontend y backend
      if (data.totalCount && clientes.length !== data.totalCount) {
        console.warn(`⚠️ DISCREPANCIA: Backend encontró ${data.totalCount} clientes, pero frontend solo procesó ${clientes.length}`);
        console.warn('📋 Verificar estructura de data.items:', data.items ? 'Existe' : 'No existe');
      }

    } catch (err: any) {
      console.error('❌ Error buscando clientes:', err);
      setError('Error buscando clientes');
      setClienteResults([]);
    } finally {
      setLoadingClientes(false);
    }
  }, [getAuthToken, getAuthHeaders]);

  // =====================================
  // 🏢 CARGAR COMPAÑÍAS
  // =====================================

  const loadCompanies = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      console.log('⚠️ No hay token, postponiendo carga de compañías');
      return;
    }

    setLoadingCompanies(true);
    
    try {
      console.log('🏢 Cargando compañías...');

      // ✅ ENDPOINT CORRECTO: /api/Companies/active (compañías activas)
      const companiesUrl = `${import.meta.env.VITE_API_URL}/Companies/active`;
      const response = await fetch(companiesUrl, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('⚠️ Token expirado al cargar compañías');
          return; // No mostrar error, solo no cargar
        }
        throw new Error(`Error cargando compañías: ${response.status}`);
      }

      // ✅ Tu backend devuelve directamente el array de CompanyDto[]
      const companiesList = await response.json();
      
      // Mapear a formato esperado por el wizard
      const mappedCompanies = companiesList.map((company: any) => ({
        id: company.id,
        comnom: company.comnom,
        comalias: company.comalias,
        activo: company.activo
      }));
      
      setCompanies(mappedCompanies);
      console.log('🏢 Compañías cargadas:', mappedCompanies.length);

    } catch (err: any) {
      console.error('❌ Error cargando compañías:', err);
      setError('Error cargando compañías');
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, [getAuthToken, getAuthHeaders]);

  // =====================================
  // 🛠️ UTILIDADES ADICIONALES
  // =====================================

  const retryProcessing = useCallback(async () => {
    if (state.uploadedFile && state.currentStep === 'upload') {
      await processDocument();
    }
  }, [state.uploadedFile, state.currentStep, processDocument]);

  const validateCurrentStep = useCallback((): boolean => {
    switch (state.currentStep) {
      case 'cliente':
        return !!state.selectedCliente;
      case 'company':
        return !!state.selectedCompany;
      case 'upload':
        return !!state.uploadedFile;
      case 'extract':
        return processing || !!state.extractedData;
      case 'form':
        return !!state.extractedData;
      default:
        return true;
    }
  }, [state, processing]);

  // =====================================
  // 🎯 RETORNAR INTERFAZ COMPLETA
  // =====================================

  return {
    // Estado del wizard
    ...state,
    
    // Estados de carga
    loading,
    processing,
    processingProgress,
    error,
    
    // Navegación
    goToStep,
    goBack,
    reset,
    
    // Selecciones
    selectCliente,
    selectCompany,
    setUploadedFile,
    
    // Procesamiento
    processDocument,
    createPoliza,
    retryProcessing,
    
    // Búsqueda de clientes
    clienteSearch,
    setClienteSearch,
    clienteResults,
    searchClientes,
    loadingClientes,
    
    // Compañías
    companies,
    loadCompanies,
    loadingCompanies,
    
    // Utilities
    setError,
    validateCurrentStep,
    getAuthToken,
  };
};