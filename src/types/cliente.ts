
import { Poliza } from "./poliza";

export interface Cliente {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  estado: 'activo' | 'inactivo';
  
  tipoDocumento: 'CI' | 'RUT' | 'Pasaporte';
  fechaNacimiento?: string;
  ocupacion?: string;
  ingresosMensuales?: number;
  
  polizas?: Poliza[];
  totalPolizas?: number;
  
  activo: boolean;
}

export interface ClienteMapper {
  fromBackend(clienteDto: any): Cliente;
  toBackend(cliente: Cliente): any;
}