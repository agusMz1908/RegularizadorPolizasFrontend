import { useState, useEffect, useCallback } from 'react';
import { polizaService } from '../services/polizaService';
import { clienteService } from '../services/clienteService';
import { companyService } from '../services/companyService';
import { seccionService } from '../services/seccionService';
import { azureService } from '../services/azureService';
import { Seccion, SeccionLookup } from '../types/core/seccion';
import { Cliente } from '../types/core/cliente';
import { Company } from '../types/core/company';
import type { PolizaFormData, PolizaCreateRequest } from '../types/core/poliza';
import type { WizardStep, DocumentProcessResult } from '../types/ui/wizard';
import { TipoOperacion } from '../utils/operationLogic';


// ============================================================================
// 🎯 ESTADO SIMPLE Y DIRECTO - SIN HERENCIAS COMPLEJAS
// ============================================================================
interface UsePolizaWizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  selectedSeccion: Seccion | null;
  selectedOperacion: TipoOperacion | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

const initialState: UsePolizaWizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  selectedSeccion: null,
  selectedOperacion: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,
};

// ============================================================================
// 🔧 HOOK PRINCIPAL - LIMPIO Y FUNCIONAL
// ============================================================================
export const usePolizaWizard = () => {
  // ✅ Estado principal
  const [state, setState] = useState<UsePolizaWizardState>(initialState);
  
  // ✅ Estados de carga y procesamiento
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ✅ Estados de búsqueda de clientes
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // ✅ Estados de compañías
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // ✅ Estados de secciones
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionesLookup, setSeccionesLookup] = useState<SeccionLookup[]>([]);
  const [loadingSecciones, setLoadingSecciones] = useState(false);

  // ============================================================================
  // 🔐 UTILIDADES DE AUTENTICACIÓN
  // ============================================================================
  const getAuthToken = useCallback((): string | null => {
    const possibleKeys = [
      'regularizador_token',
      'authToken',
      import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token'
    ];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp > now) {
            return token;
          } else {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    }

    setError('Token de autenticación no encontrado');
    return null;
  }, []);

  // ============================================================================
  // 🔍 BÚSQUEDA DE CLIENTES
  // ============================================================================
  const searchClientes = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setClienteResults([]);
      return;
    }

    try {
      setLoadingClientes(true);
      const results = await clienteService.searchClientes(term);
      setClienteResults(results);
    } catch (error: any) {
      setError(`Error buscando clientes: ${error.message}`);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // ============================================================================
  // 🏢 CARGA DE COMPAÑÍAS
  // ============================================================================
  const loadCompanies = useCallback(async () => {
    if (companies.length > 0 || loadingCompanies) {
      return;
    }

    try {
      setLoadingCompanies(true);
      const companiesResponse = await companyService.getActiveCompanies();
      setCompanies(companiesResponse);
    } catch (error: any) {
      setError(`Error cargando compañías: ${error.message}`);
    } finally {
      setLoadingCompanies(false);
    }
  }, [companies.length, loadingCompanies]);

  // ============================================================================
  // 📋 CARGA DE SECCIONES
  // ============================================================================
  const loadSecciones = useCallback(async () => {
    if (!state.selectedCompany || loadingSecciones) {
      return;
    }

    try {
      setLoadingSecciones(true);
      const [seccionesResponse, lookupResponse] = await Promise.all([
        seccionService.getSeccionesByCompany(state.selectedCompany.id),
        seccionService.getSeccionesForLookup()
      ]);

      setSecciones(seccionesResponse);
      setSeccionesLookup(lookupResponse);
    } catch (error: any) {
      setError(`Error cargando secciones: ${error.message}`);
    } finally {
      setLoadingSecciones(false);
    }
  }, [state.selectedCompany, loadingSecciones]);

  // ============================================================================
  // 📄 PROCESAMIENTO DE DOCUMENTOS
  // ============================================================================
  const processDocument = useCallback(async (file: File): Promise<DocumentProcessResult | null> => {
    if (!file || processing) {
      return null;
    }

    try {
      setProcessing(true);
      setProcessingProgress(0);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      const result = await azureService.processDocument(file, token, (progress: number) => {
        setProcessingProgress(Math.min(progress, 95));
      });
      
      setProcessingProgress(100);

      return {
        success: true,
        extractedFields: result.extractedFields || {},
        confidence: result.confidence || 0,
        needsReview: result.needsReview || false,
        documentId: result.documentId || '',
        estadoProcesamiento: result.estadoProcesamiento || 'PROCESADO',
        data: result
      };

    } catch (error: any) {
      setError(`Error al procesar el documento: ${error.message}`);
      
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

  // ============================================================================
  // 🧭 ACCIONES DE NAVEGACIÓN
  // ============================================================================
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
  }, []);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================
useEffect(() => {
  if (state.selectedCompany && state.currentStep === 'seccion') {
    loadSecciones();
  }
}, [state.selectedCompany, state.currentStep]);

  // ============================================================================
  // 📤 RETURN - INTERFACE LIMPIA
  // ============================================================================
  return {
    // Estado del wizard
    ...state,
    
    // Estados de carga
    loading,
    processing,
    processingProgress,
    error,

    // Estados de búsqueda
    clienteSearch,
    setClienteSearch,
    clienteResults,
    loadingClientes,
    companies,
    loadingCompanies,
    secciones,
    seccionesLookup,
    loadingSecciones,

    // Acciones principales
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