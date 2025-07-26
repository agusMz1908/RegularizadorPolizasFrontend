// src/hooks/usePolizaWizard.ts
// ✅ VERSIÓN FINAL CORREGIDA CON PROPIEDADES REALES DEL BACKEND

import { useState, useEffect, useCallback } from 'react';
import { polizaService } from '../services/polizaService';
import { clienteService } from '../services/clienteService';
import { companyService, Company } from '../services/companyService'; // ✅ Import correcto desde el servicio
import { seccionService } from '../services/seccionService';
import { azureService } from '../services/azureService';
import { Seccion, SeccionLookup } from '../types/core/seccion';
import { TipoOperacion } from '../utils/operationLogic';

import { PolizaFormData, PolizaCreateRequest } from '../types/core/poliza';
import { Cliente, WizardStep, WizardState, DocumentProcessResult  } from '../types/ui/wizard';

// ✅ Interfaz corregida para evitar conflictos
interface ExtendedWizardState extends WizardState {
  processingDocument?: boolean;
  documentError?: string | null;
  documentResult?: DocumentProcessResult | null;
  uploadProgress?: number;
}

const initialState: ExtendedWizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  selectedSeccion: null,
  selectedOperacion: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,

  processingDocument: false,
  documentError: null,
  documentResult: null,
  uploadProgress: 0,
};

export const usePolizaWizard = () => {
  const [state, setState] = useState<ExtendedWizardState>(initialState);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionesLookup, setSeccionesLookup] = useState<SeccionLookup[]>([]);
  const [loadingSecciones, setLoadingSecciones] = useState(false);

  // ✅ Función getAuthToken memoizada - CON MÚLTIPLES KEYS
  const getAuthToken = useCallback((): string | null => {
    // Buscar en múltiples posibles keys
    const possibleKeys = [
      'regularizador_token',  // ✅ Primero esta que se está usando
      'authToken',
      import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
    ];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`🔐 usePolizaWizard: Token encontrado en key: ${key}`);
        
        // Verificar si el token es válido
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp > now) {
            return token;
          } else {
            console.warn(`🔐 Token expirado en key: ${key}`);
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.error(`🔐 Token inválido en key: ${key}`);
          localStorage.removeItem(key);
        }
      }
    }

    console.warn('🔐 usePolizaWizard: No se encontró token válido en ninguna key');
    setError('Token de autenticación no encontrado');
    return null;
  }, []);

  // ✅ Función loadSecciones corregida
  const loadSecciones = useCallback(async () => {
    if (!state.selectedCompany || loadingSecciones) {
      return;
    }

    try {
      setLoadingSecciones(true);
      console.log('🔍 Cargando secciones para compañía:', state.selectedCompany.id);
      
      const [seccionesResponse, lookupResponse] = await Promise.all([
        seccionService.getSeccionesByCompany(state.selectedCompany.id),
        seccionService.getSeccionesForLookup()
      ]);

      console.log('✅ Secciones cargadas:', seccionesResponse.length);
      setSecciones(seccionesResponse);
      setSeccionesLookup(lookupResponse);
      
    } catch (error: any) {
      console.error('❌ Error cargando secciones:', error);
      setError(`Error cargando secciones: ${error.message}`);
    } finally {
      setLoadingSecciones(false);
    }
  }, [state.selectedCompany, loadingSecciones]);

  // ✅ useEffect corregido
  useEffect(() => {
    if (state.selectedCompany && state.currentStep === 'seccion') {
      console.log('🔍 Compañía seleccionada, cargando secciones...');
      loadSecciones();
    }
  }, [state.selectedCompany, state.currentStep, loadSecciones]);

const searchClientes = useCallback(async (term: string) => {
  if (!term.trim() || term.length < 2) {
    setClienteResults([]);
    return;
  }

  try {
    setLoadingClientes(true);
    console.log('🔍 Buscando clientes:', term);
    
    // ✅ CORREGIDO: Sin token manual, igual que companyService
    const results = await clienteService.searchClientes(term);
    console.log('✅ Clientes encontrados:', results.length);
    setClienteResults(results);
    
  } catch (error: any) {
    console.error('❌ Error buscando clientes:', error);
    setError(`Error buscando clientes: ${error.message}`);
  } finally {
    setLoadingClientes(false);
  }
}, []);

  // ✅ Función loadCompanies corregida sin token
  const loadCompanies = useCallback(async () => {
    if (companies.length > 0 || loadingCompanies) {
      return; // ✅ Evitar cargas duplicadas
    }

    try {
      setLoadingCompanies(true);
      console.log('🏢 Cargando compañías...');
      
      const companiesResponse = await companyService.getActiveCompanies();
      console.log('✅ Compañías cargadas:', companiesResponse.length);
      setCompanies(companiesResponse);
      
    } catch (error: any) {
      console.error('❌ Error cargando compañías:', error);
      setError(`Error cargando compañías: ${error.message}`);
    } finally {
      setLoadingCompanies(false);
    }
  }, [companies.length, loadingCompanies]);

  // ✅ useEffect para cargar compañías
  useEffect(() => {
    if (state.currentStep === 'company' && companies.length === 0) {
      loadCompanies();
    }
  }, [state.currentStep, companies.length, loadCompanies]);

  // ✅ Función processDocument corregida con propiedades reales del backend
  const processDocument = useCallback(async (file: File): Promise<DocumentProcessResult | null> => {
    if (!file || processing) {
      return null;
    }

    try {
      setProcessing(true);
      setProcessingProgress(0);
      setError(null);

      console.log('📄 Procesando documento:', file.name);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      // ✅ Llamar al servicio con callback de progreso
      const result = await azureService.processDocument(file, token, (progress: number, status: string) => {
        setProcessingProgress(Math.min(progress, 95));
        console.log(`🔄 Progreso: ${progress}% - ${status}`);
      });
      
      setProcessingProgress(100);

      console.log('✅ Documento procesado exitosamente');
      console.log('📊 Respuesta del backend:', result);
      
      // ✅ El azureService ya retorna en formato DocumentProcessResult
      // Solo necesitamos asegurar que tenga las propiedades básicas
      return {
        ...result,
        success: true,
        data: result,
        extractedFields: result.extractedFields || {},
        confidence: result.confidence || 0,
        needsReview: result.needsReview || false,
        documentId: result.documentId || '',
        estadoProcesamiento: result.estadoProcesamiento || 'PROCESADO'
      };

    } catch (error: any) {
      console.error('❌ Error procesando documento:', error);
      setError(`Error al procesar el documento: ${error.message}`);
      
      // ✅ Return de error que coincide con DocumentProcessResult
      return {
        success: false,
        error: error.message,
        extractedFields: {},
        confidence: 0,
        needsReview: true,
        documentId: '',
        estadoProcesamiento: 'ERROR'
      };
    } finally {
      setProcessing(false);
    }
  }, [processing, getAuthToken]);

  // ✅ Funciones de navegación sin efectos secundarios
  const selectCliente = useCallback((cliente: Cliente) => {
    setState(prev => ({ 
      ...prev, 
      selectedCliente: cliente,
      currentStep: 'company' 
    }));
    setClienteSearch('');
    setClienteResults([]);
  }, []);

  const selectCompany = useCallback((company: Company) => {
    setState(prev => ({ 
      ...prev, 
      selectedCompany: company,
      currentStep: 'seccion'
    }));
  }, []);

  const selectSeccion = useCallback((seccion: Seccion) => {
    setState(prev => ({ 
      ...prev, 
      selectedSeccion: seccion,
      currentStep: 'operacion'
    }));
  }, []);

  const selectOperacion = useCallback((operacion: TipoOperacion) => {
    setState(prev => ({ 
      ...prev, 
      selectedOperacion: operacion,
      currentStep: 'upload'
    }));
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setState(prev => ({ 
      ...prev, 
      uploadedFile: file,
      currentStep: 'processing'
    }));

    // Procesar el documento automáticamente
    const result = await processDocument(file);
    
    if (result?.success) {
      setState(prev => ({ 
        ...prev, 
        extractedData: result,
        currentStep: 'form'
      }));
    }
  }, [processDocument]);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
    setProcessingProgress(0);
    setClienteSearch('');
    setClienteResults([]);
    // ✅ NO resetear companies y secciones para evitar recargas
  }, []);

  // ✅ Return con todas las funciones memoizadas
  return {
    // Estado
    ...state,
    loading,
    processing,
    processingProgress,
    error,

    // Datos de búsqueda
    clienteSearch,
    setClienteSearch,
    clienteResults,
    loadingClientes,
    companies,
    loadingCompanies,
    secciones,
    seccionesLookup,
    loadingSecciones,

    // Acciones
    searchClientes,
    loadCompanies,
    loadSecciones,
    processDocument,
    selectCliente,
    selectCompany,
    selectSeccion,
    selectOperacion,
    uploadFile,
    reset,

    // Utilidades
    setError
  };
};