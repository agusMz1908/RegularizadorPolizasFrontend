// src/hooks/useMasterData.ts - VERSIÓN CORREGIDA Y ACTUALIZADA

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CalidadDto, CategoriaDto, CombustibleDto, DestinoDto, MasterDataOptionsDto, MonedaDto, SelectOption } from '../types/masterData';
import { MasterDataApi } from '../services/apiService';
import { TEXT_PLAIN_OPTIONS } from '../constants/textPlainOptions';

export interface MasterDataState {
  // Estados de carga
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // ✅ CORREGIDO: Usar MasterDataOptionsDto en lugar de VelneoMasterDataOptions
  options: MasterDataOptionsDto | null;
  
  // Cache individual por tipo
  categorias: SelectOption[];
  destinos: SelectOption[];
  calidades: SelectOption[];
  combustibles: SelectOption[];
  monedas: SelectOption[];
  
  // Opciones de texto plano
  estadosPoliza: SelectOption[];
  tiposTramite: SelectOption[];
  estadosBasicos: SelectOption[];
  formasPago: SelectOption[];
  departamentos: SelectOption[];
}

/**
 * 🏢 HOOK PARA MANEJO DE DATOS MAESTROS - VERSIÓN CORREGIDA
 * Maneja la carga, cache y transformación de todos los datos maestros
 */
export const useMasterData = () => {
  const [state, setState] = useState<MasterDataState>({
    loading: false, // ✅ CORREGIDO: Iniciar en false para evitar conflictos
    error: null,
    lastUpdated: null,
    options: null,
    categorias: [],
    destinos: [],
    calidades: [],
    combustibles: [],
    monedas: [],
    estadosPoliza: [],
    tiposTramite: [],
    estadosBasicos: [],
    formasPago: [],
    departamentos: []
  });

  // ✅ CORREGIDO: Transformar datos maestros usando el tipo correcto
const transformMasterDataToSelectOptions = useCallback((options: MasterDataOptionsDto) => {
  console.log('🔄 [useMasterData] Transformando datos maestros:', {
    // ✅ CORREGIDO: Verificar tanto camelCase como PascalCase para compatibilidad
    categorias: options.categorias?.length || (options as any).Categorias?.length || 0,
    destinos: options.destinos?.length || (options as any).Destinos?.length || 0,
    calidades: options.calidades?.length || (options as any).Calidades?.length || 0,
    combustibles: options.combustibles?.length || (options as any).Combustibles?.length || 0,
    monedas: options.monedas?.length || (options as any).Monedas?.length || 0
  });

  const transformed = {
    // ✅ CORREGIDO: Usar camelCase del backend con fallback a PascalCase
    categorias: (options.categorias || (options as any).Categorias)?.map((cat: CategoriaDto) => ({
      id: cat.id,
      name: cat.catdsc || `Categoría ${cat.id}`,
      description: `ID: ${cat.id}`
    })) || [],

    destinos: (options.destinos || (options as any).Destinos)?.map((dest: DestinoDto) => ({
      id: dest.id,
      name: dest.desnom || `Destino ${dest.id}`,
      description: `ID: ${dest.id}`
    })) || [],

    calidades: (options.calidades || (options as any).Calidades)?.map((cal: CalidadDto) => ({
      id: cal.id,
      name: cal.caldsc || `Calidad ${cal.id}`,
      description: `ID: ${cal.id}`
    })) || [],

    combustibles: (options.combustibles || (options as any).Combustibles)?.map((comb: CombustibleDto) => ({
      id: comb.id, // STRING: "DIS", "ELE", "GAS", "HYB"
      name: comb.name || `Combustible ${comb.id}`,
      description: `Código: ${comb.id}`
    })) || [],

    monedas: (options.monedas || (options as any).Monedas)?.map((mon: MonedaDto) => ({
      id: mon.id,
      name: mon.nombre || `Moneda ${mon.id}`,
      description: mon.codigo ? `${mon.codigo}${mon.simbolo ? ` (${mon.simbolo})` : ''}` : `ID: ${mon.id}`
    })) || [],

    // ✅ CORREGIDO: Opciones de texto plano usando arrays del backend (camelCase)
    estadosPoliza: ((options.estadosPoliza || (options as any).EstadosPoliza)?.map((estado: string) => ({
      id: estado,
      name: estado,
      description: `Estado: ${estado}`
    })) || TEXT_PLAIN_OPTIONS.estadosPoliza?.map(estado => ({
      id: estado.id,
      name: estado.name,
      description: estado.description
    })) || []),

    tiposTramite: ((options.tiposTramite || (options as any).TiposTramite)?.map((tipo: string) => ({
      id: tipo,
      name: tipo,
      description: `Tipo: ${tipo}`
    })) || TEXT_PLAIN_OPTIONS.tiposTramite?.map(tipo => ({
      id: tipo.id,
      name: tipo.name,
      description: tipo.description
    })) || []),

    estadosBasicos: ((options.estadosBasicos || (options as any).EstadosBasicos)?.map((estado: string) => ({
      id: estado,
      name: estado,
      description: `Estado: ${estado}`
    })) || TEXT_PLAIN_OPTIONS.estadosBasicos?.map(estado => ({
      id: estado.id,
      name: estado.name,
      description: estado.description
    })) || []),

    formasPago: ((options.formasPago || (options as any).FormasPago)?.map((forma: string) => ({
      id: forma,
      name: forma,
      description: `Forma: ${forma}`
    })) || TEXT_PLAIN_OPTIONS.formasPago?.map(forma => ({
      id: forma.id,
      name: forma.name,
      description: forma.description
    })) || []),
  };

  console.log('✅ [useMasterData] Transformación completada:', {
    categorias: transformed.categorias.length,
    destinos: transformed.destinos.length,
    calidades: transformed.calidades.length,
    combustibles: transformed.combustibles.length,
    monedas: transformed.monedas.length,
    estadosPoliza: transformed.estadosPoliza.length,
    formasPago: transformed.formasPago.length
  });

  return transformed;
}, []);

  // ===== CARGAR DATOS MAESTROS - CORREGIDO =====
  const loadMasterData = useCallback(async (force = false) => {
    // No recargar si ya tenemos datos y no es forzado
    if (state.options && !force && !state.error) {
      console.log('🔒 [useMasterData] Datos ya cargados, saltando recarga');
      return;
    }

    console.log('🔄 [useMasterData] Iniciando carga de datos maestros...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const options = await MasterDataApi.getMasterDataOptions();
      
      // ✅ Transformar datos maestros a formato SelectOption
      const transformedData = transformMasterDataToSelectOptions(options);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        options,
        ...transformedData
      }));

      console.log('✅ [useMasterData] Datos maestros cargados exitosamente');

    } catch (error) {
      console.error('❌ [useMasterData] Error cargando datos maestros:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido cargando maestros';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []); // ✅ CORREGIDO: Sin dependencias para evitar bucles

  // ===== CARGAR AL MONTAR - SOLO UNA VEZ =====
  useEffect(() => {
    if (!state.options && !state.loading && !state.error) {
      console.log('🚀 [useMasterData] Carga inicial al montar componente');
      loadMasterData();
    }
  }, []); // ✅ CORREGIDO: Solo al montar

  // ===== BÚSQUEDA EN MAESTROS =====
  const searchInMaster = useCallback(<T extends SelectOption>(
    masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>,
    searchTerm: string
  ): T[] => {
    const masterData = state[masterType] as T[];
    if (!searchTerm || !masterData.length) return masterData;

    const term = searchTerm.toLowerCase();
    return masterData.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.id.toString().toLowerCase().includes(term)
    );
  }, [state]);

  // ===== OBTENER ITEM POR ID =====
  const getItemById = useCallback(<T extends SelectOption>(
    masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>,
    id: string | number
  ): T | null => {
    const masterData = state[masterType] as T[];
    return masterData.find(item => item.id.toString() === id.toString()) || null;
  }, [state]);

  // ===== VALIDAR SI UN MAESTRO ESTÁ CARGADO =====
  const isMasterLoaded = useCallback((
    masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>
  ): boolean => {
    return state[masterType].length > 0;
  }, [state]);

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => ({
    totalMasters: state.options ? Object.keys(state.options).length : 0,
    totalOptions: [
      state.categorias.length,
      state.destinos.length,
      state.calidades.length,
      state.combustibles.length,
      state.monedas.length,
      state.estadosPoliza.length,
      state.tiposTramite.length,
      state.estadosBasicos.length,
      state.formasPago.length,
      state.departamentos.length
    ].reduce((sum, count) => sum + count, 0),
    loadedMasters: {
      categorias: state.categorias.length,
      destinos: state.destinos.length,
      calidades: state.calidades.length,
      combustibles: state.combustibles.length,
      monedas: state.monedas.length
    }
  }), [state]);

  // ===== HELPERS ESPECÍFICOS =====
  const helpers = useMemo(() => ({
    // Buscar combustible por texto
    findCombustibleByText: (text: string) => {
      if (!text) return null;
      const upperText = text.toUpperCase();
      
      // Mapeo común
      const commonMappings: Record<string, string> = {
        'DIESEL': 'DIS',
        'DISEL': 'DIS',
        'GAS-OIL': 'DIS',
        'GASOLINA': 'GAS',
        'NAFTA': 'GAS',
        'ELECTRICO': 'ELE',
        'ELECTRIC': 'ELE',
        'HIBRIDO': 'HYB',
        'HYBRID': 'HYB'
      };

      for (const [key, id] of Object.entries(commonMappings)) {
        if (upperText.includes(key)) {
          return getItemById('combustibles', id);
        }
      }

      // Buscar por coincidencia parcial en nombre
      return state.combustibles.find(comb => 
        comb.name.toLowerCase().includes(text.toLowerCase()) ||
        text.toLowerCase().includes(comb.name.toLowerCase())
      ) || null;
    },

    // Buscar moneda por código
    findMonedaByCodigo: (codigo: string) => {
      if (!codigo) return null;
      const upperCodigo = codigo.toUpperCase();
      
      return state.monedas.find(moneda => 
        moneda.description?.includes(upperCodigo) ||
        moneda.name.toUpperCase().includes(upperCodigo) ||
        moneda.id.toString() === upperCodigo
      ) || null;
    },

    // Verificar si los maestros están listos
    isReady: () => !state.loading && !state.error && state.options !== null,

    // Obtener departamento por texto
    findDepartamentoByText: (text: string) => {
      if (!text) return null;
      const upperText = text.toUpperCase();
      return state.departamentos.find(dept => 
        dept.name.includes(upperText) || upperText.includes(dept.name)
      ) || null;
    },

    // ✅ NUEVO: Obtener elemento por cualquier criterio
    findBestMatch: (masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>, searchText: string) => {
      if (!searchText) return null;
      
      const masterData = state[masterType];
      const searchLower = searchText.toLowerCase();
      
      // Búsqueda exacta por ID
      let match = masterData.find(item => item.id.toString().toLowerCase() === searchLower);
      if (match) return match;
      
      // Búsqueda exacta por nombre
      match = masterData.find(item => item.name.toLowerCase() === searchLower);
      if (match) return match;
      
      // Búsqueda parcial por nombre
      match = masterData.find(item => item.name.toLowerCase().includes(searchLower));
      if (match) return match;
      
      // Búsqueda parcial por descripción
      match = masterData.find(item => item.description?.toLowerCase().includes(searchLower));
      return match || null;
    }
  }), [state, getItemById]);

  // ===== RETURN DEL HOOK =====
  return {
    // Estados principales
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    rawOptions: state.options,

    // Datos transformados para selects
    categorias: state.categorias,
    destinos: state.destinos,
    calidades: state.calidades,
    combustibles: state.combustibles,
    monedas: state.monedas,
    estadosPoliza: state.estadosPoliza,
    tiposTramite: state.tiposTramite,
    estadosBasicos: state.estadosBasicos,
    formasPago: state.formasPago,
    departamentos: state.departamentos,

    // Acciones
    loadMasterData,
    searchInMaster,
    getItemById,
    isMasterLoaded,

    // Utilidades
    stats,
    helpers,

    // Estado computed
    isReady: helpers.isReady(),
    
    // ✅ NUEVO: Información de debug
    debugInfo: process.env.NODE_ENV === 'development' ? {
      state: {
        hasOptions: !!state.options,
        loadedArrays: Object.keys(state).filter(key => 
          Array.isArray(state[key as keyof MasterDataState]) && 
          (state[key as keyof MasterDataState] as any[]).length > 0
        )
      },
      stats
    } : null
  };
};

/**
 * 🔍 HOOK SIMPLIFICADO PARA UN MAESTRO ESPECÍFICO - CORREGIDO
 */
export const useMaster = (masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>) => {
  const masterData = useMasterData();
  
  return {
    data: masterData[masterType],
    loading: masterData.loading,
    error: masterData.error,
    search: (term: string) => masterData.searchInMaster(masterType, term),
    getById: (id: string | number) => masterData.getItemById(masterType, id),
    isLoaded: masterData.isMasterLoaded(masterType),
    count: masterData[masterType].length,
    isReady: masterData.isReady
  };
};


export default useMasterData;