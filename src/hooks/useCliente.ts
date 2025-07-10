// src/hooks/useCliente.ts - CON PAGINACIÓN REAL DEL BACKEND
import { useState, useEffect, useCallback, useRef } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza, mapPolizaResumidaToPoliza } from '../types/poliza';
import { velneoClienteService } from '../services/velneoClienteService';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [polizasCliente, setPolizasCliente] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPolizas, setLoadingPolizas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ NUEVO: Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalPolizas, setTotalPolizas] = useState(0);
  const [pageSize] = useState(50); // Tamaño fijo por ahora
  
  // Refs para evitar múltiples requests simultáneos
  const loadingRef = useRef(false);
  const loadingPolizasRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función para cancelar requests pendientes
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  // ✅ ACTUALIZADO: Cargar página específica de clientes
  const loadClientes = useCallback(async (page: number = 1, force: boolean = false) => {
    if (loadingRef.current && !force) {
      console.log('⚠️ loadClientes ya está ejecutándose, saltando...');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    const signal = cancelPendingRequests();

    try {
      console.log('🔄 Cargando clientes - Página:', page);
      
      // Cargar página de clientes y conteo total en paralelo
      const [clientesData, totalCount] = await Promise.all([
        velneoClienteService.getClientes(page, pageSize),
        velneoClienteService.getClientesCount()
      ]);
      
      if (signal.aborted) {
        console.log('❌ Request cancelado');
        return;
      }
      
      console.log('✅ Resultados encontrados:', result.clientes.length);
      setClientes(result.clientes);
      setTotalClientes(result.total);
      setCurrentPage(1);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('❌ Búsqueda cancelada por AbortController');
        return;
      }
      console.error('❌ Error buscando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize, loadClientes, cancelPendingRequests]);

  const refreshClientes = useCallback(() => {
    console.log('🔄 Refrescando lista de clientes...');
    loadClientes(currentPage, true);
  }, [loadClientes, currentPage]);

  const refreshPolizas = useCallback(() => {
    if (clienteSeleccionado) {
      console.log('🔄 Refrescando pólizas del cliente seleccionado...');
      loadPolizasCliente(clienteSeleccionado.id);
    }
  }, [clienteSeleccionado, loadPolizasCliente]);

  // ✅ NUEVO: Navegación de páginas
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= Math.ceil(totalClientes / pageSize)) {
      loadClientes(page, true);
    }
  }, [totalClientes, pageSize, loadClientes]);

  const getClienteById = useCallback(async (id: number): Promise<Cliente | null> => {
    try {
      console.log('🔍 Obteniendo cliente por ID:', id);
      return await velneoClienteService.getClienteById(id);
    } catch (err: any) {
      console.error('❌ Error obteniendo cliente:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // ✅ STATS actualizados
  const stats = {
    totalClientes,
    clientesActivos: clientes.filter(c => c.activo).length,
    clientesPagina: clientes.length,
    totalPolizas,
    polizasVigentes: polizasCliente.filter(p => p.estado === 'Vigente').length,
    polizasPendientes: polizasCliente.filter(p => p.estado === 'Pendiente').length,
    polizasVencidas: polizasCliente.filter(p => p.estado === 'Vencida').length,
    paginaActual: currentPage,
    totalPaginas: Math.ceil(totalClientes / pageSize),
  };

  // ✅ SOLO UNA VEZ al montar el componente
  useEffect(() => {
    loadClientes(1);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadClientes]);

  // Limpiar error cuando hay clientes
  useEffect(() => {
    if (clientes.length > 0) {
      setError(null);
    }
  }, [clientes.length]);

  return {
    // Estado
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    
    // Estados de carga
    loading,
    loadingPolizas,
    error,
    
    // Paginación
    currentPage,
    totalClientes,
    totalPolizas,
    pageSize,
    
    // Acciones de clientes
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    getClienteById,
    goToPage,
    
    // Acciones de pólizas
    refreshPolizas,
    
    // Banderas de estado
    hasClientes: clientes.length > 0,
    hasPolizas: polizasCliente.length > 0,
    isClienteSelected: !!clienteSeleccionado,
    hasNextPage: currentPage < Math.ceil(totalClientes / pageSize),
    hasPreviousPage: currentPage > 1,
  };
}; Clientes cargados - Página:', page, 'Total:', totalCount);
      setClientes(clientesData);
      setTotalClientes(totalCount);
      setCurrentPage(page);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('❌ Request cancelado por AbortController');
        return;
      }
      console.error('❌ Error cargando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pageSize, cancelPendingRequests]);

  // ✅ ACTUALIZADO: Cargar pólizas con conteo
  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    if (loadingPolizasRef.current) {
      console.log('⚠️ loadPolizasCliente ya está ejecutándose, saltando...');
      return;
    }

    loadingPolizasRef.current = true;
    setLoadingPolizas(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando pólizas para cliente:', clienteId);
      
      // Cargar pólizas y conteo en paralelo
      const [polizasData, totalCount] = await Promise.all([
        velneoClienteService.getPolizasByCliente(clienteId, 1),
        velneoClienteService.getPolizasCountByCliente(clienteId)
      ]);
      
      // Mapear las pólizas si vienen en formato DTO
      const polizasMapped = polizasData.map(poliza => {
        if ('fechaInicio' in poliza && 'fechaVencimiento' in poliza) {
          return poliza as Poliza;
        }
        
        const mapped = mapPolizaResumidaToPoliza(poliza as any);
        mapped.clienteId = clienteId;
        return mapped;
      });
      
      console.log('✅ Pólizas cargadas y mapeadas:', polizasMapped.length, 'Total:', totalCount);
      setPolizasCliente(polizasMapped);
      setTotalPolizas(totalCount);
    } catch (err: any) {
      console.error('❌ Error cargando pólizas:', err);
      setError(err.message);
      setPolizasCliente([]);
      setTotalPolizas(0);
    } finally {
      setLoadingPolizas(false);
      loadingPolizasRef.current = false;
    }
  }, []);

  const selectCliente = useCallback((cliente: Cliente) => {
    console.log('👤 Cliente seleccionado:', cliente.nombre);
    setClienteSeleccionado(cliente);
    setPolizasCliente([]);
    setTotalPolizas(0);
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);

  const clearClienteSeleccionado = useCallback(() => {
    console.log('🧹 Limpiando selección de cliente');
    setClienteSeleccionado(null);
    setPolizasCliente([]);
    setTotalPolizas(0);
  }, []);

  // ✅ ACTUALIZADO: Búsqueda con paginación
  const searchClientes = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadClientes(1, true);
      return;
    }

    setLoading(true);
    setError(null);
    const signal = cancelPendingRequests();
    
    try {
      console.log('🔍 Buscando clientes:', query);
      const result = await velneoClienteService.searchClientes(query, 1, pageSize);
      
      if (signal.aborted) {
        console.log('❌ Búsqueda cancelada');
        return;
      }
      
      console.log('✅ Resultados encontrados:', result.clientes.length);
      setClientes(result.clientes);
      setTotalClientes(result.total);
      setCurrentPage(1);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('❌ Búsqueda cancelada por AbortController');
        return;
      }
      console.error('❌ Error buscando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize, loadClientes, cancelPendingRequests]);

  const refreshClientes = useCallback(() => {
    console.log('🔄 Refrescando lista de clientes...');
    loadClientes(currentPage, true);
  }, [loadClientes, currentPage]);

  const refreshPolizas = useCallback(() => {
    if (clienteSeleccionado) {
      console.log('🔄 Refrescando pólizas del cliente seleccionado...');
      loadPolizasCliente(clienteSeleccionado.id);
    }
  }, [clienteSeleccionado, loadPolizasCliente]);

  // ✅ NUEVO: Navegación de páginas
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= Math.ceil(totalClientes / pageSize)) {
      loadClientes(page, true);
    }
  }, [totalClientes, pageSize, loadClientes]);

  const getClienteById = useCallback(async (id: number): Promise<Cliente | null> => {
    try {
      console.log('🔍 Obteniendo cliente por ID:', id);
      return await velneoClienteService.getClienteById(id);
    } catch (err: any) {
      console.error('❌ Error obteniendo cliente:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // ✅ STATS actualizados
  const stats = {
    totalClientes,
    clientesActivos: clientes.filter(c => c.activo).length,
    clientesPagina: clientes.length,
    totalPolizas,
    polizasVigentes: polizasCliente.filter(p => p.estado === 'Vigente').length,
    polizasPendientes: polizasCliente.filter(p => p.estado === 'Pendiente').length,
    polizasVencidas: polizasCliente.filter(p => p.estado === 'Vencida').length,
    paginaActual: currentPage,
    totalPaginas: Math.ceil(totalClientes / pageSize),
  };

  // ✅ SOLO UNA VEZ al montar el componente
  useEffect(() => {
    loadClientes(1);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadClientes]);

  // Limpiar error cuando hay clientes
  useEffect(() => {
    if (clientes.length > 0) {
      setError(null);
    }
  }, [clientes.length]);

  return {
    // Estado
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    
    // Estados de carga
    loading,
    loadingPolizas,
    error,
    
    // Paginación
    currentPage,
    totalClientes,
    totalPolizas,
    pageSize,
    
    // Acciones de clientes
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    getClienteById,
    goToPage,
    
    // Acciones de pólizas
    refreshPolizas,
    
    // Banderas de estado
    hasClientes: clientes.length > 0,
    hasPolizas: polizasCliente.length > 0,
    isClienteSelected: !!clienteSeleccionado,
    hasNextPage: currentPage < Math.ceil(totalClientes / pageSize),
    hasPreviousPage: currentPage > 1,
  };
}; Resultados encontrados:', resultados.length);
      setClientes(resultados);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('❌ Búsqueda cancelada por AbortController');
        return;
      }
      console.error('❌ Error buscando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar re-creación

  const refreshClientes = useCallback(() => {
    console.log('🔄 Refrescando lista de clientes...');
    loadClientes(true); // Forzar recarga
  }, [loadClientes]);

  const refreshPolizas = useCallback(() => {
    if (clienteSeleccionado) {
      console.log('🔄 Refrescando pólizas del cliente seleccionado...');
      loadPolizasCliente(clienteSeleccionado.id);
    }
  }, [clienteSeleccionado, loadPolizasCliente]);

  const getClienteById = useCallback(async (id: number): Promise<Cliente | null> => {
    try {
      console.log('🔍 Obteniendo cliente por ID:', id);
      return await velneoClienteService.getClienteById(id);
    } catch (err: any) {
      console.error('❌ Error obteniendo cliente:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // ✅ Funciones adicionales para pólizas
  const getPolizaById = useCallback(async (polizaId: number): Promise<Poliza | null> => {
    try {
      console.log('🔍 Obteniendo póliza por ID:', polizaId);
      // Buscar primero en las pólizas cargadas
      const polizaLocal = polizasCliente.find(p => p.id === polizaId);
      if (polizaLocal) {
        return polizaLocal;
      }
      
      // Si no está, hacer request al backend
      // TODO: Implementar getPolizaById en el servicio si es necesario
      console.warn('getPolizaById no implementado en el servicio');
      return null;
    } catch (err: any) {
      console.error('❌ Error obteniendo póliza:', err);
      setError(err.message);
      return null;
    }
  }, [polizasCliente]);

  const createPoliza = useCallback(async (polizaData: any): Promise<Poliza | null> => {
    try {
      console.log('🔄 Creando nueva póliza...');
      // TODO: Implementar createPoliza en el servicio
      console.warn('createPoliza no implementado en el servicio');
      return null;
    } catch (err: any) {
      console.error('❌ Error creando póliza:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const updatePoliza = useCallback(async (polizaId: number, polizaData: any): Promise<Poliza | null> => {
    try {
      console.log('🔄 Actualizando póliza:', polizaId);
      // TODO: Implementar updatePoliza en el servicio
      console.warn('updatePoliza no implementado en el servicio');
      return null;
    } catch (err: any) {
      console.error('❌ Error actualizando póliza:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const deletePoliza = useCallback(async (polizaId: number): Promise<boolean> => {
    try {
      console.log('🔄 Eliminando póliza:', polizaId);
      // TODO: Implementar deletePoliza en el servicio
      console.warn('deletePoliza no implementado en el servicio');
      return false;
    } catch (err: any) {
      console.error('❌ Error eliminando póliza:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const stats = {
    totalClientes: clientes.length,
    clientesActivos: clientes.filter(c => c.activo).length,
    totalPolizas: polizasCliente.length,
    polizasVigentes: polizasCliente.filter(p => p.estado === 'Vigente').length,
    polizasPendientes: polizasCliente.filter(p => p.estado === 'Pendiente').length,
    polizasVencidas: polizasCliente.filter(p => p.estado === 'Vencida').length,
  };

  // ✅ SOLO UNA VEZ al montar el componente
  useEffect(() => {
    loadClientes();
    
    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Dependencias vacías intencionalmente

  // Limpiar error cuando hay clientes
  useEffect(() => {
    if (clientes.length > 0) {
      setError(null);
    }
  }, [clientes.length]); // Solo depende de la longitud

  return {
    // Estado
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    
    // Estados de carga
    loading,
    loadingPolizas,
    error,
    
    // Acciones de clientes
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    getClienteById,
    
    // Acciones de pólizas
    refreshPolizas,
    getPolizaById,
    createPoliza,
    updatePoliza,
    deletePoliza,
    
    // Banderas de estado
    hasClientes: clientes.length > 0,
    hasPolizas: polizasCliente.length > 0,
    isClienteSelected: !!clienteSeleccionado,
  };
};