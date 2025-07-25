import { useState, useEffect, useCallback } from 'react';
import { polizaService } from '../services/polizaService';
import { clienteService } from '../services/clienteService';
import { companyService } from '../services/companyService';
import { seccionService } from '../services/seccionService';
import { azureService } from '../services/azureService';
import { Seccion, SeccionLookup } from '../types/core/seccion';
import { TipoOperacion } from '../utils/operationLogic';

import { PolizaFormData, PolizaCreateRequest } from '../types/core/poliza';
import { Cliente, WizardStep, WizardState, DocumentProcessResult  } from '../types/ui/wizard';
import { Company } from '../types/core/company'

interface ExtendedWizardState extends WizardState {
  processingDocument?: boolean;
  documentError?: string | null;
  documentResult?: DocumentProcessResult | null;
  uploadProgress?: number;
}

const initialState: ExtendedWizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  selectedSeccion: null,
  selectedOperacion: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,

  processingDocument: false,
  documentError: null,
  documentResult: null,
  uploadProgress: 0,
};

export const usePolizaWizard = () => {
  const [state, setState] = useState<ExtendedWizardState>(initialState);
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
  if (state.selectedCompany && state.currentStep === 'seccion') {
    console.log('🔍 Compañía seleccionada, cargando secciones...');
    loadSecciones();
  }
}, [state.selectedCompany, state.currentStep]);

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
    selectedCliente: cliente,  // ← SIN MAPEO, estructura original
    currentStep: 'company' 
  }));
  setClienteSearch('');
  setClienteResults([]);
  setError(null);
  
  console.log('👤 Cliente seleccionado (estructura Velneo original):', cliente);
}, []);

const selectCompany = useCallback((company: Company) => {
  console.log('🏢 Compañía seleccionada:', {
    id: company.id,
    nombre: company.comnom || company.nombre,
    alias: company.comalias || company.alias
  });
  
  setState(prev => ({
    ...prev,
    selectedCompany: company,
    currentStep: 'seccion'
  }));
  
  setSecciones([]);
  
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

// ✅ FUNCIÓN processDocument COMPLETA Y CORREGIDA

const processDocument = useCallback(async (file?: File | null) => {
  // ✅ Validación inicial
  if (!file) {
    setError('No hay archivo para procesar');
    return;
  }

  // ✅ Validar tamaño y tipo
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

  // ✅ Iniciar procesamiento
  setProcessing(true);
  setError(null);
  setProcessingProgress(0);

  try {
    // ✅ Actualizar estado: procesando documento
    setState(prev => ({ 
      ...prev, 
      processingDocument: true, 
      documentError: null,
      currentStep: 'extract'
    }));
    
    console.log('📄 Procesando documento con servicio Azure:', file.name);
    console.log('📊 Detalles del archivo:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // ✅ Procesar con Azure Document Intelligence
    const result = await azureService.processDocument(file, (progress) => {
      console.log(`📈 Progreso del procesamiento: ${progress}%`);
      setProcessingProgress(progress);
      setState(prev => ({ ...prev, uploadProgress: progress }));
    });
    
    console.log('✅ Resultado del procesamiento Azure:', result);
    
    // ✅ Validar que el resultado sea válido
    if (!result || !result.documentId) {
      throw new Error('El procesamiento no devolvió un resultado válido');
    }

    setState((prev: ExtendedWizardState) => ({ 
      ...prev, 
      uploadedFile: file,
      extractedData: result,                    // ✅ Guardar datos extraídos
      processingDocument: false,               // ✅ Terminar procesamiento
      documentError: null,                     // ✅ Limpiar errores
      currentStep: 'form'                      // ✅ AVANZAR AL FORMULARIO
    }));
    
    setError(null);
    
    console.log('✅ Documento procesado exitosamente. Avanzando a formulario.');
    console.log('📋 Datos extraídos:', {
      documentId: result.documentId,
      numeroPoliza: result.numeroPoliza,
      asegurado: result.asegurado,
      nivelConfianza: result.nivelConfianza,
      requiereVerificacion: result.requiereVerificacion
    });
    
    return result;
    
  } catch (error: any) {
    console.error('❌ Error procesando documento:', error);
    
    // ✅ Manejar errores específicos
    let errorMessage = 'Error desconocido al procesar el documento';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.status === 413) {
      errorMessage = 'El archivo es demasiado grande para procesar';
    } else if (error.status === 400) {
      errorMessage = 'El archivo no es válido o está corrupto';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Intenta nuevamente.';
    } else if (error.name === 'NetworkError') {
      errorMessage = 'Error de conexión. Verifica tu internet.';
    }

    // ✅ Actualizar estado con error
    setState(prev => ({ 
      ...prev, 
      processingDocument: false,
      documentError: errorMessage,
      uploadProgress: 0,
      currentStep: 'upload' // Volver al step de upload para reintentar
    }));
    
    setError(errorMessage);
    throw new Error(errorMessage);
    
  } finally {
    // ✅ Limpiar estados de procesamiento
    setProcessing(false);
    setProcessingProgress(0);
  }
}, [setError, setProcessing, setProcessingProgress, setState]);


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
    
    // ✅ TIPADO CORRECTO PARA EL REQUEST
    const polizaRequest: PolizaCreateRequest = {
      // CAMPOS BÁSICOS REQUERIDOS
      comcod: parseInt(state.selectedCompany.id.toString()),
      clinro: parseInt(state.selectedCliente.id.toString()),
      conpol: formData.numeroPoliza || velneoDatos?.datosPoliza?.numeroPoliza || "",
      confchdes: formData.vigenciaDesde || "",
      confchhas: formData.vigenciaHasta || "",
      conpremio: typeof formData.prima === 'string' ? parseFloat(formData.prima) : (formData.prima || 0),
      asegurado: state.selectedCliente.clinom || "",
      observaciones: formData.observaciones || 'Procesado automáticamente con Azure AI',
      moneda: formData.moneda || 'UYU',
      
      // ✅ NUEVOS CAMPOS DEL WIZARD QUE FALTABAN
      seccod: state.selectedSeccion?.id || 0,
      tramite: formData.tramite,
      estadoPoliza: formData.estadoPoliza,
      calidadId: formData.calidadId ? Number(formData.calidadId) : undefined,
      destinoId: formData.destinoId ? Number(formData.destinoId) : undefined,
      categoriaId: formData.categoriaId ? Number(formData.categoriaId) : undefined,
      tipoVehiculo: formData.tipoVehiculo,
      uso: formData.uso,
      formaPago: formData.formaPago,
      cantidadCuotas: formData.cantidadCuotas,
      valorCuota: formData.valorCuota,
      tipo: formData.tipo,
      cobertura: formData.cobertura,
      certificado: formData.certificado,
      
      // CAMPOS EXISTENTES DEL VEHÍCULO
      vehiculo: velneoDatos?.datosVehiculo?.marcaModelo || velneoDatos?.datosVehiculo?.marca || formData.vehiculo,
      marca: velneoDatos?.datosVehiculo?.marca || formData.marca,
      modelo: velneoDatos?.datosVehiculo?.modelo || formData.modelo,
      motor: velneoDatos?.datosVehiculo?.motor || formData.motor,
      chasis: velneoDatos?.datosVehiculo?.chasis || formData.chasis,
      matricula: velneoDatos?.datosVehiculo?.matricula || formData.matricula,
      combustible: velneoDatos?.datosVehiculo?.combustible || formData.combustible,
      anio: velneoDatos?.datosVehiculo?.anio ? parseInt(velneoDatos.datosVehiculo.anio.toString()) : (formData.anio ? Number(formData.anio) : undefined),
      
      // CAMPOS COMERCIALES
      primaComercial: velneoDatos?.condicionesPago?.prima || formData.primaComercial,
      premioTotal: velneoDatos?.condicionesPago?.premio || velneoDatos?.condicionesPago?.total || formData.premioTotal,
      corredor: velneoDatos?.datosBasicos?.corredor || formData.corredor,
      plan: formData.plan,
      ramo: velneoDatos?.datosPoliza?.ramo || formData.ramo || 'AUTOMOVILES',
      
      // DATOS DEL CLIENTE
      documento: velneoDatos?.datosBasicos?.documento || state.selectedCliente.cliced || state.selectedCliente.cliruc || formData.documento,
      email: velneoDatos?.datosBasicos?.email || state.selectedCliente.cliemail || formData.email,
      telefono: velneoDatos?.datosBasicos?.telefono || state.selectedCliente.telefono || formData.telefono,
      direccion: velneoDatos?.datosBasicos?.domicilio || state.selectedCliente.clidir || formData.direccion,
      localidad: velneoDatos?.datosBasicos?.localidad || formData.localidad,
      departamento: velneoDatos?.datosBasicos?.departamento || formData.departamento,
      
      procesadoConIA: true
    };

    // ✅ LOGGING DETALLADO PARA DEBUG
    console.log('📤 LISTO PARA ENVIAR A VELNEO. Request preparado:', polizaRequest);
    console.log('🎯 CAMPOS CRÍTICOS ESPECÍFICOS:');
    console.log('   - tramite:', polizaRequest.tramite);
    console.log('   - estado:', polizaRequest.estado);
    console.log('   - formaPago:', polizaRequest.formaPago);
    console.log('   - moneda:', polizaRequest.moneda);
    console.log('   - cobertura:', polizaRequest.cobertura);
    console.log('   - certificado:', polizaRequest.certificado);
    console.log('   - seccionId:', polizaRequest.seccod);
    console.log('🌐 URL del API:', import.meta.env.VITE_API_URL);

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
          errorMessage = errorData.message || 'Datos inválidos. Revisa los campos del formulario.';
        } else if (response.status >= 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente.';
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Respuesta exitosa de Velneo:', result);

    setState(prev => ({
      ...prev,
      currentStep: 'success',
      isComplete: true
    }));

    console.log('🎉 Póliza creada exitosamente en Velneo');

  } catch (err: any) {
    console.error('❌ Error completo creando póliza:', err);
    setError(err.message || 'Error al crear póliza');
  } finally {
    setLoading(false);
  }
}, [state.selectedCliente, state.selectedCompany, state.selectedSeccion, state.extractedData, getAuthToken, getAuthHeaders]);

const searchClientes = async (searchTerm: string) => {
  if (!searchTerm.trim()) {
    setClienteResults([]);
    return;
  }

  try {
    setState(prev => ({ ...prev, loadingClientes: true, clienteError: null }));
    
    console.log('🔍 Buscando clientes con servicio unificado:', searchTerm);
    
    // ✅ USAR EL NUEVO SERVICIO
    const clientes = await clienteService.searchClientes(searchTerm);
    
    // Mapear a formato esperado por el wizard
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
    setState(prev => ({ ...prev, loadingClientes: false }));
    
    console.log(`✅ Búsqueda completada: ${clientesMapeados.length} clientes encontrados`);
    
  } catch (error: any) {
    console.error('❌ Error buscando clientes:', error);
    setState(prev => ({ 
      ...prev, 
      loadingClientes: false, 
      clienteError: error.message 
    }));
    
    // Fallback en caso de error
    setClienteResults([]);
  }
};

const loadCompanies = async () => {
  try {
    setLoadingCompanies(true);
    
    console.log('🏢 Cargando compañías con servicio unificado...');
    const companiesData = await companyService.getActiveCompanies();
    
    console.log('🏢 Compañías recibidas del servicio:', companiesData);
    setCompanies(companiesData);
    setLoadingCompanies(false);
    
    console.log(`✅ Compañías cargadas en el state: ${companiesData.length}`);
    
  } catch (error: any) {   
    setCompanies([]);
    setLoadingCompanies(false);
  }
};

const loadSecciones = async () => {
  try {
    // ✅ USAR LOS STATES SEPARADOS, NO setState
    setLoadingSecciones(true);
    
    console.log('🔍 Cargando secciones con servicio unificado...');
    
    const seccionesData = await seccionService.getActiveSecciones();
    
    console.log('🔍 Secciones recibidas del servicio:', seccionesData);
    
    // ✅ ACTUALIZAR LOS STATES SEPARADOS
    setSecciones(seccionesData);
    setLoadingSecciones(false);
    
    console.log(`✅ Secciones cargadas en el state: ${seccionesData.length}`);
    
  } catch (error: any) {
    console.error('❌ Error cargando secciones:', error);
    
    // ✅ ACTUALIZAR LOS STATES SEPARADOS EN CASO DE ERROR
    setSecciones([]);
    setLoadingSecciones(false);
  }
};

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
      if (state.uploadedFile) {
  await processDocument(state.uploadedFile);
} else {
  console.error('❌ No hay archivo para reprocesar');
  setState(prev => ({ 
    ...prev, 
    documentError: 'No hay archivo para procesar'
  }));
}
    }
  }, [state.uploadedFile, state.currentStep, processDocument]);

const validateCurrentStep = useCallback((currentState: any): boolean => {
  switch (currentState.currentStep) {  // ✅ Usar parámetro
    case 'cliente':
      return !!currentState.selectedCliente;
    case 'company':
      return !!currentState.selectedCompania;
    case 'seccion':
      return !!currentState.selectedSeccion;
    case 'upload':
      return !!currentState.uploadedFile;
    case 'form':
      return true; 
    default:
      return false;
  }
}, []);

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

