// src/hooks/ui/useDarkModeSync.ts

import { useState, useEffect, useCallback, useRef } from 'react';

// ✅ Tipos de tema disponibles
export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

// ✅ Configuración del hook
export interface DarkModeSyncConfig {
  // Persistencia
  storageKey?: string;           // Clave para localStorage (default: 'theme-preference')
  enableStorage?: boolean;       // Guardar preferencia en localStorage
  
  // Sincronización
  syncWithSystem?: boolean;      // Sincronizar con preferencia del sistema
  syncAcrossTabs?: boolean;      // Sincronizar entre pestañas
  
  // Transiciones
  enableTransitions?: boolean;   // Habilitar transiciones suaves
  transitionDuration?: number;   // Duración de transición en ms
  transitionProperty?: string;   // Propiedades CSS a animar
  
  // Clases CSS
  darkClassName?: string;        // Clase para modo oscuro (default: 'dark')
  lightClassName?: string;       // Clase para modo claro (default: 'light')
  
  // Selectores
  targetElement?: string;        // Selector del elemento target (default: 'html')
  
  // Callbacks
  onChange?: (theme: EffectiveTheme, mode: ThemeMode) => void;
  onSystemChange?: (systemTheme: EffectiveTheme) => void;
  
  // Valores iniciales
  defaultMode?: ThemeMode;       // Modo por defecto (default: 'system')
  defaultTheme?: EffectiveTheme; // Tema por defecto si no se puede detectar sistema
}

// ✅ Estado del tema
export interface ThemeState {
  mode: ThemeMode;              // Modo seleccionado por el usuario
  effectiveTheme: EffectiveTheme; // Tema que se está aplicando realmente
  systemTheme: EffectiveTheme;   // Tema detectado del sistema
  isSystemSupported: boolean;    // Si el navegador soporta detección de sistema
  isTransitioning: boolean;      // Si está en medio de una transición
  lastChanged: Date | null;      // Última vez que cambió el tema
}

export interface UseDarkModeSyncReturn {
  // Estado actual
  state: ThemeState;
  
  // Valores de conveniencia
  isDark: boolean;
  isLight: boolean;
  isSystemMode: boolean;
  
  // Configuración
  config: DarkModeSyncConfig;
  updateConfig: (newConfig: Partial<DarkModeSyncConfig>) => void;
  
  // Acciones principales
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: EffectiveTheme) => void;
  toggleTheme: () => void;
  resetToSystem: () => void;
  
  // Utilidades
  getPreferredTheme: () => EffectiveTheme;
  isThemeSupported: () => boolean;
  exportState: () => string;
  importState: (stateJson: string) => boolean;
  
  // Avanzado
  forceRefresh: () => void;
  enableTransitions: () => void;
  disableTransitions: () => void;
}

// ✅ Configuración por defecto
const DEFAULT_CONFIG: Required<DarkModeSyncConfig> = {
  storageKey: 'theme-preference',
  enableStorage: true,
  syncWithSystem: true,
  syncAcrossTabs: true,
  enableTransitions: true,
  transitionDuration: 300,
  transitionProperty: 'background-color, border-color, color',
  darkClassName: 'dark',
  lightClassName: 'light',
  targetElement: 'html',
  defaultMode: 'system',
  defaultTheme: 'light',
  onChange: () => {},
  onSystemChange: () => {}
};

export const useDarkModeSync = (
  initialConfig: Partial<DarkModeSyncConfig> = {}
): UseDarkModeSyncReturn => {
  
  // ✅ Configuración combinada
  const [config, setConfig] = useState<Required<DarkModeSyncConfig>>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });

  // ✅ Estado del tema
  const [state, setState] = useState<ThemeState>({
    mode: config.defaultMode,
    effectiveTheme: config.defaultTheme,
    systemTheme: config.defaultTheme,
    isSystemSupported: false,
    isTransitioning: false,
    lastChanged: null
  });

  // ✅ Referencias
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const storageListenerRef = useRef<((e: StorageEvent) => void) | null>(null);

  // ✅ Detectar soporte del sistema y tema actual
  const detectSystemTheme = useCallback((): EffectiveTheme => {
    if (typeof window === 'undefined') return config.defaultTheme;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    } catch {
      return config.defaultTheme;
    }
  }, [config.defaultTheme]);

  // ✅ Verificar soporte del sistema
  const checkSystemSupport = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
    } catch {
      return false;
    }
  }, []);

  // ✅ Cargar preferencia desde localStorage
  const loadStoredPreference = useCallback((): ThemeMode => {
    if (!config.enableStorage || typeof localStorage === 'undefined') {
      return config.defaultMode;
    }

    try {
      const stored = localStorage.getItem(config.storageKey);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as ThemeMode;
      }
    } catch (error) {
      console.warn('Error loading theme preference:', error);
    }

    return config.defaultMode;
  }, [config.enableStorage, config.storageKey, config.defaultMode]);

  // ✅ Guardar preferencia en localStorage
  const savePreference = useCallback((mode: ThemeMode) => {
    if (!config.enableStorage || typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(config.storageKey, mode);
    } catch (error) {
      console.warn('Error saving theme preference:', error);
    }
  }, [config.enableStorage, config.storageKey]);

  // ✅ Calcular tema efectivo
  const calculateEffectiveTheme = useCallback((mode: ThemeMode, systemTheme: EffectiveTheme): EffectiveTheme => {
    switch (mode) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'system':
        return systemTheme;
      default:
        return config.defaultTheme;
    }
  }, [config.defaultTheme]);

  // ✅ Aplicar tema al DOM
  const applyThemeToDOM = useCallback((theme: EffectiveTheme, withTransition: boolean = true) => {
    if (typeof document === 'undefined') return;

    const targetElement = document.querySelector(config.targetElement) as HTMLElement;
    if (!targetElement) return;

    // Configurar transición si está habilitada
    if (withTransition && config.enableTransitions) {
      setState(prev => ({ ...prev, isTransitioning: true }));
      
      targetElement.style.transition = `${config.transitionProperty} ${config.transitionDuration}ms ease-in-out`;
      
      // Limpiar transición después del tiempo especificado
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      transitionTimeoutRef.current = window.setTimeout(() => {
        targetElement.style.transition = '';
        setState(prev => ({ ...prev, isTransitioning: false }));
      }, config.transitionDuration);
    }

    // Aplicar clases CSS
    targetElement.classList.remove(config.darkClassName, config.lightClassName);
    
    if (theme === 'dark') {
      targetElement.classList.add(config.darkClassName);
    } else {
      targetElement.classList.add(config.lightClassName);
    }

    // Establecer atributo data para CSS avanzado
    targetElement.setAttribute('data-theme', theme);
  }, [config]);

  // ✅ Actualizar estado completo del tema
  const updateThemeState = useCallback((
    newMode?: ThemeMode,
    newSystemTheme?: EffectiveTheme,
    withTransition: boolean = true
  ) => {
    const currentSystemTheme = newSystemTheme ?? state.systemTheme;
    const currentMode = newMode ?? state.mode;
    const newEffectiveTheme = calculateEffectiveTheme(currentMode, currentSystemTheme);

    // Solo actualizar si hay cambios
    if (newEffectiveTheme !== state.effectiveTheme || newMode !== state.mode) {
      setState(prev => ({
        ...prev,
        mode: currentMode,
        effectiveTheme: newEffectiveTheme,
        systemTheme: currentSystemTheme,
        lastChanged: new Date()
      }));

      // Aplicar al DOM
      applyThemeToDOM(newEffectiveTheme, withTransition);

      // Guardar preferencia si cambió el modo
      if (newMode && newMode !== state.mode) {
        savePreference(newMode);
      }

      // Callbacks
      if (newEffectiveTheme !== state.effectiveTheme) {
        config.onChange(newEffectiveTheme, currentMode);
      }
      
      if (newSystemTheme && newSystemTheme !== state.systemTheme) {
        config.onSystemChange(newSystemTheme);
      }
    }
  }, [state, calculateEffectiveTheme, applyThemeToDOM, savePreference, config]);

  // ✅ Funciones públicas
  const setMode = useCallback((mode: ThemeMode) => {
    updateThemeState(mode, undefined, true);
  }, [updateThemeState]);

  const setTheme = useCallback((theme: EffectiveTheme) => {
    updateThemeState(theme, undefined, true);
  }, [updateThemeState]);

  const toggleTheme = useCallback(() => {
    const newTheme: EffectiveTheme = state.effectiveTheme === 'dark' ? 'light' : 'dark';
    updateThemeState(newTheme, undefined, true);
  }, [state.effectiveTheme, updateThemeState]);

  const resetToSystem = useCallback(() => {
    updateThemeState('system', undefined, true);
  }, [updateThemeState]);

  const getPreferredTheme = useCallback((): EffectiveTheme => {
    return detectSystemTheme();
  }, [detectSystemTheme]);

  const isThemeSupported = useCallback((): boolean => {
    return checkSystemSupport();
  }, [checkSystemSupport]);

  const forceRefresh = useCallback(() => {
    const currentSystemTheme = detectSystemTheme();
    updateThemeState(undefined, currentSystemTheme, false);
  }, [detectSystemTheme, updateThemeState]);

  const enableTransitions = useCallback(() => {
    setConfig(prev => ({ ...prev, enableTransitions: true }));
  }, []);

  const disableTransitions = useCallback(() => {
    setConfig(prev => ({ ...prev, enableTransitions: false }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<DarkModeSyncConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const exportState = useCallback((): string => {
    return JSON.stringify({
      mode: state.mode,
      timestamp: Date.now(),
      version: '1.0'
    });
  }, [state.mode]);

  const importState = useCallback((stateJson: string): boolean => {
    try {
      const imported = JSON.parse(stateJson);
      if (imported.mode && ['light', 'dark', 'system'].includes(imported.mode)) {
        setMode(imported.mode);
        return true;
      }
    } catch (error) {
      console.warn('Error importing theme state:', error);
    }
    return false;
  }, [setMode]);

  // ✅ Inicialización del sistema
  useEffect(() => {
    const systemSupported = checkSystemSupport();
    const systemTheme = detectSystemTheme();
    const storedMode = loadStoredPreference();

    setState(prev => ({
      ...prev,
      mode: storedMode,
      systemTheme,
      isSystemSupported: systemSupported
    }));

    // Configurar listener para cambios del sistema
    let mediaQuery: MediaQueryList | null = null;
    let handleSystemChange: ((e: MediaQueryListEvent) => void) | null = null;

    if (systemSupported && config.syncWithSystem) {
      try {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQueryRef.current = mediaQuery;
        
        handleSystemChange = (e: MediaQueryListEvent) => {
          const newSystemTheme: EffectiveTheme = e.matches ? 'dark' : 'light';
          updateThemeState(undefined, newSystemTheme, true);
        };

        // Usar addEventListener si está disponible, sino usar deprecated addListener
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemChange);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleSystemChange);
        }
      } catch (error) {
        console.warn('Error setting up system theme listener:', error);
      }
    }

    // Aplicar tema inicial
    updateThemeState(storedMode, systemTheme, false);

    // Cleanup function
    return () => {
      if (mediaQuery && handleSystemChange) {
        try {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleSystemChange);
          } else if (mediaQuery.removeListener) {
            mediaQuery.removeListener(handleSystemChange);
          }
        } catch (error) {
          console.warn('Error cleaning up media query listener:', error);
        }
      }
    };
  }, []); // Solo ejecutar una vez al montar

  // ✅ Sincronización entre pestañas
  useEffect(() => {
    if (!config.syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === config.storageKey && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        if (['light', 'dark', 'system'].includes(newMode)) {
          updateThemeState(newMode, undefined, true);
        }
      }
    };

    storageListenerRef.current = handleStorageChange;
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (storageListenerRef.current) {
        window.removeEventListener('storage', storageListenerRef.current);
      }
    };
  }, [config.syncAcrossTabs, config.storageKey, updateThemeState]);

  // ✅ Cleanup final
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Valores derivados
  const isDark = state.effectiveTheme === 'dark';
  const isLight = state.effectiveTheme === 'light';
  const isSystemMode = state.mode === 'system';

  return {
    state,
    isDark,
    isLight,
    isSystemMode,
    config,
    updateConfig,
    setMode,
    setTheme,
    toggleTheme,
    resetToSystem,
    getPreferredTheme,
    isThemeSupported,
    exportState,
    importState,
    forceRefresh,
    enableTransitions,
    disableTransitions
  };
};

// ✅ Hook simplificado para uso básico
export const useDarkMode = (initialTheme?: EffectiveTheme) => {
  const darkModeSync = useDarkModeSync({
    defaultMode: initialTheme ? initialTheme : 'system',
    enableTransitions: true,
    syncWithSystem: true,
    syncAcrossTabs: true
  });

  return {
    isDark: darkModeSync.isDark,
    isLight: darkModeSync.isLight,
    theme: darkModeSync.state.effectiveTheme,
    toggleTheme: darkModeSync.toggleTheme,
    setTheme: darkModeSync.setTheme
  };
};

// ✅ Hook para React Context
export const useThemeContext = () => {
  const darkModeSync = useDarkModeSync();

  // Valores para provider de contexto
  return {
    theme: darkModeSync.state.effectiveTheme,
    mode: darkModeSync.state.mode,
    setMode: darkModeSync.setMode,
    toggleTheme: darkModeSync.toggleTheme,
    isDark: darkModeSync.isDark,
    isLight: darkModeSync.isLight,
    isSystemMode: darkModeSync.isSystemMode,
    systemTheme: darkModeSync.state.systemTheme,
    isTransitioning: darkModeSync.state.isTransitioning
  };
};

export default useDarkModeSync;