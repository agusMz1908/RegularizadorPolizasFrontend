export type {
  Cliente,
} from './types/cliente';

export type {
  Poliza,
  PolizaFormData,
  PolizaCreateRequest,
} from './types/poliza';

export type {
  ProcessingState,
  DocumentResult,
  ProcessingError,
  ValidationError,
} from './types/processing';

export type {
  ApiResponse,
  DocumentProcessRequest,
  DocumentProcessResponse,
  VelneoPolicyRequest,
  VelneoPolicyResponse,
  VerificationStatus,
  VerificationField,
  LoginRequest,
  LoginResponse,
  User,
} from './types/api';

export type {
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  DropdownOption,
  NavigationContext,
  BreadcrumbItem,
} from './types/common';

export { 
  API_CONFIG, 
  STORAGE_KEYS, 
  ENDPOINTS, 
  HTTP_STATUS 
} from './utils/constants';

export { apiClient } from './services/ApiClient';
export type { ApiResponse as ApiClientResponse, ApiClientOptions } from './services/ApiClient';

export { polizaService } from './services/polizaService';
export type { PolizaCreateRequest as PolizaServiceRequest } from './services/polizaService';

export { clienteService } from './services/clienteService';
export type { Cliente as ClienteType } from './services/clienteService';

export { companyService } from './services/companyService';
export type { Company, CompanyLookup } from './services/companyService';

export { seccionService } from './services/seccionService';
export type { Seccion, SeccionLookup } from './services/seccionService';

export { azureService } from './services/azureService';
export type { 
  DocumentProcessResult, 
  AzureProcessResponse 
} from './services/azureService';

export { useApiService, useGlobalErrorHandler } from './hooks/useApiService';
export type { UseApiServiceOptions, UseApiServiceState } from './hooks/useApiService';

export { useFileUpload } from './hooks/useFileUpload';
export { useDocumentProcessing } from './hooks/useDocumentProcessing';
export { usePolizaForm } from './hooks/usePolizaForm';

export { Header } from './components/common/Header';
export { ErrorMessage } from './components/common/ErrorMessage';
export { ProgressBar } from './components/common/ProgressBar';
export { Modal } from './components/common/Modal';
export { Table } from './components/common/Table';
export { SearchInput } from './components/common/SearchInput';