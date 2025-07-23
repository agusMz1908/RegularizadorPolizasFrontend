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
  LoginRequest,
  LoginResponse,
  User,
} from './types/api';

export type {
  // Common types
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  DropdownOption,
  NavigationContext,
  BreadcrumbItem,
} from './types/common';

export { apiService } from './services/api';

export { azureDocumentService, AzureDocumentService } from './services/azureDocumentService';

export { useFileUpload } from './hooks/useFileUpload';
export { useDocumentProcessing } from './hooks/useDocumentProcessing';
export { usePolizaForm } from './hooks/usePolizaForm';

// ✅ NUEVO HOOK AZURE
export { useAzureDocumentProcessing } from './hooks/useAzureDocumentProcessing';
export type { DocumentProcessingState } from './hooks/useAzureDocumentProcessing';

export { Header } from './components/common/Header';
export { ErrorMessage } from './components/common/ErrorMessage';
export { ProgressBar } from './components/common/ProgressBar';
export { Modal } from './components/common/Modal';
export { Table } from './components/common/Table';
export { SearchInput } from './components/common/SearchInput';
