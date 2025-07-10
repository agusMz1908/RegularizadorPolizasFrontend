import { Cliente } from './cliente';
import { PaginationInfo, Stats } from './common';
import { Poliza } from './poliza';

export interface UseClientesReturn {
  // Datos
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  polizasCliente: Poliza[];
  stats: Stats;
  pagination: PaginationInfo;
  
  // Estados de carga
  loading: boolean;
  loadingPolizas: boolean;
  error: string | null;
  
  // Acciones
  selectCliente: (cliente: Cliente) => void;
  clearClienteSeleccionado: () => void;
  searchClientes: (query: string) => void;
  refreshClientes: () => void;
  loadPage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
  
  // Helpers
  hasClientes: boolean;
  hasPolizas: boolean;
  isClienteSelected: boolean;
}