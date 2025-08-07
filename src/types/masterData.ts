// src/types/masterData.ts - VERSIÓN LIMPIA SIN DUPLICACIÓN
// ⚠️ NO DEFINIR SelectOption aquí - importar desde ui.ts

import type { SelectOption } from './ui';  // ← IMPORTAR desde ui.ts

/**
 * 🎯 DATOS MAESTROS DEL BACKEND
 */
export interface MasterDataOptionsDto {
  // Maestros de vehículo
  categorias: CategoriaDto[];
  destinos: DestinoDto[];
  calidades: CalidadDto[];
  combustibles: CombustibleDto[];
  monedas: MonedaDto[];
  
  // Opciones de texto plano (arrays de strings)
  estadosPoliza: string[];
  tiposTramite: string[];
  estadosBasicos: string[];
  tiposLinea: string[];
  formasPago: string[];
}

// ===== MAESTROS INDIVIDUALES (COINCIDIR CON BACKEND) =====

/**
 * 🚗 CATEGORÍA - Basado en tu backend real
 */
export interface CategoriaDto {
  id: number;
  catdsc: string;  // ← Campo exacto del backend
}

/**
 * 🎯 DESTINO - Basado en tu backend real  
 */
export interface DestinoDto {
  id: number;
  desnom: string;  // ← Campo exacto del backend
}

/**
 * ⭐ CALIDAD - Basado en tu backend real
 */
export interface CalidadDto {
  id: number;
  caldsc: string;  // ← Campo exacto del backend
}

/**
 * ⛽ COMBUSTIBLE - ESPECIAL: ID es STRING
 */
export interface CombustibleDto {
  id: string;      // "GAS", "DIS", "ELE", "HYB" 
  name: string;    // "GASOLINA", "DIESEL", "ELECTRICO", "HIBRIDO"
}

/**
 * 💰 MONEDA - Basado en tu backend real
 */
export interface MonedaDto {
  id: number;
  nombre: string;   // "PESO URUGUAYO", "DOLAR AMERICANO"
  codigo?: string;  // "PES", "DOL", "EU"
  simbolo?: string; // "$U", "$", "€"
}

// ===== OTROS TIPOS DEL SISTEMA =====

/**
 * 🏢 COMPAÑÍA
 */
export interface CompanyDto {
  id: number;
  comnom: string;    // Nombre completo
  comalias: string;  // Alias (BSE)
  comcod?: string;   // Código
  nombre?: string;   // Para compatibilidad
  alias?: string;    // Para compatibilidad
  activo: boolean;
}

/**
 * 📂 SECCIÓN
 */
export interface SeccionDto {
  id: number;
  seccion: string;  // "AUTOMOVILES"
  nombre?: string;  // Para compatibilidad
  activo: boolean;
}

/**
 * 👤 CLIENTE (simplificado)
 */
export interface ClienteDto {
  id: number;
  clinom: string;     // Nombre completo
  cliced: string;     // Documento
  clidir: string;     // Dirección
  clidircob: string;  // Dirección de cobro
  cliemail: string;   // Email
  clitelcel: string;  // Teléfono
  clidptnom: string;  // Departamento
  clilocnom: string;  // Localidad
  activo: boolean;
}

// ===== TIPOS PARA RESPUESTAS DE API =====

/**
 * 🔄 RESPUESTA DE API WRAPPER
 */
export interface MasterDataResponse {
  success: boolean;
  data: MasterDataOptionsDto;
  timestamp?: string;
  message?: string;
}

// ===== UTILITARIOS Y HELPERS =====

/**
 * 🔍 RESULTADO DE BÚSQUEDA
 */
export interface MasterSearchResult<T> {
  exact: T | null;
  fuzzy: T[];
  confidence: number;
}

/**
 * 🎯 MAPEO DE TEXTO A MAESTRO (para Azure Document Intelligence)
 */
export interface TextToMasterMapping {
  combustibles: Record<string, string>;  // "DIESEL" -> "DIS"
  destinos: Record<string, number>;      // "PARTICULAR" -> 2
  calidades: Record<string, number>;     // "PROPIETARIO" -> 1
  categorias: Record<string, number>;    // "AUTO" -> 1
}

// ===== VALIDACIÓN Y BUSINESS RULES =====

/**
 * ✅ VALIDACIÓN DE MAESTROS
 */
export interface MasterValidation {
  isRequired: boolean;
  allowEmpty: boolean;
  defaultValue?: string | number;
  validator?: (value: any) => string | null;
}

/**
 * 📋 CONFIGURACIÓN DE CAMPO DE MAESTRO
 */
export interface MasterFieldConfig {
  type: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda';
  validation: MasterValidation;
  placeholder?: string;
  helpText?: string;
}

// ===== ALIASES PARA COMPATIBILIDAD =====
// Usa estos si necesitas mantener código legacy temporalmente

/** @deprecated Usar MasterDataOptionsDto */
export type VelneoMasterDataOptions = MasterDataOptionsDto;

/** @deprecated Usar CategoriaDto */
export type CategoriaVelneoDto = CategoriaDto;

/** @deprecated Usar DestinoDto */
export type DestinoVelneoDto = DestinoDto;

// Re-exportar SelectOption desde ui.ts para conveniencia
export type { SelectOption };