export interface MasterDataResponse {
  success: boolean;
  data: VelneoMasterDataOptions;
  timestamp: string;
  source: string;
}

/**
 * 📊 OPCIONES DE MAESTROS DESDE VELNEO
 */
export interface VelneoMasterDataOptions {
  // Maestros con IDs numéricos
  Categorias: CategoriaDto[];
  Destinos: DestinoDto[];
  Calidades: CalidadDto[];
  Monedas: MonedaDto[];
  
  // Maestros con IDs string (COMBUSTIBLE ES ESPECIAL)
  Combustibles: CombustibleDto[];
  
  // Opciones de texto plano (no vienen de BD)
  EstadosPoliza: string[];
  TiposTramite: string[];
  EstadosBasicos: string[];
  TiposLinea: string[];
  FormasPago: string[];
}

// ===== MAESTROS INDIVIDUALES =====

/**
 * 🚗 CATEGORÍA (ID numérico)
 */
export interface CategoriaDto {
  id: number;
  catdsc: string;              // Descripción/nombre
}

/**
 * 🎯 DESTINO (ID numérico)
 */
export interface DestinoDto {
  id: number;
  desnom: string;              // Nombre del destino
}

/**
 * ⭐ CALIDAD (ID numérico)
 */
export interface CalidadDto {
  id: number;
  caldsc: string;              // Descripción
}

/**
 * 💰 MONEDA (ID numérico)
 */
export interface MonedaDto {
  id: number;
  nombre: string;              // "PESO URUGUAYO", "DOLAR AMERICANO"
  codigo?: string;             // "PES", "DOL", "EU"
  simbolo?: string;            // "$U", "$", "€"
}

/**
 * ⛽ COMBUSTIBLE (ID string - ESPECIAL)
 * Basado en tu JSON real: {"id": "GAS", "name": "GASOLINA"}
 */
export interface CombustibleDto {
  id: string;                  // "DIS", "ELE", "GAS", "HYB"
  name: string;                // "DISEL", "ELECTRICOS", "GASOLINA", "HYBRIDO"
}

// ===== TIPOS LEGACY (para compatibilidad con el código existente) =====

/**
 * 🏢 COMPAÑÍA
 */
export interface CompanyDto {
  id: number;
  comnom: string;              // Nombre completo
  comalias: string;            // Alias (BSE)
  nombre: string;              // Alias para compatibilidad
  alias: string;               // Alias para compatibilidad
  activo: boolean;
}

/**
 * 📂 SECCIÓN
 */
export interface SeccionDto {
  id: number;
  seccion: string;             // "AUTOMOVILES"
  nombre: string;              // Para compatibilidad
  activo: boolean;
}

/**
 * 👤 CLIENTE (simplificado para selects)
 */
export interface ClienteDto {
  id: number;
  clinom: string;              // Nombre completo
  cliced: string;              // Documento
  clidir: string;              // Dirección
  clidircob: string;           // Dirección de cobro
  cliemail: string;            // Email
  clitelcel: string;           // Teléfono
  clidptnom: string;           // Departamento
  clilocnom: string;           // Localidad
  activo: boolean;
}

// ===== MAPEO Y BÚSQUEDA =====

/**
 * 🔍 RESULTADO DE BÚSQUEDA EN MAESTROS
 */
export interface MasterSearchResult<T> {
  exact: T | null;             // Coincidencia exacta
  fuzzy: T[];                  // Coincidencias parciales
  confidence: number;          // 0-100
  suggestions: string[];       // Sugerencias de texto
}

/**
 * 🎯 MAPEO INTELIGENTE DE TEXTO A MAESTRO
 */
export interface TextToMasterMapping {
  // Mapeo de combustibles (más común)
  combustibles: Record<string, string>; // "DIESEL" -> "DIS"
  
  // Mapeo de monedas
  monedas: Record<string, string>; // "UYU" -> código interno
  
  // Mapeo de destinos comunes
  destinos: Record<string, string>; // "PARTICULAR" -> ID
  
  // Mapeo de calidades comunes
  calidades: Record<string, string>; // "PROPIETARIO" -> ID
}

/**
 * ⚙️ CONFIGURACIÓN DE MAESTROS
 */
export interface MasterConfig {
  // URLs de endpoints
  endpoints: {
    mappingOptions: string;
    categorias: string;
    destinos: string;
    calidades: string;
    combustibles: string;
    monedas: string;
  };
  
  // Cache settings
  cache: {
    ttl: number;               // Time to live en minutos
    maxSize: number;           // Máximo número de items en cache
  };
  
  // Configuración de búsqueda fuzzy
  search: {
    threshold: number;         // Umbral de similitud 0-1
    maxResults: number;        // Máximo resultados fuzzy
  };
  
  // Valores por defecto
  defaults: {
    combustible: string;       // "GAS"
    destino: number;           // 2 (PARTICULAR)
    calidad: number;           // 2 (PROPIETARIO)
    moneda: number;            // 1 (PESO URUGUAYO)
    categoria: number;         // 0
  };
}

/**
 * 📦 ESTADO DEL STORE DE MAESTROS
 */
export interface MasterDataState {
  // Datos
  options: VelneoMasterDataOptions | null;
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Cache individual por tipo
  categorias: CategoriaDto[];
  destinos: DestinoDto[];
  calidades: CalidadDto[];
  combustibles: CombustibleDto[];
  monedas: MonedaDto[];
  
  // Mapeo precalculado
  mappingTables: TextToMasterMapping;
}

/**
 * 🔄 ACCIONES DEL STORE DE MAESTROS
 */
export interface MasterDataActions {
  // Cargar datos
  loadMasterData: () => Promise<void>;
  refreshMasterData: () => Promise<void>;
  
  // Búsqueda
  searchCombustible: (text: string) => MasterSearchResult<CombustibleDto>;
  searchDestino: (text: string) => MasterSearchResult<DestinoDto>;
  searchCalidad: (text: string) => MasterSearchResult<CalidadDto>;
  searchCategoria: (text: string) => MasterSearchResult<CategoriaDto>;
  searchMoneda: (text: string) => MasterSearchResult<MonedaDto>;
  
  // Mapeo directo
  mapCombustibleTextoAId: (text: string) => string;
  mapDestinoTextoAId: (text: string) => number;
  mapCalidadTextoAId: (text: string) => number;
  mapCategoriaTextoAId: (text: string) => number;
  mapMonedaTextoAId: (text: string) => number;
  
  // Obtener por ID
  getCombustibleById: (id: string) => CombustibleDto | null;
  getDestinoById: (id: number) => DestinoDto | null;
  getCalidadById: (id: number) => CalidadDto | null;
  getCategoriaById: (id: number) => CategoriaDto | null;
  getMonedaById: (id: number) => MonedaDto | null;
}

/**
 * 🎨 OPCIONES PARA COMPONENTES SELECT
 */
export interface SelectMasterOption {
  id: string | number;
  name: string;
  description?: string;
  group?: string;              // Para agrupar opciones
  disabled?: boolean;
}

/**
 * 📋 CONFIGURACIÓN DE CAMPO CON MAESTRO
 */
export interface MasterFieldConfig {
  type: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda';
  required: boolean;
  allowEmpty: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  
  // Para búsqueda automática
  autoMapFromAzure?: string;   // Campo de Azure a mapear
  fallbackValue?: string | number;
  
  // Para validación
  validator?: (value: any) => string | null;
}

/**
 * 🔧 UTILITARIOS
 */
export interface MasterUtils {
  // Formateo
  formatCombustibleName: (combustible: CombustibleDto) => string;
  formatMonedaDisplay: (moneda: MonedaDto) => string;
  
  // Validación
  isValidCombustibleId: (id: string) => boolean;
  isValidMasterNumericId: (id: number) => boolean;
  
  // Conversión
  maestroToSelectOption: <T extends { id: any; name?: string }>(maestro: T, nameField: string) => SelectMasterOption;
  maestrosToSelectOptions: <T extends { id: any }>(maestros: T[], nameField: string) => SelectMasterOption[];
}

/**
 * ⚡ PERFORMANCE Y CACHE
 */
export interface MasterCacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface MasterCache {
  get: <T>(key: string) => MasterCacheEntry<T> | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  clear: () => void;
  cleanup: () => void; // Limpia entries expirados
}