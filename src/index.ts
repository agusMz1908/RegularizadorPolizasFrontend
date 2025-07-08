// index.ts - Archivo principal de exportaciones

import { Cliente } from './types/cliente';
import { Compania } from './types/compania';
import { Ramo } from './types/ramo';

// ================================
// TYPES
// ================================
export type {
  // Cliente types
  Cliente,
} from './types/cliente';

export type {
  // Poliza types
  Poliza,
  PolizaFormData,
} from './types/poliza';

export type {
  // Processing types
  ProcessingState,
  DocumentResult,
  ProcessingError,
  ValidationError,
} from './types/processing';

export type {
  // API types
  ApiResponse,
  DocumentProcessRequest,
  DocumentProcessResponse,
  VelneoPolicyRequest,
  VelneoPolicyResponse,
  VerificationStatus,
  VerificationField,
} from './types/api';

export type {
  // User types
  User,
  AuthState,
  LoginRequest,
  LoginResponse,
} from './types/user';

export type {
  // Common types
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  DropdownOption,
  NavigationContext,
  BreadcrumbItem,
} from './types/common';

// ================================
// SERVICES
// ================================
export { apiService } from './services/api';
export { azureDocumentService, AzureDocumentService } from './services/azureDocumentService';
export { velneoService, VelneoService } from './services/velneoService';
export { clienteService, ClienteService } from './services/clienteService';

// ================================
// HOOKS
// ================================
export { useFileUpload } from './hooks/useFileUpload';
export { useDocumentProcessing } from './hooks/useDocumentProcessing';
export { usePolizaForm } from './hooks/usePolizaForm';
export { useClientes } from './hooks/useCliente';
export { useVelneo } from './hooks/useVelneo';
export { useAuth, useAuthProvider } from './hooks/useAuth';

// ================================
// COMMON COMPONENTS
// ================================
export { Header } from './components/common/Header';
export { Sidebar } from './components/common/Sidebar';
export { LoadingSpinner } from './components/common/LoadingSpinner';
export { ErrorMessage } from './components/common/ErrorMessage';
export { ProgressBar } from './components/common/ProgressBar';
export { Modal } from './components/common/Modal';
export { Table } from './components/common/Table';
export { SearchInput } from './components/common/SearchInput';

// ================================
// POLIZA COMPONENTS
// ================================
export { FileUpload } from './components/poliza/FileUpload';
export { PolizaForm } from './components/poliza/PolizaForm';
export { PdfViewer } from './components/poliza/PdfViewer';
export { ProcessingStates } from './components/poliza/ProcessingStates';
export { NewPolizaModal } from './components/poliza/NewPolizaModal';

// ================================
// CLIENTE COMPONENTS
// ================================
export { ClienteTable } from './components/cliente/ClienteTable';
export { PolizaTable } from './components/cliente/PolizaTable';
export { ClienteForm } from './components/cliente/ClienteForm';
export { ClienteStats } from './components/cliente/ClienteStats';
export { ClienteFilters } from './components/cliente/ClienteFilters';

// ================================
// PAGES
// ================================
export { default as Dashboard } from './pages/Dashboard';
export { default as ProcesarPoliza } from './pages/ProcesarPoliza';

// ================================
// UTILS & CONSTANTS
// ================================

// Utilidades para validación
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateCI = (ci: string): boolean => {
  // Validación básica de CI uruguaya
  const cleaned = ci.replace(/[.\-\s]/g, '');
  return /^\d{7,8}$/.test(cleaned);
};

export const validateRUT = (rut: string): boolean => {
  // Validación básica de RUT uruguayo
  const cleaned = rut.replace(/[.\-\s]/g, '');
  return /^\d{12}$/.test(cleaned);
};

// Utilidades para formateo
export const formatCurrency = (amount: number, currency: string = 'UYU'): string => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: currency === 'UYU' ? 'UYU' : 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-UY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Constants
export const PROCESSING_STATES = {
  IDLE: 'idle' as const,
  UPLOADING: 'uploading' as const,
  PROCESSING: 'processing' as const,
  FORM_READY: 'form-ready' as const,
  SENDING_VELNEO: 'sending-velneo' as const,
  SENT_SUCCESS: 'sent-success' as const,
  VERIFICATION: 'verification' as const,
  COMPLETED: 'completed' as const,
  ERROR: 'error' as const,
};

export const POLIZA_ESTADOS = {
  VIGENTE: 'Vigente' as const,
  VENCIDA: 'Vencida' as const,
  CANCELADA: 'Cancelada' as const,
  PENDIENTE: 'Pendiente' as const,
};

export const RAMO_CODES = {
  AUTO: 'AUTO' as const,
  INCENDIO: 'INC' as const,
  RESPONSABILIDAD_CIVIL: 'RC' as const,
  VIDA: 'VIDA' as const,
};

export const FILE_TYPES = {
  PDF: 'application/pdf' as const,
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Error codes
export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// ================================
// CONFIGURATION
// ================================
export const APP_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://localhost:5001/api',
  AZURE_DOCUMENT_ENDPOINT: process.env.REACT_APP_AZURE_DOC_ENDPOINT || '',
  VELNEO_ENDPOINT: process.env.REACT_APP_VELNEO_ENDPOINT || '',
  MAX_UPLOAD_SIZE: MAX_FILE_SIZE,
  SUPPORTED_FILE_TYPES: [FILE_TYPES.PDF],
  DEBOUNCE_DELAY: 300,
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
} as const;

// ================================
// MOCK DATA (for development)
// ================================
export const MOCK_DATA = {
  companias: [
    { id: 1, nombre: 'Banco de Seguros del Estado', codigo: 'BSE' },
    { id: 2, nombre: 'Sura Seguros', codigo: 'SURA' },
    { id: 3, nombre: 'Mapfre Seguros', codigo: 'MAPFRE' },
    { id: 4, nombre: 'La República Seguros', codigo: 'LRS' },
  ] as Compania[],

  ramos: [
    { id: 1, nombre: 'Automóviles', codigo: 'AUTO' },
    { id: 2, nombre: 'Incendio', codigo: 'INC' },
    { id: 3, nombre: 'Responsabilidad Civil', codigo: 'RC' },
    { id: 4, nombre: 'Vida', codigo: 'VIDA' },
  ] as Ramo[],

  clientes: [
    {
      id: 1,
      nombre: 'AVALA GENTA OMAR MANUEL',
      documento: 'CI 989.333-3',
      telefono: '2514 3055',
      email: '',
      direccion: 'AVELLANEDA 4639',
      activo: true,
    },
    {
      id: 2,
      nombre: 'CUSTODIA DE VAL MOBIL SOC DE BOLSA S.A.',
      documento: '332651-3',
      telefono: '2345765',
      email: '',
      direccion: 'JUAN CARLOS GOMEZ 1348 AP 401',
      activo: true,
    },
  ] as Cliente[],
} as const;

// ================================
// VERSION INFO
// ================================
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// ================================
// DEVELOPMENT HELPERS
// ================================
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Logger for development
export const devLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log('[RegularizadorPolizas]', ...args);
  }
};

export const devError = (...args: any[]) => {
  if (isDevelopment) {
    console.error('[RegularizadorPolizas Error]', ...args);
  }
};

// ================================
// DEFAULT EXPORT
// ================================
export default {
  VERSION,
  BUILD_DATE,
  APP_CONFIG,
  MOCK_DATA,
  PROCESSING_STATES,
  POLIZA_ESTADOS,
  RAMO_CODES,
  ERROR_CODES,
};