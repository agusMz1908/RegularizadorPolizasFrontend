import { Cliente } from './cliente';

export interface ClientDto {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  estado: string;
  tipoDocumento: string;
  fechaNacimiento?: string;
  ocupacion?: string;
  ingresosMensuales?: number;
  
  // ✅ Añadir la propiedad que viene del backend
  activo: boolean;
}

export class ClienteMapper {
  static fromDto(dto: ClientDto): Cliente {
    return {
      id: dto.id,
      nombre: dto.nombre,
      documento: dto.documento,
      email: dto.email,
      telefono: dto.telefono,
      direccion: dto.direccion,
      fechaCreacion: dto.fechaCreacion,
      fechaActualizacion: dto.fechaActualizacion,
      estado: dto.estado as 'activo' | 'inactivo',
      tipoDocumento: dto.tipoDocumento as 'CI' | 'RUT' | 'Pasaporte',
      fechaNacimiento: dto.fechaNacimiento,
      ocupacion: dto.ocupacion,
      ingresosMensuales: dto.ingresosMensuales,
      
      // ✅ Mapear la propiedad activo del backend
      activo: dto.activo,
      
      // Campos requeridos por el tipo Cliente
      polizas: [],
      totalPolizas: 0,
    };
  }

  static toDto(cliente: Cliente): ClientDto {
    return {
      id: cliente.id,
      nombre: cliente.nombre,
      documento: cliente.documento,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      fechaCreacion: cliente.fechaCreacion,
      fechaActualizacion: cliente.fechaActualizacion,
      estado: cliente.estado,
      tipoDocumento: cliente.tipoDocumento,
      fechaNacimiento: cliente.fechaNacimiento,
      ocupacion: cliente.ocupacion,
      ingresosMensuales: cliente.ingresosMensuales,
      
      // ✅ Incluir activo en el DTO
      activo: cliente.activo,
    };
  }

  static fromDtoArray(dtos: ClientDto[]): Cliente[] {
    return dtos.map(dto => this.fromDto(dto));
  }
}

export type { Cliente } from './cliente';