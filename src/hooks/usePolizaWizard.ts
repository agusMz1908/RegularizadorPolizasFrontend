import { useState, useEffect, useCallback } from 'react';
import { azureDocumentService, DocumentProcessResult } from '../services/azureDocumentService';
import { seccionService } from '../services/seccionService';
import { Seccion, SeccionLookup } from '../types/seccion';
import { TipoOperacion } from '../utils/operationLogic';
import { PolizaFormData } from '../types/poliza';

export type WizardStep = 'cliente' | 'company' | 'seccion' | 'operacion' | 'upload' | 'extract' | 'form' | 'success';

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
  selectedSeccion: Seccion | null;
  selectedOperacion: TipoOperacion | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  selectedSeccion: Seccion | null; 
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

const initialState: WizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  selectedSeccion: null,
  selectedOperacion: null, 
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

  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionesLookup, setSeccionesLookup] = useState<SeccionLookup[]>([]);
  const [loadingSecciones, setLoadingSecciones] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

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
      case 'seccion':
        newStep = 'company';
        newState.selectedCompany = null;
        break;
      case 'operacion':
        newStep = 'seccion';
        newState.selectedSeccion = null;
        break;
      case 'upload':
        newStep = 'operacion'; 
        newState.selectedOperacion = null;
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
    setError(null);
    setProcessing(false);
    setProcessingProgress(0);
    setClienteSearch('');
    setClienteResults([]);
  }, []);

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
    currentStep: 'seccion' //
  }));
  setError(null);
  
  console.log('🏢 Compañía seleccionada:', company);
}, []);

const selectOperacion = useCallback((operacion: TipoOperacion) => {
  console.log('⚙️ Operación seleccionada:', operacion);
  setState(prev => ({
    ...prev,
    selectedOperacion: operacion,
    currentStep: 'upload'
  }));
}, []);

  const setUploadedFile = useCallback((file: File | null) => {
    if (!file) {
      setState((prev: WizardState) => ({ 
        ...prev, 
        uploadedFile: null 
      }));
      return;
    }

    const maxSize = 10 * 1024 * 1024;
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

  const processDocument = useCallback(async (): Promise<void> => {
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
      const result = await azureDocumentService.processDocument(
        state.uploadedFile,
        (progress) => {
          setProcessingProgress(progress);
          console.log(`📊 Progreso Azure AI: ${progress}%`);
        }
      );

      console.log('✅ Documento procesado exitosamente:', result);
      if (!result || !result.datosVelneo) {
        throw new Error('No se pudieron extraer datos del documento');
      }

      setState(prev => ({
        ...prev,
        extractedData: result,
        currentStep: 'form'
      }));

      console.log('📝 Datos listos para formulario:', result.datosVelneo);

    } catch (err: any) {
      console.error('❌ Error procesando documento:', err);
      setError(err.message || 'Error procesando el documento');
      
      setState(prev => ({ ...prev, currentStep: 'upload' }));
    } finally {
      setProcessing(false);
    }
  }, [state.uploadedFile, state.selectedCliente, state.selectedCompany, getAuthToken]);

const createPoliza = useCallback(async (formData: PolizaFormData): Promise<void> => {
  console.log('🔥 createPoliza INICIADO');
  
  const token = getAuthToken();
  if (!token || !state.selectedCliente || !state.selectedCompany) {
    setError('Faltan datos requeridos: cliente, compañía o sesión. Por favor, inicia sesión.');
    console.log('❌ Faltan datos requeridos:', { token: !!token, cliente: !!state.selectedCliente, company: !!state.selectedCompany });
    return;
  }

  console.log('✅ Datos requeridos OK, continuando...');
  setLoading(true);
  setError(null);

  try {
    console.log('💾 Creando póliza con datos:', {
      cliente: state.selectedCliente,
      company: state.selectedCompany,
      formData,
      extractedData: state.extractedData
    });

    // ✅ ACCEDER A LOS DATOS CORRECTOS
    const velneoDatos = state.extractedData?.datosVelneo;
    console.log('📊 Datos de Velneo extraídos:', velneoDatos);
    
    // ✅ PREPARAR REQUEST PARA VELNEO
    const polizaRequest = {
      comcod: parseInt(state.selectedCompany.id.toString()),
      clinro: parseInt(state.selectedCliente.id.toString()),
      conpol: formData.numeroPoliza || velneoDatos?.datosPoliza?.numeroPoliza,
      confchdes: formData.vigenciaDesde,
      confchhas: formData.vigenciaHasta,
      conpremio: typeof formData.prima === 'string' ? parseFloat(formData.prima) : formData.prima,
      asegurado: state.selectedCliente.clinom,
      observaciones: formData.observaciones || 'Procesado automáticamente con Azure AI',
      moneda: formData.moneda || 'UYU',
      
      // ✅ CAMPOS EXTENDIDOS del datosVelneo
      vehiculo: velneoDatos?.datosVehiculo?.marcaModelo || velneoDatos?.datosVehiculo?.marca,
      marca: velneoDatos?.datosVehiculo?.marca,
      modelo: velneoDatos?.datosVehiculo?.modelo,
      motor: velneoDatos?.datosVehiculo?.motor,
      chasis: velneoDatos?.datosVehiculo?.chasis,
      matricula: velneoDatos?.datosVehiculo?.matricula,
      combustible: velneoDatos?.datosVehiculo?.combustible,
      anio: velneoDatos?.datosVehiculo?.anio ? parseInt(velneoDatos.datosVehiculo.anio.toString()) : null,
      
      // ✅ CAMPOS COMERCIALES
      primaComercial: velneoDatos?.condicionesPago?.prima,
      premioTotal: velneoDatos?.condicionesPago?.premio || velneoDatos?.condicionesPago?.total,
      corredor: velneoDatos?.datosBasicos?.corredor,
      plan: formData.plan,
      ramo: velneoDatos?.datosPoliza?.ramo || formData.ramo || 'AUTOMOVILES',
      
      // ✅ DATOS DEL CLIENTE
      documento: velneoDatos?.datosBasicos?.documento || state.selectedCliente.cliced || state.selectedCliente.cliruc,
      email: velneoDatos?.datosBasicos?.email || state.selectedCliente.cliemail,
      telefono: velneoDatos?.datosBasicos?.telefono || state.selectedCliente.telefono,
      direccion: velneoDatos?.datosBasicos?.domicilio || state.selectedCliente.clidir,
      localidad: velneoDatos?.datosBasicos?.localidad,
      departamento: velneoDatos?.datosBasicos?.departamento,
      
      procesadoConIA: true
    };

    console.log('📤 LISTO PARA ENVIAR A VELNEO. Request preparado:', polizaRequest);
    console.log('🌐 URL del API:', import.meta.env.VITE_API_URL);
    console.log('🔑 Headers de auth:', getAuthHeaders());

    // ✅ LLAMADA REAL A LA API
    console.log('🚀 INICIANDO FETCH A VELNEO...');
    
    const apiUrl = `${import.meta.env.VITE_API_URL}/Polizas`;
    console.log('🎯 URL completa:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(polizaRequest),
      signal: AbortSignal.timeout(300000) // 5 minutos timeout
    });

    console.log('📡 Respuesta recibida de Velneo:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.log('❌ Error data from API:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Manejo específico de errores
        if (response.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (response.status === 400) {
          errorMessage = `Datos inválidos: ${errorMessage}`;
          // Si hay errores de validación específicos, mostrarlos
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage += `\n• ${errorData.errors.join('\n• ')}`;
          }
        } else if (response.status === 504) {
          errorMessage = 'Timeout en Velneo. La operación puede haberse completado, verifica en el sistema.';
        } else if (response.status === 502) {
          errorMessage = 'Error de conectividad con Velneo. Intenta nuevamente.';
        }
      } catch {
        // Si no se puede parsear el error, usar el mensaje por defecto
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('✅ Respuesta exitosa de creación de póliza:', responseData);

    // ✅ ACTUALIZAR ESTADO A SUCCESS
    setState(prev => ({
      ...prev,
      currentStep: 'success',
      isComplete: true
    }));

    console.log('🎉 Póliza creada exitosamente en Velneo:', responseData.poliza?.numero);

  } catch (err: any) {
    console.error('💥 ERROR COMPLETO creando póliza:', err);
    console.error('💥 Error stack:', err.stack);
    
    let errorMessage = err.message || 'Error desconocido creando la póliza';
    
    // Manejar errores específicos de red
    if (err.name === 'AbortError' || err.message.includes('timeout')) {
      errorMessage = 'Timeout creando la póliza. La operación puede haberse completado, verifica en Velneo.';
    } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
    console.log('🏁 createPoliza FINALIZADO');
  }
}, [state.selectedCliente, state.selectedCompany, state.extractedData, getAuthToken, getAuthHeaders]);

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
    console.log('🚀 Buscando clientes DIRECTO en Velneo con término:', searchTerm);

    const searchUrl = `${import.meta.env.VITE_API_URL}/clientes/direct`;
    const response = await fetch(
      `${searchUrl}?filtro=${encodeURIComponent(searchTerm)}`,
      {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error buscando clientes: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📥 Respuesta DIRECTA de Velneo:', {
      cantidad: data.clientes ? data.clientes.length : 'no clientes',
      totalCount: data.total_count,
    });
    
    const clientes = data.clientes || data.clients || data || [];
    const clientesMapeados = clientes.map((cliente: any) => ({
      id: cliente.id || cliente.clinro,
      clinom: cliente.clinom || cliente.nombre,
      cliced: cliente.cliced || cliente.documento,
      cliruc: cliente.cliruc || cliente.ruc,
      cliemail: cliente.cliemail || cliente.email,
      telefono: cliente.telefono || cliente.clicel,
      clidir: cliente.clidir || cliente.direccion,
      activo: cliente.activo !== false
    }));
    
    setClienteResults(clientesMapeados);
    console.log(`✅ Búsqueda DIRECTA completada: ${clientesMapeados.length} clientes`);
    
  } catch (err: any) {
    console.error('❌ Error en búsqueda directa:', err);
    
    try {
      const fallbackUrl = `${import.meta.env.VITE_API_URL}/clientes/all`;
      const fallbackResponse = await fetch(
        `${fallbackUrl}?search=${encodeURIComponent(searchTerm)}`,
        { headers: getAuthHeaders(), signal: AbortSignal.timeout(30000) }
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const clientesFallback = fallbackData.items || fallbackData || [];
        setClienteResults(clientesFallback);
        console.log(`✅ Fallback exitoso: ${clientesFallback.length} clientes`);
      } else {
        throw new Error('Ambos endpoints fallaron');
      }
    } catch (fallbackError) {
      console.error('❌ Fallback también falló:', fallbackError);
      setError(err.message || 'Error al buscar clientes');
      setClienteResults([]);
    }
  } finally {
    setLoadingClientes(false);
  }
}, [getAuthToken, getAuthHeaders]);

  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        console.warn('⚠️ No auth token available, skipping companies load');
        return;
      }

      const headers = getAuthHeaders();
      console.log('🚀 Loading companies from Velneo...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Companies/active`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ Unauthorized - token may be expired');
          return;
        }
        throw new Error(`Error cargando compañías: ${response.status}`);
      }

      const companiesList = await response.json();
      const mappedCompanies = companiesList.map((company: any) => ({
        id: company.id,
        comnom: company.comnom,
        comalias: company.comalias,
        activo: company.activo
      }));
      
      setCompanies(mappedCompanies);
      console.log('🏢 Compañías cargadas:', mappedCompanies.length);

      await loadSecciones();

    } catch (err: any) {
      console.error('❌ Error cargando compañías:', err);
      setError('Error cargando compañías');
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, [getAuthToken, getAuthHeaders]);

  const loadSecciones = useCallback(async () => {
    setLoadingSecciones(true);
    try {
      const [activeSecciones, lookupSecciones] = await Promise.all([
        seccionService.getActiveSecciones(),
        seccionService.getSeccionesForLookup()
      ]);

      setSecciones(activeSecciones);
      setSeccionesLookup(lookupSecciones);
      console.log('🎯 Secciones cargadas:', activeSecciones.length);

    } catch (err: any) {
      console.error('❌ Error cargando secciones:', err);
      setError('Error cargando secciones');
      setSecciones([]);
      setSeccionesLookup([]);
    } finally {
      setLoadingSecciones(false);
    }
  }, []);

    const selectSeccion = useCallback((seccion: Seccion) => {
    console.log('🎯 Sección seleccionada:', seccion.seccion);
    setState(prev => ({
      ...prev,
      selectedSeccion: seccion,
      currentStep: 'operacion' 
    }));
  }, []);

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
    case 'seccion':
      return !!state.selectedSeccion;
    case 'operacion':
      return !!state.selectedOperacion; 
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

  return {
    ...state,

    loading,
    processing,
    processingProgress,
    error,
    
    goToStep,
    goBack,
    reset,
    
    selectCliente,
    selectCompany,
    setUploadedFile,
    
    processDocument,
    createPoliza,
    retryProcessing,

    clienteSearch,
    setClienteSearch,
    clienteResults,
    searchClientes,
    loadingClientes,
    
    companies,
    loadCompanies,
    loadingCompanies,
    selectOperacion,

     secciones,
    seccionesLookup, 
    loadSecciones,
    loadingSecciones,
    selectSeccion,
    
    setError,
    validateCurrentStep,
    getAuthToken,
  };
};