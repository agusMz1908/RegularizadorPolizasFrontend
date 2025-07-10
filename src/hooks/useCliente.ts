import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { clienteService, PaginatedResponse, PaginationParams } from '../services/clienteService';

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
    pageSize: parseInt(import.meta.env.VITE_CLIENTES_PAGE_SIZE) || 25,
    totalCount: 0,
  });

  // ✅ Función principal para cargar clientes (usa tu API optimizada)
  const loadClientes = useCallback(async (page: number = 1, pageSize: number = 25, query?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 useClientes: Cargando clientes - Página:', page, 'Tamaño:', pageSize, 'Query:', query);
      
      // ✅ Usar el clienteService actualizado
      const response: PaginatedResponse<Cliente> = await clienteService.getClientes({
        page,
        pageSize,
        search: query
      });
      
      console.log('✅ useClientes: Respuesta recibida:', {
        items: response.items?.length || 0,
        totalCount: response.totalCount || 0,
        currentPage: response.currentPage || page,
        totalPages: response.totalPages || 1
      });
      
      // ✅ Validar respuesta antes de usar
      if (response && response.items) {
        setClientes(response.items);
        setPagination({
          currentPage: response.currentPage || response.pageNumber || page,
          totalPages: response.totalPages || 1,
          pageSize: response.pageSize || pageSize,
          totalCount: response.totalCount || 0,
        });
      } else {
        console.warn('⚠️ useClientes: Respuesta vacía o inválida');
        setClientes([]);
        setPagination(prev => ({ 
          ...prev, 
          currentPage: page,
          totalCount: 0, 
          totalPages: 1 
        }));
      }
      
    } catch (err: any) {
      console.error('❌ useClientes: Error cargando clientes:', err);
      setError(err.message || 'Error desconocido cargando clientes');
      setClientes([]);
      setPagination(prev => ({ 
        ...prev, 
        currentPage: page,
        totalCount: 0, 
        totalPages: 1 
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Cargar pólizas de un cliente (usa tu nuevo endpoint paginado)
  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    setLoadingPolizas(true);
    setError(null);
    
    try {
      console.log('🔄 useClientes: Cargando pólizas para cliente:', clienteId);
      
      // ✅ Usar el nuevo endpoint paginado de pólizas por cliente
      const response = await clienteService.getPolizasByCliente(clienteId, {
        page: 1,
        pageSize: 10
      });
setPolizasCliente(response.items);
      
      console.log('✅ useClientes: Pólizas cargadas:', response.items?.length || 0);
      
      if (response && response.items) {
        setPolizasCliente(response.items);
      } else {
        console.warn('⚠️ useClientes: No se encontraron pólizas para el cliente');
        setPolizasCliente([]);
      }
      
    } catch (err: any) {
      console.error('❌ useClientes: Error cargando pólizas:', err);
      setError(err.message || 'Error cargando pólizas del cliente');
      setPolizasCliente([]);
    } finally {
      setLoadingPolizas(false);
    }
  }, []);

  // ✅ Seleccionar cliente
  const selectCliente = useCallback((cliente: Cliente) => {
    console.log('👤 useClientes: Cliente seleccionado:', cliente.nombre || cliente.clinom);
    setClienteSeleccionado(cliente);
    
    // Cargar pólizas del cliente seleccionado
    if (cliente.id) {
      loadPolizasCliente(cliente.id);
    }
  }, [loadPolizasCliente]);

  // ✅ Limpiar selección
  const clearClienteSeleccionado = useCallback(() => {
    console.log('🧹 useClientes: Limpiando selección de cliente');
    setClienteSeleccionado(null);
    setPolizasCliente([]);
  }, []);

  // ✅ Buscar clientes
  const searchClientes = useCallback(async (query: string) => {
    console.log('🔍 useClientes: Buscando clientes:', query);
    setSearchQuery(query);
    await loadClientes(1, pagination.pageSize, query.trim() || undefined);
  }, [loadClientes, pagination.pageSize]);

  // ✅ Refrescar clientes
  const refreshClientes = useCallback(async () => {
    console.log('🔄 useClientes: Refrescando lista de clientes...');
    await loadClientes(pagination.currentPage, pagination.pageSize, searchQuery || undefined);
  }, [loadClientes, pagination.currentPage, pagination.pageSize, searchQuery]);

  // ✅ Cargar página específica
  const loadPage = useCallback(async (page: number) => {
    console.log('📄 useClientes: Cargando página:', page);
    await loadClientes(page, pagination.pageSize, searchQuery || undefined);
  }, [loadClientes, pagination.pageSize, searchQuery]);

  // ✅ Cambiar tamaño de página
  const changePageSize = useCallback(async (size: number) => {
    console.log('📏 useClientes: Cambiando tamaño de página:', size);
    setPagination(prev => ({ ...prev, pageSize: size }));
    await loadClientes(1, size, searchQuery || undefined);
  }, [loadClientes, searchQuery]);

  // ✅ Carga inicial
  useEffect(() => {
    console.log('🚀 useClientes: Inicializando hook...');
    loadClientes();
  }, []); // Solo al montar el componente

  // ✅ Computed values con valores por defecto seguros
  const hasClientes = Array.isArray(clientes) && clientes.length > 0;
  const hasPolizas = Array.isArray(polizasCliente) && polizasCliente.length > 0;
  const isClienteSelected = clienteSeleccionado !== null;
  
  const stats = {
    totalClientes: pagination.totalCount || 0,
    totalPolizas: polizasCliente?.length || 0,
  };

  return {
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    pagination,
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