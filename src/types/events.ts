import { ProcessingError, ProcessingState } from "./processing";

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