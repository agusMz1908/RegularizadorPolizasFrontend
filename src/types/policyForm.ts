export interface PolicyFormData {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: string;              // Input texto (del escaneo)
  asegurado: string;             // Read-only (cliente seleccionado)
  dirCobro: string;              // Input texto manual
  estadoTramite: string;         // Select texto plano
  tomador: string;               // Read-only (mismo que asegurado)
  domicilio: string;             // Read-only (del cliente)
  tramite: string;               // Select texto plano
  fecha: string;                 // Date (fecha gestión)
  asignado: string;              // Input texto (ignorar por ahora)
  tipo: string;                  // Select texto plano
  estadoPoliza: string;          // Select texto plano

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: number;              // Read-only (del paso 3)
  desde: string;                 // Date input (del escaneo)
  hasta: string;                 // Date input (del escaneo)
  poliza: string;                // Input texto (del escaneo)
  certificado: string;           // Input texto (del escaneo)

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: string;           // Input texto (marca + modelo unidos)
  anio: string;                  // Input number (del escaneo)
  matricula: string;             // Input texto (del escaneo, opcional)
  motor: string;                 // Input texto (del escaneo)
  destinoId: number;             // Select maestro Destino
  combustibleId: string;         // Select maestro Combustible (STRING!)
  chasis: string;                // Input texto (del escaneo)
  calidadId: number;             // Select maestro Calidad
  categoriaId: number;           // Select maestro Categoría

  // ===== PESTAÑA 4: DATOS DE LA COBERTURA =====
  coberturaId: number;           // Select maestro Cobertura
  zonaCirculacion: string;       // Input texto (departamento)
  monedaId: number;              // Select maestro Moneda

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  formaPago: string;             // Select texto plano
  premio: number;                // Input número (del escaneo)
  total: number;                 // Input número (del escaneo)
  moneda: number;                // Mismo que monedaId (sincronizado)
  valorCuota: number;            // Input número (del escaneo)
  cuotas: number;                // Input número (del escaneo)

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: string;         // Textarea libre
}

/**
 * 🎨 CONFIGURACIÓN DE PESTAÑAS
 */
export interface FormTab {
  id: FormTabId;
  label: string;
  icon: string;                  // Nombre del icono de Lucide
  description: string;
  color: string;                 // Clase CSS para color
  fields: (keyof PolicyFormData)[]; // Campos que pertenecen a esta pestaña
}

export type FormTabId = 
  | 'datos_basicos'
  | 'datos_poliza' 
  | 'datos_vehiculo'
  | 'datos_cobertura'
  | 'condiciones_pago'
  | 'observaciones';

/**
 * 🔧 ESTADO DEL FORMULARIO COMPLETO
 */
export interface PolicyFormState {
  // Datos del formulario
  formData: PolicyFormData;
  
  // Estado de validación
  errors: Record<string, string>;
  touchedFields: Set<string>;
  isValid: boolean;
  
  // Estado de UI
  activeTab: FormTabId;
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Progreso
  completionPercentage: number;
  tabCompletion: Record<FormTabId, number>;
  
  // Datos de contexto
  masterOptions: any; // VelneoMasterDataOptions cuando se cargue
  loadingMasters: boolean;
}

/**
 * 📊 PROGRESO DEL FORMULARIO
 */
export interface FormProgress {
  overall: number;               // Progreso general 0-100
  byTab: Record<FormTabId, {
    completion: number;          // 0-100
    errors: number;              // Cantidad de errores
    required: string[];          // Campos requeridos
    completed: string[];         // Campos completados
  }>;
}

/**
 * ✅ VALIDACIÓN
 */
export interface FieldValidation {
  field: keyof PolicyFormData;
  isRequired: boolean;
  validator?: (value: any, formData: PolicyFormData) => string | null;
  dependency?: keyof PolicyFormData; // Campo del que depende
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  missingRequired: string[];
}

/**
 * 🎯 ACCIONES DEL FORMULARIO
 */
export interface FormActions {
  updateField: (field: keyof PolicyFormData, value: any) => void;
  setActiveTab: (tab: FormTabId) => void;
  validateForm: () => FormValidationResult;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  goToFieldError: (field: keyof PolicyFormData) => void;
}

/**
 * 🔄 MAPEO AUTOMÁTICO DESDE AZURE
 */
export interface AutoMappingResult {
  mappedFields: (keyof PolicyFormData)[];
  unmappedFields: string[];
  confidence: Record<keyof PolicyFormData, number>; // 0-100 por campo
  warnings: string[];
  suggestions: Record<string, string[]>; // Sugerencias para campos no mapeados
}

/**
 * 📝 CONTEXTO DEL FORMULARIO (para React Context si lo usamos)
 */
export interface PolicyFormContextValue {
  state: PolicyFormState;
  actions: FormActions;
  
  // Datos de contexto externa
  scannedData: any; // AzureProcessResponse
  selectedClient: any; // VelneoClienteDto
  selectedCompany: any; // VelneoCompaniaDto
  selectedSection: any; // VelneoSeccionDto
  
  // Callbacks
  onSubmit: (result: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

/**
 * 🎨 OPCIONES DE UI PARA SELECTS
 */
export interface SelectOption {
  id: string | number;
  name: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: string; // Nombre del icono de Lucide
  isNumeric?: boolean; // Si devuelve number o string
}

/**
 * 📝 PROPS DE CAMPO DE INPUT
 */
export interface FormFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  icon?: string; // Nombre del icono de Lucide
  min?: number;
  max?: number;
  step?: number;
}

/**
 * 🏷️ PROPS DE TEXTAREA
 */
export interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  maxLength?: number;
}

/**
 * 📋 METADATOS DE CAMPO
 */
export interface FieldMetadata {
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  tab: FormTabId;
  required: boolean;
  readonly?: boolean;
  placeholder?: string;
  icon?: string;
  
  // Para selects
  optionsSource?: 'master' | 'plain';
  masterType?: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda';
  plainOptions?: string[];
  
  // Para validación
  validator?: string; // Nombre de la función de validación
  dependency?: keyof PolicyFormData;
  
  // Para mapeo automático
  azureField?: string; // Campo correspondiente en Azure response
  fallbackValue?: any;
}