export interface PolizaFormDataExtended {
  // Información de la Póliza
  numeroPoliza: string;
  anio?: string | number;
  vigenciaDesde: string;
  vigenciaHasta: string;
  plan?: string;
  ramo?: string;
  
  // Datos del Cliente
  asegurado: string;
  documento?: string;
  email?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  telefono?: string;
  
  // Datos del Vehículo
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  
  // Información Financiera
  prima: number | string;
  primaComercial?: number | string;
  premioTotal?: number | string;
  moneda: string;
  
  // Corredor de Seguros
  corredor?: string;
  
  // Observaciones
  observaciones: string;
}