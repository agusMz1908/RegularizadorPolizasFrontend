// src/hooks/useVelneoEntities.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../services/ApiClient';

// Tipos para las entidades
export interface CombustibleDto {
  id: string;
  name: string;
}

export interface CategoriaDto {
  id: number;
  catdsc: string;
  catcod: string;
}

export interface DestinoDto {
  id: number;
  desnom: string;
  descod: string;
}

export interface CalidadDto {
  id: number;
  caldsc: string;
  calcod: string;
}

// Hook principal
export const useVelneoEntities = () => {
  const [combustibles, setCombustibles] = useState<CombustibleDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [destinos, setDestinos] = useState<DestinoDto[]>([]);
  const [calidades, setCalidades] = useState<CalidadDto[]>([]);
  
  const [loading, setLoading] = useState({
    combustibles: false,
    categorias: false,
    destinos: false,
    calidades: false
  });
  
  const [errors, setErrors] = useState({
    combustibles: null as string | null,
    categorias: null as string | null,
    destinos: null as string | null,
    calidades: null as string | null
  });

  // Función para cargar combustibles
  const loadCombustibles = async () => {
    try {
      setLoading(prev => ({ ...prev, combustibles: true }));
      setErrors(prev => ({ ...prev, combustibles: null }));
      
      const response = await apiClient.get<CombustibleDto[]>('/Combustible');
      console.log('🔥 Combustibles cargados:', response.data);

      if (!response.success) {
        throw new Error(response.error || 'Error cargando combustibles');
      }
      setCombustibles(response.data || []);
      } catch (error: any) {
        console.error('❌ Error cargando combustibles:', error);
        setErrors(prev => ({ 
        ...prev, 
        combustibles: error.response?.data?.message || 'Error cargando combustibles' 
      }));
      } finally {
      setLoading(prev => ({ ...prev, combustibles: false }));
    }
  };

  // Función para cargar categorías
  const loadCategorias = async () => {
    try {
      setLoading(prev => ({ ...prev, categorias: true }));
      setErrors(prev => ({ ...prev, categorias: null }));
      
      const response = await apiClient.get<CategoriaDto[]>('/Categoria');
      console.log('🔥 Categorias cargadas:', response.data);

      if (!response.success) {
        throw new Error(response.error || 'Error cargando combustibles');
      }
      setCategorias(response.data || []);
    } catch (error: any) {
      console.error('❌ Error cargando categorías:', error);
      setErrors(prev => ({ 
        ...prev, 
        categorias: error.response?.data?.message || 'Error cargando categorías' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, categorias: false }));
    }
  };

  // Función para cargar destinos
  const loadDestinos = async () => {
    try {
      setLoading(prev => ({ ...prev, destinos: true }));
      setErrors(prev => ({ ...prev, destinos: null }));
      
      const response = await apiClient.get<DestinoDto[]>('/Destino');
      console.log('🔥 Combustibles cargados:', response.data);

      if (!response.success) {
        throw new Error(response.error || 'Error cargando destinos');
      }
      setDestinos(response.data || []);
    } catch (error: any) {
      console.error('❌ Error cargando destinos:', error);
      setErrors(prev => ({ 
        ...prev, 
        destinos: error.response?.data?.message || 'Error cargando destinos' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, destinos: false }));
    }
  };

  // Función para cargar calidades
  const loadCalidades = async () => {
    try {
      setLoading(prev => ({ ...prev, calidades: true }));
      setErrors(prev => ({ ...prev, calidades: null }));
      
      const response = await apiClient.get<CalidadDto[]>('/Calidad');
      console.log('🔥 Calidades cargadas:', response.data);

      if (!response.success) {
        throw new Error(response.error || 'Error cargando calidades');
      }
      setCalidades(response.data || []);
    } catch (error: any) {
      console.error('❌ Error cargando calidades:', error);
      setErrors(prev => ({ 
        ...prev, 
        calidades: error.response?.data?.message || 'Error cargando calidades' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, calidades: false }));
    }
  };

  // Cargar todas las entidades al montar el componente
  useEffect(() => {
    const loadAllEntities = async () => {
      console.log('🔄 Cargando entidades de Velneo...');
      await Promise.all([
        loadCombustibles(),
        loadCategorias(),
        loadDestinos(),
        loadCalidades()
      ]);
      console.log('✅ Todas las entidades cargadas');
    };

    loadAllEntities();
  }, []);

  // Función para refrescar todas las entidades
  const refresh = () => {
    loadCombustibles();
    loadCategorias();
    loadDestinos();
    loadCalidades();
  };

  // Funciones helper para buscar por valor de escaneo
  const findCombustibleByName = (name: string): CombustibleDto | undefined => {
    if (!name) return undefined;
    return combustibles.find(c => 
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.name.toLowerCase())
    );
  };

  const findCategoriaByName = (name: string): CategoriaDto | undefined => {
    if (!name) return undefined;
    return categorias.find(c => 
      c.catdsc.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.catdsc.toLowerCase())
    );
  };

  const findDestinoByName = (name: string): DestinoDto | undefined => {
    if (!name) return undefined;
    return destinos.find(d => 
      d.desnom.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(d.desnom.toLowerCase())
    );
  };

  const isAllLoaded = !Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);

  return {
    // Datos
    combustibles,
    categorias,
    destinos,
    calidades,
    
    // Estados
    loading,
    errors,
    isAllLoaded,
    hasErrors,
    
    // Funciones
    refresh,
    loadCombustibles,
    loadCategorias,
    loadDestinos,
    loadCalidades,
    
    // Helpers
    findCombustibleByName,
    findCategoriaByName,
    findDestinoByName
  };
};