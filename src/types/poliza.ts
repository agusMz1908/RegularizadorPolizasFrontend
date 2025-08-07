// === ACTUALIZACIÓN para src/types/poliza.ts ===

export interface PolicyFormData {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: string;              // Input texto (del escaneo)
  asegurado: string;             // Read-only (cliente seleccionado)
  tomador: string;               // Read-only (mismo que asegurado)
  domicilio: string;             // Read-only (del cliente)
  dirCobro: string;              // Input texto manual
  estadoTramite: string;         // Select texto plano ['Pendiente', 'En proceso', 'Terminado', 'Modificaciones']
  tramite: string;               // Select texto plano ['Nuevo', 'Renovación', 'Cambio', 'Endoso']
  fecha: string;                 // Date (fecha gestión)
  asignado: string;              // Input texto (usuario asignado)
  tipo: string;                  // Select texto plano ['Líneas personales', 'Líneas comerciales']
  estadoPoliza: string;          // Select texto plano ['VIG', 'ANT', 'VEN', 'END', 'ELIM', 'FIN']

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: number;              // Read-only (BSE = 2 inicialmente)
  comalias: string;              // Read-only (nombre de la compañía)
  seccion: number;               // Read-only (AUTOMÓVILES = 9)
  poliza: string;                // Input texto (del escaneo)
  certificado: string;           // Input texto (del escaneo)
  endoso: string;                // Input texto/number (incrementa en CAMBIO)
  desde: string;                 // Date input (del escaneo)
  hasta: string;                 // Date input (del escaneo)

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: string;           // Input texto (marca + modelo unidos)
  anio: string;                  // Input number (del escaneo)
  matricula: string;             // Input texto (del escaneo, opcional)
  motor: string;                 // Input texto (del escaneo)
  chasis: string;                // Input texto (del escaneo)
  
  // Maestros del vehículo (SELECT desde backend)
  destinoId: number;             // Select maestro Destino
  combustibleId: string;         // Select maestro Combustible (STRING! No number)
  calidadId: number;             // Select maestro Calidad  
  categoriaId: number;           // Select maestro Categoría

  // ===== PESTAÑA 4: DATOS DE COBERTURA =====
  coberturaId: number;           // Select maestro Cobertura
  tarifaId?: number;             // Select maestro Tarifa (NUEVO CAMPO)
  zonaCirculacion: string;       // Input texto o select departamentos
  departamentoId: number;        // Select maestro Departamento (opcional)
  monedaId: number;              // Select maestro Moneda

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  premio: number;                // Input number (del escaneo)
  total: number;                 // Input number (calculado)
  formaPago: string;             // Select texto plano ['Contado', 'Tarjeta', 'Débito Automático', 'Cuotas']
  cuotas: number;                // Input number (default 1)
  valorCuota: number;            // Input number (calculado: total/cuotas)

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: string;         // Textarea (notas adicionales)
  
  // ===== METADATA (no visible en form) =====
  clinro?: number;               // ID del cliente seleccionado
  procesadoConIA?: boolean;      // Flag de procesamiento Azure
  confidence?: number;           // Confianza del escaneo (0-100)
}

export interface PolizaCreateRequest {
  // ===== CAMPOS PRINCIPALES OBLIGATORIOS =====
  Clinro: number;                    // ID Cliente
  Clinom?: string;                   // Nombre cliente
  Comcod: number;                    // ID Compañía
  Seccod: number;                    // ID Sección
  Conpremio: number;                 // Premio (OBLIGATORIO)
  
  // ===== CAMPOS DE PÓLIZA =====
  Conpol?: string;                   // Número de póliza
  Concar?: string;                   // Certificado
  Conend?: string;                   // Endoso
  Confchdes?: string;                // Fecha desde
  Confchhas?: string;                // Fecha hasta
  Convig?: string;                   // Estado vigencia
  Contra?: string;                   // Tipo trámite
  Consta?: string;                   // Forma de pago
  Congesti?: string;                 // Tipo gestión
  Congeses?: string;                 // Estado gestión
  Congesfi?: string;                 // Fecha gestión
  
  // ===== DATOS DEL ASEGURADO =====
  Asegurado?: string;                // Nombre asegurado
  Direccion?: string;                // Dirección
  Condom?: string;                   // Domicilio
  
  // ===== DATOS DEL VEHÍCULO =====
  Marca?: string;                    // Marca
  Modelo?: string;                   // Modelo
  Conmaraut?: string;                // Marca + modelo completo
  Anio?: number;                     // Año
  Conanioaut?: number;               // Año (campo Velneo)
  Matricula?: string;                // Matrícula
  Conmataut?: string;                // Matrícula (campo Velneo)
  Motor?: string;                    // Motor
  Conmotor?: string;                 // Motor (campo Velneo)
  Chasis?: string;                   // Chasis
  Conchasis?: string;                // Chasis (campo Velneo)
  
  // ===== MAESTROS DEL VEHÍCULO =====
  Combustibles?: string;             // ID Combustible (STRING! "GAS", "DIS", etc)
  CategoriaId?: number;              // ID Categoría
  DestinoId?: number;                // ID Destino
  CalidadId?: number;                // ID Calidad
  
  // ===== DATOS FINANCIEROS =====
  PremioTotal?: number;              // Premio total
  Contot?: number;                   // Total
  CantidadCuotas?: number;           // Cantidad de cuotas
  Concuo?: number;                   // Cuotas (campo Velneo)
  Moneda?: string;                   // Moneda como string
  Moncod?: number;                   // Moneda ID
  FormaPago?: string;                // Forma de pago como string
  
  // ===== DATOS DE COBERTURA =====
  CoberturaId?: number;              // ID Cobertura
  Cobertura?: string;                // Nombre cobertura
  TarifaId?: number;                 // ID Tarifa (NUEVO CAMPO)
  TarifaNombre?: string;             // Nombre de la tarifa (NUEVO CAMPO)
  ZonaCirculacion?: string;          // Zona de circulación
  DepartamentoId?: number;           // ID Departamento
  
  // ===== OTROS CAMPOS =====
  Ramo?: string;                     // Ramo (ej: "AUTOMOVILES")
  EstadoPoliza?: string;             // Estado de la póliza
  Tramite?: string;                  // Tipo de trámite
  Observaciones?: string;            // Observaciones generales
  ProcesadoConIA?: boolean;          // Flag de procesamiento con IA
  
  // ===== CAMPOS FLEXIBLES =====
  [key: string]: any;                // Para campos adicionales
}