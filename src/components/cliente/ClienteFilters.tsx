import React from 'react';
import { Filter, X } from 'lucide-react';
import { FilterParams } from '../../types/common';

interface ClienteFiltersProps {
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
  className?: string;
}

export const ClienteFilters: React.FC<ClienteFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Activos
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde || ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta || ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};