import { useState, useEffect, useCallback, useMemo } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { clienteService, PagedResult, PaginationParams } from '../services/clienteService';

interface UseClientesReturn {
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  polizasCliente: Poliza[];
  totalClientes: number;
  totalPolizas: number;

  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  loading: boolean;
  loadingPolizas: boolean;
  loadingCount: boolean;
  error: string | null;
  
  selectCliente: (cliente: Cliente) => void;
  clearClienteSeleccionado: () => void;
  searchClientes: (query: string) => void;
  refreshClientes: () => void;
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
  
  hasClientes: boolean;
  hasPolizas: boolean;
  isClienteSelected: boolean;
}

export const useClientes = (): UseClientesReturn => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [polizasCliente, setPolizasCliente] = useState<Poliza[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalPolizas, setTotalPolizas] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingPolizas, setLoadingPolizas] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadClientes = useCallback(async (page: number = 1, size: number = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: PaginationParams = { page, pageSize: size };
      const result = await clienteService.getClientes(params);
      
      setClientes(result.items);
      setCurrentPage(result.pageNumber);
      setTotalPages(result.totalPages);
      setPageSize(result.pageSize);
      setTotalClientes(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setHasPreviousPage(result.hasPreviousPage);
      
    } catch (err: any) {
      setError(err.message || 'Error cargando clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClientesCount = useCallback(async () => {
    try {
      setLoadingCount(true);
      const result = await clienteService.getClientesCount();
      setTotalClientes(result.total_clients);
    } catch (err: any) {
      console.error('Error loading clients count:', err);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    try {
      setLoadingPolizas(true);
      setError(null);
      
      const result = await clienteService.getPolizasByCliente(clienteId, { page: 1, pageSize: 100 });
      setPolizasCliente(result.items);
      setTotalPolizas(result.totalCount);
      
    } catch (err: any) {
      setError(err.message || 'Error cargando pólizas del cliente');
      setPolizasCliente([]);
    } finally {
      setLoadingPolizas(false);
    }
  }, []);

  useEffect(() => {
    loadClientes(1, pageSize);
    loadClientesCount();
  }, [loadClientes, loadClientesCount, pageSize]);

  const selectCliente = useCallback((cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);

  const clearClienteSeleccionado = useCallback(() => {
    setClienteSeleccionado(null);
    setPolizasCliente([]);
    setTotalPolizas(0);
  }, []);

  const searchClientes = useCallback(async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      await loadClientes(1, pageSize);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const resultados = await clienteService.searchClientes(query);
      setClientes(resultados);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalClientes(resultados.length);
      setHasNextPage(false);
      setHasPreviousPage(false);
      
    } catch (err: any) {
      const clientesFiltrados = clientes.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(query.toLowerCase()) ||
        cliente.documento?.includes(query) ||
        cliente.email?.toLowerCase().includes(query.toLowerCase())
      );
      
      setClientes(clientesFiltrados);
      setTotalClientes(clientesFiltrados.length);
    } finally {
      setLoading(false);
    }
  }, [clientes, loadClientes, pageSize]);

  const refreshClientes = useCallback(() => {
    if (searchTerm.trim()) {
      searchClientes(searchTerm);
    } else {
      loadClientes(currentPage, pageSize);
    }
  }, [searchTerm, searchClientes, loadClientes, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !searchTerm.trim()) {
      loadClientes(page, pageSize);
    }
  }, [loadClientes, pageSize, totalPages, searchTerm]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    loadClientes(1, size);
  }, [loadClientes]);

  const hasClientes = useMemo(() => clientes.length > 0, [clientes]);
  const hasPolizas = useMemo(() => polizasCliente.length > 0, [polizasCliente]);
  const isClienteSelected = useMemo(() => clienteSeleccionado !== null, [clienteSeleccionado]);

  return {
    clientes,
    clienteSeleccionado,
    polizasCliente,
    totalClientes,
    totalPolizas,
    
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    
    loading,
    loadingPolizas,
    loadingCount,
    error,
    
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    goToPage,
    changePageSize,
    
    hasClientes,
    hasPolizas,
    isClienteSelected,
  };
};