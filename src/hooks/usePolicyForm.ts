// src/hooks/usePolicyForm.ts - VERSIÓN OPTIMIZADA

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { PolicyFormData } from '../types/poliza';
import type { FormTabId } from '@/types/policyForm';
import type { MasterDataOptionsDto } from '@/types/masterData';
import { EMPTY_POLICY_FORM, VELNEO_DEFAULTS } from '../constants/velneoDefault';
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
  
  // ===== REFS PARA OPTIMIZACIÓN =====
  const hasMappedData = useRef(false);
  const scannedDataRef = useRef(scannedData);
  const masterDataRef = useRef(masterData);
  
  // Actualizar las refs cuando cambien los valores
  useEffect(() => {
    scannedDataRef.current = scannedData;
  }, [scannedData]);

  useEffect(() => {
    masterDataRef.current = masterData;
  }, [masterData]);
  
  // ===== FUNCIONES PRINCIPALES =====

  /**
   * 🔄 Cargar datos maestros del backend
   */
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const data = await MasterDataApi.getMasterDataOptions();
      setMasterData(data);
      console.log('✅ Datos maestros cargados:', {
        categorias: data.categorias?.length || 0,
        destinos: data.destinos?.length || 0,
        combustibles: data.combustibles?.length || 0,
        tarifas: data.tarifas?.length || 0
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
   * 🎯 Mapear datos del escaneo Azure al formulario - OPTIMIZADO
   */
  const mapScannedData = useCallback(() => {
    const currentScannedData = scannedDataRef.current;
    const currentMasterData = masterDataRef.current;
    
    console.log('🚀 INICIANDO mapScannedData', {
      tieneScannedData: !!currentScannedData,
      tieneMasterData: !!currentMasterData,
      condicionesPago: currentScannedData?.datosVelneo?.condicionesPago
    });

    if (!currentScannedData?.datosVelneo) {
      console.log('❌ No hay datosVelneo');
      return;
    }

    const { datosBasicos, datosPoliza, datosVehiculo, datosCobertura, condicionesPago } = currentScannedData.datosVelneo;

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

      // Solo mapear maestros si están disponibles
      if (currentMasterData) {
        if (datosVehiculo.combustible && currentMasterData.combustibles) {
          const combustible = findBestMatch(
            currentMasterData.combustibles,
            datosVehiculo.combustible,
            'name'
          );
          if (combustible) {
            setFormData(prev => ({ ...prev, combustibleId: combustible.id }));
          }
        }

        if (datosVehiculo.categoria && currentMasterData.categorias) {
          const categoria = findBestMatch(
            currentMasterData.categorias,
            datosVehiculo.categoria,
            'catdsc'
          );
          if (categoria) {
            setFormData(prev => ({ ...prev, categoriaId: categoria.id }));
          }
        }

        if (datosVehiculo.destino && currentMasterData.destinos) {
          const destino = findBestMatch(
            currentMasterData.destinos,
            datosVehiculo.destino,
            'desnom'
          );
          if (destino) {
            setFormData(prev => ({ ...prev, destinoId: destino.id }));
          }
        }
      }
    }

    // Mapear zona y moneda
    if (datosCobertura) {
      setFormData(prev => ({
        ...prev,
        zonaCirculacion: datosCobertura.zonaCirculacion || prev.zonaCirculacion
      }));

      // Mapear moneda
      if (datosCobertura.codigoMoneda) {
        setFormData(prev => ({ ...prev, monedaId: datosCobertura.codigoMoneda }));
      } else if (datosCobertura.moneda && currentMasterData?.monedas) {
        const moneda = findBestMatch(
          currentMasterData.monedas,
          datosCobertura.moneda,
          'codigo'
        ) || findBestMatch(
          currentMasterData.monedas,
          datosCobertura.moneda,
          'nombre'
        );
        
        if (moneda) {
          setFormData(prev => ({ ...prev, monedaId: moneda.id }));
        }
      }
    }

    // Mapear condiciones de pago
    if (condicionesPago) {
      console.log('💰 Mapeando condiciones de pago completas:', condicionesPago);
      
      // Extraer valor por cuota
      let valorPorCuota = 0;
      if (condicionesPago.valorCuota) {
        valorPorCuota = parseFloat(condicionesPago.valorCuota);
      } else if (condicionesPago.detalleCuotas?.primeraCuota?.monto) {
        valorPorCuota = parseFloat(condicionesPago.detalleCuotas.primeraCuota.monto);
      } else if (condicionesPago.detalleCuotas?.montoPromedio) {
        valorPorCuota = parseFloat(condicionesPago.detalleCuotas.montoPromedio);
      } else if (condicionesPago.detalleCuotas?.cuotas?.[0]?.monto) {
        valorPorCuota = parseFloat(condicionesPago.detalleCuotas.cuotas[0].monto);
      }
      
      // Buscar premio y total
      let premio = 0;
      let total = 0;
      
      if (condicionesPago.premio && condicionesPago.premio !== 0) {
        premio = parseFloat(condicionesPago.premio);
      }
      
      if (condicionesPago.total && condicionesPago.total !== 0) {
        total = parseFloat(condicionesPago.total);
      } else if (condicionesPago.detalleCuotas?.cuotas?.length > 0 && valorPorCuota > 0) {
        const cantidadCuotas = condicionesPago.detalleCuotas.cuotas.length;
        total = valorPorCuota * cantidadCuotas;
        console.log(`📊 Total calculado: ${cantidadCuotas} cuotas x ${valorPorCuota} = ${total}`);
      }
      
      if (premio === 0 && total > 0) {
        premio = total;
      }
      
      const datosFinancieros = {
        premio: premio,
        total: total,
        cuotas: parseInt(condicionesPago.cuotas) || 
                condicionesPago.detalleCuotas?.cuotas?.length ||
                parseInt(condicionesPago.detalleCuotas?.cantidadTotal) || 1,
        valorCuota: valorPorCuota,
        formaPago: mapearFormaPago(condicionesPago.formaPago) || 'Contado'
      };
      
      console.log('💳 Datos financieros finales:', datosFinancieros);
      
      setFormData(prev => ({
        ...prev,
        ...datosFinancieros
      }));
    }

    console.log('✅ Mapeo completado');
  }, []); // Sin dependencias

  const mapearFormaPago = (formaPagoTexto: string): string => {
    if (!formaPagoTexto) return 'Contado';
    
    const formaPagoUpper = formaPagoTexto.toUpperCase();
    
    if (formaPagoUpper.includes('TARJETA') || formaPagoUpper.includes('CRÉDITO')) {
      return 'Tarjeta';
    } else if (formaPagoUpper.includes('DÉBITO') || formaPagoUpper.includes('DEBITO')) {
      return 'Débito Automático';
    } else if (formaPagoUpper.includes('CUOTA')) {
      return 'Cuotas';
    } else if (formaPagoUpper.includes('CONTADO')) {
      return 'Contado';
    }
    
    return 'Contado';
  };

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
   * 📝 Actualizar campo del formulario - SIMPLIFICADO SIN CÁLCULOS
   */
  const updateField = useCallback((field: keyof PolicyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Marcar campo como tocado
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      newSet.add(field);
      return newSet;
    });
  }, []); // Sin dependencias

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

    if (!masterData) {
      console.log('❌ No hay datos maestros cargados');
      return {
        success: false,
        error: 'Datos maestros no disponibles',
        message: 'Por favor espere a que se carguen los datos maestros'
      };
    }

    setIsSubmitting(true);

    try {
      const { VelneoMappingService } = await import('../services/velneoMapping');
      
      const payload = VelneoMappingService.mapFormDataToVelneoRequest(
        formData,
        selectedClient,
        selectedCompany,
        selectedSection,
        masterData,
        scannedData
      );

      console.log('📤 Enviando a Velneo:', payload);

      const response = await PolizaApi.create(payload as any);

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
  }, [formData, validateForm, selectedClient, selectedCompany, selectedSection, masterData, scannedData]);

  /**
   * 🔄 Resetear formulario
   */
  const resetForm = useCallback(() => {
    setFormData(EMPTY_POLICY_FORM);
    setErrors({});
    setWarnings({});
    setTouchedFields(new Set());
    setActiveTab('datos_basicos');
    hasMappedData.current = false;
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
        progressByTab[tab] = 100;
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
  }, [formData, calculateProgressByTab]);

  /**
   * 🔍 Verificaciones de estado
   */
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(() => touchedFields.size > 0, [touchedFields]);
  const canSubmit = useMemo(() => isValid && !isSubmitting, [isValid, isSubmitting]);

  // ===== EFECTOS =====
  
  // Cargar datos maestros al montar
  useEffect(() => {
    loadMasterData();
  }, []);

  // Mapear datos del escaneo cuando estén disponibles
  useEffect(() => {
    console.log('🔄 useEffect para mapeo de escaneo:', {
      tieneScannedData: !!scannedData,
      tieneDataVelneo: !!scannedData?.datosVelneo,
      tieneMasterData: !!masterData,
      yaMapeado: hasMappedData.current
    });
    
    // Solo mapear una vez cuando lleguen los datos
    if (scannedData?.datosVelneo && !hasMappedData.current) {
      console.log('✅ Ejecutando mapScannedData por primera vez');
      mapScannedData();
      hasMappedData.current = true;
    }
    
    // Reset el flag si cambia el scannedData
    if (!scannedData) {
      hasMappedData.current = false;
    }
  }, [scannedData?.datosVelneo, mapScannedData]);

  // Efecto separado para limpiar errores cuando se modifica un campo
  useEffect(() => {
    touchedFields.forEach(field => {
      if (errors[field]) {
        const value = formData[field as keyof PolicyFormData];
        // Solo limpiar el error si el campo tiene valor
        if (value !== '' && value !== null && value !== undefined && value !== 0) {
          setErrors(prev => {
            if (prev[field]) {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            }
            return prev;
          });
        }
      }
    });
  }, [formData, touchedFields, errors]);

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
  }, [operationType, applyBusinessRules]);

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