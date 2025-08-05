// src/hooks/useMasterData.ts - Hook para manejo de datos maestros

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { VelneoMasterDataOptions } from '../types/velneo';
import type { SelectOption } from '../components/form/SelectField';
import { MasterDataApi } from '../services/apiService';
import { TEXT_PLAIN_OPTIONS } from '../constants/textPlainOptions';
import { REGIONAL_CONFIG } from '../constants/velneoDefault';

export interface MasterDataState {
  // Estados de carga
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Datos maestros
  options: VelneoMasterDataOptions | null;
  
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
 * 🏢 HOOK PARA MANEJO DE DATOS MAESTROS
 * Maneja la carga, cache y transformación de todos los datos maestros
 */
export const useMasterData = () => {
  const [state, setState] = useState<MasterDataState>({
    loading: true,
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

  // ===== CARGAR DATOS MAESTROS =====
  const loadMasterData = useCallback(async (force = false) => {
    // No recargar si ya tenemos datos y no es forzado
    if (state.options && !force && !state.error) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔄 Cargando datos maestros...');
      
      const options = await MasterDataApi.getMasterDataOptions();
      
      // Transformar datos maestros a formato SelectOption
      const transformedData = transformMasterDataToSelectOptions(options);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        options,
        ...transformedData
      }));

      console.log('✅ Datos maestros cargados exitosamente', {
        categorias: options.Categorias?.length || 0,
        destinos: options.Destinos?.length || 0,
        calidades: options.Calidades?.length || 0,
        combustibles: options.Combustibles?.length || 0,
        monedas: options.Monedas?.length || 0
      });

    } catch (error) {
      console.error('❌ Error cargando datos maestros:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [state.options, state.error]);

  // ===== TRANSFORMAR DATOS MAESTROS =====
  const transformMasterDataToSelectOptions = useCallback((options: VelneoMasterDataOptions) => {
    return {
      // Maestros de BD
      categorias: options.Categorias?.map(cat => ({
        id: cat.id,
        name: cat.catdsc || `Categoría ${cat.id}`,
        description: `ID: ${cat.id}`
      })) || [],

      destinos: options.Destinos?.map(dest => ({
        id: dest.id,
        name: dest.desnom || `Destino ${dest.id}`,
        description: `ID: ${dest.id}`
      })) || [],

      calidades: options.Calidades?.map(cal => ({
        id: cal.id,
        name: cal.caldsc || `Calidad ${cal.id}`,
        description: `ID: ${cal.id}`
      })) || [],

      combustibles: options.Combustibles?.map(comb => ({
        id: comb.id, // STRING: "DIS", "ELE", "GAS", "HYB"
        name: comb.name || `Combustible ${comb.id}`,
        description: `Código: ${comb.id}`
      })) || [],

      monedas: options.Monedas?.map(mon => ({
        id: mon.id,
        name: mon.nombre || `Moneda ${mon.id}`,
        description: mon.codigo ? `${mon.codigo}${mon.simbolo ? ` (${mon.simbolo})` : ''}` : `ID: ${mon.id}`
      })) || [],

      // Opciones de texto plano
      estadosPoliza: TEXT_PLAIN_OPTIONS.estadosPoliza.map(estado => ({
        id: estado.id,
        name: estado.name,
        description: estado.description
      })),

      tiposTramite: TEXT_PLAIN_OPTIONS.tiposTramite.map(tipo => ({
        id: tipo.id,
        name: tipo.name,
        description: tipo.description
      })),

      estadosBasicos: TEXT_PLAIN_OPTIONS.estadosBasicos.map(estado => ({
        id: estado.id,
        name: estado.name,
        description: estado.description
      })),

      formasPago: TEXT_PLAIN_OPTIONS.formasPago.map(forma => ({
        id: forma.id,
        name: forma.name,
        description: forma.description
      })),

      departamentos: REGIONAL_CONFIG.DEPARTAMENTOS_URUGUAY.map((dept: any) => ({
        id: dept,
        name: dept,
        description: 'Departamento de Uruguay'
      }))
    };
  }, []);

  // ===== CARGAR AL MONTAR =====
  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

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
    totalMasters: Object.keys(state.options || {}).length,
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
        'GASOLINA': 'GAS',
        'NAFTA': 'GAS',
        'ELECTRICO': 'ELE',
        'HIBRIDO': 'HYB'
      };

      for (const [key, id] of Object.entries(commonMappings)) {
        if (upperText.includes(key)) {
          return getItemById('combustibles', id);
        }
      }

      return null;
    },

    // Buscar moneda por código
    findMonedaByCodigo: (codigo: string) => {
      return state.monedas.find(moneda => 
        moneda.description?.includes(codigo.toUpperCase())
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
    isReady: helpers.isReady()
  };
};

/**
 * 🔍 HOOK SIMPLIFICADO PARA UN MAESTRO ESPECÍFICO
 */
export const useMaster = (masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>) => {
  const masterData = useMasterData();
  
  return {
    data: masterData[masterType],
    loading: masterData.loading,
    error: masterData.error,
    search: (term: string) => masterData.searchInMaster(masterType, term),
    getById: (id: string | number) => masterData.getItemById(masterType, id),
    isLoaded: masterData.isMasterLoaded(masterType)
  };
};