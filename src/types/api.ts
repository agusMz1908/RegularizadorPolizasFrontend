import { PolizaFormData } from "./poliza";
import { DocumentResult } from "./processing";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface DocumentProcessRequest {
  file: File;
  clienteId: number;
  companiaId: number;
  ramoId: number;
}

export interface DocumentProcessResponse {
  documentResult: DocumentResult;
  polizaData: PolizaFormData;
  processingTime: number;
  confidence: number;
}

export interface VelneoPolicyRequest {
  clienteId: number;
  companiaId: number;
  ramoId: number;
  polizaData: PolizaFormData;
  documentoId: string;
}

export interface VelneoPolicyResponse {
  polizaId: string;
  numeroPoliza: string;
  estado: string;
  mensaje: string;
  fechaCreacion: Date;
}

export interface VerificationStatus {
  polizaId: string;
  camposVerificados: Record<string, VerificationField>;
  estadoGeneral: 'pendiente' | 'verificado' | 'requiere_correccion';
  fechaVerificacion: Date;
  userId: number;
}

export interface VerificationField {
  campo: string;
  valorOriginal: any;
  valorVerificado?: any;
  estado: 'pendiente' | 'correcto' | 'corregido';
  confianza: number;
  requiereAtencion: boolean;
}

export { DocumentResult };
