// src/constants/velneoDefault.ts - VERSIÓN CORREGIDA CON TIPOS COMPATIBLES

import type { PolicyFormData } from '../types/poliza';

// ✅ TIPO CORRECTO BASADO EN TU BACKEND REAL
interface PolizaCreateRequest {
  // ===== CAMPOS PRINCIPALES OBLIGATORIOS =====
  Clinro: number;                    // ID Cliente
  Clinom?: string;                   // Nombre cliente
  Comcod: number;                    // ID Compañía
  Conpremio: number;                 // Premio (OBLIGATORIO)
  
  // ===== CAMPOS OPCIONALES =====
  Seccod?: number;                   // ID Sección
  SeccionId?: number;                // ID Sección alternativo
  Conpol?: string;                   // Número de póliza
  Concar?: string;                   // Certificado
  Conend?: string;                   // Endoso
  Confchdes?: string;                // Fecha desde
  Confchhas?: string;                // Fecha hasta
  Convig?: string;                   // Estado vigencia
  Contra?: string;                   // Tipo trámite
  Consta?: string;                   // Forma de pago
  Congesti?: string;                 // Tipo gestión
  Congeses?: string;                 // Estado gestión
  Congesfi?: string;                 // Fecha gestión
  Asegurado?: string;                // Nombre asegurado
  Direccion?: string;                // Dirección
  Condom?: string;                   // Domicilio
  Marca?: string;                    // Marca
  Modelo?: string;                   // Modelo
  Conmaraut?: string;                // Marca + modelo completo
  Anio?: number;                     // Año
  Conanioaut?: number;               // Año (campo Velneo)
  Matricula?: string;                // Matrícula
  Conmataut?: string;                // Matrícula (campo Velneo)
  Motor?: string;                    // Motor
  Conmotor?: string;                 // Motor (campo Velneo)
  Chasis?: string;                   // Chasis
  Conchasis?: string;                // Chasis (campo Velneo)
  CombustibleId?: string;            // ID Combustible (STRING)
  CombustibleNombre?: string;        // Nombre combustible
  CategoriaId?: number;              // ID Categoría
  CategoriaNombre?: string;          // Nombre categoría
  DestinoId?: number;                // ID Destino
  DestinoNombre?: string;            // Nombre destino
  CalidadId?: number;                // ID Calidad
  CalidadNombre?: string;            // Nombre calidad
  PremioTotal?: number;              // Premio total
  Contot?: number;                   // Total
  CantidadCuotas?: number;           // Cantidad de cuotas
  Concuo?: number;                   // Cuotas (campo Velneo)
  Moneda?: string;                   // Moneda como string
  Moncod?: number;                   // Moneda ID
  FormaPago?: string;                // Forma de pago como string
  CoberturaId?: number;              // ID Cobertura
  Cobertura?: string;                // Nombre cobertura
  ZonaCirculacion?: string;          // Zona de circulación
  DepartamentoId?: number;           // ID Departamento
  Ramo?: string;                     // Ramo (ej: "AUTOMOVILES")
  EstadoPoliza?: string;             // Estado de la póliza
  Tramite?: string;                  // Tipo de trámite
  Observaciones?: string;            // Observaciones generales
  ProcesadoConIA?: boolean;          // Flag de procesamiento con IA
  
  // ===== CAMPOS ADICIONALES DEL ORIGINAL =====
  id?: number;
  flocod?: number;
  conclaaut?: number;
  condedaut?: number;
  conresciv?: number;
  conbonnsin?: number;
  conbonant?: number;
  concaraut?: number;
  concapaut?: number;
  conpadaut?: string;
  forpagvid?: string;
  concesnom?: string;
  concestel?: string;
  conges?: string;
  plan?: string;
  
  // ===== CAMPOS FLEXIBLES =====
  [key: string]: any;                // Para campos adicionales
}

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
  COMBUSTIBLE_DEFAULT: 'GAS',          // ✅ CORREGIDO: STRING para combustibles
  DESTINO_DEFAULT: 2,                  // PARTICULAR por defecto
  CALIDAD_DEFAULT: 2,                  // PROPIETARIO por defecto
  MONEDA_DEFAULT: 1,                   // PESO URUGUAYO por defecto
  
  // ===== VALORES NUMÉRICOS =====
  CUOTAS_DEFAULT: 1,
  FLOCOD_DEFAULT: 0,
  CAMPOS_NUMERICOS_DEFAULT: 0,
  
  // ===== CAMPOS VACÍOS POR DEFECTO =====
  EMPTY_STRING: '',
  
  // ===== DEPARTAMENTO POR DEFECTO =====
  DEPARTAMENTO_DEFAULT: 'MONTEVIDEO'
} as const;

/**
 * 📋 FORMULARIO VACÍO INICIAL
 */
export const EMPTY_POLICY_FORM: PolicyFormData = {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: VELNEO_DEFAULTS.EMPTY_STRING,
  asegurado: VELNEO_DEFAULTS.EMPTY_STRING,
  dirCobro: VELNEO_DEFAULTS.EMPTY_STRING,
  estadoTramite: VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT,
  tomador: VELNEO_DEFAULTS.EMPTY_STRING,
  domicilio: VELNEO_DEFAULTS.EMPTY_STRING,
  tramite: VELNEO_DEFAULTS.TRAMITE_DEFAULT,
  fecha: new Date().toISOString().split('T')[0],
  asignado: VELNEO_DEFAULTS.EMPTY_STRING,
  tipo: VELNEO_DEFAULTS.TIPO_DEFAULT,
  estadoPoliza: VELNEO_DEFAULTS.ESTADO_POLIZA_DEFAULT,

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: VELNEO_DEFAULTS.COMPANIA_BSE,
  desde: VELNEO_DEFAULTS.EMPTY_STRING,
  hasta: VELNEO_DEFAULTS.EMPTY_STRING,
  poliza: VELNEO_DEFAULTS.EMPTY_STRING,
  certificado: VELNEO_DEFAULTS.EMPTY_STRING,

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: VELNEO_DEFAULTS.EMPTY_STRING,
  anio: VELNEO_DEFAULTS.EMPTY_STRING,
  matricula: VELNEO_DEFAULTS.EMPTY_STRING,
  motor: VELNEO_DEFAULTS.EMPTY_STRING,
  destinoId: VELNEO_DEFAULTS.DESTINO_DEFAULT,
  combustibleId: VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT, // ✅ STRING
  chasis: VELNEO_DEFAULTS.EMPTY_STRING,
  calidadId: VELNEO_DEFAULTS.CALIDAD_DEFAULT,
  categoriaId: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,

  // ===== PESTAÑA 4: DATOS DE LA COBERTURA =====
  coberturaId: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  zonaCirculacion: VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT,
  monedaId: VELNEO_DEFAULTS.MONEDA_DEFAULT,

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  formaPago: VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT,
  premio: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  total: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  moneda: VELNEO_DEFAULTS.MONEDA_DEFAULT,
  valorCuota: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  cuotas: VELNEO_DEFAULTS.CUOTAS_DEFAULT,

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: VELNEO_DEFAULTS.EMPTY_STRING
};

/**
 * 🏗️ OBJETO VELNEO VACÍO (para referencia) - CORREGIDO CON TIPO ADECUADO
 */
export const EMPTY_VELNEO_REQUEST: Partial<PolizaCreateRequest> = {
  // ===== VALORES FIJOS =====
  id: 0,
  Ramo: VELNEO_DEFAULTS.RAMO,
  ProcesadoConIA: true,
  Conend: VELNEO_DEFAULTS.ENDOSO_DEFAULT,
  
  // ===== CAMPOS NUMÉRICOS POR DEFECTO =====
  flocod: VELNEO_DEFAULTS.FLOCOD_DEFAULT,
  conclaaut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  condedaut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  conresciv: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  conbonnsin: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  conbonant: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  concaraut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  concapaut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
  
  // ===== CAMPOS STRING VACÍOS =====
  conpadaut: VELNEO_DEFAULTS.EMPTY_STRING,
  forpagvid: VELNEO_DEFAULTS.EMPTY_STRING,
  concesnom: VELNEO_DEFAULTS.EMPTY_STRING,
  concestel: VELNEO_DEFAULTS.EMPTY_STRING,
  conges: VELNEO_DEFAULTS.EMPTY_STRING,
  plan: VELNEO_DEFAULTS.EMPTY_STRING
};

/**
 * 📊 CAMPOS REQUERIDOS POR PESTAÑA
 */
export const REQUIRED_FIELDS_BY_TAB = {
  datos_basicos: ['corredor', 'estadoTramite', 'tramite', 'tipo', 'estadoPoliza'],
  datos_poliza: ['desde', 'hasta', 'poliza'],
  datos_vehiculo: ['marcaModelo', 'anio', 'destinoId', 'combustibleId', 'calidadId', 'categoriaId'],
  datos_cobertura: ['coberturaId', 'zonaCirculacion', 'monedaId'],
  condiciones_pago: ['formaPago', 'premio', 'total', 'cuotas'],
  observaciones: [] as string[] // Sin campos requeridos
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
    INVALID_CUOTAS: `Cuotas debe estar entre ${1} y ${48}`,
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
  DEBOUNCE_DELAY: 300,           // ms para validación en tiempo real
  SAVE_DELAY: 1000,              // ms para auto-save (si se implementa)
  
  // Animaciones
  TAB_TRANSITION_DURATION: 300,  // ms
  FORM_ANIMATION_DELAY: 100      // ms
} as const;

/**
 * 🌍 CONFIGURACIÓN REGIONAL
 */
export const REGIONAL_CONFIG = {
  // Formato de fechas
  DATE_FORMAT: 'yyyy-MM-dd',     // Para inputs HTML5
  DISPLAY_DATE_FORMAT: 'dd/MM/yyyy',
  
  // Formato de números
  CURRENCY_LOCALE: 'es-UY',
  CURRENCY_SYMBOL: '$U',
  
  // Departamentos de Uruguay (para zona de circulación)
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
  REQUEST_TIMEOUT: 30000,        // 30 segundos
  MASTER_DATA_TIMEOUT: 10000,    // 10 segundos para maestros
  
  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000              // ms entre reintentos
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