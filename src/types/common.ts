// types/common.ts - Tipos corregidos
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  // 🆕 Agregar propiedades que faltan según el error
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterParams {
  search?: string;
  [key: string]: any;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface Stats {
  totalClientes: number;
  totalPolizas: number;
  clientesActivos?: number;
  polizasVigentes?: number;
  polizasVencidas?: number;
}

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface NavigationContext {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}