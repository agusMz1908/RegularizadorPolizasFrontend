// src/types/azure-document.ts - CORREGIDO CON TODOS LOS CAMPOS

export interface AzureProcessResponse {
  estado: string;                    // Nombre del archivo procesado
  timestamp: string;                 // Timestamp del procesamiento
  tiempoProcesamiento: number;       // Tiempo en ms
  estadoFormateado: string;          // Estado formateado (TERMINADO, ERROR, etc.)
  datosFormateados: DatosFormateados;
  documentoId?: string;              // ID del documento si está disponible
  confianzaExtraccion?: number;      // Confianza general
  requiereRevision?: boolean;        // Si requiere revisión manual
  resumen?: any;                     // Resumen del procesamiento
}

// 🔧 ESTRUCTURA COMPLETA - Incluye TODOS los campos que usamos
export interface DatosFormateados {
  // Datos básicos de la póliza
  numeroPoliza?: string;
  asegurado?: string;
  compania?: string;
  vigenciaDesde?: string;            // Fecha en formato ISO
  vigenciaHasta?: string;            // Fecha en formato ISO
  plan?: string;
  ramo?: string;
  
  // 🚗 DATOS DEL VEHÍCULO (LOS CAMPOS QUE FALTABAN)
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;              // 🔧 AGREGADO
  anio?: string | number;            // 🔧 AGREGADO
  
  // 💰 DATOS FINANCIEROS
  prima?: number;
  primaComercial?: number;
  premioTotal?: number;
  
  // 👤 DATOS DEL CLIENTE (LOS CAMPOS QUE FALTABAN)
  documento?: string;                // 🔧 AGREGADO
  email?: string;
  telefono?: string | number;
  direccion?: string;
  departamento?: string;
  localidad?: string;
  
  // 🏢 DATOS DEL CORREDOR
  corredor?: string;
  
  // 📊 METADATOS
  listaParaVelneo?: boolean;         // Si está listo para Velneo
  camposCompletos?: number;          // Cantidad de campos completados
}

// Estructura para campos extraídos (para mostrar en UI)
export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

// Estructura para el resultado del procesamiento (lo que usa el wizard)
export interface DocumentProcessResult {
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  
  // Campos principales extraídos
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  compania?: string;
  
  // 🔧 CAMPOS EXTENDIDOS DEL VEHÍCULO
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: string | number;
  
  // 🔧 CAMPOS EXTENDIDOS FINANCIEROS
  primaComercial?: number;
  premioTotal?: number;
  moneda?: string;
  
  // 🔧 CAMPOS EXTENDIDOS DEL CLIENTE
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  
  // 🔧 DATOS DEL CORREDOR
  corredor?: string;
  plan?: string;
  ramo?: string;
  
  // Metadatos del procesamiento
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  requiereRevision?: boolean;
  readyForVelneo?: boolean;
  listoParaVelneo?: boolean;
  timestamp?: string;
  
  // Datos estructurados para el formulario
  polizaData?: {
    datosFormateados: DatosFormateados;
    resumen?: any;
    documentId: string;
    timestamp?: string;
    tiempoProcesamiento?: number;
    estadoFormateado?: string;
    camposCompletos?: number;
  };
  
  // Campos extraídos para mostrar en la UI
  extractedFields?: ExtractedField[] | Record<string, any>;
  originalResponse?: any;
  errorMessage?: string;
}

// Interfaces para compatibilidad con el wizard existente
export interface Cliente {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  telefono?: string;
  cliemail?: string;
  clidir?: string;
  activo: boolean;
}

export interface Company {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias?: string;
  broker: boolean;
  activo: boolean;
}

// Tipos para el mapeo a Velneo
export interface VelneoPolizaData {
  // IDs de relaciones
  comcod: number;
  clinro: number;
  
  // Datos básicos mapeados
  conpol: string;                    // numeroPoliza
  conend?: string;                   // endoso
  confchdes: string;                 // vigenciaDesde
  confchhas: string;                 // vigenciaHasta
  contra: string;                    // estadoTramite
  convig: string;                    // estadoPoliza
  
  // Cliente
  clinom: string;                    // asegurado
  condom?: string;                   // direccion
  
  // 🚗 VEHÍCULO (CON TODOS LOS CAMPOS)
  conmaraut?: string;                // marca
  conanioaut?: number;               // anioVehiculo
  conmotor?: string;                 // motor
  conchasis?: string;                // chasis
  conmataut?: string;                // matricula
  concaraut?: number;                // categoria
  combustibles?: string;             // combustible
  vehiculo?: string;                 // descripcion vehiculo
  modelo?: string;                   // modelo
  
  // 💰 FINANCIERO COMPLETO
  conpremio: number;                 // prima
  contot?: number;                   // premioTotal
  primaComercial?: number;           // prima comercial
  moncod?: number;                   // moneda (0=UYU, 1=USD)
  concuo?: number;                   // cuotas
  forpagvid?: string;                // formaPago
  
  // 👤 CLIENTE EXTENDIDO
  documento?: string;                // documento
  email?: string;                    // email
  telefono?: string;                 // telefono
  localidad?: string;                // localidad
  departamento?: string;             // departamento
  
  // 🏢 CORREDOR
  corredor?: string;                 // corredor
  
  // Cobertura
  condedaut?: number;                // deducible
  conresciv?: number;                // responsabilidadCivil
  concapaut?: number;                // capitalAsegurado
  
  // Bonificaciones
  conbonnsin?: number;               // bonificacionSiniestros
  conbonant?: number;                // bonificacionAntiguedad
  
  // Gestión
  conges?: string;                   // gestor
  congesfi?: string;                 // fechaIngreso
  observaciones?: string;            // observaciones
  mot_no_ren?: string;               // motivoNoRenovacion
  
  // Metadatos
  documentoId?: string;
  archivoOriginal?: string;
  procesadoConIA?: boolean;
  ramo?: string;
  plan?: string;
}

// 🔧 TIPOS ADICIONALES PARA COMPATIBILIDAD

export interface AzureDocumentRequest {
  file: File;
}

export interface AzureErrorResponse {
  error: string;
  archivo?: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  codigoError?: string;
  detallesTecnicos?: string;
  sugerencias?: string[];
}

export interface AzureModelHealth {
  estaOperativo: boolean;
  tieneConexion: boolean;
  ultimaVerificacion: string;
  mensaje: string;
  nivel: 'success' | 'warning' | 'error' | 'info';
  iconoEstado?: string;
  mensajeCompleto?: string;
}

export interface AzureModelInfoResponse {
  modelId: string;
  endpoint: string;
  status: string;
  workingApiUrl?: string;
  httpStatus?: string;
  description?: string;
  createdOn?: string;
  docTypes?: string[];
  apiVersion?: string;
  warning?: string;
  message?: string;
  consultaTimestamp: string;
  estaActivo?: boolean;
  tieneAdvertencias?: boolean;
  estadoSimplificado?: string;
  health?: AzureModelHealth;
}

// Re-exportar tipos como alias para compatibilidad
export type AzureDatosFormateados = DatosFormateados;
export type AzureProcessResult = DocumentProcessResult;