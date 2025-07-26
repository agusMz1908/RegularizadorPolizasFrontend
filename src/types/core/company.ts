export interface Company {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias: string;
  activo: boolean;
  
  // ✅ Propiedades adicionales para compatibilidad
  nombre?: string;
  alias?: string;
  codigo?: string;
  comnombre?: string; // Para compatibilidad con algunos componentes
  
  comrazsoc?: string;
  comruc?: string;
  comdom?: string;
  comtel?: string;
  totalPolizas?: number;
  puedeEliminar?: boolean;
}

export interface CompanyLookup {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias: string;
  
  nombre: string;
  alias: string;
  codigo: string;
}