// src/types/masterData.ts - VERSIÓN ACTUALIZADA CON DEPARTAMENTOS

import type { SelectOption } from './ui';

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
  tarifas?: TarifaDto[];
  departamentos: DepartamentoDto[];  // ← AGREGADO
  
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
  catdsc: string;
}

/**
 * 🎯 DESTINO - Basado en tu backend real  
 */
export interface DestinoDto {
  id: number;
  desnom: string;
}

/**
 * ⭐ CALIDAD - Basado en tu backend real
 */
export interface CalidadDto {
  id: number;
  caldsc: string;
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

/**
 * 📍 DEPARTAMENTO - Basado en la respuesta del backend
 */
export interface DepartamentoDto {
  id: number;
  nombre: string;                  // "MONTEVIDEO", "CANELONES", etc.
  codigo?: string;                 // Código del departamento si existe
  bonificacionInterior?: number;   // Bonificación para interior
  codigoSC?: string;              // Código SC si aplica
  activo: boolean;                // Si está activo
  // Campos alternativos por si el backend los devuelve así
  dptnom?: string;                // Nombre alternativo del campo
}

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
 * 💵 TARIFA
 */
export interface TarifaDto {
  id: number;
  companiaId: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  activa: boolean;
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
  categorias: Record<string, number>;    // "AUTO" -> 20
  departamentos: Record<string, number>; // "MONTEVIDEO" -> 1
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
  type: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda' | 'departamento';
  validation: MasterValidation;
  placeholder?: string;
  helpText?: string;
}

// ===== CONSTANTES DE MAPEO DE DEPARTAMENTOS =====

/**
 * 🗺️ Mapeo de departamentos de Uruguay con sus IDs
 */
export const DEPARTAMENTOS_URUGUAY_MAP: Record<string, number> = {
  'MONTEVIDEO': 1,
  'ARTIGAS': 2,
  'CANELONES': 3,
  'CERRO LARGO': 4,
  'COLONIA': 5,
  'DURAZNO': 6,
  'FLORES': 7,
  'FLORIDA': 8,
  'LAVALLEJA': 9,
  'MALDONADO': 10,
  'PAYSANDÚ': 11,
  'PAYSANDU': 11,  // Sin tilde
  'RÍO NEGRO': 12,
  'RIO NEGRO': 12,  // Sin tilde
  'RIVERA': 13,
  'ROCHA': 14,
  'SALTO': 15,
  'SAN JOSÉ': 16,
  'SAN JOSE': 16,  // Sin tilde
  'SORIANO': 17,
  'TACUAREMBÓ': 18,
  'TACUAREMBO': 18,  // Sin tilde
  'TREINTA Y TRES': 19
};

// ===== ALIASES PARA COMPATIBILIDAD =====

/** @deprecated Usar MasterDataOptionsDto */
export type VelneoMasterDataOptions = MasterDataOptionsDto;

/** @deprecated Usar CategoriaDto */
export type CategoriaVelneoDto = CategoriaDto;

/** @deprecated Usar DestinoDto */
export type DestinoVelneoDto = DestinoDto;

// Re-exportar SelectOption desde ui.ts para conveniencia
export type { SelectOption };