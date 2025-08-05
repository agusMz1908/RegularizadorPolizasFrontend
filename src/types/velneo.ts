export interface VelneoPolizaRequest {
  // ===== CAMPOS OBLIGATORIOS BÁSICOS =====
  id?: number;                    // 0 para nuevas pólizas
  comcod: number;                 // ID compañía (del paso 3)
  seccod: number;                 // ID sección (AUTOMÓVILES = 9)
  clinro: number;                 // ID cliente (del paso 2)
  
  // ===== DATOS BÁSICOS (Pestaña 1) =====
  corrnom: string;                // Corredor (texto del escaneo) -> corrnom en Velneo
  clinom: string;                 // Asegurado (nombre del cliente) -> clinom en objeto poliza
  condom: string;                 // Dir. Cobro -> condom en objeto poliza
  congeses: string;               // Estado trámite (texto plano) -> congeses en objeto poliza
  clinro1: number;                // Tomador (mismo ID que clinro) -> clinro1 en objeto poliza
  contra: string;                 // Trámite (texto plano) -> contra en objeto poliza
  congesfi: string;               // Fecha gestión -> congesfi en objeto poliza
  convig: string;                 // Estado póliza (texto plano) -> convig en objeto poliza
  
  // ===== DATOS PÓLIZA (Pestaña 2) =====
  conpol: string;                 // Número póliza -> conpol en objeto poliza
  confchdes: string;              // Fecha desde -> confchdes en objeto poliza
  confchhas: string;              // Fecha hasta -> confchhas en objeto poliza
  concar: string;                 // Certificado -> concar en objeto poliza
  conend: string;                 // Endoso (default "0") -> conend en objeto poliza
  
  // ===== DATOS VEHÍCULO (Pestaña 3) =====
  conmaraut: string;              // Marca-Modelo unidos -> conmaraut en objeto poliza
  conanioaut: number;             // Año -> conanioaut en objeto poliza
  conmataut: string;              // Matrícula -> conmataut en objeto poliza
  conmotor: string;               // Motor -> conmotor en objeto poliza
  conchasis: string;              // Chasis -> conchasis en objeto poliza
  
  // ===== MAESTROS VEHÍCULO (Pestaña 3) =====
  desdsc: number;                 // ID Destino (numérico) -> desdsc en objeto poliza
  combustibles: string;           // ID Combustible (STRING: "DIS", "ELE", "GAS", "HYB") -> combustibles en objeto poliza
  caldsc: number;                 // ID Calidad (numérico) -> caldsc en objeto poliza
  catdsc: number;                 // ID Categoría (numérico) -> catdsc en objeto poliza
  
  // ===== DATOS COBERTURA (Pestaña 4) =====
  tarcod: number;                 // ID Cobertura -> tarcod en objeto poliza
  dptnom: string;                 // Zona circulación (departamento) -> dptnom en objeto poliza
  moncod: number;                 // ID Moneda -> moncod en objeto poliza
  
  // ===== CONDICIONES PAGO (Pestaña 5) =====
  consta: string;                 // Forma pago (texto plano) -> consta en objeto poliza
  conpremio: number;              // Premio -> conpremio en objeto poliza
  contot: number;                 // Total -> contot en objeto poliza
  concuo: number;                 // Cuotas -> concuo en objeto poliza
  
  // ===== CAMPOS ADICIONALES REQUERIDOS POR VELNEO =====
  ramo: string;                   // "AUTOMOVILES"
  com_alias: string;              // Alias compañía
  conpadaut: string;              // Padrón auto (vacío por defecto)
  conimp: number;                 // Impuesto (igual a conpremio)
  flocod: number;                 // Flota código (0 por defecto)
  observaciones: string;          // Observaciones (desde pestaña 6)
  procesadoConIA: boolean;        // true
  fechaCreacion: string;          // ISO date
  fechaModificacion: string;      // ISO date
  
  // ===== CAMPOS ADICIONALES PARA COMPATIBILIDAD =====
  forpagvid: string;              // Forma pago vida (vacío)
  conclaaut: number;              // Clase auto (0)
  condedaut: number;              // Deducible auto (0)
  conresciv: number;              // Responsabilidad civil (0)
  conbonnsin: number;             // Bonificación sin siniestro (0)
  conbonant: number;              // Bonificación anterior (0)
  concaraut: number;              // Carga auto (0)
  concapaut: number;              // Capital auto (0)
  concesnom: string;              // Cesionario nombre (vacío)
  concestel: string;              // Cesionario teléfono (vacío)
  conges: string;                 // Gestión (vacío)
  
  // ===== CAMPOS DERIVADOS DEL ESCANEO (Para compatibilidad/logging) =====
  vehiculo: string;               // Marca-Modelo
  marca: string;                  // Marca separada
  modelo: string;                 // Modelo separado
  motor: string;                  // Motor
  chasis: string;                 // Chasis
  matricula: string;              // Matrícula
  combustible: string;            // Combustible (texto)
  anio: number;                   // Año
  primaComercial: number;         // Prima comercial
  premioTotal: number;            // Premio total
  corredor: string;               // Corredor
  plan: string;                   // Plan (vacío)
  documento: string;              // Documento cliente
  email: string;                  // Email
  telefono: string;               // Teléfono
  direccion: string;              // Dirección
  localidad: string;              // Localidad
  departamento: string;           // Departamento
  moneda: string;                 // Moneda (texto)
  seccionId: number;              // ID sección
  estado: string;                 // Estado
  tramite: string;                // Trámite
  estadoPoliza: string;           // Estado póliza
  calidadId: number;              // ID calidad
  destinoId: number;              // ID destino
  categoriaId: number;            // ID categoría
  tipoVehiculo: string;           // Tipo vehículo
  uso: string;                    // Uso
  formaPago: string;              // Forma pago
  cantidadCuotas: number;         // Cantidad cuotas
  valorCuota: number;             // Valor cuota
  tipo: string;                   // Tipo
  cobertura: string;              // Cobertura
  certificado: string;            // Certificado
  calidad: string;                // Calidad (texto)
  categoria: string;              // Categoría (texto)
  destino: string;                // Destino (texto)
}

/**
 * 📋 RESPUESTA DE VELNEO AL CREAR PÓLIZA
 */
export interface VelneoPolizaResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    conpol: string;
    fechaCreacion: string;
  };
  errors?: string[];
}

/**
 * 🎯 DATOS DE MAESTROS DESDE VELNEO
 * Basado en el endpoint /api/velneo/mapping-options
 */
export interface VelneoMasterDataOptions {
  // Maestros con IDs numéricos
  Categorias: CategoriaVelneoDto[];
  Destinos: DestinoVelneoDto[];
  Calidades: CalidadVelneoDto[];
  Monedas: MonedaVelneoDto[];
  
  // Maestros con IDs string
  Combustibles: CombustibleVelneoDto[];
  
  // Opciones de texto plano
  EstadosPoliza: string[];
  TiposTramite: string[];
  EstadosBasicos: string[];
  TiposLinea: string[];
  FormasPago: string[];
}

// ===== MAESTROS INDIVIDUALES =====
export interface CategoriaVelneoDto {
  id: number;
  catdsc: string;              // Nombre/descripción
}

export interface DestinoVelneoDto {
  id: number;
  desnom: string;              // Nombre
}

export interface CalidadVelneoDto {
  id: number;
  caldsc: string;              // Descripción
}

export interface MonedaVelneoDto {
  id: number;
  nombre: string;              // Nombre completo
  codigo?: string;             // Código (PES, DOL, EU, etc.)
  simbolo?: string;            // Símbolo ($U, $, €, etc.)
}

export interface CombustibleVelneoDto {
  id: string;                  // "DIS", "ELE", "GAS", "HYB"
  name: string;                // "DISEL", "ELECTRICOS", "GASOLINA", "HYBRIDO"
}

/**
 * 🔧 CLIENTE DE VELNEO (para el cliente seleccionado)
 * Basado en tu JSON de cliente
 */
export interface VelneoClienteDto {
  id: number;
  clinom: string;              // Nombre completo
  cliced: string;              // Documento
  clidir: string;              // Dirección
  clidircob: string;           // Dirección de cobro
  cliemail: string;            // Email
  clitelcel: string;           // Teléfono celular
  clitelcorr: string;          // Teléfono corredor
  clidptnom: string;           // Departamento
  clilocnom: string;           // Localidad
  activo: boolean;
}

/**
 * 🏢 COMPAÑÍA DE VELNEO
 */
export interface VelneoCompaniaDto {
  id: number;
  comnom: string;              // Nombre completo
  comalias: string;            // Alias (BSE)
  activo: boolean;
}

/**
 * 📂 SECCIÓN DE VELNEO
 */
export interface VelneoSeccionDto {
  id: number;
  seccion: string;             // "AUTOMOVILES"
  activo: boolean;
}

/**
 * 🎯 VALIDATION HELPER TYPES
 */
export interface ValidationError {
  field: keyof VelneoPolizaRequest;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * 🔄 MAPEO RESULT TYPE
 */
export interface MappingResult {
  success: boolean;
  mappedObject: VelneoPolizaRequest;
  unmappedFields: string[];
  warnings: string[];
  confidence: number; // 0-100
}