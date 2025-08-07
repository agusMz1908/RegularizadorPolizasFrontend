// src/constants/velneoDefaults.ts - VERSIÓN CORREGIDA

import type { PolicyFormData } from '../types/poliza';

/**
 * 🎯 VALORES POR DEFECTO PARA BUSINESS RULES AUTOMÁTICAS
 * Basado en tu especificación: BSE + AUTOMÓVILES inicialmente
 */
export const VELNEO_DEFAULTS = {
  // ===== IDs FIJOS INICIALES =====
  SECCION_AUTOMOVILES: 9,              // ID de la sección AUTOMÓVILES
  COMPANIA_BSE: 2,                     // ID de BSE (ajustar según tu BD)
  
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
  CATEGORIA_DEFAULT: 20,  
  CAMPOS_NUMERICOS_DEFAULT: 0,             // AUTOMÓVIL por defecto
  
  // ===== VALORES NUMÉRICOS =====
  CUOTAS_DEFAULT: 1,
  PREMIO_DEFAULT: 0,
  COBERTURA_DEFAULT: 1,
  DEPARTAMENTO_DEFAULT_ID: 1,
  
  // ===== CAMPOS VACÍOS POR DEFECTO =====
  EMPTY_STRING: '',
  
  // ===== ZONA POR DEFECTO =====
  ZONA_CIRCULACION_DEFAULT: 'MONTEVIDEO'
} as const;

/**
 * 📋 FORMULARIO VACÍO INICIAL - CORREGIDO
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
  comalias: 'BSE',                    // Agregado: alias de compañía
  seccion: VELNEO_DEFAULTS.SECCION_AUTOMOVILES,  // Agregado: sección
  poliza: VELNEO_DEFAULTS.EMPTY_STRING,
  certificado: VELNEO_DEFAULTS.EMPTY_STRING,
  endoso: VELNEO_DEFAULTS.ENDOSO_DEFAULT,        // Agregado: endoso
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
  zonaCirculacion: VELNEO_DEFAULTS.ZONA_CIRCULACION_DEFAULT,
  departamentoId: VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT_ID,  // Corregido: era 'departamento'
  monedaId: VELNEO_DEFAULTS.MONEDA_DEFAULT,
  tarifaId: undefined,

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  premio: VELNEO_DEFAULTS.PREMIO_DEFAULT,
  total: VELNEO_DEFAULTS.PREMIO_DEFAULT,
  formaPago: VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT,
  cuotas: VELNEO_DEFAULTS.CUOTAS_DEFAULT,
  valorCuota: 0,

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: VELNEO_DEFAULTS.EMPTY_STRING
};

/**
 * 📊 CAMPOS REQUERIDOS POR PESTAÑA
 */
export const REQUIRED_FIELDS_BY_TAB = {
  datos_basicos: ['corredor', 'estadoTramite', 'tramite', 'tipo', 'estadoPoliza'],
  datos_poliza: ['poliza', 'desde', 'hasta'],
  datos_vehiculo: ['marcaModelo', 'anio', 'destinoId', 'combustibleId'],
  datos_cobertura: ['monedaId', 'zonaCirculacion'],
  condiciones_pago: ['premio', 'formaPago'],
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
  CUOTAS_MAX: 48,
  
  PREMIO_MIN: 0,
  TOTAL_MIN: 0,
  VALOR_CUOTA_MIN: 0,
  
  // Longitudes de texto
  CORREDOR_MAX_LENGTH: 100,
  POLIZA_MAX_LENGTH: 50,
  CERTIFICADO_MAX_LENGTH: 50,
  MARCA_MODELO_MAX_LENGTH: 150,
  MATRICULA_MAX_LENGTH: 20,
  MOTOR_MAX_LENGTH: 50,
  CHASIS_MAX_LENGTH: 50,
  OBSERVACIONES_MAX_LENGTH: 1000,
  
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
    INVALID_CUOTAS: 'Cuotas debe estar entre 1 y 48',
    NEGATIVE_AMOUNT: 'El monto no puede ser negativo',
    MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
    INVALID_FORMAT: 'Formato inválido'
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
  CURRENCY_SYMBOL: '$U',
  
  // Departamentos de Uruguay
  DEPARTAMENTOS_URUGUAY: [
    'MONTEVIDEO',
    'ARTIGAS',
    'CANELONES',
    'CERRO LARGO',
    'COLONIA',
    'DURAZNO',
    'FLORES',
    'FLORIDA',
    'LAVALLEJA',
    'MALDONADO',
    'PAYSANDÚ',
    'RÍO NEGRO',
    'RIVERA',
    'ROCHA',
    'SALTO',
    'SAN JOSÉ',
    'SORIANO',
    'TACUAREMBÓ',
    'TREINTA Y TRES'
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
    SEARCH_CLIENTES: '/api/clientes/search'
  },
  
  // Timeouts
  REQUEST_TIMEOUT: 30000,
  MASTER_DATA_TIMEOUT: 10000,
  
  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;

/**
 * 📝 TIPO REQUEST PARA CREAR PÓLIZA EN VELNEO
 */
export interface PolizaCreateRequest {
  // Campos principales obligatorios
  Clinro: number;
  Clinom?: string;
  Comcod: number;
  Seccod: number;
  Conpremio: number;
  
  // Campos de póliza
  Conpol?: string;
  Concar?: string;
  Conend?: string;
  Confchdes?: string;
  Confchhas?: string;
  Convig?: string;
  Contra?: string;
  Consta?: string;
  
  // Datos del asegurado
  Asegurado?: string;
  Direccion?: string;
  Condom?: string;
  
  // Datos del vehículo
  Marca?: string;
  Modelo?: string;
  Conmaraut?: string;
  Anio?: number;
  Conanioaut?: number;
  Matricula?: string;
  Conmataut?: string;
  Motor?: string;
  Conmotor?: string;
  Chasis?: string;
  Conchasis?: string;
  
  // Maestros
  Combustibles?: string;  // STRING!
  CategoriaId?: number;
  DestinoId?: number;
  CalidadId?: number;
  
  // Financiero
  PremioTotal?: number;
  Contot?: number;
  CantidadCuotas?: number;
  Concuo?: number;
  Moneda?: string;
  Moncod?: number;
  FormaPago?: string;
  
  // Cobertura
  CoberturaId?: number;
  Cobertura?: string;
  ZonaCirculacion?: string;
  DepartamentoId?: number;
  
  // Otros
  Ramo?: string;
  EstadoPoliza?: string;
  Tramite?: string;
  Observaciones?: string;
  ProcesadoConIA?: boolean;
  
  // Campos adicionales
  [key: string]: any;
}

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

/**
 * 🔄 MAPEO DE FORM DATA A VELNEO REQUEST
 */
export const mapFormDataToVelneoRequest = (formData: PolicyFormData): PolizaCreateRequest => {
  // Separar marca y modelo si están unidos
  const [marca, ...modeloParts] = formData.marcaModelo.split(' ');
  const modelo = modeloParts.join(' ');

  return {
    // IDs principales
    Clinro: formData.clinro || 0,
    Clinom: formData.asegurado,
    Comcod: formData.compania,
    Seccod: formData.seccion,
    
    // Datos de póliza
    Conpol: formData.poliza,
    Concar: formData.certificado,
    Conend: formData.endoso,
    Confchdes: formData.desde,
    Confchhas: formData.hasta,
    Convig: formData.estadoPoliza,
    Contra: formData.tramite,
    Consta: formData.formaPago,
    
    // Datos del asegurado
    Asegurado: formData.asegurado,
    Direccion: formData.domicilio,
    Condom: formData.domicilio,
    
    // Datos del vehículo
    Marca: marca,
    Modelo: modelo,
    Conmaraut: formData.marcaModelo,
    Anio: parseInt(formData.anio) || 0,
    Conanioaut: parseInt(formData.anio) || 0,
    Matricula: formData.matricula,
    Conmataut: formData.matricula,
    Motor: formData.motor,
    Conmotor: formData.motor,
    Chasis: formData.chasis,
    Conchasis: formData.chasis,
    
    // Maestros
    Combustibles: formData.combustibleId,  // STRING!
    CategoriaId: formData.categoriaId,
    DestinoId: formData.destinoId,
    CalidadId: formData.calidadId,
    
    // Financiero
    Conpremio: formData.premio,
    PremioTotal: formData.total,
    Contot: formData.total,
    CantidadCuotas: formData.cuotas,
    Concuo: formData.cuotas,
    Moncod: formData.monedaId,
    FormaPago: formData.formaPago,
    
    // Cobertura
    CoberturaId: formData.coberturaId,
    ZonaCirculacion: formData.zonaCirculacion,
    DepartamentoId: formData.departamentoId,
    
    // Otros
    Ramo: VELNEO_DEFAULTS.RAMO,
    EstadoPoliza: formData.estadoPoliza,
    Tramite: formData.tramite,
    Observaciones: formData.observaciones,
    ProcesadoConIA: true
  };
};