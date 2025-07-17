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

// Estructura de datos formateados extraídos por Azure
export interface DatosFormateados {
  numeroPoliza?: string;
  asegurado?: string;
  compania?: string;
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  vigenciaDesde?: string;            // Fecha en formato ISO
  vigenciaHasta?: string;            // Fecha en formato ISO
  plan?: string;
  ramo?: string;
  prima?: number;
  primaComercial?: number;
  premioTotal?: number;
  direccion?: string;
  departamento?: string;
  localidad?: string;
  telefono?: string;
  email?: string;
  corredor?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
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
  
  // Metadatos del procesamiento
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  readyForVelneo?: boolean;
  
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
  extractedFields?: ExtractedField[];
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
  
  // Vehículo
  conmaraut?: string;                // marca
  conanioaut?: number;               // anioVehiculo
  conmotor?: string;                 // motor
  conchasis?: string;                // chasis
  conmataut?: string;                // matricula
  concaraut?: number;                // categoria
  
  // Financiero
  conpremio: number;                 // prima
  contot?: number;                   // premioTotal
  moncod?: number;                   // moneda (0=UYU, 1=USD)
  concuo?: number;                   // cuotas
  forpagvid?: string;                // formaPago
  
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
}