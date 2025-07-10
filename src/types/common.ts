export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipo que coincide con tu backend .NET
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

// Tipo genérico para otros casos
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterParams {
  search?: string;
  estado?: string;
  compania?: string;
  ramo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoPoliza?: string;
  clienteId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface SearchParams {
  query: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
}

// Estados de carga y error
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
  lastUpdated?: string;
}

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface NavigationContext {
  cliente?: import('./cliente').Cliente;
  returnUrl?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}