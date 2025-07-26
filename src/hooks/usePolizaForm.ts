// src/hooks/usePolizaForm.ts
// ✅ VERSIÓN CORREGIDA - SIN ERRORES DE TYPES

import { useState, useCallback, useEffect } from 'react';
import { PolizaFormData } from '../types/core/poliza';

// ✅ TIPO LOCAL para validación - SIN import que causa problemas
interface ValidationError {
  field: string;
  message: string;
  type?: 'error' | 'warning';
}

interface UsePolizaFormOptions {
  initialData?: Partial<PolizaFormData>;
  ramoCode?: string;
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  onSubmit?: (data: PolizaFormData) => Promise<void> | void;
}

interface UsePolizaFormReturn {
  formData: PolizaFormData;
  validationErrors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  
  updateField: <K extends keyof PolizaFormData>(
    field: K, 
    value: PolizaFormData[K]
  ) => void;
  
  setFormData: React.Dispatch<React.SetStateAction<PolizaFormData>>;
  
  validate: () => boolean;
  submitForm: () => Promise<boolean>;
  reset: () => void;
  getFieldError: (field: keyof PolizaFormData) => string | undefined;
  hasFieldError: (field: keyof PolizaFormData) => boolean;
  isValid: boolean;
}

export const usePolizaForm = (options: UsePolizaFormOptions = {}): UsePolizaFormReturn => {
  const { initialData, ramoCode, onValidation, onSubmit } = options;
  
  // ✅ DEFAULTDATA COMPLETO - TODOS LOS CAMPOS DE PolizaFormData
  const defaultFormData: PolizaFormData = {
    // ✅ CAMPOS REQUERIDOS
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: '',
    moneda: 'UYU',
    asegurado: '',
    compania: 0,
    nombreCompania: '',
    seccionId: 0,
    clienteId: 0,
    cobertura: '',

    // ✅ CAMPOS OBLIGATORIOS EN EL TIPO
    nombreAsegurado: '',        
    chapa: '',              
    
    // ✅ CAMPOS OPCIONALES EXISTENTES
    observaciones: '',
    vehiculo: '',
    marca: '',
    modelo: '',
    matricula: '',
    motor: '',
    chasis: '',
    anio: '',
    primaComercial: '',
    premioTotal: '',
    cantidadCuotas: 1,
    valorCuota: '',
    formaPago: '',
    primeraCuotaFecha: '',
    primeraCuotaMonto: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    localidad: '',
    departamento: '',
    corredor: '',
    plan: '',
    ramo: ramoCode || '',
    certificado: '',
    estadoPoliza: '',
    tramite: '',
    tipo: '',
    destino: '',
    combustible: '',
    calidad: '',
    categoria: '',
    tipoVehiculo: '',
    uso: '',

    // ✅ IDs para combos
    combustibleId: null,
    categoriaId: null,
    destinoId: null,
    calidadId: null,

    // ✅ CAMPOS ADICIONALES EXISTENTES
    operacion: null,
    seccion: '',
    color: '',
    impuestoMSP: '',
    descuentos: '',
    recargos: '',
    codigoPostal: '',

    // ✅ CAMPOS ESPECÍFICOS DE VELNEO
    tramiteVelneo: undefined,
    estadoPolizaVelneo: undefined,
    formaPagoVelneo: undefined,
    monedaVelneo: undefined,
    estadoGestionVelneo: '',

    // ✅ CAMPOS NUEVOS QUE FALTABAN
    endoso: '',
    tipoMovimiento: '',
    zonaCirculacion: '',
    codigoMoneda: '',
    totalBonificaciones: '',
    observacionesGestion: '',
    informacionAdicional: '',

    // ✅ CAMPOS OPCIONALES ADICIONALES
    datosVelneo: undefined
  };

  const [formData, setFormData] = useState<PolizaFormData>({
    ...defaultFormData,
    ...initialData
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ✅ FUNCIÓN updateField TIPADA CORRECTAMENTE
  const updateField = useCallback(<K extends keyof PolizaFormData>(
    field: K, 
    value: PolizaFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  // ✅ VALIDACIÓN CORREGIDA - trabajando con strings
  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validaciones básicas requeridas
    if (!formData.numeroPoliza?.trim()) {
      errors.push({ field: 'numeroPoliza', message: 'Número de póliza es requerido' });
    }
    
    if (!formData.asegurado?.trim()) {
      errors.push({ field: 'asegurado', message: 'Asegurado es requerido' });
    }
    
    if (!formData.vigenciaDesde) {
      errors.push({ field: 'vigenciaDesde', message: 'Fecha de vigencia desde es requerida' });
    }
    
    if (!formData.vigenciaHasta) {
      errors.push({ field: 'vigenciaHasta', message: 'Fecha de vigencia hasta es requerida' });
    }
    
    if (!formData.cobertura?.trim()) {
      errors.push({ field: 'cobertura', message: 'Cobertura es requerida' });
    }
    
    // Validaciones de IDs requeridos
    if (!formData.compania || formData.compania === 0) {
      errors.push({ field: 'compania', message: 'Debe seleccionar una compañía' });
    }
    
    if (!formData.clienteId || formData.clienteId === 0) {
      errors.push({ field: 'clienteId', message: 'Debe seleccionar un cliente' });
    }
    
    if (!formData.seccionId || formData.seccionId === 0) {
      errors.push({ field: 'seccionId', message: 'Debe seleccionar una sección' });
    }
    
    // Validación de fechas
    if (formData.vigenciaDesde && formData.vigenciaHasta) {
      const desde = new Date(formData.vigenciaDesde);
      const hasta = new Date(formData.vigenciaHasta);
      
      if (desde >= hasta) {
        errors.push({ field: 'vigenciaHasta', message: 'La fecha hasta debe ser posterior a la fecha desde' });
      }
    }
    
    // ✅ VALIDACIÓN DE PRIMA CORREGIDA - trabajando con string
    if (!formData.prima?.trim()) {
      errors.push({ field: 'prima', message: 'La prima es requerida' });
    } else {
      const primaValue = parseFloat(formData.prima);
      if (isNaN(primaValue) || primaValue <= 0) {
        errors.push({ field: 'prima', message: 'La prima debe ser un número mayor a 0' });
      }
    }
    
    return errors;
  }, [formData]);

  const validate = useCallback((): boolean => {
    const errors = validateForm();
    setValidationErrors(errors);
    
    const isValid = errors.length === 0;
    if (onValidation) {
      onValidation(isValid, errors);
    }
    return isValid;
  }, [validateForm, onValidation]);

  const submitForm = useCallback(async (): Promise<boolean> => {
    if (!validate()) {
      return false;
    }

    if (!onSubmit) {
      return true;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, formData]);

  const reset = useCallback(() => {
    setFormData({ ...defaultFormData, ...initialData });
    setValidationErrors([]);
    setIsSubmitting(false);
    setIsDirty(false);
  }, [defaultFormData, initialData]);

  const getFieldError = useCallback((field: keyof PolizaFormData): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  const hasFieldError = useCallback((field: keyof PolizaFormData): boolean => {
    return validationErrors.some(error => error.field === field);
  }, [validationErrors]);

  // ✅ EFECTO PARA ACTUALIZAR DATOS CUANDO CAMBIAN LOS INICIALES
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  return {
    formData,
    validationErrors,
    isSubmitting,
    isDirty,
    updateField,
    setFormData,
    validate,
    submitForm,
    reset,
    getFieldError,
    hasFieldError,
    isValid: validationErrors.length === 0,
  };
};