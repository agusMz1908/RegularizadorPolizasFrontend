export interface Seccion {
  id: number;
  seccion: string;
  descripcion?: string;  
  icono?: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  companyId?: number;
}

export interface SeccionLookup {
  id: number;
  seccion: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
}