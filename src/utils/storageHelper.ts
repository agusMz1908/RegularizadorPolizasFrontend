// src/utils/storageHelpers.ts

import { WizardState } from '../types/wizard';

/**
 * Guarda el estado del wizard en localStorage
 */
export function saveStateToStorage(key: string, state: WizardState): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const serializedState = JSON.stringify({
      ...state,
      completedSteps: Array.from(state.completedSteps), // Convertir Set a Array
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(key, serializedState);
    console.log('💾 Estado guardado en localStorage:', key);
    return true;
  } catch (error) {
    console.error('❌ Error guardando estado:', error);
    return false;
  }
}

/**
 * Carga el estado del wizard desde localStorage
 */
export function loadStateFromStorage(key: string): WizardState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const serializedState = localStorage.getItem(key);
    if (!serializedState) return null;
    
    const parsed = JSON.parse(serializedState);
    
    // Convertir Array de vuelta a Set
    const state: WizardState = {
      ...parsed,
      completedSteps: new Set(parsed.completedSteps || [])
    };
    
    console.log('📂 Estado cargado desde localStorage:', key);
    return state;
  } catch (error) {
    console.error('❌ Error cargando estado:', error);
    return null;
  }
}

/**
 * Limpia el estado guardado
 */
export function clearSavedStateFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    console.log('🗑️ Estado eliminado de localStorage:', key);
    return true;
  } catch (error) {
    console.error('❌ Error eliminando estado:', error);
    return false;
  }
}

/**
 * Verifica si hay estado guardado
 */
export function hasStoredState(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(key);
    return stored !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene metadata del estado guardado
 */
export function getStorageMetadata(key: string): { timestamp?: string; size?: number } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const serializedState = localStorage.getItem(key);
    if (!serializedState) return null;
    
    const parsed = JSON.parse(serializedState);
    
    return {
      timestamp: parsed.timestamp,
      size: serializedState.length
    };
  } catch (error) {
    return null;
  }
}