// === CORRECCIÓN COMPLETA para src/hooks/useMasterData.ts ===

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  CalidadDto, 
  CategoriaDto, 
  CombustibleDto, 
  DestinoDto, 
  MasterDataOptionsDto, 
  MonedaDto, 
  TarifaDto,
  SelectOption 
} from '../types/masterData';
import { MasterDataApi } from '../services/apiService';
import { TEXT_PLAIN_OPTIONS } from '../constants/textPlainOptions';

// IMPORTAR apiService directamente para las tarifas
import { apiService } from '../services/apiService';

export interface MasterDataState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  options: MasterDataOptionsDto | null;
  
  // Cache individual por tipo
  categorias: SelectOption[];
  destinos: SelectOption[];
  calidades: SelectOption[];
  combustibles: SelectOption[];
  monedas: SelectOption[];
  tarifas: SelectOption[];
  
  // Opciones de texto plano
  estadosPoliza: SelectOption[];
  tiposTramite: SelectOption[];
  estadosBasicos: SelectOption[];
  formasPago: SelectOption[];
  departamentos: SelectOption[];
}

export const useMasterData = () => {
  const [state, setState] = useState<MasterDataState>({
    loading: false,
    error: null,
    lastUpdated: null,
    options: null,
    categorias: [],
    destinos: [],
    calidades: [],
    combustibles: [],
    monedas: [],
    tarifas: [],
    estadosPoliza: [],
    tiposTramite: [],
    estadosBasicos: [],
    formasPago: [],
    departamentos: []
  });

  // Transformar datos maestros
  const transformMasterDataToSelectOptions = useCallback((options: MasterDataOptionsDto) => {
    console.log('🔄 [useMasterData] Transformando datos maestros:', {
      categorias: options.categorias?.length || 0,
      destinos: options.destinos?.length || 0,
      calidades: options.calidades?.length || 0,
      combustibles: options.combustibles?.length || 0,
      monedas: options.monedas?.length || 0,
      tarifas: options.tarifas?.length || 0
    });

    const transformed = {
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
        id: comb.id,
        name: comb.name || `Combustible ${comb.id}`,
        description: `Código: ${comb.id}`
      })) || [],

      monedas: (options.monedas || (options as any).Monedas)?.map((mon: MonedaDto) => ({
        id: mon.id,
        name: mon.nombre || `Moneda ${mon.id}`,
        description: mon.codigo ? `${mon.codigo}${mon.simbolo ? ` (${mon.simbolo})` : ''}` : `ID: ${mon.id}`
      })) || [],

      // IMPORTANTE: Manejar tarifas correctamente
      tarifas: (options.tarifas || []).map((tarifa: TarifaDto) => ({
        id: tarifa.id,
        name: tarifa.nombre || `Tarifa ${tarifa.id}`,
        description: tarifa.codigo || (tarifa.descripcion && !tarifa.descripcion.includes('DOCTYPE') ? tarifa.descripcion.substring(0, 50) : `ID: ${tarifa.id}`)
      })),

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

      departamentos: [] // Por ahora vacío
    };

    console.log('✅ [useMasterData] Transformación completada:', {
      categorias: transformed.categorias.length,
      destinos: transformed.destinos.length,
      calidades: transformed.calidades.length,
      combustibles: transformed.combustibles.length,
      monedas: transformed.monedas.length,
      tarifas: transformed.tarifas.length,
      estadosPoliza: transformed.estadosPoliza.length,
      formasPago: transformed.formasPago.length
    });

    return transformed;
  }, []);

  // CARGAR DATOS MAESTROS - CORREGIDO
const loadMasterData = useCallback(async (force = false) => {
  if (state.options && !force && !state.error) {
    console.log('🔒 [useMasterData] Datos ya cargados, saltando recarga');
    return;
  }

  console.log('🔄 [useMasterData] Iniciando carga de datos maestros...');
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    // Cargar datos maestros básicos
    const options = await MasterDataApi.getMasterDataOptions();
    
    // SIEMPRE intentar cargar tarifas ya que no vienen en getMasterDataOptions
    console.log('📋 [useMasterData] Cargando tarifas por separado...');
    try {
      // CORRECCIÓN: Usar el método público getTarifas directamente
      const tarifasData = await apiService.getTarifas(1); // BSE = companiaId 1
      console.log('📋 [useMasterData] Tarifas cargadas:', tarifasData.length);
      options.tarifas = tarifasData;
    } catch (tarifaError) {
      console.error('❌ [useMasterData] Error cargando tarifas:', tarifaError);
      options.tarifas = [];
    }
    
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

    console.log('✅ [useMasterData] Datos maestros cargados exitosamente, incluyendo', transformedData.tarifas.length, 'tarifas');

  } catch (error) {
    console.error('❌ [useMasterData] Error cargando datos maestros:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido cargando maestros';
    
    setState(prev => ({
      ...prev,
      loading: false,
      error: errorMessage
    }));
  }
}, [transformMasterDataToSelectOptions]);

  // Cargar tarifas específicas por compañía
const loadTarifasByCompania = useCallback(async (companiaId: number) => {
  console.log(`📋 [useMasterData] Cargando tarifas para compañía ${companiaId}...`);
  
  try {
    // CORRECCIÓN: Usar directamente el método público
    const tarifasData = await apiService.getTarifas(companiaId);
    
    const tarifasTransformed = tarifasData.map((tarifa: any) => ({
      id: tarifa.id,
      name: tarifa.nombre || `Tarifa ${tarifa.id}`,
      description: tarifa.codigo || `ID: ${tarifa.id}`
    }));
    
    setState(prev => ({
      ...prev,
      tarifas: tarifasTransformed
    }));
    
    console.log(`✅ [useMasterData] ${tarifasTransformed.length} tarifas cargadas para compañía ${companiaId}`);
    
  } catch (error) {
    console.error(`❌ [useMasterData] Error cargando tarifas para compañía ${companiaId}:`, error);
  }
}, []);

  // IMPORTANTE: Cargar al montar - SOLO UNA VEZ
  useEffect(() => {
    if (!state.options && !state.loading && !state.error) {
      console.log('🚀 [useMasterData] Carga inicial al montar componente');
      loadMasterData();
    }
  }, []); // Sin dependencias para evitar bucles

  // MÉTODOS DE BÚSQUEDA Y UTILIDADES
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

  const getItemById = useCallback(<T extends SelectOption>(
    masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>,
    id: string | number
  ): T | null => {
    const masterData = state[masterType] as T[];
    return masterData.find(item => item.id.toString() === id.toString()) || null;
  }, [state]);

  const isMasterLoaded = useCallback((
    masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>
  ): boolean => {
    return state[masterType].length > 0;
  }, [state]);

  // Stats y helpers
  const stats = useMemo(() => ({
    totalMasters: state.options ? Object.keys(state.options).length : 0,
    totalOptions: [
      state.categorias.length,
      state.destinos.length,
      state.calidades.length,
      state.combustibles.length,
      state.monedas.length,
      state.tarifas.length,
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
      monedas: state.monedas.length,
      tarifas: state.tarifas.length
    }
  }), [state]);

  const helpers = useMemo(() => ({
    findTarifaByText: (text: string) => {
      if (!text) return null;
      const upperText = text.toUpperCase();
      
      return state.tarifas.find(tarifa => 
        tarifa.name.toUpperCase().includes(upperText) ||
        tarifa.description?.toUpperCase().includes(upperText) ||
        tarifa.id.toString() === text
      ) || null;
    },
    
    findCombustibleByText: (text: string) => {
      if (!text) return null;
      const upperText = text.toUpperCase();
      
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

      return state.combustibles.find(comb => 
        comb.name.toLowerCase().includes(text.toLowerCase()) ||
        text.toLowerCase().includes(comb.name.toLowerCase())
      ) || null;
    },

    findMonedaByCodigo: (codigo: string) => {
      if (!codigo) return null;
      const upperCodigo = codigo.toUpperCase();
      
      return state.monedas.find(moneda => 
        moneda.description?.includes(upperCodigo) ||
        moneda.name.toUpperCase().includes(upperCodigo) ||
        moneda.id.toString() === upperCodigo
      ) || null;
    },

    isReady: () => !state.loading && !state.error && state.options !== null,

    findDepartamentoByText: (text: string) => {
      if (!text) return null;
      const upperText = text.toUpperCase();
      return state.departamentos.find(dept => 
        dept.name.includes(upperText) || upperText.includes(dept.name)
      ) || null;
    },

    findBestMatch: (masterType: keyof Omit<MasterDataState, 'loading' | 'error' | 'lastUpdated' | 'options'>, searchText: string) => {
      if (!searchText) return null;
      
      const masterData = state[masterType];
      const searchLower = searchText.toLowerCase();
      
      let match = masterData.find(item => item.id.toString().toLowerCase() === searchLower);
      if (match) return match;
      
      match = masterData.find(item => item.name.toLowerCase() === searchLower);
      if (match) return match;
      
      match = masterData.find(item => item.name.toLowerCase().includes(searchLower));
      if (match) return match;
      
      match = masterData.find(item => item.description?.toLowerCase().includes(searchLower));
      return match || null;
    }
  }), [state, getItemById]);

  // Return del hook
  return {
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    rawOptions: state.options,

    categorias: state.categorias,
    destinos: state.destinos,
    calidades: state.calidades,
    combustibles: state.combustibles,
    monedas: state.monedas,
    tarifas: state.tarifas,
    estadosPoliza: state.estadosPoliza,
    tiposTramite: state.tiposTramite,
    estadosBasicos: state.estadosBasicos,
    formasPago: state.formasPago,
    departamentos: state.departamentos,

    loadMasterData,
    loadTarifasByCompania,
    searchInMaster,
    getItemById,
    isMasterLoaded,

    stats,
    helpers,

    isReady: helpers.isReady(),
    
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

// Hook simplificado para un maestro específico
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