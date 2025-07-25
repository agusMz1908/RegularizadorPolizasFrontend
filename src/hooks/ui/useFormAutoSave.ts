// src/hooks/ui/useFormAutoSave.ts

import { useState, useEffect, useRef, useCallback } from 'react';

// ✅ Tipos para el estado de autoguardado
export type AutoSaveStatus = 
  | 'idle'           // No hay cambios pendientes
  | 'pending'        // Hay cambios sin guardar
  | 'saving'         // Guardando en este momento
  | 'saved'          // Guardado exitoso
  | 'error'          // Error al guardar
  | 'offline';       // Sin conexión

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'custom';

// ✅ Configuración del autoguardado
export interface AutoSaveConfig<T = any> {
  // Configuración básica
  interval?: number;              // Intervalo en ms (default: 30000 = 30s)
  storageKey?: string;           // Clave para localStorage/sessionStorage
  storageType?: StorageType;     // Tipo de almacenamiento
  enabled?: boolean;             // Habilitar/deshabilitar autoguardado
  
  // Configuración avanzada
  debounceDelay?: number;        // Delay para debounce de cambios (default: 1000ms)
  maxRetries?: number;           // Máximo intentos en caso de error (default: 3)
  retryDelay?: number;           // Delay entre reintentos (default: 5000ms)
  saveOnUnload?: boolean;        // Guardar al cerrar ventana (default: true)
  saveOnVisibilityChange?: boolean; // Guardar al cambiar tab (default: true)
  
  // Validación
  validator?: (data: T) => boolean | Promise<boolean>; // Validar antes de guardar
  transformer?: (data: T) => any; // Transformar datos antes de guardar
  
  // Callbacks
  onSave?: (data: T, metadata: SaveMetadata) => void | Promise<void>;
  onError?: (error: Error, attempt: number) => void;
  onRestore?: (data: T) => void;
  
  // Configuración de storage personalizado
  customStorage?: {
    save: (key: string, data: any) => Promise<void>;
    load: (key: string) => Promise<any>;
    remove: (key: string) => Promise<void>;
  };
}

// ✅ Metadatos del guardado
export interface SaveMetadata {
  timestamp: number;
  attempt: number;
  isAutoSave: boolean;
  changeCount: number;
  dataSize: number;
}

// ✅ Estado del autoguardado
export interface AutoSaveState {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  lastError: Error | null;
  changeCount: number;
  nextSaveIn: number; // Segundos hasta el próximo guardado
  hasUnsavedChanges: boolean;
  isOnline: boolean;
  retryCount: number;
}

export interface UseFormAutoSaveReturn<T> {
  // Estado
  state: AutoSaveState;
  
  // Configuración
  config: AutoSaveConfig<T>;
  updateConfig: (newConfig: Partial<AutoSaveConfig<T>>) => void;
  
  // Acciones
  saveNow: () => Promise<boolean>;
  restoreData: () => T | null;
  clearSaved: () => void;
  resetState: () => void;
  
  // Control
  enable: () => void;
  disable: () => void;
  pause: () => void;
  resume: () => void;
  
  // Utilidades
  getStorageSize: () => number;
  canSave: () => boolean;
  formatLastSaved: () => string;
}

export const useFormAutoSave = <T = any>(
  data: T,
  initialConfig: AutoSaveConfig<T> = {}
): UseFormAutoSaveReturn<T> => {
  
  // ✅ Configuración con valores por defecto
  const [config, setConfig] = useState<AutoSaveConfig<T>>({
    interval: 30000,
    storageKey: 'form-autosave',
    storageType: 'localStorage',
    enabled: true,
    debounceDelay: 1000,
    maxRetries: 3,
    retryDelay: 5000,
    saveOnUnload: true,
    saveOnVisibilityChange: true,
    ...initialConfig
  });

  // ✅ Estado del autoguardado
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    lastError: null,
    changeCount: 0,
    nextSaveIn: config.interval! / 1000,
    hasUnsavedChanges: false,
    isOnline: navigator.onLine,
    retryCount: 0
  });

  // ✅ Referencias para timers e intervalos
  const saveTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  
  // ✅ Referencias para datos
  const lastDataRef = useRef<T>(data);
  const isPausedRef = useRef<boolean>(false);

  // ✅ Obtener storage
  const getStorage = useCallback((): Storage | null => {
    switch (config.storageType) {
      case 'localStorage':
        return typeof localStorage !== 'undefined' ? localStorage : null;
      case 'sessionStorage':
        return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
      case 'memory':
      case 'custom':
      default:
        return null;
    }
  }, [config.storageType]);

  // ✅ Calcular tamaño de datos
  const getDataSize = useCallback((data: any): number => {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }, []);

  // ✅ Validar datos antes de guardar
  const validateData = useCallback(async (data: T): Promise<boolean> => {
    if (!config.validator) return true;
    
    try {
      const result = await config.validator(data);
      return result;
    } catch (error) {
      console.error('Error validating data for autosave:', error);
      return false;
    }
  }, [config.validator]);

  // ✅ Transformar datos antes de guardar
  const transformData = useCallback((data: T): any => {
    if (!config.transformer) return data;
    
    try {
      return config.transformer(data);
    } catch (error) {
      console.error('Error transforming data for autosave:', error);
      return data;
    }
  }, [config.transformer]);

  // ✅ Función principal de guardado
  const performSave = useCallback(async (
    data: T, 
    isAutoSave: boolean = true,
    attempt: number = 1
  ): Promise<boolean> => {
    
    if (!config.enabled || isPausedRef.current) {
      return false;
    }

    // Validar datos
    const isValid = await validateData(data);
    if (!isValid) {
      setState(prev => ({ 
        ...prev, 
        status: 'error',
        lastError: new Error('Data validation failed')
      }));
      return false;
    }

    // Transformar datos
    const transformedData = transformData(data);
    
    // Crear metadatos
    const metadata: SaveMetadata = {
      timestamp: Date.now(),
      attempt,
      isAutoSave,
      changeCount: state.changeCount,
      dataSize: getDataSize(transformedData)
    };

    setState(prev => ({ ...prev, status: 'saving' }));

    try {
      if (config.storageType === 'custom' && config.customStorage) {
        // Storage personalizado
        await config.customStorage.save(config.storageKey!, transformedData);
      } else {
        // Storage nativo
        const storage = getStorage();
        if (storage && config.storageKey) {
          const saveData = {
            data: transformedData,
            metadata,
            version: '1.0'
          };
          storage.setItem(config.storageKey, JSON.stringify(saveData));
        }
      }

      // Callback de éxito
      if (config.onSave) {
        await config.onSave(data, metadata);
      }

      setState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date(),
        lastError: null,
        hasUnsavedChanges: false,
        retryCount: 0,
        nextSaveIn: config.interval! / 1000
      }));

      // Auto-cambiar a idle después de 2 segundos
      setTimeout(() => {
        setState(prev => prev.status === 'saved' ? { ...prev, status: 'idle' } : prev);
      }, 2000);

      return true;
      
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Unknown save error');
      
      setState(prev => ({
        ...prev,
        status: 'error',
        lastError: saveError,
        retryCount: attempt
      }));

      // Callback de error
      if (config.onError) {
        config.onError(saveError, attempt);
      }

      // Reintentar si no se alcanzó el máximo
      if (attempt < (config.maxRetries || 3)) {
        retryTimerRef.current = window.setTimeout(() => {
          performSave(data, isAutoSave, attempt + 1);
        }, config.retryDelay);
      }

      return false;
    }
  }, [config, state.changeCount, validateData, transformData, getDataSize, getStorage]);

  // ✅ Función pública para guardar ahora
  const saveNow = useCallback(async (): Promise<boolean> => {
    return await performSave(data, false);
  }, [data, performSave]);

  // ✅ Restaurar datos guardados
  const restoreData = useCallback((): T | null => {
    try {
      if (config.storageType === 'custom' && config.customStorage) {
        // Para custom storage, necesitaríamos hacer async, 
        // pero mantenemos la interfaz sync por simplicidad
        console.warn('Custom storage restore no soportado en modo sync');
        return null;
      } else {
        const storage = getStorage();
        if (storage && config.storageKey) {
          const saved = storage.getItem(config.storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            const restoredData = parsed.data || parsed; // Backward compatibility
            
            if (config.onRestore) {
              config.onRestore(restoredData);
            }
            
            return restoredData;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error restoring autosave data:', error);
      return null;
    }
  }, [config, getStorage]);

  // ✅ Limpiar datos guardados
  const clearSaved = useCallback(() => {
    try {
      if (config.storageType === 'custom' && config.customStorage) {
        // Para custom storage, sería async pero mantenemos interfaz sync
        console.warn('Custom storage clear no soportado en modo sync');
      } else {
        const storage = getStorage();
        if (storage && config.storageKey) {
          storage.removeItem(config.storageKey);
        }
      }
    } catch (error) {
      console.error('Error clearing autosave data:', error);
    }
  }, [config, getStorage]);

  // ✅ Resetear estado
  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      lastSaved: null,
      lastError: null,
      changeCount: 0,
      nextSaveIn: config.interval! / 1000,
      hasUnsavedChanges: false,
      isOnline: navigator.onLine,
      retryCount: 0
    });
  }, [config.interval]);

  // ✅ Funciones de control
  const enable = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: true }));
  }, []);

  const disable = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: false }));
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  // ✅ Utilidades
  const updateConfig = useCallback((newConfig: Partial<AutoSaveConfig<T>>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const getStorageSize = useCallback((): number => {
    return getDataSize(data);
  }, [data, getDataSize]);

  const canSave = useCallback((): boolean => {
    return config.enabled! && !isPausedRef.current && state.isOnline;
  }, [config.enabled, state.isOnline]);

  const formatLastSaved = useCallback((): string => {
    if (!state.lastSaved) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - state.lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace menos de 1 minuto';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    
    return state.lastSaved.toLocaleTimeString();
  }, [state.lastSaved]);

  // ✅ Detectar cambios en los datos
  useEffect(() => {
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    
    if (hasChanged && config.enabled) {
      lastDataRef.current = data;
      
      setState(prev => ({
        ...prev,
        changeCount: prev.changeCount + 1,
        hasUnsavedChanges: true,
        status: prev.status === 'saved' ? 'pending' : prev.status
      }));

      // Debounce: resetear timer de guardado automático
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        // Iniciar countdown para próximo guardado
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = window.setTimeout(() => {
          if (canSave()) {
            performSave(data, true);
          }
        }, config.debounceDelay);
      }, config.debounceDelay);
    }
  }, [data, config.enabled, config.debounceDelay, canSave, performSave]);

  // ✅ Countdown timer
  useEffect(() => {
    if (!config.enabled || state.status === 'saving') return;

    countdownTimerRef.current = window.setInterval(() => {
      setState(prev => ({
        ...prev,
        nextSaveIn: Math.max(0, prev.nextSaveIn - 1)
      }));
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [config.enabled, state.status]);

  // ✅ Detectar estado online/offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true, status: 'idle' }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false, status: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Guardar al cerrar ventana
  useEffect(() => {
    if (!config.saveOnUnload) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges && canSave()) {
        // Guardado síncrono para beforeunload
        try {
          const storage = getStorage();
          if (storage && config.storageKey && config.storageType !== 'memory') {
            const saveData = {
              data: transformData(data),
              metadata: {
                timestamp: Date.now(),
                attempt: 1,
                isAutoSave: false,
                changeCount: state.changeCount,
                dataSize: getDataSize(data)
              },
              version: '1.0'
            };
            storage.setItem(config.storageKey, JSON.stringify(saveData));
          }
        } catch (error) {
          console.error('Error saving on unload:', error);
        }

        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [config.saveOnUnload, state.hasUnsavedChanges, canSave, getStorage, config.storageKey, transformData, data, state.changeCount, getDataSize]);

  // ✅ Guardar al cambiar de tab
  useEffect(() => {
    if (!config.saveOnVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (document.hidden && state.hasUnsavedChanges && canSave()) {
        saveNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config.saveOnVisibilityChange, state.hasUnsavedChanges, canSave, saveNow]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  return {
    state,
    config,
    updateConfig,
    saveNow,
    restoreData,
    clearSaved,
    resetState,
    enable,
    disable,
    pause,
    resume,
    getStorageSize,
    canSave,
    formatLastSaved
  };
};

// ✅ Hook específico para formularios de póliza
export const usePolizaFormAutoSave = <T = any>(
  formData: T,
  config: Partial<AutoSaveConfig<T>> = {}
) => {
  return useFormAutoSave(formData, {
    storageKey: 'poliza-form-autosave',
    interval: 30000, // 30 segundos
    debounceDelay: 1000, // 1 segundo
    saveOnUnload: true,
    saveOnVisibilityChange: true,
    validator: (data: any) => {
      // Validación básica para formularios de póliza
      return Boolean(data && (data.numeroPoliza || data.asegurado));
    },
    transformer: (data: any) => {
      // Limpiar datos sensibles antes de guardar en localStorage
      const { sensitiveField, ...safeData } = data;
      return safeData;
    },
    ...config
  });
};

export default useFormAutoSave;