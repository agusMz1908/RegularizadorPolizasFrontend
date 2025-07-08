export interface Poliza {
  id: number;
  clienteId: number;
  numero: string;
  compania: string;
  ramo: string;
  estado: 'Vigente' | 'Vencida' | 'Cancelada' | 'Pendiente';
  fechaDesde: string;
  fechaHasta: string;
  prima: number;
  moneda: string;
  sumaAsegurada?: number;
  deducible?: number;
  comision?: number;
  observaciones?: string;
}

export interface PolizaFormData {
  // Datos básicos
  numeroPoliza?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  moneda?: string;
  
  // Datos del asegurado
  nombreAsegurado?: string;
  documentoAsegurado?: string;
  telefonoAsegurado?: string;
  emailAsegurado?: string;
  direccionAsegurado?: string;
  
  // Datos del vehículo (si aplica)
  marca?: string;
  modelo?: string;
  año?: string;
  chapa?: string;
  chasis?: string;
  motor?: string;
  color?: string;
  
  // Datos financieros
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