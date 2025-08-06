// src/hooks/usePolicyForm.ts - VERSIÓN CORREGIDA Y OPTIMIZADA

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormTabId, FormValidationResult } from '../types/policyForm';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { VelneoMappingService } from '../services/velneoMapping';
import { apiService, MasterDataApi } from '../services/apiService';
import type { MasterDataOptionsDto } from '../types/masterData';
import { 
  EMPTY_POLICY_FORM, 
  ALL_REQUIRED_FIELDS,
  VALIDATION_CONFIG 
} from '../constants/velneoDefault';
import { FORM_TABS } from '../constants/formTabs';
import type { PolicyFormData } from '@/types/poliza';

export interface UsePolicyFormProps {
  scannedData?: AzureProcessResponse;
  selectedClient: any;
  selectedCompany: any;
  selectedSection: any;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onBack?: () => void;
}

export interface FormValidationError {
  field: keyof PolicyFormData;
  message: string;
  severity: 'error' | 'warning';
}

// ✅ UTILIDADES DE PESTAÑAS CORREGIDAS
const TabsUtils = {
  getRequiredFieldsForTab: (tabId: FormTabId): string[] => {
    switch (tabId) {
      case 'datos_basicos':
        return ['poliza', 'desde', 'hasta', 'tramite', 'estadoPoliza'];
      case 'datos_poliza':
        return ['compania'];
      case 'datos_vehiculo':
        return ['marcaModelo', 'anio', 'destinoId', 'combustibleId'];
      case 'datos_cobertura':
        return ['premio', 'monedaId'];
      case 'condiciones_pago':
        return ['formaPago'];
      case 'observaciones':
        return [];
      default:
        return [];
    }
  },

  getFieldsForTab: (tabId: FormTabId): string[] => {
    switch (tabId) {
      case 'datos_basicos':
        return ['poliza', 'certificado', 'desde', 'hasta', 'tramite', 'estadoPoliza', 'corredor'];
      case 'datos_poliza':
        return ['compania', 'asegurado', 'tomador', 'domicilio'];
      case 'datos_vehiculo':
        return ['marcaModelo', 'anio', 'matricula', 'motor', 'chasis', 'destinoId', 'combustibleId', 'calidadId', 'categoriaId'];
      case 'datos_cobertura':
        return ['premio', 'total', 'monedaId', 'coberturaId'];
      case 'condiciones_pago':
        return ['formaPago', 'cuotas', 'valorCuota'];
      case 'observaciones':
        return ['observaciones'];
      default:
        return [];
    }
  },

  getNextTab: (currentTab: FormTabId) => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTab);
    return currentIndex < FORM_TABS.length - 1 ? FORM_TABS[currentIndex + 1] : null;
  },

  getPreviousTab: (currentTab: FormTabId) => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTab);
    return currentIndex > 0 ? FORM_TABS[currentIndex - 1] : null;
  },

  getTabForField: (fieldName: string): FormTabId | null => {
    for (const tab of FORM_TABS) {
      if (TabsUtils.getFieldsForTab(tab.id).includes(fieldName)) {
        return tab.id;
      }
    }
    return null;
  }
};

/**
 * 🎯 HOOK PRINCIPAL DEL FORMULARIO DE PÓLIZA
 * VERSIÓN CORREGIDA: Todos los errores solucionados
 */
export const usePolicyForm = ({
  scannedData,
  selectedClient,
  selectedCompany,
  selectedSection,
  onSuccess,
  onError,
  onBack
}: UsePolicyFormProps) => {
  
  // ===== ESTADOS PRINCIPALES =====
  const [formData, setFormData] = useState<PolicyFormData>({ ...EMPTY_POLICY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FormTabId>('datos_basicos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // ===== ESTADOS DE MAESTROS =====
  const [masterOptions, setMasterOptions] = useState<MasterDataOptionsDto | null>(null);  
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [masterError, setMasterError] = useState<string | null>(null);

  // ===== 🔧 CARGAR OPCIONES DE MAESTROS - OPTIMIZADO =====
  useEffect(() => {
    let isComponentMounted = true;
    
    const loadMasterOptions = async () => {
      // Evitar cargas múltiples o si ya están cargados
      if (masterOptions !== null || !loadingMasters) {
        console.log('🔒 [usePolicyForm] Maestros ya cargados o carga en progreso');
        return;
      }

      try {
        console.log('🔄 [usePolicyForm] Cargando opciones de maestros...');
        const options = await MasterDataApi.getMasterDataOptions();
        
        // Solo actualizar estado si el componente sigue montado
        if (isComponentMounted) {
          console.log('✅ [usePolicyForm] Opciones de maestros cargadas:', {
            categorias: options.Categorias?.length || 0,
            destinos: options.Destinos?.length || 0,
            calidades: options.Calidades?.length || 0,
            combustibles: options.Combustibles?.length || 0,
            monedas: options.Monedas?.length || 0
          });
          
          setMasterOptions(options);
          setMasterError(null);
        }
      } catch (error) {
        console.error('❌ [usePolicyForm] Error cargando opciones de maestros:', error);
        
        if (isComponentMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido cargando maestros';
          setMasterError(errorMessage);
          
          // NO llamar onError aquí para evitar bucles
          console.warn('⚠️ [usePolicyForm] Error de maestros guardado en estado local');
        }
      } finally {
        if (isComponentMounted) {
          setLoadingMasters(false);
        }
      }
    };

    loadMasterOptions();
    
    // Cleanup function
    return () => {
      isComponentMounted = false;
    };
  }, []); // ✅ Solo ejecutar una vez

  // ===== 🔧 INICIALIZACIÓN CON DATOS DE AZURE - MEJORADO =====
  const initializeFormFromAzure = useCallback(() => {
    if (!scannedData || !selectedClient) {
      console.log('🔒 [usePolicyForm] Esperando datos para inicialización...');
      return;
    }

    try {
      console.log('🔄 [usePolicyForm] Inicializando formulario con datos de Azure...');
      
      // ✅ VERIFICAR QUE EL MÉTODO EXISTE ANTES DE USAR
      let mappedData = {};
      if (VelneoMappingService.mapAzureToFormData) {
        mappedData = VelneoMappingService.mapAzureToFormData(
          scannedData, 
          selectedClient, 
          selectedCompany, 
          masterOptions || undefined
        );
      } else {
        console.warn('⚠️ [usePolicyForm] VelneoMappingService.mapAzureToFormData no está disponible');
      }

      // Datos básicos del contexto
      const contextData = {
        asegurado: selectedClient?.clinom || selectedClient?.nombre || '',
        tomador: selectedClient?.clinom || selectedClient?.nombre || '',
        domicilio: selectedClient?.clidir || selectedClient?.direccion || '',
        compania: selectedCompany?.comcod || selectedCompany?.id || '',
      };

      // Combinar datos
      const initialData: PolicyFormData = {
        ...EMPTY_POLICY_FORM,
        ...mappedData,
        ...contextData
      };

      console.log('✅ [usePolicyForm] Datos iniciales preparados:', {
        camposMapeados: Object.keys(mappedData).length,
        camposContexto: Object.keys(contextData).length,
        completitud: scannedData.porcentajeCompletitud || 0
      });

      setFormData(initialData);
      setIsDirty(true);
      
    } catch (error) {
      console.error('❌ [usePolicyForm] Error inicializando formulario:', error);
      setMasterError('Error procesando datos del documento escaneado');
    }
  }, [scannedData, selectedClient, selectedCompany, masterOptions]);

  // ===== EFECTO PARA INICIALIZAR FORMULARIO =====
  useEffect(() => {
    // Solo inicializar cuando tengamos todos los datos necesarios
    if (scannedData && selectedClient && !loadingMasters && masterOptions) {
      console.log('🚀 [usePolicyForm] Condiciones cumplidas para inicialización');
      initializeFormFromAzure();
    }
  }, [scannedData, selectedClient, selectedCompany, loadingMasters, masterOptions, initializeFormFromAzure]);

  // ===== VALIDACIÓN INDIVIDUAL DE CAMPO =====
  const validateField = useCallback((field: keyof PolicyFormData, value: any): string | null => {
    // Campos requeridos básicos
    const requiredFields = ['poliza', 'desde', 'hasta', 'tramite', 'estadoPoliza'];
    
    if (requiredFields.includes(field as string)) {
      if (value === null || value === undefined || value === '') {
        return `${field} es requerido`;
      }
    }

    // Validaciones específicas por campo
    switch (field) {
      case 'anio':
        const yearStr = String(value);
        if (yearStr && !/^\d{4}$/.test(yearStr)) {
          return 'Año debe ser un número de 4 dígitos';
        }
        const year = Number(yearStr);
        if (yearStr && (year < 1900 || year > new Date().getFullYear() + 1)) {
          return 'Año debe estar entre 1900 y el próximo año';
        }
        break;

      case 'cuotas':
        const cuotas = Number(value);
        if (value && (isNaN(cuotas) || cuotas < 1 || cuotas > 12)) {
          return 'Cuotas debe estar entre 1 y 12';
        }
        break;

      case 'premio':
      case 'total':
      case 'valorCuota':
        const amount = Number(value);
        if (value && (isNaN(amount) || amount < 0)) {
          return 'Debe ser un número válido mayor o igual a 0';
        }
        break;

      case 'hasta':
        if (formData.desde && value) {
          const desde = new Date(formData.desde);
          const hasta = new Date(value);
          if (hasta <= desde) {
            return 'La fecha hasta debe ser posterior a la fecha desde';
          }
        }
        break;
    }

    return null;
  }, [formData]);

  // ===== ACTUALIZAR CAMPO DEL FORMULARIO =====
  const updateFormData = useCallback((field: keyof PolicyFormData, value: any) => {
    console.log(`📝 [usePolicyForm] Actualizando ${field}:`, value);
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Sincronizaciones automáticas
      if (field === 'monedaId') {
        newData.moneda = value;
      }
      
      return newData;
    });
    
    setTouchedFields(prev => new Set(prev.add(field as string)));
    setIsDirty(true);
    
    // Limpiar error del campo si existe
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
    
    // Validación en tiempo real para campos críticos
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateField]);

  // ===== 🔧 VALIDACIÓN COMPLETA DEL FORMULARIO - CORREGIDA =====
  const validateForm = useCallback((): FormValidationResult => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['poliza', 'desde', 'hasta', 'tramite', 'estadoPoliza'];

    // Validar campos requeridos
    requiredFields.forEach(field => {
      const value = formData[field as keyof PolicyFormData];
      const error = validateField(field as keyof PolicyFormData, value);
      
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validaciones cruzadas
    if (formData.desde && formData.hasta) {
      const desde = new Date(formData.desde);
      const hasta = new Date(formData.hasta);
      if (hasta <= desde) {
        newErrors.hasta = 'La fecha hasta debe ser posterior a la fecha desde';
      }
    }

    const isValid = Object.keys(newErrors).length === 0;
    const missingRequired = requiredFields.filter(field => {
      const value = formData[field as keyof PolicyFormData];
      return value === null || value === undefined || value === '';
    });

    // ✅ ESTRUCTURA CORRECTA SEGÚN FormValidationResult
    return {
      isValid,
      errors: newErrors,
      warnings: {}, // Agregar warnings vacío
      missingRequired // Agregar missingRequired
    };
  }, [formData, validateField]);

  // ===== PROGRESO DEL FORMULARIO =====
  const formProgress = useMemo(() => {
    const requiredFields = ['poliza', 'desde', 'hasta', 'tramite', 'estadoPoliza'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof PolicyFormData];
      return value !== null && value !== undefined && value !== '';
    }).length;

    const overallProgress = Math.round((completedFields / requiredFields.length) * 100);

    // Progreso por pestaña
    const byTab = FORM_TABS.reduce((acc, tab) => {
      const tabFields = TabsUtils.getRequiredFieldsForTab(tab.id);
      const tabCompleted = tabFields.filter(field => {
        const value = formData[field as keyof PolicyFormData];
        return value !== null && value !== undefined && value !== '';
      }).length;
      
      const tabErrors = tabFields.filter(field => errors[field]).length;

      acc[tab.id] = {
        completion: tabFields.length > 0 ? Math.round((tabCompleted / tabFields.length) * 100) : 100,
        errors: tabErrors,
        required: tabFields,
        completed: tabCompleted
      };

      return acc;
    }, {} as Record<FormTabId, any>);

    return {
      overall: overallProgress,
      byTab
    };
  }, [formData, errors]);

  // ===== NAVEGACIÓN ENTRE PESTAÑAS =====
  const goToTab = useCallback((tabId: FormTabId) => {
    console.log(`🔀 [usePolicyForm] Navegando a pestaña: ${tabId}`);
    setActiveTab(tabId);
  }, []);

  const goToNextTab = useCallback(() => {
    const nextTab = TabsUtils.getNextTab(activeTab);
    if (nextTab) {
      console.log(`➡️ [usePolicyForm] Siguiente pestaña: ${nextTab.id}`);
      setActiveTab(nextTab.id);
    }
  }, [activeTab]);

  const goToPreviousTab = useCallback(() => {
    const previousTab = TabsUtils.getPreviousTab(activeTab);
    if (previousTab) {
      console.log(`⬅️ [usePolicyForm] Pestaña anterior: ${previousTab.id}`);
      setActiveTab(previousTab.id);
    }
  }, [activeTab]);

  const goToFieldError = useCallback((field: keyof PolicyFormData) => {
    const tabId = TabsUtils.getTabForField(field as string);
    if (tabId) {
      console.log(`🚨 [usePolicyForm] Navegando a pestaña con error: ${tabId} (campo: ${field})`);
      setActiveTab(tabId);
    }
  }, []);

  // ===== CALLBACKS PARA MANEJO DE RESULTADOS =====
  const handleFormError = useCallback((message: string) => {
    console.error('❌ [usePolicyForm] Form error:', message);
    onError(message);
  }, [onError]);

  const handleFormSuccess = useCallback((result: any) => {
    console.log('✅ [usePolicyForm] Form success:', result);
    onSuccess(result);
  }, [onSuccess]);

  // ===== 🔧 ENVÍO DEL FORMULARIO CORREGIDO =====
  const submitForm = useCallback(async () => {
    console.log('📤 [usePolicyForm] Iniciando envío del formulario...');
    setIsSubmitting(true);
    
    try {
      // Marcar todos los campos como tocados
      const allFields = Object.keys(formData) as (keyof PolicyFormData)[];
      setTouchedFields(new Set(allFields.map(f => f as string)));

      // Validar formulario completo
      const validationResult = validateForm();
      
      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        
        // Ir a la primera pestaña con errores
        const firstErrorField = Object.keys(validationResult.errors)[0] as keyof PolicyFormData;
        if (firstErrorField) {
          goToFieldError(firstErrorField);
        }
        
        handleFormError(`Se encontraron ${Object.keys(validationResult.errors).length} errores en el formulario`);
        return;
      }

      // Limpiar errores
      setErrors({});

      console.log('🔄 [usePolicyForm] Mapeando datos para Velneo...');
      
      // ✅ CORREGIDO: Verificar que el método existe y mapear correctamente
      if (!VelneoMappingService.mapFormDataToVelneoRequest) {
        throw new Error('VelneoMappingService.mapFormDataToVelneoRequest no está disponible');
      }

      const velneoRequest = VelneoMappingService.mapFormDataToVelneoRequest(
        formData,
        selectedClient,
        selectedCompany,
        selectedSection,
        masterOptions || undefined
      );

      console.log('📋 [usePolicyForm] Objeto mapeado para Velneo:', {
        poliza: velneoRequest.Conpol || formData.poliza,
        cliente: velneoRequest.Clinom || selectedClient?.clinom,
        companiaId: velneoRequest.Comcod,
        premio: velneoRequest.Conpremio,
        campos: Object.keys(velneoRequest).length
      });

      // ✅ CORREGIDO: Usar el método correcto del apiService
      console.log('🚀 [usePolicyForm] Enviando a Velneo...');
      
      const result = await apiService.createPoliza(velneoRequest);
      
      console.log('✅ [usePolicyForm] Póliza enviada exitosamente:', result);
      
      // Resetear estados
      setIsDirty(false);
      
      handleFormSuccess(result);
    } catch (error) {
      console.error('❌ [usePolicyForm] Error enviando formulario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error enviando póliza a Velneo';
      handleFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData, 
    selectedClient, 
    selectedCompany, 
    selectedSection, 
    masterOptions, 
    validateForm, 
    goToFieldError, 
    handleFormSuccess, 
    handleFormError
  ]);

  // ===== RESETEAR FORMULARIO =====
  const resetForm = useCallback(() => {
    console.log('🔄 [usePolicyForm] Reseteando formulario...');
    setFormData({ ...EMPTY_POLICY_FORM });
    setErrors({});
    setTouchedFields(new Set());
    setActiveTab('datos_basicos');
    setIsDirty(false);
  }, []);

  // ===== ESTADOS COMPUTADOS =====
  const isValid = useMemo(() => {
    return validateForm().isValid;
  }, [validateForm]);

  const canSubmit = useMemo(() => {
    return isValid && !isSubmitting && !loadingMasters && masterOptions !== null;
  }, [isValid, isSubmitting, loadingMasters, masterOptions]);

  const hasUnsavedChanges = useMemo(() => {
    return isDirty && !isSubmitting;
  }, [isDirty, isSubmitting]);

  // ===== RECARGA MANUAL DE MAESTROS =====
  const reloadMasters = useCallback(async () => {
    console.log('🔄 [usePolicyForm] Recargando maestros manualmente...');
    setMasterOptions(null);
    setLoadingMasters(true);
    setMasterError(null);
    
    try {
      const options = await MasterDataApi.getMasterDataOptions();
      setMasterOptions(options);
      setMasterError(null);
      console.log('✅ [usePolicyForm] Maestros recargados exitosamente');
    } catch (error) {
      console.error('❌ [usePolicyForm] Error recargando maestros:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error recargando maestros';
      setMasterError(errorMessage);
    } finally {
      setLoadingMasters(false);
    }
  }, []);

  // ===== INFORMACIÓN DE DEBUG =====
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      formData: Object.keys(formData).length,
      errors: Object.keys(errors),
      touchedFields: Array.from(touchedFields),
      activeTab,
      progress: formProgress.overall,
      masterOptions: masterOptions ? {
        categorias: masterOptions.Categorias?.length || 0,
        destinos: masterOptions.Destinos?.length || 0,
        calidades: masterOptions.Calidades?.length || 0,
        combustibles: masterOptions.Combustibles?.length || 0,
        monedas: masterOptions.Monedas?.length || 0
      } : null,
      validation: validateForm()
    };
  }, [formData, errors, touchedFields, activeTab, formProgress, masterOptions, validateForm]);

  // ===== RETURN DEL HOOK =====
  return {
    // Estados principales
    formData,
    errors,
    touchedFields,
    activeTab,
    isSubmitting,
    isDirty,
    isValid,
    canSubmit,
    hasUnsavedChanges,
    
    // Estados de maestros
    masterOptions,
    loadingMasters,
    masterError,
    
    // Progreso
    formProgress,
    
    // Acciones principales
    updateFormData,
    validateForm,
    submitForm,
    resetForm,
    reloadMasters,
    
    // Navegación
    setActiveTab: goToTab,
    goToNextTab,
    goToPreviousTab,
    goToFieldError,
    
    // Información contextual
    selectedClient,
    selectedCompany,
    selectedSection,
    scannedData,
    
    // Utilidades
    validateField,
    onBack,
    
    // Debug (solo en desarrollo)
    debugInfo
  };
};