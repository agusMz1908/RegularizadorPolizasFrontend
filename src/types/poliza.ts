export interface Poliza {
  id: number;
  clienteId: number;
  numero: string;
  compania: string;
  ramo: string;
  estado: 'Vigente' | 'Vencida' | 'Cancelada' | 'Pendiente';
  
  fechaInicio: string;        
  fechaVencimiento: string;   
  prima: number;
  moneda: string;
  
  sumaAsegurada?: number;
  deducible?: number;
  comision?: number;
  observaciones?: string;
  
  conpol?: string;          
  confchdes?: string;     
  confchhas?: string;       
  convig?: string;          
  comAlias?: string;        
  
  fechaCreacion?: string;
  fechaModificacion?: string;
  activo?: boolean;
}

export interface PolizaFormData {
  numeroPoliza?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  moneda?: string;

  nombreAsegurado?: string;
  documentoAsegurado?: string;
  telefonoAsegurado?: string;
  emailAsegurado?: string;
  direccionAsegurado?: string;

  marca?: string;
  modelo?: string;
  año?: string;
  chapa?: string;
  chasis?: string;
  motor?: string;
  color?: string;

  sumaAsegurada?: number;
  deducible?: number;
  comision?: number;
  
  observaciones?: string;
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

export interface PolizaResumidaDto {
  id: number;
  conpol: string;          
  ramo: string;
  confchdes?: string;       
  confchhas?: string;      
  convig: string;        
  comAlias: string;         
  prima?: number;
  moneda?: string;
}

export const mapPolizaResumidaToPoliza = (dto: PolizaResumidaDto): Poliza => ({
  id: dto.id,
  clienteId: 0, 
  numero: dto.conpol || '',
  compania: dto.comAlias || '',
  ramo: dto.ramo || '',
  estado: mapVigenciaToEstado(dto.convig),
  fechaInicio: dto.confchdes || '',
  fechaVencimiento: dto.confchhas || '',
  prima: dto.prima || 0,
  moneda: dto.moneda || 'UYU',
  
  conpol: dto.conpol,
  confchdes: dto.confchdes,
  confchhas: dto.confchhas,
  convig: dto.convig,
  comAlias: dto.comAlias,
});

const mapVigenciaToEstado = (vigencia: string): Poliza['estado'] => {
  switch (vigencia?.toLowerCase()) {
    case 'vigente':
    case 'activa':
      return 'Vigente';
    case 'vencida':
    case 'expirada':
      return 'Vencida';
    case 'cancelada':
    case 'anulada':
      return 'Cancelada';
    case 'pendiente':
    case 'proceso':
      return 'Pendiente';
    default:
      return 'Pendiente';
  }
};