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

export interface PolizaConEndosos extends Poliza {
  totalEndosos?: number;
  endosos?: any[];
}

export interface PolizaFormData {
  // ✅ INFORMACIÓN BÁSICA DE LA PÓLIZA
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  prima: number | string;
  moneda: string;
  asegurado: string;
  observaciones: string;
  
  // ✅ CAMPOS QUE ESTABAN FALTANDO (causaban los errores)
  plan?: string;               // ← AGREGADO
  ramo?: string;              // ← AGREGADO
  
  // ✅ CAMPOS ADICIONALES EXISTENTES
  color?: string;
  tipoVehiculo?: string;
  uso?: string;
  impuestoMSP?: number;
  formaPago?: string;
  cantidadCuotas?: number;
  descuentos?: number;
  recargos?: number;
  codigoPostal?: string;
  seccion?: string;
  seccionId?: number;
  certificado?: string;
  estadoPoliza?: string;
  compania?: string;
  corredor?: string;
  
  // ✅ CAMPOS DEL VEHÍCULO (para completitud)
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: string | number;
  
  // ✅ CAMPOS FINANCIEROS ADICIONALES
  primaComercial?: number;
  premioTotal?: number;
  
  // ✅ DATOS DEL CLIENTE ADICIONALES
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
}

export interface Compania {
  id: number;
  nombre: string;
  codigo: string;
  activo?: boolean;
}

export interface Ramo {
  id: number;
  nombre: string;
  codigo: string;
  icon?: React.ReactNode;
  activo?: boolean;
}

export interface VelneoPoliza {
  conpol: string | number;
  com_alias: string;
  conend?: string | number;
  contpocob?: string;
  confchdes: string | Date;
  confchhas: string | Date;
  conpremio: number;
  moncod: number;
  ramo?: string;
  estado?: string;
  clienteId: number;
  id?: number;
}

export class PolizaMapper {
  static fromVelneo(velneoData: VelneoPoliza): Poliza {
    return {
      id: velneoData.id || 0,
      clienteId: velneoData.clienteId,
      numero: velneoData.conpol?.toString(),
      compania: velneoData.com_alias,
      ramo: velneoData.ramo,
      estado: velneoData.estado as any || 'activo',
      fechaDesde: typeof velneoData.confchdes === 'string' ? velneoData.confchdes : velneoData.confchdes?.toISOString(),
      fechaHasta: typeof velneoData.confchhas === 'string' ? velneoData.confchhas : velneoData.confchhas?.toISOString(),
      prima: velneoData.conpremio,
      moneda: velneoData.moncod === 2 ? 'USD' : 'UYU',
      
      conpol: velneoData.conpol,
      com_alias: velneoData.com_alias,
      conend: velneoData.conend,
      contpocob: velneoData.contpocob,
      confchdes: velneoData.confchdes,
      confchhas: velneoData.confchhas,
      conpremio: velneoData.conpremio,
      moncod: velneoData.moncod,
    };
  }
  
  static toVelneo(poliza: Poliza): VelneoPoliza {
    return {
      conpol: poliza.conpol || poliza.numero || '',
      com_alias: poliza.com_alias || poliza.compania || '',
      conend: poliza.conend,
      contpocob: poliza.contpocob,
      confchdes: poliza.confchdes || poliza.fechaDesde || new Date().toISOString(),
      confchhas: poliza.confchhas || poliza.fechaHasta || new Date().toISOString(),
      conpremio: poliza.conpremio || poliza.prima || 0,
      moncod: poliza.moncod || (poliza.moneda === 'USD' ? 2 : 1),
      ramo: poliza.ramo,
      estado: poliza.estado,
      clienteId: poliza.clienteId || 0,
      id: poliza.id,
    };
  }
}