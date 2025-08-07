// src/hooks/usePolicyForm.ts - VERSIÓN CON IMPORTS CORRECTOS

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PolicyFormData } from '../types/poliza';
import type { FormTabId } from '@/types/policyForm';
import type { MasterDataOptionsDto } from '@/types/masterData';
import { EMPTY_POLICY_FORM, VELNEO_DEFAULTS, mapFormDataToVelneoRequest } from '../constants/velneoDefault';
import { MasterDataApi, PolizaApi } from '../services/apiService';  

// ===== TIPOS =====
interface UsePolicyFormProps {
  scannedData?: any;
  selectedClient?: any;
  selectedCompany?: any;
  selectedSection?: any;
  operationType?: 'EMISION' | 'RENOVACION' | 'CAMBIO';
}

interface SubmitResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface TabProgress {
  [key: string]: number;
}

interface FormProgress {
  required: number;
  total: number;
  byTab: TabProgress;
}

// ===== HOOK PRINCIPAL =====
export function usePolicyForm({
  scannedData,
  selectedClient,
  selectedCompany,
  selectedSection,
  operationType = 'EMISION'
}: UsePolicyFormProps = {}) {
  
  // ===== ESTADOS PRINCIPALES =====
  const [formData, setFormData] = useState<PolicyFormData>(EMPTY_POLICY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [masterData, setMasterData] = useState<MasterDataOptionsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTabId>('datos_basicos');
  
  // ===== EFECTOS =====
  
  // Cargar datos maestros al montar
  useEffect(() => {
    loadMasterData();
  }, []);

  // Mapear datos del escaneo cuando estén disponibles
  useEffect(() => {
    if (scannedData && masterData) {
      mapScannedData();
    }
  }, [scannedData, masterData]);

  // Actualizar datos del cliente
  useEffect(() => {
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        asegurado: selectedClient.clinom || selectedClient.nombre || '',
        tomador: selectedClient.clinom || selectedClient.nombre || '',
        domicilio: selectedClient.clidir || selectedClient.direccion || '',
        dirCobro: selectedClient.clidircob || '',
        clinro: selectedClient.clinro || selectedClient.id
      }));
    }
  }, [selectedClient]);

  // Actualizar datos de compañía
  useEffect(() => {
    if (selectedCompany) {
      setFormData(prev => ({
        ...prev,
        compania: selectedCompany.comcod || selectedCompany.id || VELNEO_DEFAULTS.COMPANIA_BSE,
        comalias: selectedCompany.comalias || selectedCompany.nombre || 'BSE'
      }));
    }
  }, [selectedCompany]);

  // Actualizar datos de sección
  useEffect(() => {
    if (selectedSection) {
      setFormData(prev => ({
        ...prev,
        seccion: selectedSection.seccod || selectedSection.id || VELNEO_DEFAULTS.SECCION_AUTOMOVILES
      }));
    }
  }, [selectedSection]);

  // Aplicar business rules según operación
  useEffect(() => {
    applyBusinessRules();
  }, [operationType]);

  // ===== FUNCIONES PRINCIPALES =====

  /**
   * 🔄 Cargar datos maestros del backend
   */
  const loadMasterData = async () => {
    setLoading(true);
    try {
      // ✅ CORREGIDO: Usar MasterDataApi desde apiService
      const data = await MasterDataApi.getMasterDataOptions();
      setMasterData(data);
      console.log('✅ Datos maestros cargados:', {
        categorias: data.categorias?.length || 0,
        destinos: data.destinos?.length || 0,
        combustibles: data.combustibles?.length || 0
      });
    } catch (error) {
      console.error('❌ Error cargando maestros:', error);
      setErrors(prev => ({
        ...prev,
        _global: 'Error cargando datos maestros. Algunos campos podrían no funcionar correctamente.'
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 Mapear datos del escaneo Azure al formulario
   */
  const mapScannedData = useCallback(() => {
    if (!scannedData?.datosVelneo || !masterData) return;

    const { datosBasicos, datosPoliza, datosVehiculo, datosCobertura } = scannedData.datosVelneo;

    // Mapear datos básicos
    if (datosBasicos) {
      setFormData(prev => ({
        ...prev,
        corredor: datosBasicos.corredor || prev.corredor
      }));
    }

    // Mapear datos de póliza
    if (datosPoliza) {
      setFormData(prev => ({
        ...prev,
        poliza: datosPoliza.numeroPoliza || prev.poliza,
        certificado: datosPoliza.certificado || prev.certificado,
        desde: formatDate(datosPoliza.desde) || prev.desde,
        hasta: formatDate(datosPoliza.hasta) || prev.hasta
      }));
    }

    // Mapear datos del vehículo
    if (datosVehiculo) {
      const marcaModelo = [datosVehiculo.marca, datosVehiculo.modelo]
        .filter(Boolean)
        .join(' ');

      setFormData(prev => ({
        ...prev,
        marcaModelo: marcaModelo || prev.marcaModelo,
        anio: datosVehiculo.anio || prev.anio,
        matricula: datosVehiculo.matricula || prev.matricula,
        motor: datosVehiculo.motor || prev.motor,
        chasis: datosVehiculo.chasis || prev.chasis
      }));

      // ✅ Mapear maestros con búsqueda inteligente simple
      if (datosVehiculo.combustible && masterData.combustibles) {
        const combustible = findBestMatch(
          masterData.combustibles,
          datosVehiculo.combustible,
          'name'
        );
        if (combustible) {
          setFormData(prev => ({ ...prev, combustibleId: combustible.id }));
        }
      }

      if (datosVehiculo.categoria && masterData.categorias) {
        const categoria = findBestMatch(
          masterData.categorias,
          datosVehiculo.categoria,
          'catdsc'
        );
        if (categoria) {
          setFormData(prev => ({ ...prev, categoriaId: categoria.id }));
        }
      }

      if (datosVehiculo.destino && masterData.destinos) {
        const destino = findBestMatch(
          masterData.destinos,
          datosVehiculo.destino,
          'desnom'
        );
        if (destino) {
          setFormData(prev => ({ ...prev, destinoId: destino.id }));
        }
      }
    }

    // Mapear datos financieros
    if (datosCobertura) {
      setFormData(prev => ({
        ...prev,
        premio: parseFloat(datosCobertura.premio) || prev.premio,
        total: parseFloat(datosCobertura.total) || parseFloat(datosCobertura.premio) || prev.total,
        zonaCirculacion: datosCobertura.zonaCirculacion || prev.zonaCirculacion
      }));

      if (datosCobertura.moneda && masterData.monedas) {
        const moneda = findBestMatch(
          masterData.monedas,
          datosCobertura.moneda,
          'nombre'
        );
        if (moneda) {
          setFormData(prev => ({ ...prev, monedaId: moneda.id }));
        }
      }
    }

    console.log('✅ Datos mapeados desde Azure');
  }, [scannedData, masterData]);

  /**
   * 📋 Aplicar business rules según tipo de operación
   */
  const applyBusinessRules = useCallback(() => {
    switch (operationType) {
      case 'EMISION':
        setFormData(prev => ({
          ...prev,
          tramite: 'Nuevo',
          estadoPoliza: 'VIG',
          endoso: '0'
        }));
        break;

      case 'RENOVACION':
        setFormData(prev => ({
          ...prev,
          tramite: 'Renovación',
          estadoPoliza: 'VIG',
          desde: incrementYear(prev.desde),
          hasta: incrementYear(prev.hasta)
        }));
        break;

      case 'CAMBIO':
        setFormData(prev => ({
          ...prev,
          tramite: 'Cambio',
          estadoPoliza: 'VIG',
          endoso: String(parseInt(prev.endoso || '0') + 1)
        }));
        break;
    }
  }, [operationType]);

  /**
   * 📝 Actualizar campo del formulario
   */
  const updateField = useCallback((field: keyof PolicyFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-cálculos
      if (field === 'premio' || field === 'cuotas') {
        updated.total = updated.premio;
        updated.valorCuota = updated.cuotas > 0 ? updated.total / updated.cuotas : 0;
      }

      return updated;
    });

    // Marcar campo como tocado
    setTouchedFields(prev => new Set(prev).add(field));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Limpiar warning del campo si existe
    if (warnings[field]) {
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[field];
        return newWarnings;
      });
    }
  }, [errors, warnings]);

  /**
   * ✅ Validar formulario completo
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

    // ===== VALIDACIONES REQUERIDAS =====
    if (!formData.poliza) {
      newErrors.poliza = 'Número de póliza es requerido';
    }

    if (!formData.desde) {
      newErrors.desde = 'Fecha desde es requerida';
    }

    if (!formData.hasta) {
      newErrors.hasta = 'Fecha hasta es requerida';
    }

    if (formData.desde && formData.hasta) {
      const fechaDesde = new Date(formData.desde);
      const fechaHasta = new Date(formData.hasta);
      if (fechaDesde >= fechaHasta) {
        newErrors.hasta = 'La fecha hasta debe ser posterior a la fecha desde';
      }
    }

    if (!formData.marcaModelo) {
      newErrors.marcaModelo = 'Marca y modelo son requeridos';
    }

    if (!formData.anio) {
      newErrors.anio = 'Año del vehículo es requerido';
    } else {
      const anio = parseInt(formData.anio);
      if (anio < 1900 || anio > new Date().getFullYear() + 1) {
        newErrors.anio = 'Año del vehículo inválido';
      }
    }

    if (!formData.combustibleId) {
      newErrors.combustibleId = 'Tipo de combustible es requerido';
    }

    if (!formData.destinoId) {
      newErrors.destinoId = 'Destino del vehículo es requerido';
    }

    if (formData.premio <= 0) {
      newErrors.premio = 'El premio debe ser mayor a 0';
    }

    if (!formData.monedaId) {
      newErrors.monedaId = 'Moneda es requerida';
    }

    // ===== WARNINGS (no bloquean el envío) =====
    if (!formData.matricula) {
      newWarnings.matricula = 'Se recomienda ingresar la matrícula';
    }

    if (!formData.motor && !formData.chasis) {
      newWarnings.vehiculo = 'Se recomienda ingresar motor o chasis';
    }

    if (!formData.corredor) {
      newWarnings.corredor = 'No se ha especificado un corredor';
    }

    if (!formData.observaciones && operationType === 'CAMBIO') {
      newWarnings.observaciones = 'Se recomienda agregar observaciones para cambios';
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return Object.keys(newErrors).length === 0;
  }, [formData, operationType]);

  /**
   * 📤 Enviar formulario a Velneo
   */
  const submitForm = useCallback(async (): Promise<SubmitResult> => {
    if (!validateForm()) {
      console.log('❌ Formulario tiene errores, no se puede enviar');
      return { 
        success: false, 
        error: 'El formulario tiene errores de validación',
        message: 'Por favor corrija los errores antes de enviar'
      };
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para el backend
      const payload = mapFormDataToVelneoRequest(formData);

      console.log('📤 Enviando a Velneo:', payload);

      // ✅ CORREGIDO: Usar PolizaApi desde apiService
      const response = await PolizaApi.create(payload);

      console.log('✅ Póliza creada exitosamente:', response);

      return {
        success: true,
        data: response,
        message: 'Póliza enviada exitosamente a Velneo'
      };

    } catch (error: any) {
      console.error('❌ Error enviando póliza:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al enviar la póliza';

      setErrors(prev => ({
        ...prev,
        _global: errorMessage
      }));

      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };

    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  /**
   * 🔄 Resetear formulario
   */
  const resetForm = useCallback(() => {
    setFormData(EMPTY_POLICY_FORM);
    setErrors({});
    setWarnings({});
    setTouchedFields(new Set());
    setActiveTab('datos_basicos');
    console.log('📋 Formulario reseteado');
  }, []);

    /**
   * 📊 Calcular progreso por pestaña
   */
  const calculateProgressByTab = useCallback((): TabProgress => {
    const tabs: Record<FormTabId, (keyof PolicyFormData)[]> = {
      datos_basicos: ['corredor', 'estadoTramite', 'tramite', 'estadoPoliza'],
      datos_poliza: ['poliza', 'desde', 'hasta'],
      datos_vehiculo: ['marcaModelo', 'anio', 'combustibleId', 'destinoId'],
      datos_cobertura: ['monedaId', 'zonaCirculacion'],
      condiciones_pago: ['premio', 'formaPago'],
      observaciones: []
    };

    const progressByTab: TabProgress = {};

    for (const [tab, fields] of Object.entries(tabs)) {
      if (fields.length === 0) {
        progressByTab[tab] = 100; // Pestañas sin campos requeridos
      } else {
        const completed = fields.filter(field => {
          const value = formData[field];
          return value !== '' && value !== null && value !== undefined && value !== 0;
        }).length;
        progressByTab[tab] = Math.round((completed / fields.length) * 100);
      }
    }

    return progressByTab;
  }, [formData]);

  /**
   * 📊 Calcular progreso del formulario
   */
  const progress = useMemo((): FormProgress => {
    const requiredFields = [
      'poliza', 'desde', 'hasta', 'marcaModelo', 'anio',
      'combustibleId', 'destinoId', 'premio', 'monedaId'
    ];

    const completedRequired = requiredFields.filter(
      field => {
        const value = formData[field as keyof PolicyFormData];
        return value !== '' && value !== null && value !== undefined && value !== 0;
      }
    ).length;

    const totalFields = Object.keys(formData).length;
    const completedFields = Object.values(formData).filter(
      value => value !== '' && value !== 0 && value !== null && value !== undefined
    ).length;

    return {
      required: Math.round((completedRequired / requiredFields.length) * 100),
      total: Math.round((completedFields / totalFields) * 100),
      byTab: calculateProgressByTab()
    };
  }, [formData]);

  /**
   * 🔍 Verificaciones de estado
   */
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(() => touchedFields.size > 0, [touchedFields]);
  const canSubmit = useMemo(() => isValid && !isSubmitting, [isValid, isSubmitting]);

  // ===== RETURN DEL HOOK =====
  return {
    // Estados principales
    formData,
    errors,
    warnings,
    touchedFields,
    masterData,
    loading,
    isSubmitting,
    activeTab,
    
    // Acciones
    updateField,
    validateForm,
    submitForm,
    resetForm,
    loadMasterData,
    setActiveTab,
    
    // Información de estado
    progress,
    isValid,
    isDirty,
    canSubmit
  };
}

// ===== FUNCIONES AUXILIARES =====

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function incrementYear(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * 🔍 Búsqueda inteligente simple para maestros
 */
function findBestMatch<T extends { id: any; [key: string]: any }>(
  items: T[],
  searchText: string,
  searchField: string
): T | null {
  if (!searchText || !items?.length) return null;

  const normalizedSearch = searchText.toLowerCase().trim();

  // Búsqueda exacta
  for (const item of items) {
    if (item[searchField]?.toLowerCase().trim() === normalizedSearch) {
      return item;
    }
  }

  // Búsqueda parcial
  for (const item of items) {
    if (item[searchField]?.toLowerCase().includes(normalizedSearch)) {
      return item;
    }
  }

  return null;
}