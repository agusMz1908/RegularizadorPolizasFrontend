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


// ================================
// SERVICES
// ================================
export { apiService } from './services/api';

// ✅ NUEVO SERVICIO AZURE
export { azureDocumentService, AzureDocumentService } from './services/azureDocumentService';

// ================================
// HOOKS
// ================================
export { useFileUpload } from './hooks/useFileUpload';
export { useDocumentProcessing } from './hooks/useDocumentProcessing';
export { usePolizaForm } from './hooks/usePolizaForm';

// ✅ NUEVO HOOK AZURE
export { useAzureDocumentProcessing } from './hooks/useAzureDocumentProcessing';
export type { DocumentProcessingState } from './hooks/useAzureDocumentProcessing';

// ================================
// UTILS
// ================================
// ✅ NUEVAS UTILIDADES AZURE
export { AzureDocumentUtils } from './utils/azure-document-utils';

// ================================
// COMMON COMPONENTS
// ================================
export { Header } from './components/common/Header';
export { Sidebar } from './components/common/Sidebar';
export { ErrorMessage } from './components/common/ErrorMessage';
export { ProgressBar } from './components/common/ProgressBar';
export { Modal } from './components/common/Modal';
export { Table } from './components/common/Table';
export { SearchInput } from './components/common/SearchInput';

// ================================
// AZURE COMPONENTS
// ================================
// ✅ NUEVOS COMPONENTES AZURE
export { AzureDocumentProcessor } from './components/azure/AzureDocumentProcessor';

// ================================
// POLIZA COMPONENTS
// ================================
/* 
=================================================================
📋 NUEVAS EXPORTACIONES AGREGADAS:
=================================================================

✅ TIPOS AZURE:
• AzureProcessResponse - Respuesta principal del procesamiento
• AzureBatchResponse - Respuesta de procesamiento en lote
• AzureModelInfoResponse - Información del modelo
• AzureErrorResponse - Manejo de errores
• Todos los sub-tipos relacionados

✅ SERVICIO AZURE:
• azureDocumentService - Instancia del servicio
• AzureDocumentService - Clase del servicio

✅ HOOK AZURE:
• useAzureDocumentProcessing - Hook principal
• DocumentProcessingState - Tipo del estado

✅ UTILIDADES AZURE:
• AzureDocumentUtils - Utilidades para procesamiento

✅ COMPONENTES AZURE:
• AzureDocumentProcessor - Componente principal

=================================================================
🎯 USO EN APLICACIONES:
=================================================================

// Importación básica
import { 
  azureDocumentService, 
  useAzureDocumentProcessing,
  AzureDocumentProcessor,
  AzureDocumentUtils 
} from '@regularizador/shared';

// Uso del hook
const { processDocument, result, isProcessing } = useAzureDocumentProcessing();

// Uso del servicio
const result = await azureDocumentService.processDocument(file);

// Uso del componente
<AzureDocumentProcessor onDocumentProcessed={handleResult} />

================================================================
*/