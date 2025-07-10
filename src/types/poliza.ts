export interface Poliza {
  id: number;
  numero: string;
  clienteId: number;
  companiaId: number;
  ramoId: number;

  compania: string;
  ramo: string;
  producto: string;

  fechaInicio: string;
  fechaVencimiento: string;
  fechaEmision: string;

  prima: number;
  primaAnual: number;
  sumaDolarizada?: number;
  deducible?: number;

  estado: 'vigente' | 'vencida' | 'cancelada' | 'suspendida' | 'por_vencer';
  tipoPoliza: 'nueva' | 'renovacion' | 'endoso';

  vehiculo?: {
    marca: string;
    modelo: string;
    año: number;
    chapa: string;
    numeroMotor?: string;
    numeroChasis?: string;
    color?: string;
  };

  beneficiarios?: Beneficiario[];
  conductores?: Conductor[];

  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
  observaciones?: string;
}

export interface Beneficiario {
  id: number;
  nombre: string;
  documento: string;
  relacion: string;
  porcentaje: number;
}

export interface Conductor {
  id: number;
  nombre: string;
  documento: string;
  licencia: string;
  fechaNacimiento: string;
  principal: boolean;
}