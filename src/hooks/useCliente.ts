import { useState, useEffect, useRef, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { clienteService } from '../services/clienteService';
import { PaginationParams, FilterParams, PagedResult } from '../types/common';

// Interfaz para las estadísticas del dashboard
interface ClienteStats {
  totalClientes: number;
  totalPolizas: number;
  clientesActivos: number;
  polizasVencidas: number;
  polizasVigentes: number;
  polizasPorVencer: number;
}

// Interfaz para el estado del hook
interface UseClientesState {
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  polizasCliente: Poliza[];
  stats: ClienteStats;
  loading: boolean;
  loadingPolizas: boolean;
  error: string | null;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  totalClientes: number;
  pageSize: number;
  
  // Filtros
  searchQuery: string;
  filters: FilterParams;
}

// Estado inicial
const initialState: UseClientesState = {
  clientes: [],
  clienteSeleccionado: null,
  polizasCliente: [],
  stats: {
    totalClientes: 0,
    totalPolizas: 0,
    clientesActivos: 0,
    polizasVencidas: 0,
    polizasVigentes: 0,
    polizasPorVencer: 0,
  },
  loading: false,
  loadingPolizas: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalClientes: 0,
  pageSize: 10,
  searchQuery: '',
  filters: {},
};

export const useClientes = () => {
  // Estado principal
  const [state, setState] = useState<UseClientesState>(initialState);
  
  // Referencias para cancelar requests pendientes
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  
  // Función para cancelar requests pendientes
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Función para cargar clientes con paginación
  const loadClientes = useCallback(async (
    page: number = 1,
    pageSize: number = 10,
    filters?: FilterParams,
    searchQuery?: string
  ) => {
    // Evitar requests duplicados
    if (loadingRef.current) {
      return;
    }

    try {
      // Cancelar request anterior si existe
      cancelPendingRequests();
      
      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();
      
      // Marcar como loading
      loadingRef.current = true;
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));

      // Preparar parámetros de paginación
      const paginationParams: PaginationParams = {
        page,
        limit: pageSize,
        sortBy: 'nombre',
        sortOrder: 'asc'
      };

      // Preparar filtros
      const filterParams: FilterParams = {
        ...filters,
        ...(searchQuery && { search: searchQuery })
      };

      // Hacer la petición al backend
      const response: PagedResult<Cliente> = await clienteService.getClientes(
        paginationParams,
        filterParams
      );

      // Verificar si el request fue cancelado
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Calcular totalPages si no viene del backend
      const totalPages = response.totalPages || Math.ceil(response.totalCount / response.pageSize);

      // Actualizar estado con los resultados
      setState(prev => ({
        ...prev,
        clientes: response.items,
        currentPage: response.pageNumber,
        totalPages: totalPages,
        totalClientes: response.totalCount,
        pageSize: response.pageSize,
        loading: false,
        error: null,
        searchQuery: searchQuery || '',
        filters: filterParams
      }));

    } catch (error) {
      // Solo actualizar error si no fue cancelado
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      }
    } finally {
      loadingRef.current = false;
    }
  }, [cancelPendingRequests]);

  // Función para cargar pólizas de un cliente
  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loadingPolizas: true, 
        error: null 
      }));

      const polizas = await clienteService.getPolizasByCliente(clienteId);
      
      setState(prev => ({
        ...prev,
        polizasCliente: polizas,
        loadingPolizas: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando pólizas';
      setState(prev => ({
        ...prev,
        loadingPolizas: false,
        error: errorMessage
      }));
    }
  }, []);

  // Función para seleccionar un cliente
  const selectCliente = useCallback((cliente: Cliente) => {
    setState(prev => ({ 
      ...prev, 
      clienteSeleccionado: cliente,
      polizasCliente: [] // Limpiar pólizas anteriores
    }));
    
    // Cargar pólizas del cliente seleccionado
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);

  // Función para limpiar cliente seleccionado
  const clearClienteSeleccionado = useCallback(() => {
    setState(prev => ({
      ...prev,
      clienteSeleccionado: null,
      polizasCliente: []
    }));
  }, []);

  // Función para buscar clientes
  const searchClientes = useCallback((query: string) => {
    loadClientes(1, state.pageSize, state.filters, query);
  }, [loadClientes, state.pageSize, state.filters]);

  // Función para cambiar página
  const changePage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      loadClientes(page, state.pageSize, state.filters, state.searchQuery);
    }
  }, [loadClientes, state.pageSize, state.filters, state.searchQuery, state.totalPages]);

  // Función para cambiar tamaño de página
  const changePageSize = useCallback((pageSize: number) => {
    loadClientes(1, pageSize, state.filters, state.searchQuery);
  }, [loadClientes, state.filters, state.searchQuery]);

  // Función para aplicar filtros
  const applyFilters = useCallback((filters: FilterParams) => {
    loadClientes(1, state.pageSize, filters, state.searchQuery);
  }, [loadClientes, state.pageSize, state.searchQuery]);

  // Función para refrescar clientes
  const refreshClientes = useCallback(() => {
    loadClientes(state.currentPage, state.pageSize, state.filters, state.searchQuery);
  }, [loadClientes, state.currentPage, state.pageSize, state.filters, state.searchQuery]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
    
    // Cleanup: cancelar requests pendientes
    return () => {
      cancelPendingRequests();
    };
  }, [loadClientes, cancelPendingRequests]);

  // Funciones de utilidad
  const hasClientes = state.clientes.length > 0;
  const hasPolizas = state.polizasCliente.length > 0;
  const isClienteSelected = state.clienteSeleccionado !== null;

  // Información de paginación
  const paginationInfo = {
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    pageSize: state.pageSize,
    totalClientes: state.totalClientes,
    hasNextPage: state.currentPage < state.totalPages,
    hasPreviousPage: state.currentPage > 1,
    startItem: (state.currentPage - 1) * state.pageSize + 1,
    endItem: Math.min(state.currentPage * state.pageSize, state.totalClientes)
  };

  return {
    // Datos
    clientes: state.clientes,
    clienteSeleccionado: state.clienteSeleccionado,
    polizasCliente: state.polizasCliente,
    stats: state.stats,
    
    // Estados
    loading: state.loading,
    loadingPolizas: state.loadingPolizas,
    error: state.error,
    
    // Paginación
    paginationInfo,
    
    // Filtros
    searchQuery: state.searchQuery,
    filters: state.filters,
    
    // Acciones
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    changePage,
    changePageSize,
    applyFilters,
    refreshClientes,
    clearError,
    
    // Utilidades
    hasClientes,
    hasPolizas,
    isClienteSelected,
  };
};