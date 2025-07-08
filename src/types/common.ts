export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  estado?: string;
  compania?: string;
  ramo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}