import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { clienteService } from '../services/clienteService';
import { PaginationParams, PaginatedResponse } from '../types/common';

interface UseClientesReturn {
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  polizasCliente: Poliza[];
  stats: {
    totalClientes: number;
    totalPolizas: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  loadingPolizas: boolean;
  error: string | null;
  selectCliente: (cliente: Cliente) => void;
  clearClienteSeleccionado: () => void;
  searchClientes: (query: string) => Promise<void>;
  refreshClientes: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  changePageSize: (size: number) => Promise<void>;
  hasClientes: boolean;
  hasPolizas: boolean;
  isClienteSelected: boolean;
}

export const useClientes = (): UseClientesReturn => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [polizasCliente, setPolizasCliente] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPolizas, setLoadingPolizas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalCount: 0,
  });

  const loadClientes = useCallback(async (page: number = 1, pageSize: number = 20, query?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando clientes - Página:', page, 'Tamaño:', pageSize, 'Query:', query);
      
      const paginationParams: PaginationParams = {
        page,
        limit: pageSize,
        sortBy: 'nombre',
        sortOrder: 'asc'
      };

      const filters = query ? { search: query } : undefined;
      
      const response: PaginatedResponse<Cliente> = await clienteService.getClientes(paginationParams, filters);
      
      console.log('✅ Respuesta recibida:', {
        items: response.items.length,
        totalCount: response.totalCount,
        currentPage: response.currentPage,
        totalPages: response.totalPages
      });
      
      setClientes(response.items);
      setPagination({
        currentPage: response.pageNumber,
        totalPages: response.totalPages,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
      });
      
    } catch (err: any) {
      console.error('❌ Error cargando clientes:', err);
      setError(err.message);
      setClientes([]);
      setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    setLoadingPolizas(true);
    setError(null);
    try {
      console.log('🔄 Cargando pólizas para cliente:', clienteId);
      const polizasData = await clienteService.getPolizasByCliente(clienteId);
      console.log('✅ Pólizas cargadas:', polizasData.length);
      setPolizasCliente(polizasData);
    } catch (err: any) {
      console.error('❌ Error cargando pólizas:', err);
      setError(err.message);
      setPolizasCliente([]);
    } finally {
      setLoadingPolizas(false);
    }
  }, []);

  const selectCliente = useCallback((cliente: Cliente) => {
    console.log('👤 Cliente seleccionado:', cliente.nombre);
    setClienteSeleccionado(cliente);
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);

  const clearClienteSeleccionado = useCallback(() => {
    console.log('🧹 Limpiando selección de cliente');
    setClienteSeleccionado(null);
    setPolizasCliente([]);
  }, []);

  const searchClientes = useCallback(async (query: string) => {
    console.log('🔍 Buscando clientes:', query);
    setSearchQuery(query);
    await loadClientes(1, pagination.pageSize, query.trim() || undefined);
  }, [loadClientes, pagination.pageSize]);

  const refreshClientes = useCallback(async () => {
    console.log('🔄 Refrescando lista de clientes...');
    await loadClientes(pagination.currentPage, pagination.pageSize, searchQuery || undefined);
  }, [loadClientes, pagination.currentPage, pagination.pageSize, searchQuery]);

  const loadPage = useCallback(async (page: number) => {
    console.log('📄 Cargando página:', page);
    await loadClientes(page, pagination.pageSize, searchQuery || undefined);
  }, [loadClientes, pagination.pageSize, searchQuery]);

  const changePageSize = useCallback(async (size: number) => {
    console.log('📏 Cambiando tamaño de página:', size);
    await loadClientes(1, size, searchQuery || undefined);
  }, [loadClientes, searchQuery]);

  // Carga inicial
  useEffect(() => {
    loadClientes();
  }, []);

  // Computed values
  const hasClientes = clientes.length > 0;
  const hasPolizas = polizasCliente.length > 0;
  const isClienteSelected = clienteSeleccionado !== null;
  
  const stats = {
    totalClientes: pagination.totalCount,
    totalPolizas: polizasCliente.length,
  };

  // Mapear pagination para que coincida con el formato esperado por Dashboard
  const paginationFormatted = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalCount,
  };

  return {
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    pagination: paginationFormatted,
    loading,
    loadingPolizas,
    error,
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    loadPage,
    changePageSize,
    hasClientes,
    hasPolizas,
    isClienteSelected,
  };
};