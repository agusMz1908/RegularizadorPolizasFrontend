// src/features/policy-form/PolicyFormProvider.tsx
// Context y estado global del formulario de póliza

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PolicyFormData } from '@/types/poliza';
import type { FormTabId } from '@/types/policyForm';
import type { MasterDataOptionsDto, ClienteDto, CompanyDto, SeccionDto } from '@/types/masterData';
import type { AzureProcessResponse } from '@/types/azureDocumentResult';
import { MasterDataApi } from '@/services/apiService';
import { FORM_TABS, TabsUtils } from '@/constants/formTabs';

// ===== TIPOS =====
export interface FormProgress {
  overall: number;  // 0-100
  byTab: Record<FormTabId, {
    completion: number;     // 0-100
    errors: number;
    requiredFields: string[];
    completedFields: string[];
  }>;
}

export interface FormValidationErrors {
  [key: string]: string | undefined;
}

export interface PolicyFormContextValue {
  // Datos
  formData: PolicyFormData;
  masterData: MasterDataOptionsDto | null;
  
  // Contexto externo
  scannedData: AzureProcessResponse | null;
  selectedClient: ClienteDto | null;
  selectedCompany: CompanyDto | null;
  selectedSection: SeccionDto | null;
  
  // Estado
  activeTab: FormTabId;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: FormValidationErrors;
  touchedFields: Set<string>;
  progress: FormProgress;
  
  // Acciones
  updateField: (field: keyof PolicyFormData, value: any) => void;
  updateMultipleFields: (updates: Partial<PolicyFormData>) => void;
  setActiveTab: (tab: FormTabId) => void;
  markFieldTouched: (field: keyof PolicyFormData) => void;
  validateField: (field: keyof PolicyFormData) => string | undefined;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => Promise<void>;
}

// ===== INITIAL STATE =====
const getInitialFormData = (): PolicyFormData => ({
  // Datos básicos
  asegurado: '',
  tomador: '',
  domicilio: '',
  dirCobro: '',
  corredor: '',
  asignado: '',
  
  // Estados y tipos
  estadoTramite: 'Pendiente',
  tramite: 'Nuevo',
  estadoPoliza: 'VIG',
  tipo: 'Líneas personales',
  fecha: '',
  
  // Datos de póliza
  poliza: '',
  certificado: '',
  desde: '',
  hasta: '',
  compania: 0,
  comalias: '',
  
  // Datos del vehículo
  marcaModelo: '',
  anio: '',
  matricula: '',
  motor: '',
  chasis: '',
  destinoId: 0,
  combustibleId: '',
  calidadId: 0,
  categoriaId: 0,
  
  // Cobertura
  monedaId: 1,
  coberturaId: 0,
  zonaCirculacion: '',
  moneda: 0,
  
  // Condiciones de pago
  formaPago: 'Contado',
  cuotas: 1,
  premio: 0,
  total: 0,
  valorCuota: 0,
  
  // Observaciones
  observaciones: ''
});

// ===== CONTEXT =====
const PolicyFormContext = createContext<PolicyFormContextValue | undefined>(undefined);

export const usePolicyFormContext = () => {
  const context = useContext(PolicyFormContext);
  if (!context) {
    throw new Error('usePolicyFormContext must be used within PolicyFormProvider');
  }
  return context;
};

// ===== PROVIDER COMPONENT =====
interface PolicyFormProviderProps {
  children: React.ReactNode;
  scannedData?: AzureProcessResponse | null;
  selectedClient?: ClienteDto | null;
  selectedCompany?: CompanyDto | null;
  selectedSection?: SeccionDto | null;
  onSubmit?: (data: PolicyFormData) => Promise<void>;
}

export function PolicyFormProvider({
  children,
  scannedData = null,
  selectedClient = null,
  selectedCompany = null,
  selectedSection = null,
  onSubmit
}: PolicyFormProviderProps) {
  // Estado principal
  const [formData, setFormData] = useState<PolicyFormData>(getInitialFormData());
  const [masterData, setMasterData] = useState<MasterDataOptionsDto | null>(null);
  const [activeTab, setActiveTab] = useState<FormTabId>('datos_basicos');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // ===== CARGAR DATOS MAESTROS =====
  useEffect(() => {
    const loadMasterData = async () => {
      if (masterData) return; // Ya cargados
      
      setIsLoading(true);
      try {
        const data = await MasterDataApi.getMasterDataOptions();
        setMasterData(data);
      } catch (error) {
        console.error('Error cargando datos maestros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Cargar solo si estamos en la pestaña de vehículo o cobertura
    if (activeTab === 'datos_vehiculo' || activeTab === 'datos_cobertura') {
      loadMasterData();
    }
  }, [activeTab, masterData]);

  // ===== APLICAR DATOS ESCANEADOS =====
  useEffect(() => {
    if (scannedData?.datosVelneo) {
      const mappedData = mapScannedDataToForm(scannedData.datosVelneo);
      setFormData(prev => ({
        ...prev,
        ...mappedData
      }));
    }
  }, [scannedData]);

  // ===== APLICAR DATOS DEL CLIENTE =====
  useEffect(() => {
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        asegurado: selectedClient.clinom || prev.asegurado,
        domicilio: selectedClient.clidir || prev.domicilio,
        dirCobro: selectedClient.clidircob || prev.dirCobro
      }));
    }
  }, [selectedClient]);

  // ===== VALIDACIÓN =====
  const validateField = useCallback((field: keyof PolicyFormData): string | undefined => {
    const value = formData[field];
    
    // Validaciones por campo
    switch (field) {
      case 'asegurado':
        return !value ? 'El asegurado es requerido' : undefined;
      case 'poliza':
        return !value ? 'El número de póliza es requerido' : undefined;
      case 'desde':
        return !value ? 'La fecha desde es requerida' : undefined;
      case 'hasta':
        if (!value) return 'La fecha hasta es requerida';
        if (formData.desde && value < formData.desde) {
          return 'La fecha hasta debe ser posterior a la fecha desde';
        }
        return undefined;
      case 'marcaModelo':
        return !value ? 'La marca y modelo son requeridos' : undefined;
      case 'anio':
        const year = Number(value);
        if (!value) return 'El año es requerido';
        if (year < 1900 || year > new Date().getFullYear() + 1) {
          return 'Año inválido';
        }
        return undefined;
      case 'corredor':
        return !value ? 'El corredor es requerido' : undefined;
      case 'destinoId':
        return !value || value === 0 ? 'El destino es requerido' : undefined;
      case 'combustibleId':
        return !value ? 'El combustible es requerido' : undefined;
      case 'monedaId':
        return !value || value === 0 ? 'La moneda es requerida' : undefined;
      case 'formaPago':
        return !value ? 'La forma de pago es requerida' : undefined;
      default:
        return undefined;
    }
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormValidationErrors = {};
    let isValid = true;

    // Definir campos requeridos manualmente ya que no existe getRequiredFieldsForTab
    const requiredFields: (keyof PolicyFormData)[] = [
      'asegurado', 'poliza', 'desde', 'hasta', 'marcaModelo',
      'anio', 'corredor', 'destinoId', 'combustibleId', 'monedaId',
      'total', 'premio', 'formaPago'
    ];

    requiredFields.forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField]);

  // ===== ACCIONES =====
  const updateField = useCallback((field: keyof PolicyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validar campo si ya fue tocado
    if (touchedFields.has(field)) {
      const error = validateField(field);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [touchedFields, validateField]);

  const updateMultipleFields = useCallback((updates: Partial<PolicyFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const markFieldTouched = useCallback((field: keyof PolicyFormData) => {
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Validar al tocar
    const error = validateField(field);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [validateField]);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setTouchedFields(new Set());
    setActiveTab('datos_basicos');
  }, []);

  const submitForm = useCallback(async () => {
    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData) as (keyof PolicyFormData)[];
    setTouchedFields(new Set(allFields));

    if (!validateForm()) {
      // Ir a la primera pestaña con errores
      const tabsWithErrors = FORM_TABS.filter(tab => {
        const tabFields = TabsUtils.getFieldsForTab(tab.id);
        return tabFields.some(field => errors[field]);
      });
      
      if (tabsWithErrors.length > 0) {
        setActiveTab(tabsWithErrors[0].id);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, errors, onSubmit]);

  // ===== PROGRESO =====
  const calculateProgress = useCallback((): FormProgress => {
    const tabProgress: FormProgress['byTab'] = {} as FormProgress['byTab'];
    let totalCompletion = 0;
    let tabCount = 0;

    // Definir campos requeridos por pestaña manualmente
    const requiredFieldsByTab: Record<FormTabId, string[]> = {
      'datos_basicos': ['corredor', 'asegurado', 'estadoTramite', 'tramite', 'estadoPoliza'],
      'datos_poliza': ['poliza', 'desde', 'hasta'],
      'datos_vehiculo': ['marcaModelo', 'anio', 'destinoId', 'combustibleId'],
      'datos_cobertura': ['monedaId'],
      'condiciones_pago': ['formaPago', 'premio', 'total'],
      'observaciones': []
    };

    FORM_TABS.forEach(tab => {
      const fields = TabsUtils.getFieldsForTab(tab.id);
      const requiredFields = requiredFieldsByTab[tab.id] || [];
      const completedFields = requiredFields.filter(field => {
        const value = formData[field as keyof PolicyFormData];
        return value !== '' && value !== 0 && value !== null && value !== undefined;
      });
      const tabErrors = fields.filter(field => errors[field]).length;
      const completion = requiredFields.length > 0 
        ? Math.round((completedFields.length / requiredFields.length) * 100)
        : 100;

      tabProgress[tab.id] = {
        completion,
        errors: tabErrors,
        requiredFields: requiredFields,
        completedFields: completedFields
      };

      totalCompletion += completion;
      tabCount++;
    });

    return {
      overall: Math.round(totalCompletion / tabCount),
      byTab: tabProgress
    };
  }, [formData, errors]);

  const progress = calculateProgress();

  // ===== CONTEXT VALUE =====
  const contextValue: PolicyFormContextValue = {
    // Datos
    formData,
    masterData,
    
    // Contexto externo
    scannedData,
    selectedClient,
    selectedCompany,
    selectedSection,
    
    // Estado
    activeTab,
    isLoading,
    isSubmitting,
    errors,
    touchedFields,
    progress,
    
    // Acciones
    updateField,
    updateMultipleFields,
    setActiveTab,
    markFieldTouched,
    validateField,
    validateForm,
    resetForm,
    submitForm
  };

  return (
    <PolicyFormContext.Provider value={contextValue}>
      {children}
    </PolicyFormContext.Provider>
  );
}

// ===== HELPER FUNCTIONS =====

function mapScannedDataToForm(datosVelneo: any): Partial<PolicyFormData> {
  const mapped: Partial<PolicyFormData> = {};
  
  // Mapear desde datosBasicos
  if (datosVelneo.datosBasicos) {
    const basicos = datosVelneo.datosBasicos;
    if (basicos.asegurado) mapped.asegurado = basicos.asegurado;
    if (basicos.corredor) mapped.corredor = basicos.corredor;
    if (basicos.domicilio) mapped.domicilio = basicos.domicilio;
    if (basicos.tramite) mapped.tramite = basicos.tramite;
    if (basicos.estado) mapped.estadoTramite = basicos.estado;
    if (basicos.fecha) mapped.fecha = basicos.fecha;
    if (basicos.asignado) mapped.asignado = basicos.asignado;
    if (basicos.tipo) mapped.tipo = basicos.tipo;
  }
  
  // Mapear desde datosPoliza
  if (datosVelneo.datosPoliza) {
    const poliza = datosVelneo.datosPoliza;
    if (poliza.numeroPoliza) mapped.poliza = poliza.numeroPoliza;
    if (poliza.certificado) mapped.certificado = poliza.certificado;
    if (poliza.desde) mapped.desde = poliza.desde;
    if (poliza.hasta) mapped.hasta = poliza.hasta;
  }
  
  // Mapear desde datosVehiculo
  if (datosVelneo.datosVehiculo) {
    const vehiculo = datosVelneo.datosVehiculo;
    if (vehiculo.marcaModelo) mapped.marcaModelo = vehiculo.marcaModelo;
    if (vehiculo.anio) mapped.anio = vehiculo.anio;
    if (vehiculo.matricula) mapped.matricula = vehiculo.matricula;
    if (vehiculo.motor) mapped.motor = vehiculo.motor;
    if (vehiculo.chasis) mapped.chasis = vehiculo.chasis;
  }
  
  // Mapear desde datosCobertura
  if (datosVelneo.datosCobertura) {
    const cobertura = datosVelneo.datosCobertura;
    if (cobertura.zonaCirculacion) mapped.zonaCirculacion = cobertura.zonaCirculacion;
    if (cobertura.moneda) mapped.moneda = cobertura.moneda;
  }
  
  // Mapear desde condicionesPago
  if (datosVelneo.condicionesPago) {
    const pago = datosVelneo.condicionesPago;
    if (pago.formaPago) mapped.formaPago = pago.formaPago;
    if (pago.cuotas) mapped.cuotas = pago.cuotas;
    if (pago.premio) mapped.premio = pago.premio;
    if (pago.total) mapped.total = pago.total;
    if (pago.valorCuota) mapped.valorCuota = pago.valorCuota;
  }
  
  // Mapear desde observaciones
  if (datosVelneo.observaciones) {
    if (datosVelneo.observaciones.observacionesGenerales) {
      mapped.observaciones = datosVelneo.observaciones.observacionesGenerales;
    }
  }
  
  return mapped;
}