// src/hooks/usePolizaWizard.ts
import { useState, useEffect, useCallback } from 'react';
import { wizardService, Cliente, Company, DocumentProcessResult } from '../services/wizardService';

export type WizardStep = 'cliente' | 'company' | 'upload' | 'extract' | 'form' | 'success';

export interface WizardState {
  currentStep: WizardStep;
  selectedCliente: Cliente | null;
  selectedCompany: Company | null;
  uploadedFile: File | null;
  extractedData: DocumentProcessResult | null;
  isComplete: boolean;
}

export interface WizardActions {
  // Navegación
  goToStep: (step: WizardStep) => void;
  goBack: () => void;
  reset: () => void;
  
  // Selecciones
  selectCliente: (cliente: Cliente) => void;
  selectCompany: (company: Company) => void;
  setUploadedFile: (file: File) => void;
  
  // Procesamiento
  processDocument: () => Promise<void>;
  createPoliza: (formData: any) => Promise<void>;
  
  // Estados de carga
  loading: boolean;
  processing: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Búsquedas
  clienteSearch: string;
  setClienteSearch: (search: string) => void;
  clienteResults: Cliente[];
  searchClientes: (searchTerm: string) => Promise<void>;
  loadingClientes: boolean;
  
  // Compañías
  companies: Company[];
  loadCompanies: () => Promise<void>;
  loadingCompanies: boolean;
}

const initialState: WizardState = {
  currentStep: 'cliente',
  selectedCliente: null,
  selectedCompany: null,
  uploadedFile: null,
  extractedData: null,
  isComplete: false,
};

export const usePolizaWizard = (): WizardState & WizardActions => {
  // Estados principales
  const [state, setState] = useState<WizardState>(initialState);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteResults, setClienteResults] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estados de compañías
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Efecto para cargar compañías al inicio
  useEffect(() => {
    loadCompanies();
  }, []);

  // Navegación
  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
    setError(null);
  }, []);

  const goBack = useCallback(() => {
    setState((prev: WizardState) => {
      let newStep: WizardStep;
      let newState = { ...prev };
      
      switch (prev.currentStep) {
        case 'company':
          newStep = 'cliente';
          newState.selectedCliente = null;
          break;
        case 'upload':
          newStep = 'company';
          newState.selectedCompany = null;
          break;
        case 'extract':
          newStep = 'upload';
          newState.uploadedFile = null;
          break;
        case 'form':
          newStep = 'extract';
          newState.extractedData = null;
          break;
        default:
          return prev;
      }
      
      return { ...newState, currentStep: newStep };
    });
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setClienteSearch('');
    setClienteResults([]);
    setError(null);
    setLoading(false);
    setProcessing(false);
  }, []);

  // Selecciones
  const selectCliente = useCallback((cliente: Cliente) => {
    setState((prev: WizardState) => ({ 
      ...prev, 
      selectedCliente: cliente, 
      currentStep: 'company' 
    }));
    setClienteSearch('');
    setClienteResults([]);
    setError(null);
  }, []);

  const selectCompany = useCallback((company: Company) => {
    setState((prev: WizardState) => ({ 
      ...prev, 
      selectedCompany: company, 
      currentStep: 'upload' 
    }));
    setError(null);
  }, []);

  const setUploadedFile = useCallback((file: File) => {
    // Validar archivo
    const validation = wizardService.validatePdfFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }

    setState((prev: WizardState) => ({ 
      ...prev, 
      uploadedFile: file, 
      currentStep: 'extract' 
    }));
    setError(null);
  }, []);

  // Búsqueda de clientes con debounce
  const searchClientes = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setClienteResults([]);
      return;
    }

    setLoadingClientes(true);
    setError(null);

    try {
      console.log('🔍 Searching clientes:', searchTerm);
      const results = await wizardService.searchClientes(searchTerm, 10);
      setClienteResults(results);
      console.log('✅ Found clients:', results.length);
    } catch (err: any) {
      console.error('❌ Error searching clientes:', err);
      setError('Error al buscar clientes: ' + err.message);
      setClienteResults([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Cargar compañías
  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    setError(null);

    try {
      console.log('🏢 Loading companies...');
      const companiesData = await wizardService.getCompaniesForLookup();
      setCompanies(companiesData);
      console.log('✅ Loaded companies:', companiesData.length);
    } catch (err: any) {
      console.error('❌ Error loading companies:', err);
      setError('Error al cargar compañías: ' + err.message);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  // Procesamiento de documento
  const processDocument = useCallback(async () => {
    if (!state.uploadedFile) {
      setError('No hay archivo seleccionado');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('📄 Processing document:', state.uploadedFile.name);
      
      // Cambiar a step de procesamiento
      setState((prev: WizardState) => ({ ...prev, currentStep: 'extract' }));
      
      const result = await wizardService.processDocument(state.uploadedFile);
      
      console.log('✅ Document processed successfully:', result);
      
      setState((prev: WizardState) => ({ 
        ...prev, 
        extractedData: result, 
        currentStep: 'form' 
      }));
    } catch (err: any) {
      console.error('❌ Error processing document:', err);
      setError('Error al procesar el documento: ' + err.message);
      // Volver al step de upload en caso de error
      setState((prev: WizardState) => ({ ...prev, currentStep: 'upload' }));
    } finally {
      setProcessing(false);
    }
  }, [state.uploadedFile]);

  // Creación de póliza
  const createPoliza = useCallback(async (formData: any) => {
    if (!state.selectedCliente || !state.selectedCompany) {
      setError('Faltan datos del cliente o compañía');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('📋 Creating poliza in Velneo...');
      
      const polizaData = {
        // Datos de relaciones
        comcod: state.selectedCompany.id,
        clinro: state.selectedCliente.id,
        
        // Datos del formulario
        conpol: formData.numeroPoliza,
        confchdes: formData.vigenciaDesde,
        confchhas: formData.vigenciaHasta,
        conpremio: formData.prima,
        
        // Datos adicionales
        asegurado: formData.asegurado,
        observaciones: formData.observaciones,
        moneda: formData.moneda,
        
        // Metadatos del procesamiento
        documentoId: state.extractedData?.documentId,
        archivoOriginal: state.uploadedFile?.name,
        procesadoConIA: true,
      };

      const result = await wizardService.createPolizaInVelneo(polizaData);
      
      console.log('✅ Poliza created successfully:', result);
      
      setState((prev: WizardState) => ({ 
        ...prev, 
        currentStep: 'success',
        isComplete: true 
      }));

      return result;
    } catch (err: any) {
      console.error('❌ Error creating poliza:', err);
      setError('Error al crear póliza en Velneo: ' + err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [state.selectedCliente, state.selectedCompany, state.extractedData, state.uploadedFile]);

  return {
    // Estado
    ...state,
    
    // Acciones de navegación
    goToStep,
    goBack,
    reset,
    
    // Acciones de selección
    selectCliente,
    selectCompany,
    setUploadedFile,
    
    // Acciones de procesamiento
    processDocument,
    createPoliza,
    
    // Estados de carga
    loading,
    processing,
    error,
    setError,
    
    // Búsqueda de clientes
    clienteSearch,
    setClienteSearch,
    clienteResults,
    searchClientes,
    loadingClientes,
    
    // Compañías
    companies,
    loadCompanies,
    loadingCompanies,
  };
};