// src/hooks/ui/useFormAutoSave.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce, isEqual } from 'lodash';

// ============================================================================
// 🎯 TIPOS DEL HOOK
// ============================================================================

export interface AutoSaveConfig<T = any> {
  // Configuración básica
  enabled?: boolean;
  interval?: number; // ms entre auto-guardados
  debounceMs?: number; // ms para debounce de cambios
  
  // Configuración de datos
  key: string; // Clave única para identificar el formulario
  version?: string;
  maxVersions?: number; // Máximo de versiones a mantener
  
  // Configuración de storage
  storageType?: 'localStorage' | 'sessionStorage' | 'memory';
  compressionEnabled?: boolean;
  
  // Configuración de comportamiento
  saveOnChange?: boolean; // Guardar en cada cambio
  saveOnBlur?: boolean; // Guardar al perder foco
  saveOnUnload?: boolean; // Guardar antes de cerrar página
  clearOnSubmit?: boolean; // Limpiar después de envío exitoso
  
  // Validación antes de guardar
  validateBeforeSave?: (data: T) => boolean;
  
  // Callbacks
  onSave?: (data: T, saveType: AutoSaveType) => void;
  onLoad?: (data: T) => void;
  onError?: (error: string, operation: string) => void;
  onStorageFull?: () => void;
}

export type AutoSaveType = 
  | 'manual' 
  | 'interval' 
  | 'change' 
  | 'blur' 
  | 'unload' 
  | 'recovery';

export interface AutoSaveEntry<T = any> {
  data: T;
  timestamp: string;
  version: string;
  saveType: AutoSaveType;
  checksum: string;
}

export interface AutoSaveStats {
  totalSaves: number;
  lastSave: Date | null;
  savesByType: Record<AutoSaveType, number>;
  averageSize: number;
  storageUsed: number;
  recoveryAvailable: boolean;
}

export interface UseFormAutoSaveReturn<T = any> {
  // Estado
  isEnabled: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // Datos
  savedData: T | null;
  currentData: T | null;
  
  // Acciones principales
  save: (data: T, saveType?: AutoSaveType) => Promise<boolean>;
  load: () => Promise<T | null>;
  clear: () => Promise<boolean>;
  
  // Control
  enable: () => void;
  disable: () => void;
  pause: () => void;
  resume: () => void;
  
  // Gestión de datos
  updateData: (data: T) => void;
  hasChanges: (data: T) => boolean;
  
  // Recuperación
  hasRecoveryData: () => boolean;
  getRecoveryData: () => T | null;
  clearRecoveryData: () => void;
  
  // Versiones
  getAllVersions: () => AutoSaveEntry<T>[];
  getVersion: (timestamp: string) => AutoSaveEntry<T> | null;
  deleteVersion: (timestamp: string) => boolean;
  
  // Utilidades
  getStats: () => AutoSaveStats;
  exportData: () => any;
  importData: (data: any) => Promise<boolean>;
  
  // Estado
  error: string | null;
  stats: AutoSaveStats | null;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useFormAutoSave = <T = any>(
  config: AutoSaveConfig<T>
): UseFormAutoSaveReturn<T> => {

  const {
    enabled = true,
    interval = 30000, // 30 segundos
    debounceMs = 1000,
    key,
    version = '1.0',
    maxVersions = 10,
    storageType = 'localStorage',
    compressionEnabled = false,
    saveOnChange = true,
    saveOnBlur = false,
    saveOnUnload = true,
    clearOnSubmit = false,
    validateBeforeSave,
    onSave,
    onLoad,
    onError,
    onStorageFull
  } = config;

  // ============================================================================
  // 📊 ESTADO DEL HOOK
  // ============================================================================

  // Estados principales
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Datos
  const [savedData, setSavedData] = useState<T | null>(null);
  const [currentData, setCurrentData] = useState<T | null>(null);
  
  // Estado
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AutoSaveStats | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Referencias
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T | null>(null);
  const saveCounterRef = useRef(0);
  const totalSizeRef = useRef(0);

  // ============================================================================
  // 💾 FUNCIONES DE STORAGE
  // ============================================================================

  /**
   * Obtiene el storage apropiado
   */
  const getStorage = useCallback((): Storage | Map<string, string> => {
    if (storageType === 'memory') {
      if (!window._autoSaveMemoryStorage) {
        window._autoSaveMemoryStorage = new Map<string, string>();
      }
      return window._autoSaveMemoryStorage;
    }
    
    try {
      return storageType === 'localStorage' ? localStorage : sessionStorage;
    } catch (error) {
      console.warn('Storage no disponible, usando memoria:', error);
      if (!window._autoSaveMemoryStorage) {
        window._autoSaveMemoryStorage = new Map<string, string>();
      }
      return window._autoSaveMemoryStorage;
    }
  }, [storageType]);

  /**
   * Construye claves de storage
   */
  const buildKeys = useCallback(() => {
    return {
      data: `autosave_${key}`,
      versions: `autosave_${key}_versions`,
      recovery: `autosave_${key}_recovery`,
      stats: `autosave_${key}_stats`
    };
  }, [key]);

  /**
   * Calcula checksum de los datos
   */
  const calculateChecksum = useCallback((data: T): string => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }, []);

  /**
   * Comprime datos si está habilitado
   */
  const compressData = useCallback((data: string): string => {
    if (compressionEnabled && typeof LZString !== 'undefined') {
      try {
        return LZString.compress(data);
      } catch (error) {
        console.warn('Error comprimiendo datos:', error);
      }
    }
    return data;
  }, [compressionEnabled]);

  /**
   * Descomprime datos
   */
  const decompressData = useCallback((data: string): string => {
    if (compressionEnabled && typeof LZString !== 'undefined') {
      try {
        const decompressed = LZString.decompress(data);
        return decompressed || data;
      } catch (error) {
        console.warn('Error descomprimiendo datos:', error);
      }
    }
    return data;
  }, [compressionEnabled]);

  // ============================================================================
  // 💾 FUNCIONES PRINCIPALES
  // ============================================================================

  /**
   * Guarda los datos
   */
  const save = useCallback(async (
    data: T, 
    saveType: AutoSaveType = 'manual'
  ): Promise<boolean> => {
    if (!isEnabled || isPaused) return false;
    
    // Validar antes de guardar si está configurado
    if (validateBeforeSave && !validateBeforeSave(data)) {
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const storage = getStorage();
      const keys = buildKeys();
      const now = new Date();
      const checksum = calculateChecksum(data);

      // Crear entrada de auto-save
      const entry: AutoSaveEntry<T> = {
        data,
        timestamp: now.toISOString(),
        version,
        saveType,
        checksum
      };

      // Preparar datos para storage
      let serializedData = JSON.stringify(entry);
      serializedData = compressData(serializedData);

      // Guardar datos principales
      if (storage instanceof Map) {
        storage.set(keys.data, serializedData);
      } else {
        storage.setItem(keys.data, serializedData);
      }

      // Gestionar versiones
      await saveVersion(entry);

      // Actualizar estado
      setSavedData(data);
      setCurrentData(data);
      setLastSaved(now);
      setHasUnsavedChanges(false);
      lastDataRef.current = data;

      // Actualizar estadísticas
      updateStats(saveType, serializedData.length);

      onSave?.(data, saveType);
      
      return true;

    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        onStorageFull?.();
        // Intentar limpiar versiones antiguas
        await cleanOldVersions();
        
        // Reintentar una vez
        try {
          const storage = getStorage();
          const keys = buildKeys();
          const entry: AutoSaveEntry<T> = {
            data,
            timestamp: new Date().toISOString(),
            version,
            saveType,
            checksum: calculateChecksum(data)
          };
          
          let serializedData = JSON.stringify(entry);
          serializedData = compressData(serializedData);

          if (storage instanceof Map) {
            storage.set(keys.data, serializedData);
          } else {
            storage.setItem(keys.data, serializedData);
          }
          
          return true;
        } catch (retryError) {
          const errorMessage = 'Storage lleno después de limpieza';
          setError(errorMessage);
          onError?.(errorMessage, 'save');
          return false;
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Error guardando';
      setError(errorMessage);
      onError?.(errorMessage, 'save');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    isEnabled, isPaused, validateBeforeSave, getStorage, buildKeys, 
    version, calculateChecksum, compressData, onSave, onStorageFull, onError
  ]);

  /**
   * Carga los datos
   */
  const load = useCallback(async (): Promise<T | null> => {
    setError(null);

    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      let serializedData: string | null = null;
      
      if (storage instanceof Map) {
        serializedData = storage.get(keys.data) || null;
      } else {
        serializedData = storage.getItem(keys.data);
      }

      if (!serializedData) {
        return null;
      }

      // Descomprimir datos
      serializedData = decompressData(serializedData);
      
      const entry: AutoSaveEntry<T> = JSON.parse(serializedData);
      
      // Verificar integridad de datos
      const currentChecksum = calculateChecksum(entry.data);
      if (entry.checksum && entry.checksum !== currentChecksum) {
        console.warn('Checksum no coincide, posible corrupción de datos');
      }

      // Actualizar estado
      setSavedData(entry.data);
      setCurrentData(entry.data);
      setLastSaved(new Date(entry.timestamp));
      setHasUnsavedChanges(false);
      lastDataRef.current = entry.data;

      onLoad?.(entry.data);
      
      return entry.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando datos';
      setError(errorMessage);
      onError?.(errorMessage, 'load');
      return null;
    }
  }, [getStorage, buildKeys, decompressData, calculateChecksum, onLoad, onError]);

  /**
   * Limpia los datos guardados
   */
  const clear = useCallback(async (): Promise<boolean> => {
    try {
      const storage = getStorage();
      const keys = buildKeys();

      // Limpiar datos principales
      if (storage instanceof Map) {
        storage.delete(keys.data);
        storage.delete(keys.versions);
        storage.delete(keys.recovery);
        storage.delete(keys.stats);
      } else {
        storage.removeItem(keys.data);
        storage.removeItem(keys.versions);
        storage.removeItem(keys.recovery);
        storage.removeItem(keys.stats);
      }

      // Resetear estado
      setSavedData(null);
      setCurrentData(null);
      setLastSaved(null);
      setHasUnsavedChanges(false);
      setStats(null);
      lastDataRef.current = null;

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error limpiando datos';
      setError(errorMessage);
      onError?.(errorMessage, 'clear');
      return false;
    }
  }, [getStorage, buildKeys, onError]);

  // ============================================================================
  // 🔄 CONTROL DEL AUTO-GUARDADO
  // ============================================================================

  /**
   * Habilita el auto-guardado
   */
  const enable = useCallback((): void => {
    setIsEnabled(true);
    startInterval();
  }, []);

  /**
   * Deshabilita el auto-guardado
   */
  const disable = useCallback((): void => {
    setIsEnabled(false);
    stopInterval();
  }, []);

  /**
   * Pausa el auto-guardado temporalmente
   */
  const pause = useCallback((): void => {
    setIsPaused(true);
    stopInterval();
  }, []);

  /**
   * Reanuda el auto-guardado
   */
  const resume = useCallback((): void => {
    setIsPaused(false);
    if (isEnabled) {
      startInterval();
    }
  }, [isEnabled]);

  /**
   * Inicia el intervalo de auto-guardado
   */
  const startInterval = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        if (currentData && hasUnsavedChanges && !isSaving) {
          save(currentData, 'interval');
        }
      }, interval);
    }
  }, [interval, currentData, hasUnsavedChanges, isSaving, save]);

  /**
   * Detiene el intervalo de auto-guardado
   */
  const stopInterval = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ============================================================================
  // 📊 GESTIÓN DE DATOS
  // ============================================================================

  /**
   * Actualiza los datos actuales
   */
  const updateData = useCallback((data: T): void => {
    setCurrentData(data);
    
    // Verificar si hay cambios
    const dataHasChanged = !isEqual(data, lastDataRef.current);
    setHasUnsavedChanges(dataHasChanged);

    // Auto-guardar en cambio si está habilitado
    if (saveOnChange && dataHasChanged && isEnabled && !isPaused) {
      debouncedSave(data, 'change');
    }
  }, [saveOnChange, isEnabled, isPaused]);

  /**
   * Verifica si hay cambios en los datos
   */
  const hasChanges = useCallback((data: T): boolean => {
    return !isEqual(data, lastDataRef.current);
  }, []);

  // ============================================================================
  // 🔄 RECUPERACIÓN DE DATOS
  // ============================================================================

  /**
   * Verifica si hay datos de recuperación
   */
  const hasRecoveryData = useCallback((): boolean => {
    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      if (storage instanceof Map) {
        return storage.has(keys.recovery);
      } else {
        return storage.getItem(keys.recovery) !== null;
      }
    } catch (error) {
      return false;
    }
  }, [getStorage, buildKeys]);

  /**
   * Obtiene datos de recuperación
   */
  const getRecoveryData = useCallback((): T | null => {
    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      let serializedData: string | null = null;
      
      if (storage instanceof Map) {
        serializedData = storage.get(keys.recovery) || null;
      } else {
        serializedData = storage.getItem(keys.recovery);
      }

      if (!serializedData) {
        return null;
      }

      serializedData = decompressData(serializedData);
      const entry: AutoSaveEntry<T> = JSON.parse(serializedData);
      
      return entry.data;

    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error obteniendo datos de recuperación', 'getRecoveryData');
      return null;
    }
  }, [getStorage, buildKeys, decompressData, onError]);

  /**
   * Limpia datos de recuperación
   */
  const clearRecoveryData = useCallback((): void => {
    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      if (storage instanceof Map) {
        storage.delete(keys.recovery);
      } else {
        storage.removeItem(keys.recovery);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error limpiando datos de recuperación', 'clearRecoveryData');
    }
  }, [getStorage, buildKeys, onError]);

  // ============================================================================
  // 📚 GESTIÓN DE VERSIONES
  // ============================================================================

  /**
   * Guarda una versión
   */
  const saveVersion = useCallback(async (entry: AutoSaveEntry<T>): Promise<void> => {
    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      // Obtener versiones existentes
      let versions: AutoSaveEntry<T>[] = [];
      
      let existingVersions: string | null = null;
      if (storage instanceof Map) {
        existingVersions = storage.get(keys.versions) || null;
      } else {
        existingVersions = storage.getItem(keys.versions);
      }
      
      if (existingVersions) {
        const decompressed = decompressData(existingVersions);
        versions = JSON.parse(decompressed);
      }

      // Agregar nueva versión
      versions.unshift(entry);

      // Mantener solo las últimas versiones
      if (versions.length > maxVersions) {
        versions = versions.slice(0, maxVersions);
      }

      // Guardar versiones actualizadas
      let serializedVersions = JSON.stringify(versions);
      serializedVersions = compressData(serializedVersions);

      if (storage instanceof Map) {
        storage.set(keys.versions, serializedVersions);
      } else {
        storage.setItem(keys.versions, serializedVersions);
      }

    } catch (error) {
      console.warn('Error guardando versión:', error);
    }
  }, [getStorage, buildKeys, maxVersions, decompressData, compressData]);

  /**
   * Obtiene todas las versiones
   */
  const getAllVersions = useCallback((): AutoSaveEntry<T>[] => {
    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      let serializedVersions: string | null = null;
      
      if (storage instanceof Map) {
        serializedVersions = storage.get(keys.versions) || null;
      } else {
        serializedVersions = storage.getItem(keys.versions);
      }

      if (!serializedVersions) {
        return [];
      }

      const decompressed = decompressData(serializedVersions);
      return JSON.parse(decompressed);

    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error obteniendo versiones', 'getAllVersions');
      return [];
    }
  }, [getStorage, buildKeys, decompressData, onError]);

  /**
   * Obtiene una versión específica
   */
  const getVersion = useCallback((timestamp: string): AutoSaveEntry<T> | null => {
    const versions = getAllVersions();
    return versions.find(v => v.timestamp === timestamp) || null;
  }, [getAllVersions]);

  /**
   * Elimina una versión específica
   */
  const deleteVersion = useCallback((timestamp: string): boolean => {
    try {
      const storage = getStorage();
      const keys = buildKeys();
      
      const versions = getAllVersions();
      const filteredVersions = versions.filter(v => v.timestamp !== timestamp);

      let serializedVersions = JSON.stringify(filteredVersions);
      serializedVersions = compressData(serializedVersions);

      if (storage instanceof Map) {
        storage.set(keys.versions, serializedVersions);
      } else {
        storage.setItem(keys.versions, serializedVersions);
      }

      return true;

    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error eliminando versión', 'deleteVersion');
      return false;
    }
  }, [getStorage, buildKeys, getAllVersions, compressData, onError]);

  /**
   * Limpia versiones antiguas
   */
  const cleanOldVersions = useCallback(async (): Promise<number> => {
    try {
      const versions = getAllVersions();
      const now = new Date();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
      
      const validVersions = versions.filter(version => {
        const versionDate = new Date(version.timestamp);
        return (now.getTime() - versionDate.getTime()) < maxAge;
      });

      // Mantener al menos las últimas 3 versiones
      const versionsToKeep = validVersions.length < 3 ? 
        versions.slice(0, 3) : 
        validVersions;

      const storage = getStorage();
      const keys = buildKeys();
      
      let serializedVersions = JSON.stringify(versionsToKeep);
      serializedVersions = compressData(serializedVersions);

      if (storage instanceof Map) {
        storage.set(keys.versions, serializedVersions);
      } else {
        storage.setItem(keys.versions, serializedVersions);
      }

      return versions.length - versionsToKeep.length;

    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error limpiando versiones', 'cleanOldVersions');
      return 0;
    }
  }, [getAllVersions, getStorage, buildKeys, compressData, onError]);

  // ============================================================================
  // 📊 ESTADÍSTICAS Y UTILIDADES
  // ============================================================================

  /**
   * Actualiza estadísticas
   */
  const updateStats = useCallback((saveType: AutoSaveType, dataSize: number): void => {
    setStats(prev => {
      const newStats: AutoSaveStats = {
        totalSaves: (prev?.totalSaves || 0) + 1,
        lastSave: new Date(),
        savesByType: {
          ...(prev?.savesByType || {}),
          [saveType]: ((prev?.savesByType?.[saveType] || 0) + 1)
        } as Record<AutoSaveType, number>,
        averageSize: prev ? 
          ((prev.averageSize * prev.totalSaves) + dataSize) / (prev.totalSaves + 1) :
          dataSize,
        storageUsed: (prev?.storageUsed || 0) + dataSize,
        recoveryAvailable: hasRecoveryData()
      };

      return newStats;
    });
  }, [hasRecoveryData]);

  /**
   * Obtiene estadísticas
   */
  const getStats = useCallback((): AutoSaveStats => {
    return stats || {
      totalSaves: 0,
      lastSave: null,
      savesByType: {
        manual: 0,
        interval: 0,
        change: 0,
        blur: 0,
        unload: 0,
        recovery: 0
      },
      averageSize: 0,
      storageUsed: 0,
      recoveryAvailable: hasRecoveryData()
    };
  }, [stats, hasRecoveryData]);

  /**
   * Exporta todos los datos
   */
  const exportData = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      key,
      version,
      currentData,
      savedData,
      versions: getAllVersions(),
      stats: getStats(),
      config: {
        storageType,
        compressionEnabled,
        maxVersions
      }
    };
  }, [key, version, currentData, savedData, getAllVersions, getStats, storageType, compressionEnabled, maxVersions]);

  /**
   * Importa datos
   */
  const importData = useCallback(async (data: any): Promise<boolean> => {
    try {
      if (!data.currentData) {
        throw new Error('Datos de importación inválidos');
      }

      // Limpiar datos existentes
      await clear();

      // Importar datos principales
      const success = await save(data.currentData, 'manual');
      
      if (success && data.versions) {
        // Importar versiones
        const storage = getStorage();
        const keys = buildKeys();
        
        let serializedVersions = JSON.stringify(data.versions);
        serializedVersions = compressData(serializedVersions);

        if (storage instanceof Map) {
          storage.set(keys.versions, serializedVersions);
        } else {
          storage.setItem(keys.versions, serializedVersions);
        }
      }

      return success;

    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error importando datos', 'importData');
      return false;
    }
  }, [clear, save, getStorage, buildKeys, compressData, onError]);

  // ============================================================================
  // 🔄 FUNCIONES DEBOUNCED
  // ============================================================================

  // Save con debounce para cambios
  const debouncedSave = useCallback(
    debounce((data: T, saveType: AutoSaveType) => {
      save(data, saveType);
    }, debounceMs),
    [save, debounceMs]
  );

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Configurar intervalo inicial
  useEffect(() => {
    if (isEnabled && !isPaused) {
      startInterval();
    }
    
    return () => {
      stopInterval();
    };
  }, [isEnabled, isPaused, startInterval, stopInterval]);

  // Guardar en unload si está configurado
  useEffect(() => {
    if (!saveOnUnload) return;

    const handleBeforeUnload = () => {
      if (currentData && hasUnsavedChanges) {
        // Guardar datos de recuperación
        try {
          const storage = getStorage();
          const keys = buildKeys();
          
          const recoveryEntry: AutoSaveEntry<T> = {
            data: currentData,
            timestamp: new Date().toISOString(),
            version,
            saveType: 'unload',
            checksum: calculateChecksum(currentData)
          };

          let serializedData = JSON.stringify(recoveryEntry);
          serializedData = compressData(serializedData);

          if (storage instanceof Map) {
            storage.set(keys.recovery, serializedData);
          } else {
            storage.setItem(keys.recovery, serializedData);
          }
        } catch (error) {
          console.warn('Error guardando datos de recuperación:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveOnUnload, currentData, hasUnsavedChanges, getStorage, buildKeys, version, calculateChecksum, compressData]);

  // Cargar datos iniciales
  useEffect(() => {
    load();
  }, []);

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado
    isEnabled,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    
    // Datos
    savedData,
    currentData,
    
    // Acciones principales
    save,
    load,
    clear,
    
    // Control
    enable,
    disable,
    pause,
    resume,
    
    // Gestión de datos
    updateData,
    hasChanges,
    
    // Recuperación
    hasRecoveryData,
    getRecoveryData,
    clearRecoveryData,
    
    // Versiones
    getAllVersions,
    getVersion,
    deleteVersion,
    
    // Utilidades
    getStats,
    exportData,
    importData,
    
    // Estado
    error,
    stats
  };
};

// Declarar tipos globales
declare global {
  interface Window {
    _autoSaveMemoryStorage?: Map<string, string>;
  }
}

declare const LZString: {
  compress: (input: string) => string;
  decompress: (compressed: string) => string;
} | undefined;

export default useFormAutoSave;