import { useState, useEffect, useCallback } from 'react';
import { wizardService } from '../services/wizardService';
import { Cliente, Company, DocumentProcessResult, PolizaFormDataExtended } from '../types/wizard';

export type WizardStep = 'cliente' | 'company' | 'upload' | 'extract' | 'form' | 'success';

export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

export interface WizardActions {
  // Navegación
  goToStep: (step: WizardStep) => void;
  goBack: () => void;
  reset: () => void;
  
  // Selecciones
  selectCliente: (cliente: Cliente) => void;
  selectCompany: (company: Company) => void;
  setUploadedFile: (file: File) => void;
  
  // Procesamiento
  processDocument: () => Promise<void>;
  createPoliza: (formData: PolizaFormDataExtended) => Promise<void>;
  
  // Estados de carga
  loading: boolean;
  processing: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Búsquedas
  clienteSearch: string;
  setClienteSearch: (search: string) => void;
  clienteResults: Cliente[];
  searchClientes: (searchTerm: string) => Promise<void>;
  loadingClientes: boolean;
  
  // Compañías
  companies: Company[];
  loadCompanies: () => Promise<void>;
  loadingCompanies: boolean;
}

const initialState: WizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,
};

export const usePolizaWizard = (): WizardState & WizardActions => {
  // Estados principales
  const [state, setState] = useState<WizardState>(initialState);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estados de compañías
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Efecto para cargar compañías al inicio
  useEffect(() => {
    loadCompanies();
  }, []);

  // Navegación
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
          break;
        case 'form':
          newStep = 'extract';
          newState.extractedData = null;
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
  }, []);

  // Selecciones
  const selectCliente = useCallback((cliente: Cliente) => {
    setState((prev: WizardState) => ({ 
      ...prev, 
      selectedCliente: cliente, 
      currentStep: 'company' 
    }));
    setClienteSearch('');
    setClienteResults([]);
    setError(null);
  }, []);

  const selectCompany = useCallback((company: Company) => {
    setState((prev: WizardState) => ({ 
      ...prev, 
      selectedCompany: company, 
      currentStep: 'upload' 
    }));
    setError(null);
  }, []);

  const setUploadedFile = useCallback((file: File) => {
    // Validar archivo
    const validation = wizardService.validatePdfFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }

    setState((prev: WizardState) => ({ 
      ...prev, 
      uploadedFile: file, 
      currentStep: 'extract' 
    }));
    setError(null);
  }, []);

  // Búsqueda de clientes con debounce
  const searchClientes = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setClienteResults([]);
      return;
    }

    setLoadingClientes(true);
    setError(null);

    try {
      console.log('🔍 Searching clientes:', searchTerm);
      const results = await wizardService.searchClientes(searchTerm, 10);
      setClienteResults(results);
      console.log('✅ Found clients:', results.length);
    } catch (err: any) {
      console.error('❌ Error searching clientes:', err);
      setError('Error al buscar clientes: ' + err.message);
      setClienteResults([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Cargar compañías
  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    setError(null);

    try {
      console.log('🏢 Loading companies...');
      const companiesData = await wizardService.getCompaniesForLookup();
      setCompanies(companiesData);
      console.log('✅ Loaded companies:', companiesData.length);
    } catch (err: any) {
      console.error('❌ Error loading companies:', err);
      setError('Error al cargar compañías: ' + err.message);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  // 🔧 FUNCIÓN HELPER PARA BUSCAR CAMPOS EN MÚLTIPLES UBICACIONES
  const buscarCampo = useCallback((mainData: any, extractedFields: any, possibleKeys: string[]): string => {
    for (const key of possibleKeys) {
      // Buscar en datos principales
      if (mainData && mainData[key] && mainData[key] !== '') {
        return String(mainData[key]).trim();
      }
      
      // Buscar en extracted fields
      if (extractedFields && extractedFields[key] && extractedFields[key] !== '') {
        return String(extractedFields[key]).trim();
      }
    }
    
    return '';
  }, []);

  // 🔧 FUNCIÓN PARA CREAR DATOS VACÍOS EN CASO DE ERROR
  const crearDatosVacios = useCallback((): DocumentProcessResult => ({
    documentId: `empty_${Date.now()}`,
    estadoProcesamiento: 'VACIO',
    numeroPoliza: '', 
    asegurado: '', 
    vigenciaDesde: '', 
    vigenciaHasta: '',
    vehiculo: '', 
    marca: '', 
    modelo: '', 
    motor: '', 
    chasis: '', 
    matricula: '', 
    anio: '',
    prima: 0, 
    primaComercial: 0, 
    premioTotal: 0, 
    moneda: 'UYU',
    corredor: '', 
    plan: '', 
    ramo: 'AUTOMOVILES',
    documento: '', 
    email: '', 
    telefono: '', 
    direccion: '', 
    localidad: '', 
    departamento: '',
    nivelConfianza: 0, 
    requiereRevision: true, 
    listoParaVelneo: false,
    timestamp: new Date().toISOString(), 
    extractedFields: {}
  }), []);

  // 🔧 FUNCIÓN PARA NORMALIZAR LA RESPUESTA DEL BACKEND
  const normalizarRespuestaBackend = useCallback((response: any): DocumentProcessResult => {
    console.log('🔄 Normalizando respuesta del backend...');
    console.log('📄 Response recibida:', response);
    
    if (!response || typeof response !== 'object') {
      console.warn('⚠️ Respuesta inválida del backend:', response);
      return crearDatosVacios();
    }

    // Extraer campos desde diferentes posibles ubicaciones
    const extractedFields = response.extractedFields || response.camposExtraidos || {};
    const mainData = response;
    
    console.log('📋 Extracted fields encontrados:', extractedFields);
    console.log('📋 Main data keys:', Object.keys(mainData));

    const datosNormalizados: DocumentProcessResult = {
      // Metadatos
      documentId: response.documentId || `doc_${Date.now()}`,
      estadoProcesamiento: response.estadoProcesamiento || 'PROCESADO',
      nivelConfianza: response.nivelConfianza || response.confidence || 0,
      requiereRevision: response.requiereRevision !== undefined ? response.requiereRevision : true,
      listoParaVelneo: response.listoParaVelneo !== undefined ? response.listoParaVelneo : false,
      timestamp: response.timestamp || new Date().toISOString(),
      
      // Información básica de la póliza
      numeroPoliza: buscarCampo(mainData, extractedFields, [
        'numeroPoliza', 'policyNumber', 'numero_poliza', 'poliza.numero', 'poliza_numero'
      ]),
      
      anio: buscarCampo(mainData, extractedFields, [
        'anio', 'año', 'year', 'poliza.año', 'vehiculo.año', 'vehiculo_año'
      ]),
      
      vigenciaDesde: buscarCampo(mainData, extractedFields, [
        'vigenciaDesde', 'validFrom', 'fecha_desde', 'vigencia.desde', 'poliza.vigencia.desde'
      ]),
      
      vigenciaHasta: buscarCampo(mainData, extractedFields, [
        'vigenciaHasta', 'validTo', 'fecha_hasta', 'vigencia.hasta', 'poliza.vigencia.hasta'
      ]),
      
      plan: buscarCampo(mainData, extractedFields, [
        'plan', 'coveragePlan', 'poliza.plan', 'tipo_plan', 'cobertura'
      ]),
      
      ramo: buscarCampo(mainData, extractedFields, [
        'ramo', 'branch', 'poliza.ramo', 'tipo_seguro'
      ]) || 'AUTOMOVILES',
      
      // Datos del asegurado
      asegurado: buscarCampo(mainData, extractedFields, [
        'asegurado', 'cliente', 'insured', 'cliente_nombre', 'asegurado.nombre'
      ]),
      
      documento: buscarCampo(mainData, extractedFields, [
        'documento', 'documentNumber', 'cliente_documento', 'asegurado.documento'
      ]),
      
      email: buscarCampo(mainData, extractedFields, [
        'email', 'emailAddress', 'cliente_email', 'asegurado.email'
      ]),
      
      telefono: buscarCampo(mainData, extractedFields, [
        'telefono', 'phone', 'cliente_telefono', 'asegurado.telefono'
      ]),
      
      direccion: buscarCampo(mainData, extractedFields, [
        'direccion', 'address', 'cliente_direccion', 'asegurado.direccion'
      ]),
      
      localidad: buscarCampo(mainData, extractedFields, [
        'localidad', 'city', 'cliente_localidad', 'asegurado.localidad'
      ]),
      
      departamento: buscarCampo(mainData, extractedFields, [
        'departamento', 'state', 'cliente_departamento', 'asegurado.departamento'
      ]),
      
      // 🚗 DATOS DEL VEHÍCULO (LOS CAMPOS QUE AGREGASTE)
      vehiculo: buscarCampo(mainData, extractedFields, [
        'vehiculo', 'vehicle', 'vehicleDescription', 'vehiculo_descripcion'
      ]),
      
      marca: buscarCampo(mainData, extractedFields, [
        'marca', 'brand', 'vehicleBrand', 'vehiculo_marca', 'vehiculo.marca'
      ]),
      
      modelo: buscarCampo(mainData, extractedFields, [
        'modelo', 'model', 'vehicleModel', 'vehiculo_modelo', 'vehiculo.modelo'
      ]),
      
      motor: buscarCampo(mainData, extractedFields, [
        'motor', 'engine', 'engineNumber', 'vehiculo_motor', 'vehiculo.motor', 'numero_motor'
      ]),
      
      chasis: buscarCampo(mainData, extractedFields, [
        'chasis', 'chassis', 'chassisNumber', 'vehiculo_chasis', 'vehiculo.chasis', 'numero_chasis'
      ]),
      
      matricula: buscarCampo(mainData, extractedFields, [
        'matricula', 'plate', 'plateNumber', 'vehiculo_matricula', 'vehiculo.matricula', 'placa'
      ]),
      
      combustible: buscarCampo(mainData, extractedFields, [
        'combustible', 'fuel', 'fuelType', 'vehiculo_combustible', 'vehiculo.combustible'
      ]),
      
      // 💰 DATOS FINANCIEROS (LOS OTROS CAMPOS QUE AGREGASTE)
      prima: parseFloat(buscarCampo(mainData, extractedFields, [
        'prima', 'premium', 'primaComercial', 'prima_comercial', 'financiero.prima'
      ]) || '0'),
      
      primaComercial: parseFloat(buscarCampo(mainData, extractedFields, [
        'primaComercial', 'commercialPremium', 'prima_comercial', 'financiero.prima_comercial'
      ]) || '0'),
      
      premioTotal: parseFloat(buscarCampo(mainData, extractedFields, [
        'premioTotal', 'totalPremium', 'premio_total', 'financiero.premio_total', 'total'
      ]) || '0'),
      
      moneda: buscarCampo(mainData, extractedFields, [
        'moneda', 'currency', 'financiero.moneda'
      ]) || 'UYU',
      
      // Datos del corredor
      corredor: buscarCampo(mainData, extractedFields, [
        'corredor', 'broker', 'brokerName', 'corredor_nombre', 'corredor.nombre'
      ]),
      
      // Conservar datos originales
      extractedFields: extractedFields,
      originalResponse: response
    };
    
    console.log('✅ Datos normalizados generados:', datosNormalizados);
    console.log('🎯 Campos de vehículo mapeados:');
    console.log('- Marca:', datosNormalizados.marca);
    console.log('- Modelo:', datosNormalizados.modelo);
    console.log('- Motor:', datosNormalizados.motor);
    console.log('- Chasis:', datosNormalizados.chasis);
    console.log('- Matrícula:', datosNormalizados.matricula);
    
    return datosNormalizados;
  }, [buscarCampo, crearDatosVacios]);

  // 🔧 PROCESAMIENTO DE DOCUMENTO MEJORADO
  const processDocument = useCallback(async () => {
    if (!state.uploadedFile) {
      setError('No hay archivo seleccionado');
      return;
    }

    console.log('='.repeat(60));
    console.log('🚀 INICIANDO PROCESAMIENTO DE DOCUMENTO');
    console.log('='.repeat(60));
    console.log('📄 Archivo:', state.uploadedFile.name);
    console.log('📏 Tamaño:', state.uploadedFile.size, 'bytes');
    
    setProcessing(true);
    setError(null);

    try {
      // TIMEOUT para evitar que se quede colgado
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El procesamiento tardó más de 90 segundos')), 90000);
      });
      
      // Promesa del procesamiento real
      console.log('⏱️  Enviando archivo al backend...');
      const processPromise = wizardService.processDocument(state.uploadedFile);
      
      // Race entre timeout y procesamiento
      const rawResult = await Promise.race([processPromise, timeoutPromise]);
      
      console.log('📥 RESPUESTA CRUDA DEL BACKEND:');
      console.log('- Tipo:', typeof rawResult);
      console.log('- Claves:', Object.keys(rawResult || {}));
      console.log('- Contenido completo:', rawResult);
      
      // 🔧 NORMALIZAR LA RESPUESTA
      const normalizedResult = normalizarRespuestaBackend(rawResult);
      
      console.log('✅ RESULTADO NORMALIZADO:');
      console.log('- Document ID:', normalizedResult.documentId);
      console.log('- Número Póliza:', normalizedResult.numeroPoliza);
      console.log('- Asegurado:', normalizedResult.asegurado);
      console.log('- Marca vehículo:', normalizedResult.marca);
      console.log('- Modelo vehículo:', normalizedResult.modelo);
      console.log('- Prima:', normalizedResult.prima);
      
      // Validar que el resultado tiene datos mínimos
      if (!normalizedResult.documentId && !normalizedResult.numeroPoliza) {
        console.warn('⚠️ Resultado insuficiente, creando datos por defecto...');
        const datosDefecto = crearDatosVacios();
        datosDefecto.documentId = `processed_${Date.now()}`;
        datosDefecto.estadoProcesamiento = 'PROCESADO_PARCIAL';
        
        setState((prev: WizardState) => ({ 
          ...prev, 
          extractedData: datosDefecto, 
          currentStep: 'form' 
        }));
        
        console.log('✅ Avanzando al formulario con datos por defecto');
        return;
      }
      
      // Guardar datos normalizados
      setState((prev: WizardState) => ({ 
        ...prev, 
        extractedData: normalizedResult, 
        currentStep: 'form' 
      }));
      
      console.log('✅ Estado actualizado, avanzando al paso del formulario');
      
    } catch (err: any) {
      console.error('❌ ERROR EN PROCESAMIENTO:', err);
      console.error('❌ Detalles del error:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      let errorMessage = 'Error al procesar el documento';
      
      // Mejorar mensajes de error según el tipo
      if (err.message.includes('timeout') || err.message.includes('Timeout')) {
        errorMessage = 'El procesamiento está tardando más de lo esperado. Por favor, intenta con un archivo más pequeño o verifica tu conexión.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Error de autenticación. Por favor, vuelve a iniciar sesión.';
      } else if (err.message.includes('413')) {
        errorMessage = 'El archivo es demasiado grande. El tamaño máximo es 10MB.';
      } else if (err.message.includes('400')) {
        errorMessage = 'El archivo no es válido o no se puede procesar. Asegúrate de que sea un PDF de una póliza.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Por favor, intenta nuevamente en unos minutos.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Crear datos de error para que el formulario no se rompa
      const errorData = crearDatosVacios();
      errorData.documentId = `error_${Date.now()}`;
      errorData.estadoProcesamiento = 'ERROR';
      errorData.errorMessage = err.message;
      
      setState((prev: WizardState) => ({ 
        ...prev, 
        extractedData: errorData,
        currentStep: 'form' // Avanzar igual para que el usuario pueda llenar manualmente
      }));
      
      console.log('⚠️ Avanzando al formulario con datos de error para llenar manualmente');
      
    } finally {
      setProcessing(false);
      console.log('🏁 Procesamiento completado');
      console.log('='.repeat(60));
    }
  }, [state.uploadedFile, normalizarRespuestaBackend, crearDatosVacios]);

  // Creación de póliza - ACTUALIZADO CON TIPOS CORREGIDOS
  const createPoliza = useCallback(async (formData: PolizaFormDataExtended) => {
    if (!state.selectedCliente || !state.selectedCompany) {
      setError('Faltan datos del cliente o compañía');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('📋 Creating poliza in Velneo with extended types...');
      console.log('🎯 Form data:', formData);
      console.log('👤 Cliente:', state.selectedCliente);
      console.log('🏢 Company:', state.selectedCompany);
      
      // Usar el método adaptado para PolizaFormDataExtended
      const result = await wizardService.createPolizaInVelneo(
        formData, 
        state.selectedCliente.id, 
        state.selectedCompany.id
      );
      
      console.log('✅ Poliza created successfully:', result);
      
      setState((prev: WizardState) => ({ 
        ...prev, 
        currentStep: 'success',
        isComplete: true 
      }));

      return result;
    } catch (err: any) {
      console.error('❌ Error creating poliza:', err);
      setError('Error al crear póliza en Velneo: ' + err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [state.selectedCliente, state.selectedCompany]);

  return {
    // Estado
    ...state,
    
    // Acciones de navegación
    goToStep,
    goBack,
    reset,
    
    // Acciones de selección
    selectCliente,
    selectCompany,
    setUploadedFile,
    
    // Acciones de procesamiento
    processDocument,
    createPoliza,
    
    // Estados de carga
    loading,
    processing,
    error,
    setError,
    
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
  };
};