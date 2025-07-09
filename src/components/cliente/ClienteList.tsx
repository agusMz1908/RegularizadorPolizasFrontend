import React from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Users, Loader2 } from 'lucide-react';
import { Cliente } from '../../types/cliente';

interface ClientesListProps {
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  totalClientes: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading: boolean;
  error: string | null;
  onSelectCliente: (cliente: Cliente) => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  onGoToPage: (page: number) => void;
  onChangePageSize: (size: number) => void;
}

export const ClientesList: React.FC<ClientesListProps> = ({
  clientes,
  clienteSeleccionado,
  totalClientes,
  currentPage,
  totalPages,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  loading,
  error,
  onSelectCliente,
  onSearch,
  onRefresh,
  onGoToPage,
  onChangePageSize,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    onRefresh();
  };

  const renderPaginationInfo = () => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalClientes);
    
    return (
      <span className="text-sm text-gray-700">
        Mostrando {startItem} - {endItem} de {totalClientes} clientes
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Clientes
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Cargando clientes desde Velneo...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p className="font-medium">Error al cargar clientes</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        ) : clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No se encontraron clientes</p>
            <p className="text-sm mt-1">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay clientes disponibles'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => onSelectCliente(cliente)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  clienteSeleccionado?.id === cliente.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {cliente.nombre || 'Sin nombre'}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>Doc: {cliente.documento || 'N/A'}</span>
                      {cliente.telefono && <span>Tel: {cliente.telefono}</span>}
                    </div>
                    {cliente.email && (
                      <p className="mt-1 text-sm text-gray-500 truncate">{cliente.email}</p>
                    )}
                  </div>
                  {clienteSeleccionado?.id === cliente.id && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con paginación */}
      {!loading && !error && clientes.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {renderPaginationInfo()}
              
              {/* Selector de tamaño de página */}
              <select
                value={pageSize}
                onChange={(e) => onChangePageSize(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onGoToPage(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-700">
                {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => onGoToPage(currentPage + 1)}
                disabled={!hasNextPage}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};