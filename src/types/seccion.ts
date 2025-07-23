export interface Seccion {
  id: number;
  name: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
}

export interface SeccionLookup {
  id: number;
  name: string;
  icono?: string;
  activo: boolean;
}