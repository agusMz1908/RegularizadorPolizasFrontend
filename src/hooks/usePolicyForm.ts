// src/hooks/usePolicyForm.ts - Hook principal del formulario (CORREGIDO SIN BUCLES)

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PolicyFormData, FormTabId, FormValidationResult } from '../types/policyForm';
import type { VelneoMasterDataOptions } from '../types/velneo';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { VelneoMappingService } from '../services/velneoMapping';
import { apiService, MasterDataApi } from '../services/apiService';
import { 
  EMPTY_POLICY_FORM, 
  ALL_REQUIRED_FIELDS,
  VALIDATION_CONFIG 
} from '../constants/velneoDefault';
import { FORM_TABS, TabsUtils } from '../constants/formTabs';

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

/**
 * 🎯 HOOK PRINCIPAL DEL FORMULARIO DE PÓLIZA
 * Maneja todo el estado, validaciones, mapeo y envío del formulario
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
  const [masterOptions, setMasterOptions] = useState<VelneoMasterDataOptions | null>(null);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [masterError, setMasterError] = useState<string | null>(null);

  // ===== 🔧 CORREGIDO: CARGAR OPCIONES DE MAESTROS SIN BUCLE =====
  useEffect(() => {
    const loadMasterOptions = async () => {
      // Evitar cargas múltiples
      if (masterOptions || !loadingMasters) {
        return;
      }

      try {
        setLoadingMasters(true);
        setMasterError(null);
        
        console.log('🔄 Cargando opciones de maestros...');
        const options = await MasterDataApi.getMasterDataOptions();
        
        setMasterOptions(options);
        console.log('✅ Opciones de maestros cargadas exitosamente');
      } catch (error) {
        console.error('❌ Error cargando opciones de maestros:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setMasterError(errorMessage);
        
        // ✅ CORREGIDO: NO llamar onError aquí para evitar bucles
        // Solo guardamos el error en el estado y lo manejamos en el componente
        console.warn('Error de maestros guardado en estado:', errorMessage);
      } finally {
        setLoadingMasters(false);
      }
    };

    loadMasterOptions();
  }, []); // ✅ CORREGIDO: Array vacío - solo se ejecuta una vez

  // ===== 🔧 CORREGIDO: CALLBACK ESTABLE PARA INICIALIZACIÓN =====
  const initializeFormFromAzure = useCallback(() => {
    if (!scannedData || !selectedClient || !masterOptions) {
      return;
    }

    try {
      console.log('🔄 Inicializando formulario con datos de Azure...');
      
      const mappedData = VelneoMappingService.mapAzureDataToFormData(
        scannedData,
        selectedClient,
        selectedCompany,
        masterOptions
      );

      // Combinar datos mapeados con datos por defecto
      const initialData = {
        ...EMPTY_POLICY_FORM,
        ...mappedData,
        // Campos que vienen del contexto
        asegurado: selectedClient?.clinom || selectedClient?.nombre || '',
        tomador: selectedClient?.clinom || selectedClient?.nombre || '',
        domicilio: selectedClient?.clidir || selectedClient?.direccion || '',
        compania: selectedCompany?.comcod || EMPTY_POLICY_FORM.compania
      };

      setFormData(initialData);
      setIsDirty(true);
      
      console.log('✅ Formulario inicializado con datos de Azure', {
        camposMapping: Object.keys(mappedData).length,
        completitud: scannedData.porcentajeCompletitud
      });
    } catch (error) {
      console.error('❌ Error inicializando formulario:', error);
      setMasterError('Error procesando datos del documento escaneado');
    }
  }, [scannedData, selectedClient, selectedCompany, masterOptions]); // ✅ DEPENDENCIAS CORRECTAS

  // ===== INICIALIZAR FORMULARIO CON DATOS DEL ESCANEO =====
  useEffect(() => {
    if (scannedData && selectedClient && masterOptions && !loadingMasters) {
      initializeFormFromAzure();
    }
  }, [scannedData, selectedClient, selectedCompany, masterOptions, loadingMasters, initializeFormFromAzure]);

  // ===== VALIDACIÓN INDIVIDUAL DE CAMPO (ESTABILIZADA) =====
  const validateField = useCallback((field: keyof PolicyFormData, value: any): string | null => {
    // Validaciones requeridas
    if (ALL_REQUIRED_FIELDS.includes(field as any)) {
      if (value === null || value === undefined || value === '') {
        return VALIDATION_CONFIG.MESSAGES.REQUIRED;
      }
    }

    // Validaciones específicas por campo
    switch (field) {
      case 'anio':
        const yearStr = String(value);
        if (!yearStr || !VALIDATION_CONFIG.ANIO_PATTERN.test(yearStr)) {
          return 'Año debe ser un número de 4 dígitos';
        }
        const year = Number(yearStr);
        if (year < VALIDATION_CONFIG.ANIO_MIN || year > VALIDATION_CONFIG.ANIO_MAX) {
          return VALIDATION_CONFIG.MESSAGES.INVALID_YEAR;
        }
        break;

      case 'cuotas':
        const cuotas = Number(value);
        if (isNaN(cuotas) || cuotas < VALIDATION_CONFIG.CUOTAS_MIN || cuotas > VALIDATION_CONFIG.CUOTAS_MAX) {
          return VALIDATION_CONFIG.MESSAGES.INVALID_CUOTAS;
        }
        break;

      case 'premio':
      case 'total':
      case 'valorCuota':
        const amount = Number(value);
        if (isNaN(amount) || amount < 0) {
          return VALIDATION_CONFIG.MESSAGES.NEGATIVE_AMOUNT;
        }
        break;

      case 'corredor':
      case 'marcaModelo':
        if (value && value.length > VALIDATION_CONFIG.CORREDOR_MAX_LENGTH) {
          return VALIDATION_CONFIG.MESSAGES.MAX_LENGTH(VALIDATION_CONFIG.CORREDOR_MAX_LENGTH);
        }
        break;

      case 'poliza':
        if (value && !VALIDATION_CONFIG.POLIZA_PATTERN.test(value)) {
          return VALIDATION_CONFIG.MESSAGES.INVALID_FORMAT;
        }
        break;

      case 'hasta':
        if (formData.desde && value) {
          const desde = new Date(formData.desde);
          const hasta = new Date(value);
          if (hasta <= desde) {
            return VALIDATION_CONFIG.MESSAGES.DATE_RANGE;
          }
        }
        break;
    }

    return null;
  }, [formData]); // ✅ Solo formData como dependencia

  // ===== ACTUALIZAR CAMPO DEL FORMULARIO (OPTIMIZADO) =====
  const updateFormData = useCallback((field: keyof PolicyFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Sincronizar campos relacionados
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
    if (ALL_REQUIRED_FIELDS.includes(field as any)) {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  }, [validateField]); // ✅ Solo validateField como dependencia

  // ===== VALIDACIÓN COMPLETA DEL FORMULARIO =====
  const validateForm = useCallback((): FormValidationResult => {
    const newErrors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    const missingRequired: string[] = [];

    // Validar todos los campos requeridos
    ALL_REQUIRED_FIELDS.forEach(field => {
      const value = formData[field as keyof PolicyFormData];
      const error = validateField(field as keyof PolicyFormData, value);
      
      if (error) {
        newErrors[field] = error;
        if (value === null || value === undefined || value === '') {
          missingRequired.push(field);
        }
      }
    });

    // Validaciones cruzadas
    if (formData.desde && formData.hasta) {
      const desde = new Date(formData.desde);
      const hasta = new Date(formData.hasta);
      if (hasta <= desde) {
        newErrors.hasta = VALIDATION_CONFIG.MESSAGES.DATE_RANGE;
      }
    }

    // Warnings para campos opcionales pero recomendados
    if (!formData.matricula && formData.anio && Number(formData.anio) < new Date().getFullYear()) {
      warnings.matricula = 'Considere agregar la matrícula si el vehículo ya está matriculado';
    }

    if (!formData.motor) {
      warnings.motor = 'El número de motor puede ser requerido por la compañía';
    }

    const isValid = Object.keys(newErrors).length === 0;
    
    return {
      isValid,
      errors: newErrors,
      warnings,
      missingRequired
    };
  }, [formData, validateField]);

  // ===== CALCULAR PROGRESO DEL FORMULARIO =====
  const formProgress = useMemo(() => {
    const totalRequired = ALL_REQUIRED_FIELDS.length;
    const completedRequired = ALL_REQUIRED_FIELDS.filter(field => {
      const value = formData[field as keyof PolicyFormData];
      return value !== null && value !== undefined && value !== '';
    }).length;

    const overallProgress = Math.round((completedRequired / totalRequired) * 100);

    // Calcular progreso por pestaña
    const tabProgress = FORM_TABS.reduce((acc, tab) => {
      const tabRequiredFields = TabsUtils.getRequiredFieldsForTab(tab.id);
      const tabCompletedFields = tabRequiredFields.filter(field => {
        const value = formData[field as keyof PolicyFormData];
        return value !== null && value !== undefined && value !== '';
      }).length;
      
      const tabCompletion = tabRequiredFields.length > 0 
        ? Math.round((tabCompletedFields / tabRequiredFields.length) * 100)
        : 100;

      const tabErrors = tabRequiredFields.filter(field => errors[field]).length;

      acc[tab.id] = {
        completion: tabCompletion,
        errors: tabErrors,
        required: tabRequiredFields,
        completed: tabRequiredFields.filter(field => {
          const value = formData[field as keyof PolicyFormData];
          return value !== null && value !== undefined && value !== '';
        })
      };

      return acc;
    }, {} as Record<FormTabId, any>);

    return {
      overall: overallProgress,
      byTab: tabProgress
    };
  }, [formData, errors]);

  // ===== NAVEGACIÓN ENTRE PESTAÑAS =====
  const goToTab = useCallback((tabId: FormTabId) => {
    setActiveTab(tabId);
  }, []);

  const goToNextTab = useCallback(() => {
    const nextTab = TabsUtils.getNextTab(activeTab);
    if (nextTab) {
      setActiveTab(nextTab.id);
    }
  }, [activeTab]);

  const goToPreviousTab = useCallback(() => {
    const previousTab = TabsUtils.getPreviousTab(activeTab);
    if (previousTab) {
      setActiveTab(previousTab.id);
    }
  }, [activeTab]);

  const goToFieldError = useCallback((field: keyof PolicyFormData) => {
    const tabId = TabsUtils.getTabForField(field as string);
    if (tabId) {
      setActiveTab(tabId);
    }
  }, []);

  // ===== 🔧 CORREGIDO: CALLBACKS ESTABLES PARA ENVÍO =====
  const handleFormError = useCallback((message: string) => {
    console.error('Form error:', message);
    onError(message);
  }, [onError]);

  const handleFormSuccess = useCallback((result: any) => {
    console.log('Form success:', result);
    onSuccess(result);
  }, [onSuccess]);

  // ===== ENVÍO DEL FORMULARIO =====
  const submitForm = useCallback(async () => {
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

      console.log('🚀 Enviando formulario a Velneo...');
      
      // Mapear datos del formulario al formato de Velneo
      const velneoRequest = VelneoMappingService.mapFormDataToVelneoRequest(
        formData,
        selectedClient,
        selectedCompany,
        selectedSection,
        masterOptions || undefined
      );

      console.log('📤 Objeto mapeado para Velneo:', {
        poliza: velneoRequest.conpol,
        cliente: velneoRequest.clinom,
        compania: velneoRequest.com_alias,
        campos: Object.keys(velneoRequest).length
      });

      // Enviar a Velneo
      const result = await apiService.createPoliza(velneoRequest);
      
      console.log('✅ Póliza enviada exitosamente a Velneo:', result);
      
      // Resetear estados
      setIsDirty(false);
      
      handleFormSuccess(result);
    } catch (error) {
      console.error('❌ Error enviando formulario:', error);
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
    setFormData({ ...EMPTY_POLICY_FORM });
    setErrors({});
    setTouchedFields(new Set());
    setActiveTab('datos_basicos');
    setIsDirty(false);
  }, []);

  // ===== ESTADO COMPUTED =====
  const isValid = useMemo(() => {
    return validateForm().isValid;
  }, [validateForm]);

  const canSubmit = useMemo(() => {
    return isValid && !isSubmitting && !loadingMasters && masterOptions !== null;
  }, [isValid, isSubmitting, loadingMasters, masterOptions]);

  const hasUnsavedChanges = useMemo(() => {
    return isDirty && !isSubmitting;
  }, [isDirty, isSubmitting]);

  // ===== INFORMACIÓN DE DEBUG =====
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      formData,
      errors,
      touchedFields: Array.from(touchedFields),
      activeTab,
      progress: formProgress,
      masterOptions: masterOptions ? Object.keys(masterOptions) : null,
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