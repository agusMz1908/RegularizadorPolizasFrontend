// src/constants/velneoDefaults.ts - VERSIÓN ACTUALIZADA CON DOBLE MONEDA

import type { PolicyFormData } from '../types/poliza';

/**
 * 🎯 VALORES POR DEFECTO PARA BUSINESS RULES AUTOMÁTICAS
 * Basado en tu especificación: BSE + AUTOMÓVILES inicialmente
 */
export const VELNEO_DEFAULTS = {
  // ===== IDs FIJOS INICIALES =====
  SECCION_AUTOMOVILES: 9,              // ID de la sección AUTOMÓVILES
  COMPANIA_BSE: 2,                     // ID de BSE
  
  // ===== ESTADOS Y TIPOS POR DEFECTO =====
  ESTADO_TRAMITE_DEFAULT: 'En proceso',
  TRAMITE_DEFAULT: 'Nuevo',
  ESTADO_POLIZA_DEFAULT: 'VIG',
  TIPO_DEFAULT: 'Líneas personales',
  FORMA_PAGO_DEFAULT: 'Contado',
  
  // ===== VALORES FIJOS =====
  ENDOSO_DEFAULT: '0',
  RAMO: 'AUTOMOVILES',
  
  // ===== MAESTROS POR DEFECTO =====
  COMBUSTIBLE_DEFAULT: 'GAS',          // STRING para combustibles
  DESTINO_DEFAULT: 2,                  // PARTICULAR por defecto
  CALIDAD_DEFAULT: 2,                  // PROPIETARIO por defecto
  MONEDA_DEFAULT: 1,                   // PESO URUGUAYO por defecto
  CATEGORIA_DEFAULT: 20,               // AUTOMÓVIL por defecto
  COBERTURA_DEFAULT: 1,                // Responsabilidad Civil por defecto
  DEPARTAMENTO_DEFAULT_ID: 1,          // Montevideo por defecto
  
  // ===== VALORES NUMÉRICOS =====
  CUOTAS_DEFAULT: 1,
  PREMIO_DEFAULT: 0,
  VALOR_CUOTA_DEFAULT: 0,
  
  // ===== CAMPOS VACÍOS POR DEFECTO =====
  EMPTY_STRING: '',
  
  // ===== ZONA POR DEFECTO =====
  ZONA_CIRCULACION_DEFAULT: 'Todo el país'
} as const;

/**
 * 📋 FORMULARIO VACÍO INICIAL - ACTUALIZADO CON DOBLE MONEDA
 */
export const EMPTY_POLICY_FORM: PolicyFormData = {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: VELNEO_DEFAULTS.EMPTY_STRING,
  asegurado: VELNEO_DEFAULTS.EMPTY_STRING,
  tomador: VELNEO_DEFAULTS.EMPTY_STRING,
  domicilio: VELNEO_DEFAULTS.EMPTY_STRING,
  dirCobro: VELNEO_DEFAULTS.EMPTY_STRING,
  estadoTramite: VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT,
  tramite: VELNEO_DEFAULTS.TRAMITE_DEFAULT,
  fecha: new Date().toISOString().split('T')[0],
  asignado: VELNEO_DEFAULTS.EMPTY_STRING,
  tipo: VELNEO_DEFAULTS.TIPO_DEFAULT,
  estadoPoliza: VELNEO_DEFAULTS.ESTADO_POLIZA_DEFAULT,

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: VELNEO_DEFAULTS.COMPANIA_BSE,
  comalias: 'BSE',
  seccion: VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
  poliza: VELNEO_DEFAULTS.EMPTY_STRING,
  certificado: VELNEO_DEFAULTS.EMPTY_STRING,
  endoso: VELNEO_DEFAULTS.ENDOSO_DEFAULT,
  desde: VELNEO_DEFAULTS.EMPTY_STRING,
  hasta: VELNEO_DEFAULTS.EMPTY_STRING,

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: VELNEO_DEFAULTS.EMPTY_STRING,
  anio: VELNEO_DEFAULTS.EMPTY_STRING,
  matricula: VELNEO_DEFAULTS.EMPTY_STRING,
  motor: VELNEO_DEFAULTS.EMPTY_STRING,
  chasis: VELNEO_DEFAULTS.EMPTY_STRING,
  destinoId: VELNEO_DEFAULTS.DESTINO_DEFAULT,
  combustibleId: VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT, // STRING
  calidadId: VELNEO_DEFAULTS.CALIDAD_DEFAULT,
  categoriaId: VELNEO_DEFAULTS.CATEGORIA_DEFAULT,

  // ===== PESTAÑA 4: DATOS DE LA COBERTURA =====
  coberturaId: VELNEO_DEFAULTS.COBERTURA_DEFAULT,
  tarifaId: undefined,                                    // Opcional
  zonaCirculacion: VELNEO_DEFAULTS.ZONA_CIRCULACION_DEFAULT,
  departamentoId: VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT_ID,
  monedaId: VELNEO_DEFAULTS.MONEDA_DEFAULT,              // Moneda de COBERTURA

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  premio: VELNEO_DEFAULTS.PREMIO_DEFAULT,
  total: VELNEO_DEFAULTS.PREMIO_DEFAULT,
  formaPago: VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT,
  cuotas: VELNEO_DEFAULTS.CUOTAS_DEFAULT,
  valorCuota: VELNEO_DEFAULTS.VALOR_CUOTA_DEFAULT,
  monedaPagoId: VELNEO_DEFAULTS.MONEDA_DEFAULT,          // NUEVO - Moneda de PAGO

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: VELNEO_DEFAULTS.EMPTY_STRING
};

/**
 * 📊 CAMPOS REQUERIDOS POR PESTAÑA - ACTUALIZADO
 */
export const REQUIRED_FIELDS_BY_TAB = {
  datos_basicos: ['corredor', 'estadoTramite', 'tramite', 'tipo', 'estadoPoliza'],
  datos_poliza: ['poliza', 'desde', 'hasta'],
  datos_vehiculo: ['marcaModelo', 'anio', 'destinoId', 'combustibleId', 'calidadId', 'categoriaId'],
  datos_cobertura: ['coberturaId', 'monedaId', 'departamentoId'],
  condiciones_pago: ['premio', 'formaPago', 'monedaPagoId'],
  observaciones: [] as string[]
} as const;

/**
 * 🎯 TODOS LOS CAMPOS REQUERIDOS
 */
export const ALL_REQUIRED_FIELDS = [
  ...REQUIRED_FIELDS_BY_TAB.datos_basicos,
  ...REQUIRED_FIELDS_BY_TAB.datos_poliza,
  ...REQUIRED_FIELDS_BY_TAB.datos_vehiculo,
  ...REQUIRED_FIELDS_BY_TAB.datos_cobertura,
  ...REQUIRED_FIELDS_BY_TAB.condiciones_pago
] as const;

/**
 * ⚡ CONFIGURACIÓN DE VALIDACIÓN
 */
export const VALIDATION_CONFIG = {
  // Rangos numéricos
  ANIO_MIN: 1900,
  ANIO_MAX: new Date().getFullYear() + 1,
  
  CUOTAS_MIN: 1,
  CUOTAS_MAX: 12,  // Máximo 12 cuotas según el backend
  
  PREMIO_MIN: 0,
  TOTAL_MIN: 0,
  VALOR_CUOTA_MIN: 0,
  
  // Longitudes de texto
  CORREDOR_MAX_LENGTH: 128,
  POLIZA_MAX_LENGTH: 256,
  CERTIFICADO_MAX_LENGTH: 256,
  MARCA_MODELO_MAX_LENGTH: 128,
  MATRICULA_MAX_LENGTH: 64,
  MOTOR_MAX_LENGTH: 40,
  CHASIS_MAX_LENGTH: 40,
  OBSERVACIONES_MAX_LENGTH: 2000,
  ASEGURADO_MAX_LENGTH: 128,
  DIRECCION_MAX_LENGTH: 256,
  ZONA_CIRCULACION_MAX_LENGTH: 128,
  
  // Patrones regex
  POLIZA_PATTERN: /^[A-Z0-9\-\/]+$/i,
  MATRICULA_PATTERN: /^[A-Z0-9\-\s]*$/i,
  ANIO_PATTERN: /^\d{4}$/,
  
  // Mensajes de error
  MESSAGES: {
    REQUIRED: 'Este campo es requerido',
    INVALID_DATE: 'Fecha inválida',
    DATE_RANGE: 'La fecha hasta debe ser posterior a la fecha desde',
    INVALID_YEAR: `Año debe estar entre ${1900} y ${new Date().getFullYear() + 1}`,
    INVALID_CUOTAS: 'Cuotas debe estar entre 1 y 12',
    NEGATIVE_AMOUNT: 'El monto no puede ser negativo',
    MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
    INVALID_FORMAT: 'Formato inválido',
    DIFFERENT_CURRENCIES: 'Atención: Las monedas de cobertura y pago son diferentes'
  }
} as const;

/**
 * 🎨 CONFIGURACIÓN DE UI
 */
export const UI_CONFIG = {
  // Colores de pestañas
  TAB_COLORS: {
    datos_basicos: 'bg-blue-500',
    datos_poliza: 'bg-green-500',
    datos_vehiculo: 'bg-purple-500',
    datos_cobertura: 'bg-orange-500',
    condiciones_pago: 'bg-emerald-500',
    observaciones: 'bg-slate-500'
  },
  
  // Iconos de pestañas (Lucide React)
  TAB_ICONS: {
    datos_basicos: 'User',
    datos_poliza: 'FileText',
    datos_vehiculo: 'Car',
    datos_cobertura: 'Shield',
    condiciones_pago: 'CreditCard',
    observaciones: 'MessageSquare'
  },
  
  // Timeouts y delays
  DEBOUNCE_DELAY: 300,
  SAVE_DELAY: 1000,
  
  // Animaciones
  TAB_TRANSITION_DURATION: 300,
  FORM_ANIMATION_DELAY: 100
} as const;

/**
 * 🌍 CONFIGURACIÓN REGIONAL
 */
export const REGIONAL_CONFIG = {
  // Formato de fechas
  DATE_FORMAT: 'yyyy-MM-dd',
  DISPLAY_DATE_FORMAT: 'dd/MM/yyyy',
  
  // Formato de números
  CURRENCY_LOCALE: 'es-UY',
  CURRENCY_OPTIONS: {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  
  // Símbolos de moneda
  CURRENCY_SYMBOLS: {
    1: '$U',    // Peso uruguayo
    2: 'USD',   // Dólar
    3: 'UI',    // Unidades indexadas
    4: '€',     // Euro
    5: 'R$'     // Real brasileño
  },
  
  // Departamentos de Uruguay con IDs
  DEPARTAMENTOS_URUGUAY: [
    { id: 1, name: 'MONTEVIDEO' },
    { id: 2, name: 'ARTIGAS' },
    { id: 3, name: 'CANELONES' },
    { id: 4, name: 'CERRO LARGO' },
    { id: 5, name: 'COLONIA' },
    { id: 6, name: 'DURAZNO' },
    { id: 7, name: 'FLORES' },
    { id: 8, name: 'FLORIDA' },
    { id: 9, name: 'LAVALLEJA' },
    { id: 10, name: 'MALDONADO' },
    { id: 11, name: 'PAYSANDÚ' },
    { id: 12, name: 'RÍO NEGRO' },
    { id: 13, name: 'RIVERA' },
    { id: 14, name: 'ROCHA' },
    { id: 15, name: 'SALTO' },
    { id: 16, name: 'SAN JOSÉ' },
    { id: 17, name: 'SORIANO' },
    { id: 18, name: 'TACUAREMBÓ' },
    { id: 19, name: 'TREINTA Y TRES' }
  ]
} as const;

/**
 * 🔄 CONFIGURACIÓN DE API
 */
export const API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    MAPPING_OPTIONS: '/api/velneo/mapping-options',
    CREATE_POLIZA: '/api/polizas',
    GET_CLIENTES: '/api/clientes',
    SEARCH_CLIENTES: '/api/clientes/search',
    GET_MASTER_DATA: '/api/masterdata/options'
  },
  
  // Timeouts
  REQUEST_TIMEOUT: 30000,
  MASTER_DATA_TIMEOUT: 10000,
  
  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;

/**
 * 📝 HELPERS PARA ACCESO RÁPIDO
 */
export const getDefaultFormData = (): PolicyFormData => ({ ...EMPTY_POLICY_FORM });

export const getRequiredFieldsForTab = (tabId: keyof typeof REQUIRED_FIELDS_BY_TAB) => 
  REQUIRED_FIELDS_BY_TAB[tabId];

export const isFieldRequired = (fieldName: keyof PolicyFormData): boolean => 
  ALL_REQUIRED_FIELDS.includes(fieldName as any);

export const getTabColor = (tabId: keyof typeof UI_CONFIG.TAB_COLORS) => 
  UI_CONFIG.TAB_COLORS[tabId];

export const getTabIcon = (tabId: keyof typeof UI_CONFIG.TAB_ICONS) => 
  UI_CONFIG.TAB_ICONS[tabId];

export const getCurrencySymbol = (monedaId: number): string => 
  REGIONAL_CONFIG.CURRENCY_SYMBOLS[monedaId as keyof typeof REGIONAL_CONFIG.CURRENCY_SYMBOLS] || '$';

/**
 * 🔄 MAPEO DE FORM DATA A VELNEO REQUEST - ACTUALIZADO CON DOBLE MONEDA
 */
export const mapFormDataToVelneoRequest = (
  formData: PolicyFormData,
  selectedClient?: any,
  selectedCompany?: any
): any => {
  // Separar marca y modelo si están unidos
  const [marca, ...modeloParts] = formData.marcaModelo.split(' ');
  const modelo = modeloParts.join(' ');

  return {
    // ===== CAMPOS REQUERIDOS =====
    Comcod: selectedCompany?.id || formData.compania || VELNEO_DEFAULTS.COMPANIA_BSE,
    Seccod: formData.seccion || VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
    Clinro: selectedClient?.id || formData.clinro || 0,
    Conpol: formData.poliza || '',
    Confchdes: formData.desde || new Date().toISOString().split('T')[0],
    Confchhas: formData.hasta || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    Conpremio: Number(formData.premio) || 0,
    Asegurado: selectedClient?.clinom || formData.asegurado || '',
    
    // ===== DATOS DE CONTROL =====
    Contra: mapTramiteToNumber(formData.tramite),
    Congesti: mapEstadoToNumber(formData.estadoTramite),
    Congeses: mapEstadoToNumber(formData.estadoTramite),
    Convig: mapEstadoPolizaToNumber(formData.estadoPoliza),
    Consta: mapFormaPagoToNumber(formData.formaPago),
    
    // ===== DATOS DEL VEHÍCULO =====
    Conmaraut: formData.marcaModelo || '',
    Conanioaut: formData.anio ? Number(formData.anio) : undefined,
    Conmataut: formData.matricula || '',
    Conmotor: formData.motor || '',
    Conchasis: formData.chasis || '',
    
    // ===== IDs DE MAESTROS =====
    Catdsc: formData.categoriaId || undefined,
    Desdsc: formData.destinoId || undefined,
    Caldsc: formData.calidadId || undefined,
    Tarcod: formData.tarifaId || undefined,
    
    // ===== DATOS FINANCIEROS CON DOBLE MONEDA =====
    Contot: Number(formData.total) || Number(formData.premio) || 0,
    Concuo: Number(formData.cuotas) || 1,
    Moncod: Number(formData.monedaId) || VELNEO_DEFAULTS.MONEDA_DEFAULT,        // Moneda COBERTURA
    Conviamon: Number(formData.monedaPagoId) || Number(formData.monedaId) || VELNEO_DEFAULTS.MONEDA_DEFAULT, // Moneda PAGO
    
    // ===== CAMPOS LEGACY =====
    Marca: marca,
    Modelo: modelo,
    Anio: parseInt(formData.anio) || 0,
    Matricula: formData.matricula,
    Motor: formData.motor,
    Chasis: formData.chasis,
    Combustible: formData.combustibleId || '', // STRING
    CategoriaId: formData.categoriaId,
    DestinoId: formData.destinoId,
    CalidadId: formData.calidadId,
    FormaPago: formData.formaPago,
    CantidadCuotas: formData.cuotas,
    ValorCuota: formData.valorCuota,
    Departamento: formData.zonaCirculacion || '',
    
    // ===== OTROS CAMPOS =====
    Ramo: VELNEO_DEFAULTS.RAMO,
    Observaciones: buildObservations(formData),
    ProcesadoConIA: true,
    
    // Datos adicionales
    Condom: selectedClient?.clidir || formData.domicilio || '',
    Clinom: selectedClient?.clinom || formData.asegurado || '',
    Concar: formData.certificado || '0',
    Conend: formData.endoso || '0',
  };
};

/**
 * Helper para construir observaciones incluyendo info de monedas
 */
const buildObservations = (formData: PolicyFormData): string => {
  let obs = formData.observaciones || '';
  
  // Agregar nota si las monedas son diferentes
  if (formData.monedaPagoId && formData.monedaId && formData.monedaPagoId !== formData.monedaId) {
    const monedaCobertura = getCurrencySymbol(formData.monedaId);
    const monedaPago = getCurrencySymbol(formData.monedaPagoId);
    obs += `\n[MONEDAS DIFERENTES: Cobertura en ${monedaCobertura}, Pago en ${monedaPago}]`;
  }
  
  return obs;
};

/**
 * Helpers de mapeo a números para el backend
 */
const mapTramiteToNumber = (tramite: string): string => {
  const mapping: Record<string, string> = {
    'Nuevo': '1',
    'Renovación': '2',
    'Cambio': '3',
    'Endoso': '4',
    'No Renueva': '5',
    'Cancelación': '6'
  };
  return mapping[tramite] || '1';
};

const mapEstadoToNumber = (estado: string): string => {
  const mapping: Record<string, string> = {
    'Pendiente': '1',
    'En proceso': '2',
    'Terminado': '3',
    'Modificaciones': '4'
  };
  return mapping[estado] || '1';
};

const mapEstadoPolizaToNumber = (estado: string): string => {
  const mapping: Record<string, string> = {
    'VIG': '1',
    'ANT': '2',
    'VEN': '3',
    'END': '4',
    'ELIM': '5',
    'FIN': '6'
  };
  return mapping[estado] || '1';
};

const mapFormaPagoToNumber = (formaPago: string): string => {
  const mapping: Record<string, string> = {
    'Contado': '1',
    'Tarjeta': '2',
    'Débito Automático': '3',
    'Cuotas': '4'
  };
  return mapping[formaPago] || '1';
};

/**
 * Validador de formulario
 */
export const validateFormData = (formData: PolicyFormData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validar campos requeridos
  ALL_REQUIRED_FIELDS.forEach(field => {
    if (!formData[field as keyof PolicyFormData]) {
      errors[field] = VALIDATION_CONFIG.MESSAGES.REQUIRED;
    }
  });
  
  // Validar año
  if (formData.anio) {
    const year = parseInt(formData.anio);
    if (isNaN(year) || year < VALIDATION_CONFIG.ANIO_MIN || year > VALIDATION_CONFIG.ANIO_MAX) {
      errors.anio = VALIDATION_CONFIG.MESSAGES.INVALID_YEAR;
    }
  }
  
  // Validar fechas
  if (formData.desde && formData.hasta) {
    const desde = new Date(formData.desde);
    const hasta = new Date(formData.hasta);
    if (hasta <= desde) {
      errors.hasta = VALIDATION_CONFIG.MESSAGES.DATE_RANGE;
    }
  }
  
  // Validar cuotas
  if (formData.cuotas < VALIDATION_CONFIG.CUOTAS_MIN || formData.cuotas > VALIDATION_CONFIG.CUOTAS_MAX) {
    errors.cuotas = VALIDATION_CONFIG.MESSAGES.INVALID_CUOTAS;
  }
  
  // Validar montos
  if (formData.premio < 0) {
    errors.premio = VALIDATION_CONFIG.MESSAGES.NEGATIVE_AMOUNT;
  }
  if (formData.total < 0) {
    errors.total = VALIDATION_CONFIG.MESSAGES.NEGATIVE_AMOUNT;
  }
  
  // Advertencia de monedas diferentes (no es un error, solo informativo)
  if (formData.monedaPagoId && formData.monedaId && formData.monedaPagoId !== formData.monedaId) {
    console.warn(VALIDATION_CONFIG.MESSAGES.DIFFERENT_CURRENCIES);
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};