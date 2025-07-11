// src/hooks/useCliente.ts - SIMPLIFICADO Y CORREGIDO
import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza, PolizaConEndosos } from '../types/poliza';
import { clienteService } from '../services/clienteService';
import { PaginationParams, PaginatedResponse, Stats, PaginationInfo } from '../types/common';

// 🆕 Tipo simple para modal de póliza
type PolizaParaModal = {
  [key: string]: any;
  conpol?: string | number;
  numero?: string | number;
};

interface UseClientesReturn {
  // Datos existentes
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  polizasCliente: PolizaConEndosos[];
  stats: Stats;
  pagination: PaginationInfo;
  loading: boolean;
  loadingPolizas: boolean;
  error: string | null;
  isSearching: boolean;
  searchQuery: string;

  // 🆕 Estados para modales - tipos simplificados
  selectedClienteForModal: Cliente | null;
  selectedPolizaForModal: PolizaParaModal | null;
  clienteModalOpen: boolean;
  polizaModalOpen: boolean;

  // Funciones existentes
  selectCliente: (cliente: Cliente) => void;
  clearClienteSeleccionado: () => void;
  searchClientes: (query: string) => Promise<void>;
  refreshClientes: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  changePageSize: (size: number) => Promise<void>;
  clearSearch: () => Promise<void>;
  
  // 🆕 Funciones para modales - tipos simplificados
  openClienteModal: (cliente: Cliente) => void;
  closeClienteModal: () => void;
  openPolizaModal: (poliza: PolizaParaModal) => void;
  closePolizaModal: () => void;
  
  // Helpers
  hasClientes: boolean;
  hasPolizas: boolean;
  isClienteSelected: boolean;
}

export const useClientes = (): UseClientesReturn => {
  // Estados existentes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [polizasCliente, setPolizasCliente] = useState<PolizaConEndosos[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPolizas, setLoadingPolizas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // 🆕 Estados para modales - tipos simplificados
  const [selectedClienteForModal, setSelectedClienteForModal] = useState<Cliente | null>(null);
  const [selectedPolizaForModal, setSelectedPolizaForModal] = useState<PolizaParaModal | null>(null);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [polizaModalOpen, setPolizaModalOpen] = useState(false);

  // Funciones existentes (mantener todas)
  const loadClientes = useCallback(async (page: number = 1, pageSize: number = 20, query?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando clientes - Página:', page, 'Tamaño:', pageSize, 'Query:', query);
      
      const paginationParams: PaginationParams = {
        page,
        limit: pageSize,
        sortBy: 'clinom',
        sortOrder: 'asc'
      };

      const filters = query ? { search: query } : undefined;
      
      const response: PaginatedResponse<Cliente> = await clienteService.getClientes(paginationParams, filters);
      
      console.log('✅ Respuesta recibida:', {
        items: response.items.length,
        totalCount: response.totalCount,
        currentPage: response.currentPage || response.pageNumber,
        totalPages: response.totalPages
      });
      
      setClientes(response.items);
      setPagination({
        currentPage: response.currentPage || response.pageNumber,
        totalPages: response.totalPages,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        hasNextPage: response.hasNextPage || (response.currentPage || response.pageNumber) < response.totalPages,
        hasPreviousPage: response.hasPreviousPage || (response.currentPage || response.pageNumber) > 1,
      });
      
    } catch (err: any) {
      console.error('❌ Error cargando clientes:', err);
      setError(err.message);
      setClientes([]);
      setPagination(prev => ({ 
        ...prev, 
        totalCount: 0, 
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false 
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  const searchClientesGlobal = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchQuery('');
      await loadClientes(1, pagination.pageSize);
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      console.log('🔍 Búsqueda GLOBAL usando endpoint /search:', query);
      
      const clientes = await clienteService.searchClientes(query.trim());
      
      console.log('✅ Búsqueda completada:', {
        query,
        resultados: clientes.length,
        primerResultado: clientes[0]?.clinom || 'Sin resultados'
      });
      
      setClientes(clientes);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        pageSize: clientes.length,
        totalCount: clientes.length,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      
    } catch (err: any) {
      console.error('❌ Error en búsqueda global:', err);
      
      if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
        setError('La búsqueda está tardando mucho. Intenta con términos más específicos.');
      } else {
        setError(err.message || 'Error en la búsqueda');
      }
      
      setClientes([]);
      setPagination(prev => ({ 
        ...prev, 
        totalCount: 0, 
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false 
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, loadClientes]);

  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    setLoadingPolizas(true);
    setError(null);
    try {
      console.log('🔄 Cargando pólizas para cliente:', clienteId);
      
      if (typeof clienteService.getPolizasByCliente === 'function') {
        const polizasRaw = await clienteService.getPolizasByCliente(clienteId);
        console.log('✅ Pólizas RAW recibidas:', polizasRaw.length);
        
        // Filtrar antecedentes
        const polizasSinAntecedentes = polizasRaw.filter((poliza: any) => {
          const convig = poliza.convig || poliza.Convig;
          const esAntecedente = convig === "2" || convig === 2;
          return !esAntecedente;
        });
        
        // 🆕 Simplificar - solo asignar directamente como PolizaConEndosos
        const polizasMap = new Map<string, any>();
        
        polizasSinAntecedentes.forEach((poliza: any) => {
          const numeroPoliza = String(poliza.conpol || poliza.Conpol || poliza.numero || '');
          if (!numeroPoliza) return;
          
          if (!polizasMap.has(numeroPoliza)) {
            polizasMap.set(numeroPoliza, poliza);
          }
        });
        
        const polizasDeduplicadas = Array.from(polizasMap.values()) as PolizaConEndosos[];
        setPolizasCliente(polizasDeduplicadas);
      } else {
        console.warn('⚠️ Método getPolizasByCliente no implementado');
        setPolizasCliente([]);
      }
    } catch (err: any) {
      console.error('❌ Error cargando pólizas:', err);
      setError(err.message);
      setPolizasCliente([]);
    } finally {
      setLoadingPolizas(false);
    }
  }, []);

  const selectCliente = useCallback((cliente: Cliente) => {
    console.log('👤 Cliente seleccionado:', cliente.clinom);
    setClienteSeleccionado(cliente);
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);

  const clearClienteSeleccionado = useCallback(() => {
    console.log('🧹 Limpiando selección de cliente');
    setClienteSeleccionado(null);
    setPolizasCliente([]);
  }, []);

  const searchClientes = useCallback(async (query: string) => {
    console.log('🔍 Iniciando búsqueda:', query);
    await searchClientesGlobal(query);
  }, [searchClientesGlobal]);

  const refreshClientes = useCallback(async () => {
    console.log('🔄 Refrescando...');
    if (isSearching && searchQuery) {
      await searchClientesGlobal(searchQuery);
    } else {
      await loadClientes(pagination.currentPage, pagination.pageSize);
    }
  }, [isSearching, searchQuery, searchClientesGlobal, loadClientes, pagination.currentPage, pagination.pageSize]);

  const loadPage = useCallback(async (page: number) => {
    if (isSearching) {
      console.log('⚠️ No se puede paginar durante búsqueda');
      return;
    }
    console.log('📄 Cargando página:', page);
    await loadClientes(page, pagination.pageSize);
  }, [isSearching, loadClientes, pagination.pageSize]);

  const changePageSize = useCallback(async (size: number) => {
    if (isSearching) {
      console.log('⚠️ No se puede cambiar tamaño durante búsqueda');
      return;
    }
    console.log('📏 Cambiando tamaño de página:', size);
    await loadClientes(1, size);
  }, [isSearching, loadClientes]);

  const clearSearch = useCallback(async () => {
    console.log('🧹 Limpiando búsqueda');
    setIsSearching(false);
    setSearchQuery('');
    await loadClientes(1, 20); 
  }, [loadClientes]);

  // 🆕 Funciones para modales - simplificadas
  const openClienteModal = useCallback((cliente: Cliente) => {
    console.log('🔍 Abriendo modal de cliente:', cliente.clinom);
    setSelectedClienteForModal(cliente);
    setClienteModalOpen(true);
  }, []);

  const closeClienteModal = useCallback(() => {
    console.log('❌ Cerrando modal de cliente');
    setClienteModalOpen(false);
    setSelectedClienteForModal(null);
  }, []);

  const openPolizaModal = useCallback((poliza: PolizaParaModal) => {
    console.log('🔍 Abriendo modal de póliza:', poliza.conpol || poliza.numero);
    setSelectedPolizaForModal(poliza);
    setPolizaModalOpen(true);
  }, []);

  const closePolizaModal = useCallback(() => {
    console.log('❌ Cerrando modal de póliza');
    setPolizaModalOpen(false);
    setSelectedPolizaForModal(null);
  }, []);

  // Carga inicial
  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  // Computed values
  const hasClientes = clientes.length > 0;
  const hasPolizas = polizasCliente.length > 0;
  const isClienteSelected = clienteSeleccionado !== null;
  
  const stats: Stats = {
    totalClientes: pagination.totalCount,
    totalPolizas: polizasCliente.length,
  };

  return {
    // Datos existentes
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    pagination,
    loading,
    loadingPolizas,
    error,
    isSearching,
    searchQuery,

    // 🆕 Estados para modales
    selectedClienteForModal,
    selectedPolizaForModal,
    clienteModalOpen,
    polizaModalOpen,

    // Funciones existentes
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    loadPage,
    changePageSize,
    clearSearch,
    
    // 🆕 Funciones para modales
    openClienteModal,
    closeClienteModal,
    openPolizaModal,
    closePolizaModal,
    
    // Helpers
    hasClientes,
    hasPolizas,
    isClienteSelected,
  };
};