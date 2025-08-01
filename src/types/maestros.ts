export interface CompanyDto {
  id: number;
  comnom: string;           // "BANCO DE SEGUROS"
  comrazsoc: string;
  comruc: string;
  comdom: string;
  comtel: string;
  comfax: string;
  comalias: string;         // "BSE"
  activo: boolean;
  nombre: string;           // "BANCO DE SEGUROS" 
  alias: string;            // "BSE"
  codigo: string;
  totalPolizas: number;
  puedeEliminar: boolean;
}

export interface SeccionDto {
  id: number;
  seccion: string;          // "AUTOMOVILES"
  icono: string;            // "🚗"
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface CombustibleDto {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface CategoriaDto {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface CoberturaDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface DestinoDto {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface CalidadDto {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface TarifaDto {
  id: number;
  companiaId: number;
  nombre: string;
  codigo?: string;
  activa: boolean;
}

export interface MaestrosDto {
  combustibles: CombustibleDto[];
  categorias: CategoriaDto[];
  destinos: DestinoDto[];
  calidades: CalidadDto[];
  coberturas: CoberturaDto[];
}