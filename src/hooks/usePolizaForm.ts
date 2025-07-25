// ✅ src/hooks/usePolizaForm.ts - CORRECCIÓN COMPLETA

import { useState, useCallback, useEffect } from 'react';
import { PolizaFormData } from '../types/poliza';
import { ValidationError } from '../types/processing';

interface UsePolizaFormOptions {
  initialData?: Partial<PolizaFormData>;  // ✅ PARTIAL para permitir datos incompletos
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
  
  setFormData: React.Dispatch<React.SetStateAction<PolizaFormData>>;  // ✅ AGREGAR SETTER DIRECTO
  
  validate: () => boolean;
  submitForm: () => Promise<boolean>;
  reset: () => void;
  getFieldError: (field: keyof PolizaFormData) => string | undefined;
  hasFieldError: (field: keyof PolizaFormData) => boolean;
  isValid: boolean;
}

export const usePolizaForm = (options: UsePolizaFormOptions = {}): UsePolizaFormReturn => {
  const { initialData, ramoCode, onValidation, onSubmit } = options;
  
  // ✅ VALORES POR DEFECTO COMPLETOS INCLUYENDO CAMPOS FALTANTES
  const defaultFormData: PolizaFormData = {
    // CAMPOS BÁSICOS REQUERIDOS
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: 0,
    moneda: 'PES',
    asegurado: '',
    compania: 0,
    seccionId: 0,
    clienteId: 0,
    cobertura: '',
    
    // ✅ CAMPOS QUE FALTABAN - CAUSABAN ERRORES:
    nombreAsegurado: '',         // Error línea 61
    chapa: '',                   // Error líneas 78, 82
    
    // CAMPOS OPCIONALES
    observaciones: '',
    vehiculo: '',
    marca: '',
    modelo: '',
    motor: '',
    chasis: '',
    matricula: '',
    combustible: '',
    anio: '',
    primaComercial: 0,
    premioTotal: 0,
    cantidadCuotas: 0,
    valorCuota: 0,
    formaPago: '',
    primeraCuotaFecha: '',
    primeraCuotaMonto: 0,
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
    calidad: '',
    categoria: '',
    tipoVehiculo: '',
    uso: '',
    combustibleId: null,
    categoriaId: null,
    destinoId: null,
    calidadId: null,
    operacion: null,
    seccion: '',
    color: '',
    impuestoMSP: 0,
    descuentos: 0,
    recargos: 0,
    codigoPostal: '',
    
    // CAMPOS ESPECÍFICOS DE VELNEO
    tramiteVelneo: undefined,
    estadoPolizaVelneo: undefined,
    formaPagoVelneo: undefined,
    monedaVelneo: undefined,
    estadoGestionVelneo: ''
  };

  const [formData, setFormData] = useState<PolizaFormData>({
    ...defaultFormData,
    ...initialData  // ✅ SOBRESCRIBIR CON DATOS INICIALES SI EXISTEN
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

  // ✅ VALIDACIÓN MEJORADA
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
    
    // Validación de prima
    const primaValue = typeof formData.prima === 'string' ? parseFloat(formData.prima) : formData.prima;
    if (isNaN(primaValue) || primaValue <= 0) {
      errors.push({ field: 'prima', message: 'La prima debe ser un número mayor a 0' });
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
    setFormData,  // ✅ EXPORTAR SETTER DIRECTO
    validate,
    submitForm,
    reset,
    getFieldError,
    hasFieldError,
    isValid: validationErrors.length === 0,
  };
};