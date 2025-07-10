// src/types/common.ts
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipo que coincide con el backend (PagedResult<T>)
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Alias para compatibilidad con naming frontend más común
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
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
  [key: string]: any; // Para filtros adicionales
}

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface NavigationContext {
  cliente?: import('./cliente').Cliente;
  compania?: import('./poliza').Compania;
  ramo?: import('./poliza').Ramo;
  returnUrl?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// Respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Para sortear tablas
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Para búsquedas con debounce
export interface SearchConfig {
  query: string;
  debounceMs?: number;
  minLength?: number;
}