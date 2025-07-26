// src/hooks/wizard/useWizardPersistence.ts - IMPORTS CORREGIDOS

import { useState, useCallback, useRef, useEffect } from 'react';
import { PolizaFormData } from '../../types/core/poliza';
import { WizardState, WizardStep } from '../../types/ui/wizard'; // ✅ CORREGIDO

// ============================================================================
// 🎯 TIPOS DEL HOOK
// ============================================================================

export interface PersistenceData {
  // Datos del wizard
  wizardState: WizardState;
  formData: PolizaFormData;
  stepData: Record<string, any>;
  
  // Metadatos
  sessionId: string;
  userId?: string;
  lastUpdate: string;
  version: string;
  expiresAt: string;
  
  // Control
  isComplete: boolean;
  currentStep: WizardStep;
  completedSteps: string[];
}

export interface StorageStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  storageUsed: number; // en bytes
  oldestSession: string | null;
  newestSession: string | null;
}

export interface UseWizardPersistenceConfig {
  // Configuración de storage
  storageType?: 'localStorage' | 'sessionStorage' | 'memory';
  keyPrefix?: string;
  version?: string;
  maxSessions?: number;
  
  // Configuración de expiración
  sessionDuration?: number; // en ms
  autoExpire?: boolean;
  cleanupInterval?: number; // en ms
  
  // Configuración de auto-guardado
  autoSave?: boolean;
  autoSaveInterval?: number; // en ms
  debounceMs?: number;
  
  // Configuración de datos
  includeFormData?: boolean;
  includeStepData?: boolean;
  compressionEnabled?: boolean;
  
  // Identificación
  userId?: string;
  sessionId?: string;
  generateSessionId?: () => string;
  
  // Callbacks
  onSave?: (data: PersistenceData) => void;
  onLoad?: (data: PersistenceData) => void;
  onExpired?: (sessionId: string) => void;
  onStorageFull?: () => void;
  onError?: (error: string, operation: string) => void;
}

export interface UseWizardPersistenceReturn {
  // Estado
  isLoading: boolean;
  isSaving: boolean;
  hasPersistedData: boolean;
  sessionId: string;
  lastSaved: Date | null;
  
  // Datos persistidos
  persistedWizardState: WizardState | null;
  persistedFormData: PolizaFormData | null;
  persistedStepData: Record<string, any> | null;
  
  // Acciones principales
  saveState: (
    wizardState: WizardState,
    formData?: PolizaFormData,
    stepData?: Record<string, any>
  ) => Promise<boolean>;
  loadState: () => Promise<PersistenceData | null>;
  clearState: () => Promise<boolean>;
  
  // Control de sesión
  createNewSession: () => string;
  restoreSession: (sessionId: string) => Promise<boolean>;
  getAllSessions: () => string[];
  
  // Utilidades
  exportSession: () => any;
  importSession: (data: any) => Promise<boolean>;
  getStorageStats: () => StorageStats;
  cleanExpiredSessions: () => number;
  
  // Auto-guardado
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  isAutoSaveEnabled: boolean;
  
  // Estado
  error: string | null;
  stats: StorageStats | null;
}

// ============================================================================
// 🎪 HOOK PRINCIPAL
// ============================================================================

export const useWizardPersistence = (
  config: UseWizardPersistenceConfig = {}
): UseWizardPersistenceReturn => {

  const {
    storageType = 'localStorage',
    keyPrefix = 'poliza_wizard',
    version = '1.0',
    maxSessions = 10,
    sessionDuration = 24 * 60 * 60 * 1000, // 24 horas
    autoExpire = true,
    cleanupInterval = 60 * 60 * 1000, // 1 hora
    autoSave = true,
    autoSaveInterval = 30 * 1000, // 30 segundos
    debounceMs = 1000,
    includeFormData = true,
    includeStepData = true,
    compressionEnabled = false,
    userId,
    sessionId: providedSessionId,
    generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    onSave,
    onLoad,
    onExpired,
    onStorageFull,
    onError
  } = config;

  // ============================================================================
  // 📊 ESTADO DEL HOOK
  // ============================================================================

  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPersistedData, setHasPersistedData] = useState(false);
  const [sessionId, setSessionId] = useState(providedSessionId || generateSessionId());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Datos persistidos
  const [persistedWizardState, setPersistedWizardState] = useState<WizardState | null>(null);
  const [persistedFormData, setPersistedFormData] = useState<PolizaFormData | null>(null);
  const [persistedStepData, setPersistedStepData] = useState<Record<string, any> | null>(null);
  
  // Estado y estadísticas
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(autoSave);
  
  // Referencias
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);
  const saveQueueRef = useRef<any>(null);

  // ============================================================================
  // 💾 FUNCIONES DE STORAGE
  // ============================================================================

  /**
   * Obtiene el storage apropiado
   */
  const getStorage = useCallback((): Storage | Map<string, string> => {
    if (storageType === 'memory') {
      // Crear storage en memoria si no existe
      if (!window._wizardMemoryStorage) {
        window._wizardMemoryStorage = new Map<string, string>();
      }
      return window._wizardMemoryStorage;
    }
    
    try {
      return storageType === 'localStorage' ? localStorage : sessionStorage;
    } catch (error) {
      console.warn('Storage no disponible, usando memoria:', error);
      if (!window._wizardMemoryStorage) {
        window._wizardMemoryStorage = new Map<string, string>();
      }
      return window._wizardMemoryStorage;
    }
  }, [storageType]);

  /**
   * Construye la clave de storage
   */
  const buildStorageKey = useCallback((id: string): string => {
    return `${keyPrefix}_${id}`;
  }, [keyPrefix]);

  /**
   * Guarda datos en storage
   */
  const saveToStorage = useCallback(async (key: string, data: any): Promise<boolean> => {
    try {
      const storage = getStorage();
      let serializedData = JSON.stringify(data);
      
      // Aplicar compresión si está habilitada
      if (compressionEnabled) {
        // Implementación básica de compresión (en producción usar una librería)
        serializedData = LZString?.compress?.(serializedData) || serializedData;
      }
      
      if (storage instanceof Map) {
        storage.set(key, serializedData);
      } else {
        storage.setItem(key, serializedData);
      }
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        onStorageFull?.();
        // Intentar limpiar sesiones expiradas
        cleanExpiredSessions();
        
        // Intentar guardar nuevamente
        try {
          const storage = getStorage();
          let serializedData = JSON.stringify(data);
          
          if (storage instanceof Map) {
            storage.set(key, serializedData);
          } else {
            storage.setItem(key, serializedData);
          }
          return true;
        } catch (retryError) {
          onError?.('Storage lleno después de limpieza', 'save');
          return false;
        }
      }
      
      onError?.(error instanceof Error ? error.message : 'Error guardando', 'save');
      return false;
    }
  }, [getStorage, compressionEnabled, onStorageFull, onError]);

  /**
   * Carga datos desde storage
   */
  const loadFromStorage = useCallback(async (key: string): Promise<any | null> => {
    try {
      const storage = getStorage();
      let serializedData: string | null = null;
      
      if (storage instanceof Map) {
        serializedData = storage.get(key) || null;
      } else {
        serializedData = storage.getItem(key);
      }
      
      if (!serializedData) return null;
      
      // Aplicar descompresión si está habilitada
      if (compressionEnabled && typeof LZString !== 'undefined') {
        try {
          const decompressed = LZString.decompress(serializedData);
          if (decompressed) {
            serializedData = decompressed;
          }
        } catch (decompressionError) {
          // Si falla la descompresión, usar datos originales
          console.warn('Error descomprimiendo, usando datos originales');
        }
      }
      
      return JSON.parse(serializedData);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error cargando', 'load');
      return null;
    }
  }, [getStorage, compressionEnabled, onError]);

  /**
   * Elimina datos del storage
   */
  const removeFromStorage = useCallback(async (key: string): Promise<boolean> => {
    try {
      const storage = getStorage();
      
      if (storage instanceof Map) {
        storage.delete(key);
      } else {
        storage.removeItem(key);
      }
      
      return true;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error eliminando', 'remove');
      return false;
    }
  }, [getStorage, onError]);

  // ============================================================================
  // 💾 FUNCIONES PRINCIPALES
  // ============================================================================

  /**
   * Guarda el estado del wizard
   */
  const saveState = useCallback(async (
    wizardState: WizardState,
    formData?: PolizaFormData,
    stepData?: Record<string, any>
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + sessionDuration);
      
      const persistenceData: PersistenceData = {
        wizardState,
        formData: includeFormData ? (formData || {} as PolizaFormData) : {} as PolizaFormData,
        stepData: includeStepData ? (stepData || {}) : {},
        sessionId,
        userId,
        lastUpdate: now.toISOString(),
        version,
        expiresAt: expiresAt.toISOString(),
        isComplete: wizardState.isComplete || false,
        currentStep: wizardState.currentStep,
        completedSteps: Array.from(wizardState.completedSteps || [])
      };

      const key = buildStorageKey(sessionId);
      const success = await saveToStorage(key, persistenceData);
      
      if (success) {
        setLastSaved(now);
        setHasPersistedData(true);
        setPersistedWizardState(wizardState);
        setPersistedFormData(formData || null);
        setPersistedStepData(stepData || null);
        
        // Actualizar referencia para comparación
        lastDataRef.current = { wizardState, formData, stepData };
        
        onSave?.(persistenceData);
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error guardando estado';
      setError(errorMessage);
      onError?.(errorMessage, 'saveState');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    sessionDuration, sessionId, userId, version, includeFormData, includeStepData,
    buildStorageKey, saveToStorage, onSave, onError
  ]);

  /**
   * Carga el estado del wizard
   */
  const loadState = useCallback(async (): Promise<PersistenceData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const key = buildStorageKey(sessionId);
      const data = await loadFromStorage(key);
      
      if (!data) {
        setHasPersistedData(false);
        return null;
      }

      // Verificar expiración
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      
      if (autoExpire && now > expiresAt) {
        // Sesión expirada
        await removeFromStorage(key);
        setHasPersistedData(false);
        onExpired?.(sessionId);
        return null;
      }

      // Verificar versión
      if (data.version !== version) {
        console.warn(`Versión de datos incompatible: ${data.version} vs ${version}`);
        // Opcionalmente migrar datos aquí
      }

      // Actualizar estado
      setHasPersistedData(true);
      setPersistedWizardState(data.wizardState);
      setPersistedFormData(data.formData);
      setPersistedStepData(data.stepData);
      setLastSaved(new Date(data.lastUpdate));
      
      onLoad?.(data);
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando estado';
      setError(errorMessage);
      onError?.(errorMessage, 'loadState');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    sessionId, buildStorageKey, loadFromStorage, removeFromStorage, 
    autoExpire, version, onLoad, onExpired, onError
  ]);

  /**
   * Limpia el estado del wizard
   */
  const clearState = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      const key = buildStorageKey(sessionId);
      const success = await removeFromStorage(key);
      
      if (success) {
        setHasPersistedData(false);
        setPersistedWizardState(null);
        setPersistedFormData(null);
        setPersistedStepData(null);
        setLastSaved(null);
        lastDataRef.current = null;
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error limpiando estado';
      setError(errorMessage);
      onError?.(errorMessage, 'clearState');
      return false;
    }
  }, [sessionId, buildStorageKey, removeFromStorage, onError]);

  // ============================================================================
  // 🔧 CONTROL DE SESIÓN
  // ============================================================================

  /**
   * Crea nueva sesión
   */
  const createNewSession = useCallback((): string => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setHasPersistedData(false);
    setPersistedWizardState(null);
    setPersistedFormData(null);
    setPersistedStepData(null);
    setLastSaved(null);
    lastDataRef.current = null;
    
    return newSessionId;
  }, [generateSessionId]);

  /**
   * Restaura una sesión específica
   */
  const restoreSession = useCallback(async (targetSessionId: string): Promise<boolean> => {
    const oldSessionId = sessionId;
    setSessionId(targetSessionId);
    
    const data = await loadState();
    
    if (!data) {
      // Restaurar sesión anterior si falló
      setSessionId(oldSessionId);
      return false;
    }
    
    return true;
  }, [sessionId, loadState]);

  /**
   * Obtiene todas las sesiones disponibles
   */
  const getAllSessions = useCallback((): string[] => {
    try {
      const storage = getStorage();
      const sessions: string[] = [];
      
      if (storage instanceof Map) {
        storage.forEach((_, key) => {
          if (key.startsWith(keyPrefix)) {
            const sessionId = key.replace(`${keyPrefix}_`, '');
            sessions.push(sessionId);
          }
        });
      } else {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(keyPrefix)) {
            const sessionId = key.replace(`${keyPrefix}_`, '');
            sessions.push(sessionId);
          }
        }
      }
      
      return sessions;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error obteniendo sesiones', 'getAllSessions');
      return [];
    }
  }, [getStorage, keyPrefix, onError]);

  // ============================================================================
  // 📊 UTILIDADES Y ESTADÍSTICAS
  // ============================================================================

  /**
   * Exporta la sesión actual
   */
  const exportSession = useCallback(() => {
    return {
      sessionId,
      persistedWizardState,
      persistedFormData,
      persistedStepData,
      lastSaved: lastSaved?.toISOString(),
      config: {
        version,
        includeFormData,
        includeStepData
      }
    };
  }, [sessionId, persistedWizardState, persistedFormData, persistedStepData, lastSaved, version, includeFormData, includeStepData]);

  /**
   * Importa una sesión
   */
  const importSession = useCallback(async (data: any): Promise<boolean> => {
    try {
      if (!data.persistedWizardState) {
        throw new Error('Datos de sesión inválidos');
      }
      
      // Crear nueva sesión para los datos importados
      const newSessionId = generateSessionId();
      const oldSessionId = sessionId;
      
      setSessionId(newSessionId);
      
      const success = await saveState(
        data.persistedWizardState,
        data.persistedFormData,
        data.persistedStepData
      );
      
      if (!success) {
        // Restaurar sesión anterior si falló
        setSessionId(oldSessionId);
        return false;
      }
      
      return true;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error importando sesión', 'importSession');
      return false;
    }
  }, [sessionId, generateSessionId, saveState, onError]);

  /**
   * Obtiene estadísticas de storage
   */
  const getStorageStats = useCallback((): StorageStats => {
    const sessions = getAllSessions();
    let totalSize = 0;
    let activeSessions = 0;
    let expiredSessions = 0;
    let oldestSession: string | null = null;
    let newestSession: string | null = null;
    let oldestDate = new Date();
    let newestDate = new Date(0);

    sessions.forEach(sessionId => {
      try {
        const key = buildStorageKey(sessionId);
        const storage = getStorage();
        let data: string | null = null;
        
        if (storage instanceof Map) {
          data = storage.get(key) || null;
        } else {
          data = storage.getItem(key);
        }
        
        if (data) {
          totalSize += data.length;
          
          const parsed = JSON.parse(data);
          const lastUpdate = new Date(parsed.lastUpdate);
          const expiresAt = new Date(parsed.expiresAt);
          const now = new Date();
          
          if (now > expiresAt) {
            expiredSessions++;
          } else {
            activeSessions++;
          }
          
          if (lastUpdate < oldestDate) {
            oldestDate = lastUpdate;
            oldestSession = sessionId;
          }
          
          if (lastUpdate > newestDate) {
            newestDate = lastUpdate;
            newestSession = sessionId;
          }
        }
      } catch (error) {
        // Ignorar errores de parseo
      }
    });

    const stats: StorageStats = {
      totalSessions: sessions.length,
      activeSessions,
      expiredSessions,
      storageUsed: totalSize,
      oldestSession,
      newestSession
    };
    
    setStats(stats);
    return stats;
  }, [getAllSessions, buildStorageKey, getStorage]);

  /**
   * Limpia sesiones expiradas
   */
  const cleanExpiredSessions = useCallback((): number => {
    const sessions = getAllSessions();
    let cleaned = 0;
    
    sessions.forEach(async sessionId => {
      try {
        const key = buildStorageKey(sessionId);
        const data = await loadFromStorage(key);
        
        if (data) {
          const expiresAt = new Date(data.expiresAt);
          const now = new Date();
          
          if (now > expiresAt) {
            await removeFromStorage(key);
            cleaned++;
          }
        }
      } catch (error) {
        // Si hay error leyendo, eliminar la entrada corrupta
        const key = buildStorageKey(sessionId);
        removeFromStorage(key);
        cleaned++;
      }
    });
    
    return cleaned;
  }, [getAllSessions, buildStorageKey, loadFromStorage, removeFromStorage]);

  // ============================================================================
  // ⚡ AUTO-GUARDADO
  // ============================================================================

  /**
   * Habilita auto-guardado
   */
  const enableAutoSave = useCallback((): void => {
    setIsAutoSaveEnabled(true);
    
    if (autoSaveInterval > 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        // Solo auto-guardar si hay datos y han cambiado
        if (lastDataRef.current && hasPersistedData) {
          const { wizardState, formData, stepData } = lastDataRef.current;
          saveState(wizardState, formData, stepData);
        }
      }, autoSaveInterval);
    }
  }, [autoSaveInterval, hasPersistedData, saveState]);

  /**
   * Deshabilita auto-guardado
   */
  const disableAutoSave = useCallback((): void => {
    setIsAutoSaveEnabled(false);
    
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Configurar auto-guardado inicial
  useEffect(() => {
    if (autoSave) {
      enableAutoSave();
    }
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSave, enableAutoSave]);

  // Configurar limpieza automática
  useEffect(() => {
    if (autoExpire && cleanupInterval > 0) {
      cleanupIntervalRef.current = setInterval(() => {
        cleanExpiredSessions();
      }, cleanupInterval);
    }
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [autoExpire, cleanupInterval, cleanExpiredSessions]);

  // Cargar datos iniciales
  useEffect(() => {
    loadState();
  }, []);

  // ============================================================================
  // 📤 RETURN DEL HOOK
  // ============================================================================

  return {
    // Estado
    isLoading,
    isSaving,
    hasPersistedData,
    sessionId,
    lastSaved,
    
    // Datos persistidos
    persistedWizardState,
    persistedFormData,
    persistedStepData,
    
    // Acciones principales
    saveState,
    loadState,
    clearState,
    
    // Control de sesión
    createNewSession,
    restoreSession,
    getAllSessions,
    
    // Utilidades
    exportSession,
    importSession,
    getStorageStats,
    cleanExpiredSessions,
    
    // Auto-guardado
    enableAutoSave,
    disableAutoSave,
    isAutoSaveEnabled,
    
    // Estado
    error,
    stats
  };
};

// Declarar tipo global para memory storage
declare global {
  interface Window {
    _wizardMemoryStorage?: Map<string, string>;
  }
}

// Definir LZString si está disponible (opcional)
declare const LZString: {
  compress: (input: string) => string;
  decompress: (compressed: string) => string;
} | undefined;

export default useWizardPersistence;