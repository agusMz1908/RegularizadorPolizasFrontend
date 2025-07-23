export interface Seccion {
    id: number;
    seccion: string;
    icono?: string;
    activo: boolean;
    fechaCreacion: string;
    fechaModifcacion: string;
}

export interface SeccionLookup {
  id: number;
  seccion: string;
  icono?: string;
  activo: boolean;
}