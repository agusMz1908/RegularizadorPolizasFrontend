// src/types/api.ts - CORREGIDO
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// User types
export interface User {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol?: string;
  permisos?: string[];
  fechaCreacion?: Date;
  ultimoAcceso?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Document processing types - CORREGIDOS
export interface DocumentProcessRequest {
  file: File;
  clienteId?: number;
  companiaId?: number;
  ramoId?: number;
}

// Estructura que devuelve tu backend
export interface DocumentProcessResponse {
  listoParaVelneo: boolean;
  datosFormateados: any;
  resumen: any;
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  mensajeError?: string;
  
  // Campos extraídos por Azure Document Intelligence
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  compania?: string;
  
  // Metadata del procesamiento
  nivelConfianza?: number;
  tiempoProcesamiento?: number;
  requiereVerificacion?: boolean;
  readyForVelneo?: boolean;
  
  // Datos estructurados para el formulario
  polizaData?: any;
  
  // Campos extraídos en formato para mostrar
  extractedFields?: ExtractedField[];
  
  // URLs y archivos
  pdfViewerUrl?: string;
  rutaArchivo?: string;
}

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

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

// Velneo integration types
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

// Verification types
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

import type { PolizaFormData } from './poliza';