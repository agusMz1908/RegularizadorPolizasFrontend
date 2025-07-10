import { Cliente } from '../types/cliente';

interface ClienteBackend {
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
  totalPolizas?: number;
}

export class ClienteAdapter {
  static fromBackend(clienteBackend: ClienteBackend): Cliente {
    return {
      ...clienteBackend,
      activo: clienteBackend.estado === 'activo',
      polizas: [],
    };
  }

  static toBackend(cliente: Cliente): Partial<ClienteBackend> {
    return {
      id: cliente.id,
      nombre: cliente.nombre,
      documento: cliente.documento,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      fechaCreacion: cliente.fechaCreacion,
      fechaActualizacion: cliente.fechaActualizacion,
      estado: cliente.activo ? 'activo' : 'inactivo',
      tipoDocumento: cliente.tipoDocumento,
      fechaNacimiento: cliente.fechaNacimiento,
      ocupacion: cliente.ocupacion,
      ingresosMensuales: cliente.ingresosMensuales,
    };
  }

  static mapClientesList(clientesBackend: ClienteBackend[]): Cliente[] {
    return clientesBackend.map(cliente => this.fromBackend(cliente));
  }
}