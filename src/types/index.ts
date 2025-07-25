/**
 * src/types/index.ts
 * Exportaciones centralizadas - VERSIÓN SIMPLIFICADA
 */

// ============================================================================
// 🏆 TIPOS PRINCIPALES (solo si existe el archivo)
// ============================================================================

// Solo exportar si el archivo existe
export type {
  PolizaCreateRequest,
  PolizaFormData,
  PolizaDto,
  EstadoPoliza,
  Tramite,
  FormaPago,
  MonedaId,
  EstadoGestion
} from './core/poliza';

export {
  ESTADOS_POLIZA,
  TRAMITES,
  FORMAS_PAGO,
  MONEDAS,
  ESTADOS_GESTION
} from './core/poliza';

// ============================================================================
// 🛠️ UTILIDADES (solo si existen los archivos)
// ============================================================================

// Comentar temporalmente hasta que funcionen los tipos base
// export * from '../utils/poliza-mappers';
// export * from '../utils/validators';

// ============================================================================
// 📡 TIPOS DE API BÁSICOS
// ============================================================================

export interface PolizaCreateResponse {
  success: boolean;
  message: string;
  numeroPoliza: string;
  clienteId: number;
  companiaId: number;
  seccionId: number;
  polizaCreada: any;
  timestamp: string;
  procesadoConIA: boolean;
}

export interface PolizaValidationResponse {
  success: boolean;
  numeroPoliza: string;
  errores: string[];
  warnings: string[];
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// 👤 TIPOS DE ENTIDADES BÁSICAS
// ============================================================================

export interface ClienteDto {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  clidir?: string;
  cliemail?: string;
  telefono?: string;
  activo: boolean;
}

export interface CompanyDto {
  id: number;
  nombre: string;
  codigo?: string;
  alias?: string;
  activo: boolean;
}

export interface SeccionDto {
  id: number;
  seccion: string;
  descripcion?: string;
  activo: boolean;
}

export interface LookupDto {
  id: number;
  name: string;
  codigo?: string;
  activo: boolean;
}

// ============================================================================
// 🎨 TIPOS DE UI/COMPONENTES
// ============================================================================

export interface WizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export interface WizardState {
  currentStep: number;
  isLoading: boolean;
  error?: string;
  selectedCompany?: CompanyDto;
  selectedCliente?: ClienteDto;
  selectedSeccion?: SeccionDto;
  extractedData?: any;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
  redirectTo?: string;
}

// ============================================================================
// 🛠️ HELPERS BÁSICOS
// ============================================================================

export function debugearMapeo(formData: any, request: any): void {
  console.group('🔍 DEBUG: Mapeo de datos');
  console.log('📝 Form Data:', formData);
  console.log('📤 Request Final:', request);
  console.groupEnd();
}

export function limpiarRequest(data: any): any {
  const cleaned: any = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
}