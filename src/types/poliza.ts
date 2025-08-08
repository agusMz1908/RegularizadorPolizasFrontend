export interface PolicyFormData {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: string;              
  asegurado: string;             
  tomador: string;               
  domicilio: string;             
  dirCobro: string;              
  estadoTramite: string;         
  tramite: string;               
  fecha: string;                 
  asignado: string;              
  tipo: string;                  
  estadoPoliza: string;          

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: number;              
  comalias: string;              
  seccion: number;               
  poliza: string;                
  certificado: string;           
  endoso: string;                
  desde: string;                 
  hasta: string;                 

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: string;           
  anio: string;                  
  matricula: string;             
  motor: string;                 
  chasis: string;                
  destinoId: number;             
  combustibleId: string;         // STRING, no number!
  calidadId: number;             
  categoriaId: number;           

  // ===== PESTAÑA 4: DATOS DE COBERTURA =====
  coberturaId: number;           
  tarifaId?: number;             
  zonaCirculacion: string;       
  departamentoId: number;        
  monedaId: number;              // Moneda de COBERTURA → Moncod

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  premio: number;                
  total: number;                 
  formaPago: string;             
  cuotas: number;                
  valorCuota: number;            
  monedaPagoId: number;          // NUEVO - Moneda de PAGO → Conviamon

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: string;         
  
  // ===== METADATA =====
  clinro?: number;               
  procesadoConIA?: boolean;      
  confidence?: number;           
}

export interface PolizaCreateRequest {
  // ===== CAMPOS BÁSICOS REQUERIDOS =====
  Comcod: number;                    // ID Compañía (requerido)
  Seccod: number;                    // ID Sección (requerido, 0-9)
  Clinro: number;                    // ID Cliente (requerido)
  Conpol: string;                    // Número de póliza (requerido)
  Confchdes: string;                 // Fecha desde (requerido)
  Confchhas: string;                 // Fecha hasta (requerido)
  Conpremio: number;                 // Premio (requerido)
  Asegurado: string;                 // Nombre asegurado (requerido)
  
  // ===== CAMPOS DE CONTROL Y ESTADO =====
  Contra?: string;                   // Trámite
  Congesti?: string;                 // Tipo gestión
  Congeses?: string;                 // Estado gestión
  Convig?: string;                   // Estado póliza
  Consta?: string;                   // Forma de pago
  
  // ===== DATOS DEL VEHÍCULO =====
  Conmaraut?: string;                // Marca
  Conanioaut?: number;               // Año
  Conmataut?: string;                // Matrícula
  Conmotor?: string;                 // Motor
  Conchasis?: string;                // Chasis
  Conpadaut?: string;                // Padrón
  
  // ===== DATOS COMERCIALES Y FINANCIEROS =====
  Contot?: number;                   // Total
  Concuo?: number;                   // Cuotas (1-12)
  Conimp?: number;                   // Importe
  Ramo?: string;                     // Ramo (default: "AUTOMOVILES")
  Com_alias?: string;                // Alias compañía
  
  // ===== IDs DE MAESTROS (NUEVOS/ACTUALIZADOS) =====
  Catdsc?: number;                   // ID Categoría
  Desdsc?: number;                   // ID Destino  
  Caldsc?: number;                   // ID Calidad
  Flocod?: number;                   // ID Flota
  Tarcod?: number;                   // ID Tarifa (NUEVO)
  Corrnom?: number;                  // ID Corredor
  
  // ===== DATOS DEL CLIENTE/ASEGURADO =====
  Condom?: string;                   // Domicilio
  Clinom?: string;                   // Nombre cliente
  Clinro1?: number;                  // ID Cliente secundario/tomador
  
  // ===== COBERTURAS Y SEGUROS =====
  Tposegdsc?: string;                // Tipo seguro/cobertura
  Concar?: string;                   // Certificado
  Conend?: string;                   // Endoso
  Forpagvid?: string;                // Forma pago vida
  
  // ===== CAMPOS DE MONEDA =====
  Moncod?: number;                   // ID Moneda
  Conviamon?: number;                // ID Moneda condiciones pago
  
  // ===== CAMPOS ADICIONALES VEHÍCULOS =====
  Conclaaut?: number;                // Clase auto
  Condedaut?: number;                // Deducible auto
  Conresciv?: number;                // Responsabilidad civil
  Conbonnsin?: number;               // Bonus sin siniestro
  Conbonant?: number;                // Bonus anterior
  Concaraut?: number;                // Carrocería auto
  Concesnom?: string;                // Nombre cesionario
  Concestel?: string;                // Teléfono cesionario
  Concapaut?: number;                // Capacidad auto
  
  // ===== CAMPOS DE GESTIÓN =====
  Congesfi?: Date;                   // Fecha gestión
  Conges?: string;                   // Gestión
  
  // ===== CAMPOS DE AUDITORÍA =====
  Observaciones?: string;            // Observaciones
  ProcesadoConIA?: boolean;          // Procesado con IA
  FechaCreacion?: Date;              // Fecha creación
  FechaModificacion?: Date;          // Fecha modificación
  
  // ===== CAMPOS LEGACY (compatibilidad) =====
  Vehiculo?: string;
  Marca?: string;
  Modelo?: string;
  Motor?: string;
  Chasis?: string;
  Matricula?: string;
  Combustible?: string;              // Combustible como texto
  Anio?: number;
  PrimaComercial?: number;
  PremioTotal?: number;
  Corredor?: string;
  Plan?: string;
  Documento?: string;
  Email?: string;
  Telefono?: string;
  Direccion?: string;
  Localidad?: string;
  Departamento?: string;             // Departamento/Zona
  Moneda?: string;
  SeccionId?: number;
  Estado?: string;
  Tramite?: string;
  EstadoPoliza?: string;
  CalidadId?: number;
  DestinoId?: number;
  CategoriaId?: number;
  TipoVehiculo?: string;
  Uso?: string;
  FormaPago?: string;
  CantidadCuotas?: number;
  ValorCuota?: number;
  Tipo?: string;
  Cobertura?: string;
  Certificado?: string;
  Calidad?: string;
  Categoria?: string;
  Destino?: string;
}

export interface CreatePolizaResponse {
  success: boolean;
  data?: {
    id?: number;
    numeroPoliza?: string;
    message?: string;
    [key: string]: any;
  };
  message?: string;
  error?: string;
  validationErrors?: Record<string, string>;
}