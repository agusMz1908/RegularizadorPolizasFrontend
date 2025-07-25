export type ProcessingState = 
  | 'idle'           // Sin archivo, mostrar drag & drop
  | 'uploading'      // Subiendo archivo, progress bar
  | 'processing'     // Azure AI trabajando, spinner
  | 'form-ready'     // Formulario generado, datos editables
  | 'sending-velneo' // Enviando a Velneo, loading
  | 'sent-success'   // Enviado exitosamente
  | 'verification'   // En proceso de verificación
  | 'completed'      // Proceso completado
  | 'error';         // Error en cualquier etapa

export interface DocumentResult {
  documentoId: string;
  nombreArchivo: string;
  tamañoArchivo: number;
  camposExtraidos: Record<string, any>;
  confianzaPromedio: number;
  requiereVerificacion: boolean;
  pdfViewerUrl: string;
  fechaProcesamiento?: Date;
}

export interface ProcessingError {
  type: 'upload' | 'processing' | 'validation' | 'velneo' | 'network';
  message: string;
  details?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface FileUploadEvent {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface FormValidationEvent {
  field: string;
  value: any;
  isValid: boolean;
  errors: string[];
}

export interface ProcessingEvent {
  stage: ProcessingState;
  progress?: number;
  message?: string;
  error?: ProcessingError;
  data?: any;
}