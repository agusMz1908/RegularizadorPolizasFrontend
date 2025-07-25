// src/components/wizard/shared/SearchBox.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Users,
  Building2,
  Hash,
  User,
  Building
} from 'lucide-react';

interface SearchFilter {
  id: string;
  label: string;
  value: any;
  active: boolean;
}

interface SearchBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string, filters?: SearchFilter[]) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  showFilters?: boolean;
  filters?: SearchFilter[];
  onFiltersChange?: (filters: SearchFilter[]) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
  autoFocus?: boolean;
  debounceMs?: number;
  maxLength?: number;
  isDarkMode?: boolean;
  searchType?: 'clientes' | 'companias' | 'polizas' | 'general';
  showSearchStats?: boolean;
  resultsCount?: number;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onValueChange,
  onSearch,
  placeholder = 'Buscar...',
  loading = false,
  disabled = false,
  showFilters = false,
  filters = [],
  onFiltersChange,
  size = 'md',
  variant = 'default',
  autoFocus = false,
  debounceMs = 300,
  maxLength,
  isDarkMode = false,
  searchType = 'general',
  showSearchStats = false,
  resultsCount,
  className = ''
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [internalFilters, setInternalFilters] = useState<SearchFilter[]>(filters);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // ✅ Auto-focus si está habilitado
  useEffect(() => {
    if (autoFocus && searchRef.current) {
      searchRef.current.focus();
    }
  }, [autoFocus]);

  // ✅ Sync filters with props
  useEffect(() => {
    setInternalFilters(filters);
  }, [filters]);

  // ✅ Debounced search usando useCallback y useEffect
  const debouncedSearch = useCallback((searchValue: string, searchFilters: SearchFilter[]) => {
    if (onSearch) {
      onSearch(searchValue, searchFilters.filter(f => f.active));
    }
  }, [onSearch]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value, internalFilters);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [value, internalFilters, debouncedSearch, debounceMs]);

  // ✅ Configuración de tamaños
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const paddingClasses = {
    sm: 'pl-10 pr-12',
    md: 'pl-12 pr-14',
    lg: 'pl-14 pr-16'
  };

  // ✅ Placeholders específicos por tipo
  const getPlaceholder = (): string => {
    if (placeholder !== 'Buscar...') return placeholder;
    
    const placeholders = {
      clientes: 'Buscar por nombre, documento o RUC...',
      companias: 'Buscar compañías por nombre...',
      polizas: 'Buscar por número de póliza...',
      general: 'Buscar...'
    };
    
    return placeholders[searchType];
  };

  // ✅ Icono según tipo de búsqueda
  const getSearchIcon = () => {
    const icons = {
      clientes: Users,
      companias: Building2,
      polizas: Hash,
      general: Search
    };
    
    const IconComponent = icons[searchType];
    return <IconComponent className={iconSizes[size]} />;
  };

  // ✅ Manejar cambios en filtros
  const handleFilterToggle = (filterId: string) => {
    const updatedFilters = internalFilters.map(filter =>
      filter.id === filterId 
        ? { ...filter, active: !filter.active }
        : filter
    );
    
    setInternalFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  // ✅ Limpiar búsqueda
  const handleClear = () => {
    onValueChange('');
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  // ✅ Contar filtros activos
  const activeFiltersCount = internalFilters.filter(f => f.active).length;

  // ✅ Estilos base
  const baseClasses = `
    w-full rounded-xl border-2 transition-all duration-200 font-medium
    ${sizeClasses[size]} ${paddingClasses[size]}
    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
    ${isDarkMode 
      ? 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100'
    }
    focus:ring-4 focus:outline-none
  `;

  return (
    <div className={`relative ${className}`}>
      {/* Campo de búsqueda principal */}
      <div className="relative">
        {/* Icono de búsqueda */}
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {loading ? (
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
          ) : (
            getSearchIcon()
          )}
        </div>

        {/* Input */}
        <input
          ref={searchRef}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={disabled}
          maxLength={maxLength}
          className={baseClasses}
        />

        {/* Botones de acción */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Botón limpiar */}
          {value && !loading && (
            <button
              onClick={handleClear}
              className={`p-1 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className={iconSizes[size]} />
            </button>
          )}

          {/* Botón filtros */}
          {showFilters && internalFilters.length > 0 && (
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`p-1 rounded-md transition-colors relative ${
                activeFiltersCount > 0
                  ? isDarkMode 
                    ? 'text-blue-400 bg-blue-900/30' 
                    : 'text-blue-600 bg-blue-100'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className={iconSizes[size]} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && isFiltersOpen && internalFilters.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border shadow-lg z-50 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Filtros de búsqueda
            </h4>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className={`p-1 rounded-md ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {internalFilters.map((filter) => (
              <label
                key={filter.id}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  filter.active
                    ? isDarkMode 
                      ? 'bg-blue-900/30 border border-blue-700/50' 
                      : 'bg-blue-50 border border-blue-200'
                    : isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filter.active}
                  onChange={() => handleFilterToggle(filter.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {filter.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas de búsqueda */}
      {showSearchStats && value && resultsCount !== undefined && (
        <div className={`mt-2 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {resultsCount === 0 
            ? `Sin resultados para "${value}"`
            : `${resultsCount} resultado${resultsCount !== 1 ? 's' : ''} encontrado${resultsCount !== 1 ? 's' : ''}`
          }
        </div>
      )}
    </div>
  );
};

// ✅ Componente especializado para búsqueda de clientes
export const ClienteSearchBox: React.FC<Omit<SearchBoxProps, 'searchType' | 'filters'> & {
  showOnlyActive?: boolean;
  onActiveFilterChange?: (showOnlyActive: boolean) => void;
}> = ({
  showOnlyActive = true,
  onActiveFilterChange,
  ...props
}) => {
  const filters: SearchFilter[] = [
    {
      id: 'active',
      label: 'Solo clientes activos',
      value: true,
      active: showOnlyActive
    }
  ];

  const handleFiltersChange = (updatedFilters: SearchFilter[]) => {
    const activeFilter = updatedFilters.find(f => f.id === 'active');
    if (activeFilter && onActiveFilterChange) {
      onActiveFilterChange(activeFilter.active);
    }
  };

  return (
    <SearchBox
      {...props}
      searchType="clientes"
      showFilters={true}
      filters={filters}
      onFiltersChange={handleFiltersChange}
    />
  );
};

export const CompanySearchBox: React.FC<Omit<SearchBoxProps, 'searchType'>> = (props) => {
  return (
    <SearchBox
      {...props}
      searchType="companias"
    />
  );
};

export default SearchBox;