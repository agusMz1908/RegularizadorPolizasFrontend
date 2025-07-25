import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

// ============================================================================
// 🎯 TIPOS DEL HOOK
// ============================================================================

export interface Cliente {
  id: string;
  nombre: string;
  apellido?: string;
  documento: string;
  tipoDocumento: 'CI' | 'RUC' | 'PASAPORTE';
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  empresaId?: number;
  estado: 'activo' | 'inactivo' | 'suspendido';
  fechaCreacion: string;
  fechaModificacion: string;
  // Metadatos adicionales
  polizasCount?: number;
  ultimaPoliza?: string;
  riesgoLevel?: 'bajo' | 'medio' | 'alto';
}

export interface SearchFilters {
  query?: string;
  tipoDocumento?: 'CI' | 'RUC' | 'PASAPORTE' | 'todos';
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'todos';
  empresaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  conPolizas?: boolean;
  riesgoLevel?: 'bajo' | 'medio' | 'alto' | 'todos';
}

export interface SearchResult {
  clientes: Cliente[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  searchTime: number;
}

export interface SearchStats {
  totalSearches: number;
  averageTime: number;
  cacheHits: number;
  lastSearch: Date | null;
  mostSearched: string[];
}

export interface UseClienteSearchConfig {
  // Configuración de búsqueda
  apiEndpoint?: string;
  debounceMs?: number;
  minQueryLength?: number;
  pageSize?: number;
  maxCacheSize?: number;
  cacheExpiration?: number; // en ms
  
  // Configuración de filtros
  enableFilters?: boolean;
  defaultFilters?: SearchFilters;
  enableAdvancedSearch?: boolean;
  
  // Configuración de comportamiento
  searchOnMount?: boolean;
  clearOnUnmount?: boolean;
  autoSelectSingle?: boolean;
  trackStats?: boolean;
  
  // Callbacks
  onSearchStart?: (query: string, filters: SearchFilters) => void;
  onSearchComplete?: (result: SearchResult) => void;
  onSearchError?: (error: string) => void;
  onClienteSelect?: (cliente: Cliente) => void;
  onCacheHit?: (query: string) => void;
}

export interface UseClienteSearchReturn {
  // Estado de búsqueda
  isSearching: boolean;
  isLoading: boolean;
  query: string;
  filters: SearchFilters;
  
  // Resultados
  clientes: Cliente[];
  totalResults: number;
  hasMore: boolean;
  selectedCliente: Cliente | null;
  
  // Paginación
  currentPage: number;
  pageSize: number;
  totalPages: number;
  
  // Acciones principales
  search: (query: string, newFilters?: SearchFilters) => Promise<void>;
  searchById: (id: string) => Promise<Cliente | null>;
  searchByDocument: (documento: string, tipo?: string) => Promise<Cliente | null>;
  clearSearch: () => void;
  
  // Paginación
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  
  // Filtros
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  
  // Selección
  selectCliente: (cliente: Cliente) => void;
  clearSelection: () => void;
  
  // Cache y estadísticas
  clearCache: () => void;
  getSearchStats: () => SearchStats;
  
  // Utilidades
  exportResults: () => any;
  getRecentSearches: () => string[];
  getSuggestions: (partial: string) => string[];
  
  // Estado
  error: string | null;
  lastSearchTime: number;
  stats: SearchStats | null;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useClienteSearch = (
  config: UseClienteSearchConfig = {}
): UseClienteSearchReturn => {

  const {
    apiEndpoint = '/api/clientes/search',
    debounceMs = 300,
    minQueryLength = 2,
    pageSize = 20,
    maxCacheSize = 100,
    cacheExpiration = 5 * 60 * 1000, // 5 minutos
    enableFilters = true,
    defaultFilters = {},
    enableAdvancedSearch = true,
    searchOnMount = false,
    clearOnUnmount = true,
    autoSelectSingle = false,
    trackStats = true,
    onSearchStart,
    onSearchComplete,
    onSearchError,
    onClienteSelect,
    onCacheHit
  } = config;

  // ============================================================================
  // 📊 ESTADO DEL HOOK
  // ============================================================================

  // Estados principales
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters });
  
  // Resultados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Cache y estado
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [stats, setStats] = useState<SearchStats | null>(null);
  
  // Referencias
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: SearchResult; timestamp: number }>>(new Map());
  const recentSearchesRef = useRef<string[]>([]);
  const searchHistoryRef = useRef<{ query: string; timestamp: number; resultCount: number }[]>([]);

  // ============================================================================
  // 🔍 FUNCIONES DE BÚSQUEDA
  // ============================================================================

  /**
   * Función principal de búsqueda
   */
  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters = {},
    page: number = 1,
    append: boolean = false
  ): Promise<void> => {
    // Validaciones iniciales
    if (searchQuery.length < minQueryLength && searchQuery.length > 0) {
      return;
    }

    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setIsSearching(true);
    setError(null);
    if (!append) {
      setClientes([]);
    }

    const startTime = Date.now();
    
    try {
      // Construir clave de cache
      const cacheKey = JSON.stringify({ query: searchQuery, filters: searchFilters, page });
      
      // Verificar cache
      const cachedResult = cacheRef.current.get(cacheKey);
      const now = Date.now();
      
      if (cachedResult && (now - cachedResult.timestamp) < cacheExpiration) {
        // Usar resultado cacheado
        const result = cachedResult.data;
        
        if (append) {
          setClientes(prev => [...prev, ...result.clientes]);
        } else {
          setClientes(result.clientes);
        }
        
        setTotalResults(result.total);
        setHasMore(result.hasMore);
        setCurrentPage(result.page);
        setTotalPages(Math.ceil(result.total / pageSize));
        
        onCacheHit?.(cacheKey);
        onSearchComplete?.(result);
        
        return;
      }

      // Notificar inicio de búsqueda
      onSearchStart?.(searchQuery, searchFilters);

      // Construir parámetros de búsqueda
      const searchParams = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(searchFilters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== 'todos') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      // Realizar búsqueda HTTP
      const response = await fetch(`${apiEndpoint}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      const result: SearchResult = {
        clientes: data.clientes || [],
        total: data.total || 0,
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        hasMore: data.hasMore || false,
        searchTime: Date.now() - startTime
      };

      // Actualizar estado
      if (append) {
        setClientes(prev => [...prev, ...result.clientes]);
      } else {
        setClientes(result.clientes);
      }
      
      setTotalResults(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(result.page);
      setTotalPages(Math.ceil(result.total / pageSize));
      setLastSearchTime(result.searchTime);

      // Auto-selección si solo hay un resultado
      if (autoSelectSingle && result.clientes.length === 1 && !append) {
        setSelectedCliente(result.clientes[0]);
        onClienteSelect?.(result.clientes[0]);
      }

      // Actualizar cache
      if (cacheRef.current.size >= maxCacheSize) {
        // Limpiar entradas más antiguas
        const entries = Array.from(cacheRef.current.entries());
        entries.sort(([,a], [,b]) => a.timestamp - b.timestamp);
        const toDelete = entries.slice(0, Math.floor(maxCacheSize / 2));
        toDelete.forEach(([key]) => cacheRef.current.delete(key));
      }
      
      cacheRef.current.set(cacheKey, { data: result, timestamp: now });

      // Actualizar historial de búsquedas
      if (searchQuery.trim() && !recentSearchesRef.current.includes(searchQuery)) {
        recentSearchesRef.current.unshift(searchQuery);
        recentSearchesRef.current = recentSearchesRef.current.slice(0, 10); // Mantener solo 10
      }

      // Actualizar estadísticas
      if (trackStats) {
        updateStats(searchQuery, result.searchTime, false);
      }

      // Notificar completado
      onSearchComplete?.(result);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Búsqueda cancelada, no hacer nada
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en búsqueda';
      setError(errorMessage);
      onSearchError?.(errorMessage);
      
      console.error('Error en búsqueda de clientes:', error);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [
    minQueryLength, pageSize, cacheExpiration, maxCacheSize, autoSelectSingle, trackStats,
    apiEndpoint, onSearchStart, onSearchComplete, onSearchError, onClienteSelect, onCacheHit
  ]);

  // ============================================================================
  // 🔄 FUNCIONES DEBOUNCED
  // ============================================================================

  // Búsqueda con debounce
  const debouncedSearch = useMemo(
    () => debounce((query: string, filters: SearchFilters) => {
      performSearch(query, filters, 1, false);
    }, debounceMs),
    [performSearch, debounceMs]
  );

  /**
   * Función pública de búsqueda
   */
  const search = useCallback(async (
    newQuery: string, 
    newFilters: SearchFilters = {}
  ): Promise<void> => {
    setQuery(newQuery);
    const combinedFilters = { ...filters, ...newFilters };
    setFilters(combinedFilters);
    setCurrentPage(1);
    
    if (newQuery.length >= minQueryLength || newQuery.length === 0) {
      debouncedSearch(newQuery, combinedFilters);
    } else {
      setClientes([]);
      setTotalResults(0);
      setHasMore(false);
    }
  }, [filters, minQueryLength, debouncedSearch]);

  // ============================================================================
  // 🎯 BÚSQUEDAS ESPECÍFICAS
  // ============================================================================

  /**
   * Buscar cliente por ID
   */
  const searchById = useCallback(async (id: string): Promise<Cliente | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Cliente no encontrado: ${response.status}`);
      }

      const cliente = await response.json();
      return cliente;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error buscando cliente por ID';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  /**
   * Buscar cliente por documento
   */
  const searchByDocument = useCallback(async (
    documento: string, 
    tipo?: string
  ): Promise<Cliente | null> => {
    const searchFilters: SearchFilters = {
      query: documento,
      ...(tipo && { tipoDocumento: tipo as any })
    };

    await performSearch(documento, searchFilters, 1, false);
    
    // Retornar el primer resultado si existe
    return clientes.length > 0 ? clientes[0] : null;
  }, [performSearch, clientes]);

  // ============================================================================
  // 🔄 CONTROL DE BÚSQUEDA
  // ============================================================================

  /**
   * Limpiar búsqueda
   */
  const clearSearch = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    debouncedSearch.cancel();
    
    setQuery('');
    setClientes([]);
    setTotalResults(0);
    setHasMore(false);
    setCurrentPage(1);
    setTotalPages(0);
    setError(null);
    setIsSearching(false);
    setIsLoading(false);
  }, [debouncedSearch]);

  /**
   * Cargar más resultados
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || isSearching) return;
    
    const nextPage = currentPage + 1;
    await performSearch(query, filters, nextPage, true);
  }, [hasMore, isSearching, currentPage, query, filters, performSearch]);

  /**
   * Ir a página específica
   */
  const goToPage = useCallback(async (page: number): Promise<void> => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    await performSearch(query, filters, page, false);
  }, [totalPages, currentPage, query, filters, performSearch]);

  // ============================================================================
  // 🔧 FILTROS
  // ============================================================================

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>): void => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (query) {
      debouncedSearch(query, updatedFilters);
    }
  }, [filters, query, debouncedSearch]);

  /**
   * Resetear filtros
   */
  const resetFilters = useCallback((): void => {
    const resetFilters = { ...defaultFilters };
    setFilters(resetFilters);
    
    if (query) {
      debouncedSearch(query, resetFilters);
    }
  }, [defaultFilters, query, debouncedSearch]);

  // ============================================================================
  // 👤 SELECCIÓN DE CLIENTE
  // ============================================================================

  /**
   * Seleccionar cliente
   */
  const selectCliente = useCallback((cliente: Cliente): void => {
    setSelectedCliente(cliente);
    onClienteSelect?.(cliente);
  }, [onClienteSelect]);

  /**
   * Limpiar selección
   */
  const clearSelection = useCallback((): void => {
    setSelectedCliente(null);
  }, []);

  // ============================================================================
  // 💾 CACHE Y ESTADÍSTICAS
  // ============================================================================

  /**
   * Limpiar cache
   */
  const clearCache = useCallback((): void => {
    cacheRef.current.clear();
    recentSearchesRef.current = [];
    searchHistoryRef.current = [];
  }, []);

  /**
   * Actualizar estadísticas
   */
  const updateStats = useCallback((query: string, searchTime: number, fromCache: boolean): void => {
    setStats(prev => {
      const newStats: SearchStats = {
        totalSearches: (prev?.totalSearches || 0) + 1,
        averageTime: prev ? 
          ((prev.averageTime * prev.totalSearches) + searchTime) / (prev.totalSearches + 1) :
          searchTime,
        cacheHits: (prev?.cacheHits || 0) + (fromCache ? 1 : 0),
        lastSearch: new Date(),
        mostSearched: updateMostSearched(prev?.mostSearched || [], query)
      };
      
      return newStats;
    });
  }, []);

  /**
   * Obtener estadísticas
   */
  const getSearchStats = useCallback((): SearchStats => {
    return stats || {
      totalSearches: 0,
      averageTime: 0,
      cacheHits: 0,
      lastSearch: null,
      mostSearched: []
    };
  }, [stats]);

  // ============================================================================
  // 🔧 UTILIDADES
  // ============================================================================

  /**
   * Exportar resultados
   */
  const exportResults = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      query,
      filters,
      totalResults,
      clientes: clientes.map(cliente => ({
        id: cliente.id,
        nombre: cliente.nombre,
        documento: cliente.documento,
        email: cliente.email,
        telefono: cliente.telefono
      })),
      stats: getSearchStats()
    };
  }, [query, filters, totalResults, clientes, getSearchStats]);

  /**
   * Obtener búsquedas recientes
   */
  const getRecentSearches = useCallback((): string[] => {
    return [...recentSearchesRef.current];
  }, []);

  /**
   * Obtener sugerencias
   */
  const getSuggestions = useCallback((partial: string): string[] => {
    if (partial.length < 2) return [];
    
    const suggestions = recentSearchesRef.current
      .filter(search => search.toLowerCase().includes(partial.toLowerCase()))
      .slice(0, 5);
      
    return suggestions;
  }, []);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Búsqueda inicial si está configurada
  useEffect(() => {
    if (searchOnMount && defaultFilters.query) {
      search(defaultFilters.query, defaultFilters);
    }
  }, [searchOnMount, defaultFilters, search]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      debouncedSearch.cancel();
      
      if (clearOnUnmount) {
        clearCache();
      }
    };
  }, [clearOnUnmount, debouncedSearch, clearCache]);

  // ============================================================================
  // 🔧 FUNCIONES AUXILIARES
  // ============================================================================

  function updateMostSearched(current: string[], newQuery: string): string[] {
    const updated = [...current];
    const index = updated.indexOf(newQuery);
    
    if (index > -1) {
      updated.splice(index, 1);
    }
    
    updated.unshift(newQuery);
    return updated.slice(0, 5);
  }

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado de búsqueda
    isSearching,
    isLoading,
    query,
    filters,
    
    // Resultados
    clientes,
    totalResults,
    hasMore,
    selectedCliente,
    
    // Paginación
    currentPage,
    pageSize,
    totalPages,
    
    // Acciones principales
    search,
    searchById,
    searchByDocument,
    clearSearch,
    
    // Paginación
    loadMore,
    goToPage,
    
    // Filtros
    updateFilters,
    resetFilters,
    
    // Selección
    selectCliente,
    clearSelection,
    
    // Cache y estadísticas
    clearCache,
    getSearchStats,
    
    // Utilidades
    exportResults,
    getRecentSearches,
    getSuggestions,
    
    // Estado
    error,
    lastSearchTime,
    stats
  };
};

export default useClienteSearch;