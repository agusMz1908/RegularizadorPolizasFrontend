import { VelneoTramite, VelneoEstadoPoliza, VelneoFormaPago, VelneoMoneda } from './velneo';

export interface Poliza {
  id?: number;
  conpol?: string | number;
  conend?: string | number;
  numero?: string | number;
  endoso?: string | number;
  
  com_alias?: string;
  compania?: string;
  Com_alias?: string;
  ramo?: string;
  Ramo?: string;
  contpocob?: string;
  Contpocob?: string;
  confchdes?: string | Date;
  Confchdes?: string | Date;
  confchhas?: string | Date;
  Confchhas?: string | Date;
  conpremio?: number;
  Conpremio?: number;
  moncod?: number;
  Moncod?: number;
  estado?: string;
  Estado?: string;
  fechaDesde?: string | Date;
  fechaHasta?: string | Date;
  prima?: number;
  moneda?: string;

  asegurado?: string;
  cliente?: string;
  nombreAsegurado?: string;
  suma?: number;
  sumaAsegurada?: number;
  consum?: number;
  Consum?: number;
  tipoSeguro?: string;
  rama?: string;
  clienteId?: number;
  clinom?: string;

  vehiculo?: {
    marca: string;
    modelo: string;
    año: number;
    patente: string;
  };
  
  [key: string]: any;
}

export interface PolizaFormData {
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  prima: number | string;  
  moneda: string;
  asegurado: string;
  observaciones?: string;

  compania: number;    
  seccionId: number;           
  clienteId: number;          
  cobertura: string;           

  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: string | number;

  primaComercial?: number;
  premioTotal?: number;
  cantidadCuotas?: number;
  valorCuota?: number;
  formaPago?: string;
  primeraCuotaFecha?: string;
  primeraCuotaMonto?: number;

  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;

  corredor?: string;
  plan?: string;
  ramo?: string;
  certificado?: string;
  estadoPoliza?: string;
  tramite?: string;
  tipo?: string;

  destino?: string;
  calidad?: string;
  categoria?: string;
  tipoVehiculo?: string;
  uso?: string;

  combustibleId?: string | null;
  categoriaId?: number | null;
  destinoId?: number | null;
  calidadId?: number | null;

  operacion?: any;
  seccion?: string;
  color?: string;
  impuestoMSP?: number;
  descuentos?: number;
  recargos?: number;
  codigoPostal?: string;

  tramiteVelneo?: VelneoTramite;
  estadoPolizaVelneo?: VelneoEstadoPoliza;
  formaPagoVelneo?: VelneoFormaPago;
  monedaVelneo?: VelneoMoneda;
  estadoGestionVelneo?: string;
}

export interface PolizaCreateRequest {
  // ✅ CAMPOS BÁSICOS REQUERIDOS
  comcod: number;
  clinro: number;
  seccod?: number;
  conpol: string;
  conend?: string;           
  confchdes: string | Date;
  confchhas: string | Date;
  conpremio: number;
  asegurado: string;

  contot?: number;        
  concuo?: number;         
  
  observaciones?: string;
  moneda?: string;
  cobertura?: string;
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: number;
  primaComercial?: number;
  premioTotal?: number;
  corredor?: string;
  plan?: string;
  ramo?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  seccionId?: number;
  estado?: string;
  tramite?: string;
  estadoPoliza?: string;
  calidadId?: number;
  destinoId?: number;
  categoriaId?: number;
  tipoVehiculo?: string;
  uso?: string;
  formaPago?: string;
  cantidadCuotas?: number;
  valorCuota?: number;
  tipo?: string;
  certificado?: string;
  procesadoConIA?: boolean;
  documentoId?: string;
  archivoOriginal?: string;
  
  // ✅ CAMPOS DE VELNEO EXISTENTES
  condom?: string;         
  clinom?: string;      
  conmaraut?: string;     
  conanioaut?: number;     
  conmataut?: string;       
  conchasis?: string;      
  conmotor?: string;    
  catdsc?: number;       
  desdsc?: number;        
  caldsc?: number;        
  contra?: string;        
  congeses?: string;        
  convig?: string;        
  consta?: string;          
  moncod?: number;       
  congesti?: string;

  conges?: string;           // Para 'SISTEMA_AUTO'
  congesfi?: Date;           // Para fecha de gestión
  ingresado?: Date;          // Para fecha de ingreso
  last_update?: Date;        // Para última actualización
  com_alias?: string;        // Para alias de compañía
  combustibles?: string;     // Para tipo de combustible (nota el 's' al final)
}