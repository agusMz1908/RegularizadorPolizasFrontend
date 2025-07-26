// src/utils/storageHelpers.ts
// ✅ VERSIÓN CORREGIDA - Compatible con WizardState real

import { WizardState } from '../types/ui/wizard';

/**
 * Guarda el estado del wizard en localStorage
 */
export function saveStateToStorage(key: string, state: WizardState): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // ✅ Serializar solo las propiedades que existen en WizardState
    const serializedState = JSON.stringify({
      currentStep: state.currentStep,
      selectedCliente: state.selectedCliente,
      selectedCompany: state.selectedCompany,
      selectedSeccion: state.selectedSeccion,
      selectedOperacion: state.selectedOperacion,
      uploadedFile: null, // File no se puede serializar
      extractedData: state.extractedData,
      isComplete: state.isComplete,
      stepData: state.stepData,
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
export function loadStateFromStorage(key: string): Partial<WizardState> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const serializedState = localStorage.getItem(key);
    if (!serializedState) return null;
    
    const parsed = JSON.parse(serializedState);
    
    // ✅ Crear estado parcial compatible con WizardState
    const state: Partial<WizardState> = {
      currentStep: parsed.currentStep,
      selectedCliente: parsed.selectedCliente,
      selectedCompany: parsed.selectedCompany,
      selectedSeccion: parsed.selectedSeccion,
      selectedOperacion: parsed.selectedOperacion,
      extractedData: parsed.extractedData,
      isComplete: parsed.isComplete,
      stepData: parsed.stepData
      // uploadedFile se omite porque File no se puede deserializar
    };
    
    console.log('📂 Estado cargado desde localStorage:', key);
    return state;
  } catch (error) {
    console.error('❌ Error cargando estado:', error);
    return null;
  }
}

/**
 * Guarda solo los datos del formulario
 */
export function saveFormDataToStorage(key: string, formData: any): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const serializedData = JSON.stringify({
      formData,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(key, serializedData);
    console.log('💾 Datos del formulario guardados:', key);
    return true;
  } catch (error) {
    console.error('❌ Error guardando datos del formulario:', error);
    return false;
  }
}

/**
 * Carga los datos del formulario
 */
export function loadFormDataFromStorage(key: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const serializedData = localStorage.getItem(key);
    if (!serializedData) return null;
    
    const parsed = JSON.parse(serializedData);
    console.log('📂 Datos del formulario cargados:', key);
    return parsed.formData;
  } catch (error) {
    console.error('❌ Error cargando datos del formulario:', error);
    return null;
  }
}

/**
 * Guarda el progreso del wizard (solo pasos completados)
 */
export function saveWizardProgress(key: string, state: WizardState): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const progress = {
      currentStep: state.currentStep,
      hasCliente: !!state.selectedCliente,
      hasCompany: !!state.selectedCompany,
      hasSeccion: !!state.selectedSeccion,
      hasOperacion: !!state.selectedOperacion,
      hasFile: !!state.uploadedFile,
      hasExtractedData: !!state.extractedData,
      isComplete: state.isComplete,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`${key}_progress`, JSON.stringify(progress));
    console.log('💾 Progreso del wizard guardado:', key);
    return true;
  } catch (error) {
    console.error('❌ Error guardando progreso:', error);
    return false;
  }
}

/**
 * Carga el progreso del wizard
 */
export function loadWizardProgress(key: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const progressData = localStorage.getItem(`${key}_progress`);
    if (!progressData) return null;
    
    const progress = JSON.parse(progressData);
    console.log('📂 Progreso del wizard cargado:', key);
    return progress;
  } catch (error) {
    console.error('❌ Error cargando progreso:', error);
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
    localStorage.removeItem(`${key}_progress`);
    localStorage.removeItem(`${key}_form`);
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
 * Verifica si hay progreso guardado
 */
export function hasStoredProgress(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(`${key}_progress`);
    return stored !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene metadata del estado guardado
 */
export function getStorageMetadata(key: string): { 
  timestamp?: string; 
  size?: number;
  hasProgress?: boolean;
  hasFormData?: boolean;
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const serializedState = localStorage.getItem(key);
    if (!serializedState) return null;
    
    const parsed = JSON.parse(serializedState);
    const hasProgress = hasStoredProgress(key);
    const hasFormData = localStorage.getItem(`${key}_form`) !== null;
    
    return {
      timestamp: parsed.timestamp,
      size: serializedState.length,
      hasProgress,
      hasFormData
    };
  } catch (error) {
    return null;
  }
}

/**
 * Restaura el estado del wizard desde localStorage
 */
export function restoreWizardState(
  key: string,
  currentState: WizardState
): WizardState {
  const storedState = loadStateFromStorage(key);
  
  if (!storedState) {
    return currentState;
  }
  
  // ✅ Merge seguro del estado guardado con el estado actual
  return {
    ...currentState,
    currentStep: storedState.currentStep || currentState.currentStep,
    selectedCliente: storedState.selectedCliente || currentState.selectedCliente,
    selectedCompany: storedState.selectedCompany || currentState.selectedCompany,
    selectedSeccion: storedState.selectedSeccion || currentState.selectedSeccion,
    selectedOperacion: storedState.selectedOperacion || currentState.selectedOperacion,
    extractedData: storedState.extractedData || currentState.extractedData,
    isComplete: storedState.isComplete || currentState.isComplete,
    stepData: { ...currentState.stepData, ...storedState.stepData }
  };
}

/**
 * Auto-guarda el estado cada cierto tiempo
 */
export function setupAutoSave(
  key: string,
  getState: () => WizardState,
  intervalMs: number = 30000 // 30 segundos
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const interval = setInterval(() => {
    const state = getState();
    if (state.currentStep !== 'cliente') { // Solo auto-guardar si hay progreso
      saveStateToStorage(key, state);
    }
  }, intervalMs);
  
  console.log('⏰ Auto-guardado configurado cada', intervalMs / 1000, 'segundos');
  
  return () => {
    clearInterval(interval);
    console.log('⏹️ Auto-guardado detenido');
  };
}

export default {
  saveStateToStorage,
  loadStateFromStorage,
  saveFormDataToStorage,
  loadFormDataFromStorage,
  saveWizardProgress,
  loadWizardProgress,
  clearSavedStateFromStorage,
  hasStoredState,
  hasStoredProgress,
  getStorageMetadata,
  restoreWizardState,
  setupAutoSave
};