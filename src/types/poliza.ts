// ===== ENTIDAD PRINCIPAL DE PÓLIZA EN VELNEO =====
export interface PolizaDto {
  id: number;
  comcod: number;        // ID de compañía
  seccod: number;        // ID de sección
  clinro: number;        // ID de cliente
  conpol: string;        // Número de póliza
  confchdes: string;     // Fecha desde
  confchhas: string;     // Fecha hasta
  convig: string;        // Estado vigencia
  conmaraut: string;     // Marca auto
  conanioaut: number;    // Año auto
  combustibles: string;  // Combustible
  conpremio: number;     // Premio/monto
  conend?: string;       // Endoso
  conpadre?: number;     // ID póliza padre (para renovaciones)
  // Campos adicionales según necesidad
  comAlias?: string;     // Alias de compañía para display
  seccionNombre?: string; // Nombre de sección para display
}

// ===== ✅ ACTUALIZADA: ESTRUCTURA CORRECTA DEL FORMULARIO =====
export interface PolicyFormData {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: string;              // Input texto (del escaneo)
  asegurado: string;             // Read-only (cliente seleccionado)
  dirCobro: string;              // Input texto manual
  estadoTramite: string;         // Select texto plano
  tomador: string;               // Read-only (mismo que asegurado)
  domicilio: string;             // Read-only (del cliente)
  tramite: string;               // Select texto plano
  fecha: string;                 // Date (fecha gestión)
  asignado: string;              // Input texto (ignorar por ahora)
  tipo: string;                  // Select texto plano
  estadoPoliza: string;          // Select texto plano

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: number;              // Read-only (del paso 3)
  desde: string;                 // Date input (del escaneo)
  hasta: string;                 // Date input (del escaneo)
  poliza: string;                // Input texto (del escaneo)
  certificado: string;           // Input texto (del escaneo)

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: string;           // Input texto (marca + modelo unidos)
  anio: string;                  // Input number (del escaneo)
  matricula: string;             // Input texto (del escaneo, opcional)
  motor: string;                 // Input texto (del escaneo)
  destinoId: number;             // Select maestro Destino
  combustibleId: string;         // Select maestro Combustible (STRING!)
  chasis: string;                // Input texto (del escaneo)
  calidadId: number;             // Select maestro Calidad
  categoriaId: number;           // Select maestro Categoría

  // ===== PESTAÑA 4: DATOS DE LA COBERTURA =====
  coberturaId: number;           // Select maestro Cobertura
  zonaCirculacion: string;       // Input texto (departamento)
  monedaId: number;              // Select maestro Moneda

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  formaPago: string;             // Select texto plano
  premio: number;                // Input número (del escaneo)
  total: number;                 // Input número (del escaneo)
  moneda: number;                // Mismo que monedaId (sincronizado)
  valorCuota: number;            // Input número (del escaneo)
  cuotas: number;                // Input número (del escaneo)

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: string;         // Textarea libre
}

// ✅ TIPO CORREGIDO: Basado en el backend real PolizaCreateRequest
export interface PolizaCreateRequest {
  // ===== CAMPOS PRINCIPALES OBLIGATORIOS =====
  Clinro: number;                    // ID Cliente
  Clinom?: string;                   // Nombre cliente
  Comcod: number;                    // ID Compañía
  Seccod?: number;                   // ID Sección (opcional, se puede derivar)
  SeccionId?: number;                // ID Sección alternativo
  
  // ===== DATOS BÁSICOS DE LA PÓLIZA =====
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
  
  // ===== DATOS DEL CLIENTE =====
  Asegurado?: string;                // Nombre asegurado (alternativo)
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
  CombustibleId?: number;            // ID Combustible
  CombustibleNombre?: string;        // Nombre combustible
  CategoriaId?: number;              // ID Categoría
  CategoriaNombre?: string;          // Nombre categoría
  DestinoId?: number;                // ID Destino
  DestinoNombre?: string;            // Nombre destino
  CalidadId?: number;                // ID Calidad
  CalidadNombre?: string;            // Nombre calidad
  
  // ===== DATOS FINANCIEROS =====
  Conpremio: number;                 // Premio (OBLIGATORIO)
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
