// src/types/mapping.ts
export interface MappedField {
  valorExtraido: string;
  valorMapeado: any;
  confianza: number;
  opcionesDisponibles?: any[];
  nivelConfianza: 'high' | 'medium' | 'low' | 'failed';
}

export interface PolicyMappingResult {
  camposMapeados: Record<string, MappedField>;
  camposQueFallaronMapeo: string[];
  porcentajeExito: number;
  camposConAltaConfianza: number;
  camposConMediaConfianza: number;
  camposConBajaConfianza: number;
  opcionesDisponibles?: MasterDataOptions;
}

export interface MasterDataOptions {
  categorias: CategoryDto[];
  destinos: DestinoDto[];
  calidades: CalidadDto[];
  combustibles: CombustibleDto[];
  coberturas: CoberturaDto[];
  zonas: ZonaDto[];
  monedas: MonedaDto[];
  estadosPoliza: string[];
  tiposTramite: string[];
  estadosBasicos: string[];
  tiposLinea: string[];
  formasPago: string[];
}

export interface PolicyMappingResponse {
  success: boolean;
  mappingResult: PolicyMappingResult;
  timestamp: string;
  processingTimeMs: number;
  recommendations: string[];
}

export interface ApplyMappingRequest {
  azureData: any;
  manualMappings: Record<string, any>;
}

export interface ApplyMappingResponse {
  success: boolean;
  message: string;
  velneoObject: any;
  timestamp: string;
}

// Master Data DTOs (matching backend)
export interface CategoryDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface DestinoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface CalidadDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface CombustibleDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface CoberturaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface ZonaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface MonedaDto {
  codigo: string;
  nombre: string;
  simbolo?: string;
}