import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza, PolizaConEndosos } from '../types/poliza';
import { clienteService } from '../services/clienteService';
import { PaginationParams, PaginatedResponse, Stats, PaginationInfo } from '../types/common';
import apiService from '../services/api';

interface UseClientesReturn {
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

  selectCliente: (cliente: Cliente) => void;
  clearClienteSeleccionado: () => void;
  searchClientes: (query: string) => Promise<void>;
  refreshClientes: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  changePageSize: (size: number) => Promise<void>;
  
  clearSearch: () => Promise<void>;
  
  hasClientes: boolean;
  hasPolizas: boolean;
  isClienteSelected: boolean;
}

export const useClientes = (): UseClientesReturn => {
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
    console.log('🔍 Búsqueda GLOBAL usando método existente:', query);
    
    // ✅ Usar el método getClientes existente que YA funciona
    // Solo cambiar el pageSize a 1000 para obtener más resultados
    const paginationParams: PaginationParams = {
      page: 1,
      limit: 1000, // 🆕 Límite alto para búsqueda completa
      sortBy: 'clinom',
      sortOrder: 'asc'
    };

    const filters = { search: query.trim() }; // 🆕 Usar 'search' como en el método normal
    
    const response: PaginatedResponse<Cliente> = await clienteService.getClientes(paginationParams, filters);
    
    console.log('✅ Búsqueda completada:', {
      query,
      resultados: response.items.length,
      totalResultados: response.totalCount,
      primerResultado: response.items[0]?.clinom || 'Sin resultados'
    });
    
    setClientes(response.items);
    setPagination({
      currentPage: 1,
      totalPages: 1, // Una sola página con todos los resultados
      pageSize: response.items.length,
      totalCount: response.items.length, // Total mostrado
      hasNextPage: false,
      hasPreviousPage: false,
    });
    
  } catch (err: any) {
    console.error('❌ Error en búsqueda global:', err);
    
    // 🆕 Mensaje de error más claro
    if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
      setError('La búsqueda está tardando mucho. Intenta con un término más específico.');
    } else {
      setError(`Error en búsqueda: ${err.message}`);
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
      
      // 🆕 FILTRAR ANTECEDENTES usando el campo convig
      const polizasSinAntecedentes = polizasRaw.filter((poliza: any) => {
        const convig = poliza.convig || poliza.Convig;
        const esAntecedente = convig === "2" || convig === 2; // Estado 2 = ANT
        
        console.log(`🔍 Póliza ${poliza.conpol}:`, {
          numero: poliza.conpol,
          convig: convig,
          esAntecedente: esAntecedente,
          accion: esAntecedente ? '🚫 EXCLUIR' : '✅ INCLUIR'
        });
        
        return !esAntecedente;
      });
      
      console.log('📋 Resultado del filtro:', {
        original: polizasRaw.length,
        sinAntecedentes: polizasSinAntecedentes.length,
        antecedentesEliminados: polizasRaw.length - polizasSinAntecedentes.length
      });
      
      // 🆕 DEDUPLICACIÓN (sobre pólizas sin antecedentes)
      const polizasMap = new Map<string, PolizaConEndosos>();
      
      polizasSinAntecedentes.forEach((poliza: any) => {
        const numeroPoliza = poliza.conpol || poliza.Conpol || poliza.numero;
        const numeroEndoso = parseInt(poliza.conend || poliza.Conend || poliza.endoso || '0');
        const fechaEndoso = poliza.confchdes || poliza.Confchdes || poliza.fechaDesde;
        
        if (!numeroPoliza) return;
        
        const polizaExistente = polizasMap.get(numeroPoliza);
        
        if (!polizaExistente) {
          // Primera vez que vemos esta póliza
          const polizaConEndosos: PolizaConEndosos = {
            ...poliza,
            conpol: String(numeroPoliza),
            conend: String(poliza.conend || poliza.Conend || poliza.endoso || '0'),
            numero: String(numeroPoliza),
            endoso: String(poliza.conend || poliza.Conend || poliza.endoso || '0'),
            totalEndosos: 1,
            endosos: [poliza]
          };
          polizasMap.set(numeroPoliza, polizaConEndosos);
        } else {
          // Ya existe esta póliza
          const endosoExistente = parseInt(String(polizaExistente.conend || '0'));
          const fechaExistente = polizaExistente.confchdes || polizaExistente.Confchdes;
          
          polizaExistente.totalEndosos = (polizaExistente.totalEndosos || 0) + 1;
          polizaExistente.endosos = polizaExistente.endosos || [];
          polizaExistente.endosos.push(poliza);
          
          const esMasReciente = numeroEndoso > endosoExistente || 
                               (!fechaExistente && fechaEndoso) ||
                               (fechaEndoso && fechaExistente && new Date(fechaEndoso) > new Date(fechaExistente));
          
          if (esMasReciente) {
            const endosos = polizaExistente.endosos;
            const totalEndosos = polizaExistente.totalEndosos;
            
            const polizaActualizada: PolizaConEndosos = {
              ...poliza,
              conpol: String(numeroPoliza),
              conend: String(poliza.conend || poliza.Conend || poliza.endoso || '0'),
              numero: String(numeroPoliza),
              endoso: String(poliza.conend || poliza.Conend || poliza.endoso || '0'),
              totalEndosos,
              endosos
            };
            
            polizasMap.set(numeroPoliza, polizaActualizada);
          }
        }
      });
      
      const polizasDeduplicadas = Array.from(polizasMap.values()).map(poliza => ({
        ...poliza,
        endosos: (poliza.endosos || []).sort((a: any, b: any) => {
          const endosoA = parseInt(String(a.conend || a.Conend || '0'));
          const endosoB = parseInt(String(b.conend || b.Conend || '0'));
          return endosoB - endosoA;
        })
      }));
      
      console.log('✅ Resultado final:', {
        polizasRaw: polizasRaw.length,
        sinAntecedentes: polizasSinAntecedentes.length,
        deduplicadas: polizasDeduplicadas.length,
        deberianSerTres: polizasDeduplicadas.length === 3 ? '✅ CORRECTO - 3 pólizas' : `❌ INCORRECTO - ${polizasDeduplicadas.length} pólizas`
      });
      
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

  // Carga inicial
  useEffect(() => {
    loadClientes();
  }, []);

  // Carga inicial
  useEffect(() => {
    loadClientes();
  }, []);

  // Computed values
  const hasClientes = clientes.length > 0;
  const hasPolizas = polizasCliente.length > 0;
  const isClienteSelected = clienteSeleccionado !== null;
  
  const stats: Stats = {
    totalClientes: pagination.totalCount,
    totalPolizas: polizasCliente.length,
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
    isSearching,
    searchQuery,
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    clearSearch,
    refreshClientes,
    loadPage,
    changePageSize,
    hasClientes,
    hasPolizas,
    isClienteSelected,
  };
};