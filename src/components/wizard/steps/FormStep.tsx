import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Sparkles, 
  RefreshCw, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Car,
  CreditCard,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  mapClienteToFormData, 
  mapCompanyToFormData, 
  mapSeccionToFormData, 
  mapOperacionToFormData,
  getClienteDisplayName,
  getCompanyDisplayName,
  getSeccionDisplayName,
  getOperacionDisplayName,
  combineWizardData,
  validateWizardData,
  debugWizardMapping,
} from '../../../utils/wizardDataMapper';
import { PolizaFormData } from '../../../types/core/poliza';
import { DocumentProcessResult, WizardState } from '../../../types/ui/wizard';
import { UseFormValidationReturn } from '../../../hooks/wizard/useFormValidation';

interface FormStepProps {
  formData: PolizaFormData;
  extractedData: DocumentProcessResult | null;
  validation: UseFormValidationReturn;
  onFormDataChange: (data: PolizaFormData) => void;
  onSubmit: () => void;
  saving: boolean;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  wizardState: WizardState;
}

export const FormStep: React.FC<FormStepProps> = ({
  formData,
  extractedData,
  validation,
  onFormDataChange,
  onSubmit,
  saving,
  onNext,
  onBack,
  isDarkMode,
  wizardState
}) => {
  const [activeTab, setActiveTab] = useState('basicos');
  
  // ✅ Estados para auto-completado
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const tabs = [
    { id: 'basicos', label: 'Datos Básicos', icon: User, color: 'blue' },
    { id: 'poliza', label: 'Póliza', icon: FileText, color: 'purple' },
    { id: 'vehiculo', label: 'Vehículo', icon: Car, color: 'green' },
    { id: 'condiciones', label: 'Condiciones Pago', icon: CreditCard, color: 'orange' },
    { id: 'observaciones', label: 'Observaciones', icon: FileCheck, color: 'indigo' }
  ];

  // ✅ Efecto para auto-completado desde datos extraídos
  useEffect(() => {
    if (extractedData && 
        extractedData.datosVelneo && 
        !hasAutoFilled &&  
        !isAutoFilling) {   
      
      console.log('🤖 FormStep: Auto-completando formulario con datos extraídos...');
      console.log('📊 Datos extraídos recibidos:', extractedData);
      
      autoFillForm();
      setHasAutoFilled(true); 
    }
  }, [extractedData?.datosVelneo, hasAutoFilled, isAutoFilling]);

  // ✅ Efecto para inicializar con datos del wizard
  useEffect(() => {
    if (wizardState && Object.keys(formData).length === 0) {
      initializeFormWithWizardData();
    }
  }, [wizardState]);

  const initializeFormWithWizardData = () => {
  // ✅ Usar la función helper combinada
  const wizardData = combineWizardData(wizardState.stepData);
  
  // ✅ Validar datos antes de aplicar (opcional)
  const validation = validateWizardData(wizardState.stepData);
  if (!validation.isValid) {
    console.warn('⚠️ Datos del wizard inválidos:', validation.errors);
  }

  // ✅ Debug del mapeo (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    debugWizardMapping(wizardState.stepData, wizardData);
  }

  const mergedData = { ...formData, ...wizardData } as PolizaFormData;
  onFormDataChange(mergedData);
  
  console.log('🔗 FormStep: Datos del wizard aplicados:', wizardData);
};


  // ✅ Funciones para mostrar datos del wizard
  const getClienteDisplay = (): string => {
    const cliente = wizardState?.stepData?.cliente;
    if (!cliente) return 'No seleccionado';
    return cliente.nombre || cliente.clinom || `Cliente ID: ${cliente.id}`;
  };

  const getCompaniaDisplay = (): string => {
    const company = wizardState?.stepData?.company;
    if (!company) return 'No seleccionada';
    return company.nombre || `Compañía ID: ${company.id}`;
  };

  const getSeccionDisplay = (): string => {
    const seccion = wizardState?.stepData?.seccion;
    if (!seccion) return 'No seleccionada';
    return seccion.nombre || `Sección ID: ${seccion.id}`;
  };

const getOperacionDisplay = (): string => {
  const operacion = wizardState?.stepData?.operacion;
  if (!operacion) return 'No especificada';
  
  // Mapear string a display name
  const operacionNames: Record<string, string> = {
    'EMISION': 'Nueva Póliza',
    'RENOVACION': 'Renovación',
    'ENDOSO': 'Endoso',
    'CAMBIO': 'Modificación'
  };
  
  return operacionNames[operacion] || operacion;
};

  // ✅ Obtener datos del wizard para auto-completado
  const getWizardDataForForm = (): Partial<PolizaFormData> => {
    const wizardData: Partial<PolizaFormData> = {};

    if (wizardState?.stepData?.cliente) {
      const cliente = wizardState.stepData.cliente;
      wizardData.clienteId = cliente.id;
      wizardData.asegurado = cliente.nombre || cliente.clinom;
      wizardData.documento = cliente.cliced || cliente.cliced || cliente.cliruc;
    }

    if (wizardState?.stepData?.company) {
      wizardData.compania = wizardState.stepData.company.id;
    }

    if (wizardState?.stepData?.seccion) {
      wizardData.seccionId = wizardState.stepData.seccion.id;
      wizardData.seccion = wizardState.stepData.seccion.nombre;
    }

    if (wizardState?.stepData?.operacion) {
      wizardData.tipoMovimiento = wizardState.stepData.operacion;
    }

    return wizardData;
  };

  // ✅ Función principal de auto-completado
  const autoFillForm = async () => {
    if (!extractedData || !extractedData.datosVelneo) {
      console.warn('⚠️ No hay datosVelneo para auto-completar');
      return;
    }

    setIsAutoFilling(true);
    const filledFields = new Set<string>();

    try {
      const autoFilledData: Partial<PolizaFormData> = {};
      const { datosVelneo } = extractedData;

      // APLICAR DATOS DEL WIZARD PRIMERO
      const wizardData = getWizardDataForForm();
      Object.assign(autoFilledData, wizardData);
      Object.keys(wizardData).forEach(key => filledFields.add(key));

      console.log('📋 Mapeando desde datosVelneo:', datosVelneo);

      // DATOS BÁSICOS DEL ASEGURADO
      if (datosVelneo.datosBasicos) {
        const { datosBasicos } = datosVelneo;
        
        if (datosBasicos.asegurado) {
          autoFilledData.asegurado = datosBasicos.asegurado;
          autoFilledData.nombreAsegurado = datosBasicos.asegurado;
          filledFields.add('asegurado');
          filledFields.add('nombreAsegurado');
        }
        
        if (datosBasicos.documento) {
          autoFilledData.documento = datosBasicos.documento;
          filledFields.add('documento');
        }
        
        if (datosBasicos.telefono) {
          autoFilledData.telefono = datosBasicos.telefono;
          filledFields.add('telefono');
        }
        
        if (datosBasicos.email) {
          autoFilledData.email = datosBasicos.email;
          filledFields.add('email');
        }
        
        if (datosBasicos.domicilio) {
          autoFilledData.direccion = datosBasicos.domicilio;
          filledFields.add('direccion');
        }
        
        if (datosBasicos.departamento) {
          autoFilledData.departamento = datosBasicos.departamento;
          filledFields.add('departamento');
        }
        
        if (datosBasicos.localidad) {
          autoFilledData.localidad = datosBasicos.localidad;
          filledFields.add('localidad');
        }
        
        if (datosBasicos.codigoPostal) {
          autoFilledData.codigoPostal = datosBasicos.codigoPostal;
          filledFields.add('codigoPostal');
        }
        
        if (datosBasicos.corredor) {
          autoFilledData.corredor = datosBasicos.corredor;
          filledFields.add('corredor');
        }
        
        if (datosBasicos.tipo) {
          autoFilledData.tipo = datosBasicos.tipo;
          filledFields.add('tipo');
        }
        
        if (datosBasicos.tramite) {
          autoFilledData.tramite = datosBasicos.tramite;
          filledFields.add('tramite');
        }
      }

      // DATOS DE LA PÓLIZA
      if (datosVelneo.datosPoliza) {
        const { datosPoliza } = datosVelneo;
        
        if (datosPoliza.numeroPoliza) {
          autoFilledData.numeroPoliza = datosPoliza.numeroPoliza;
          filledFields.add('numeroPoliza');
        }
        
        if (datosPoliza.desde) {
          autoFilledData.vigenciaDesde = formatDateToUruguayan(datosPoliza.desde);
          filledFields.add('vigenciaDesde');
        }
        
        if (datosPoliza.hasta) {
          autoFilledData.vigenciaHasta = formatDateToUruguayan(datosPoliza.hasta);
          filledFields.add('vigenciaHasta');
        }
        
        if (datosPoliza.ramo) {
          autoFilledData.ramo = datosPoliza.ramo;
          filledFields.add('ramo');
        }
        
        if (datosPoliza.certificado) {
          autoFilledData.certificado = datosPoliza.certificado;
          filledFields.add('certificado');
        }
        
        if (datosPoliza.endoso) {
          autoFilledData.endoso = datosPoliza.endoso;
          filledFields.add('endoso');
        }
        
        if (datosPoliza.tipoMovimiento) {
          autoFilledData.tipoMovimiento = datosPoliza.tipoMovimiento;
          filledFields.add('tipoMovimiento');
        }
        
        if (datosPoliza.compania) {
          autoFilledData.compania = datosPoliza.compania;
          filledFields.add('compania');
        }
      }

      // DATOS DE COBERTURA
      if (datosVelneo.datosCobertura) {
        const { datosCobertura } = datosVelneo;
        
        if (datosCobertura.cobertura) {
          autoFilledData.cobertura = datosCobertura.cobertura;
          filledFields.add('cobertura');
        }
        
        if (datosCobertura.moneda) {
          autoFilledData.moneda = datosCobertura.moneda;
          filledFields.add('moneda');
        }
        
        if (datosCobertura.zonaCirculacion) {
          autoFilledData.zonaCirculacion = datosCobertura.zonaCirculacion;
          filledFields.add('zonaCirculacion');
        }
        
        if (datosCobertura.codigoMoneda) {
          autoFilledData.codigoMoneda = datosCobertura.codigoMoneda.toString();
          filledFields.add('codigoMoneda');
        }
      }

      // DATOS DEL VEHÍCULO
      if (datosVelneo.datosVehiculo) {
        const { datosVehiculo } = datosVelneo;
        
        if (datosVehiculo.marca) {
          autoFilledData.marca = datosVehiculo.marca;
          filledFields.add('marca');
        }
        
        if (datosVehiculo.modelo) {
          autoFilledData.modelo = datosVehiculo.modelo;
          filledFields.add('modelo');
        }
        
        if (datosVehiculo.marcaModelo) {
          autoFilledData.vehiculo = datosVehiculo.marcaModelo;
          filledFields.add('vehiculo');
        }
        
        if (datosVehiculo.matricula) {
          autoFilledData.matricula = datosVehiculo.matricula;
          autoFilledData.chapa = datosVehiculo.matricula;
          filledFields.add('matricula');
          filledFields.add('chapa');
        }
        
        if (datosVehiculo.motor) {
          autoFilledData.motor = datosVehiculo.motor;
          filledFields.add('motor');
        }
        
        if (datosVehiculo.chasis) {
          autoFilledData.chasis = datosVehiculo.chasis;
          filledFields.add('chasis');
        }
        
        if (datosVehiculo.anio) {
          autoFilledData.anio = datosVehiculo.anio;
          filledFields.add('anio');
        }
        
        if (datosVehiculo.color) {
          autoFilledData.color = datosVehiculo.color;
          filledFields.add('color');
        }
        
        if (datosVehiculo.combustible) {
          autoFilledData.combustible = datosVehiculo.combustible;
          filledFields.add('combustible');
        }
        
        if (datosVehiculo.categoria) {
          autoFilledData.categoria = datosVehiculo.categoria;
          filledFields.add('categoria');
        }
        
        if (datosVehiculo.destino) {
          autoFilledData.destino = datosVehiculo.destino;
          filledFields.add('destino');
        }
        
        if (datosVehiculo.uso) {
          autoFilledData.uso = datosVehiculo.uso;
          filledFields.add('uso');
        }
        
        if (datosVehiculo.calidad) {
          autoFilledData.calidad = datosVehiculo.calidad;
          filledFields.add('calidad');
        }
        
        if (datosVehiculo.tipoVehiculo) {
          autoFilledData.tipoVehiculo = datosVehiculo.tipoVehiculo;
          filledFields.add('tipoVehiculo');
        }
      }

      // CONDICIONES DE PAGO
      if (datosVelneo.condicionesPago) {
        const { condicionesPago } = datosVelneo;
        
        if (condicionesPago.premio) {
          autoFilledData.prima = condicionesPago.premio.toString();
          filledFields.add('prima');
        }
        
        if (condicionesPago.total) {
          autoFilledData.premioTotal = condicionesPago.total.toString();
          filledFields.add('premioTotal');
        }
        
        if (condicionesPago.cuotas) {
          autoFilledData.cantidadCuotas = condicionesPago.cuotas.toString();
          filledFields.add('cantidadCuotas');
        }
        
        if (condicionesPago.formaPago) {
          autoFilledData.formaPago = condicionesPago.formaPago;
          filledFields.add('formaPago');
        }
        
        if (condicionesPago.valorCuota) {
          autoFilledData.valorCuota = condicionesPago.valorCuota.toString();
          filledFields.add('valorCuota');
        }
        
        if (condicionesPago.detalleCuotas) {
          const { detalleCuotas } = condicionesPago;
          
          if (detalleCuotas.primerVencimiento) {
            autoFilledData.primeraCuotaFecha = formatDateToUruguayan(detalleCuotas.primerVencimiento);
            filledFields.add('primeraCuotaFecha');
          }
          
          if (detalleCuotas.primaCuota) {
            autoFilledData.primeraCuotaMonto = detalleCuotas.primaCuota.toString();
            filledFields.add('primeraCuotaMonto');
          }
        }
      }

      // BONIFICACIONES
      if (datosVelneo.bonificaciones) {
        const { bonificaciones } = datosVelneo;
        
        if (bonificaciones.descuentos !== undefined) {
          autoFilledData.descuentos = bonificaciones.descuentos.toString();
          filledFields.add('descuentos');
        }
        
        if (bonificaciones.recargos !== undefined) {
          autoFilledData.recargos = bonificaciones.recargos.toString();
          filledFields.add('recargos');
        }
        
        if (bonificaciones.impuestoMSP !== undefined) {
          autoFilledData.impuestoMSP = bonificaciones.impuestoMSP.toString();
          filledFields.add('impuestoMSP');
        }
        
        if (bonificaciones.totalBonificaciones !== undefined) {
          autoFilledData.totalBonificaciones = bonificaciones.totalBonificaciones.toString();
          filledFields.add('totalBonificaciones');
        }
      }

      // OBSERVACIONES + DESGLOSE DE CUOTAS
      let observacionesCompletas = '';
      
      if (datosVelneo.observaciones) {
        const { observaciones } = datosVelneo;
        
        if (observaciones.observacionesGenerales) {
          observacionesCompletas += observaciones.observacionesGenerales;
        }
        
        if (observaciones.observacionesGestion) {
          autoFilledData.observacionesGestion = observaciones.observacionesGestion;
          filledFields.add('observacionesGestion');
        }
        
        if (observaciones.informacionAdicional) {
          autoFilledData.informacionAdicional = observaciones.informacionAdicional;
          filledFields.add('informacionAdicional');
        }
      }

      // AGREGAR DESGLOSE DE CUOTAS SI EXISTE
      if (datosVelneo.condicionesPago?.detalleCuotas?.cuotas?.length > 0) {
        const desgloseCuotas = generateCuotasDesglose(datosVelneo);
        observacionesCompletas += desgloseCuotas;
        
        console.log('📋 Desglose de cuotas agregado a observaciones');
      }

      if (observacionesCompletas) {
        autoFilledData.observaciones = observacionesCompletas;
        filledFields.add('observaciones');
      }

      console.log('🤖 FormStep: Datos auto-completados:', autoFilledData);
      console.log('🤖 FormStep: Campos rellenados:', Array.from(filledFields));
      console.log(`📊 Total campos auto-completados: ${filledFields.size}`);
      
      setAutoFilledFields(filledFields);
      
      const mergedData = { ...formData, ...autoFilledData } as PolizaFormData;
      onFormDataChange(mergedData);

    } catch (error) {
      console.error('❌ FormStep: Error en auto-completado:', error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  // ✅ Generar desglose de cuotas
  const generateCuotasDesglose = (datosVelneo: any): string => {
    if (!datosVelneo?.condicionesPago?.detalleCuotas?.cuotas) {
      return '';
    }

    const { detalleCuotas, formaPago, total, cuotas } = datosVelneo.condicionesPago;
    
    let desglose = '\n\n=== DESGLOSE DE CUOTAS EXTRAÍDO AUTOMÁTICAMENTE ===\n';
    desglose += `📋 Forma de Pago: ${formaPago}\n`;
    desglose += `💰 Total a Pagar: $${total.toLocaleString('es-UY')}\n`;
    desglose += `🔢 Cantidad de Cuotas: ${cuotas}\n`;
    desglose += `💳 Valor Promedio por Cuota: $${detalleCuotas.montoPromedio?.toLocaleString('es-UY') || 'N/A'}\n`;
    desglose += `📅 Primer Vencimiento: ${new Date(detalleCuotas.primerVencimiento).toLocaleDateString('es-UY')}\n\n`;
    
    desglose += '📅 CRONOGRAMA DETALLADO DE PAGOS:\n';
    desglose += ''.padEnd(50, '-') + '\n';
    
    detalleCuotas.cuotas.forEach((cuota: any, index: number) => {
      const fecha = new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY');
      const numero = cuota.numero || index + 1;
      desglose += `Cuota ${numero.toString().padStart(2, '0')}: ${fecha} - $${cuota.monto.toLocaleString('es-UY')}\n`;
    });
    
    desglose += ''.padEnd(50, '-') + '\n';
    desglose += `💡 NOTA: Este desglose fue extraído automáticamente del PDF.\n`;
    desglose += `    Solo se envía a Velneo: cantidad de cuotas (${cuotas}) y valor por cuota.\n`;
    desglose += `    Las fechas específicas se conservan aquí para referencia.\n`;

    return desglose;
  };

  // ✅ Formatear fecha a formato uruguayo
  const formatDateToUruguayan = (isoDate: string): string => {
    try {
      if (!isoDate) return '';
      
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return isoDate;
    }
  };

  // ✅ Estadísticas de auto-completado
  const getAutoFillStats = (): string => {
    const totalFields = autoFilledFields?.size || 0;
    const datosVelneo = extractedData?.datosVelneo;
    const completeness = datosVelneo?.porcentajeCompletitud || 0;
    const fieldsExtracted = datosVelneo?.metricas?.camposExtraidos || 0;
    
    if (totalFields === 0 && completeness === 0) {
      return 'Sin auto-completado disponible';
    }
    
    return `${totalFields} campos auto-completados • ${completeness}% completitud • ${fieldsExtracted} campos extraídos`;
  };

  // ✅ Re-aplicar auto-completado
  const reApplyAutoFill = () => {
    if (extractedData) {
      setAutoFilledFields(new Set());
      setHasAutoFilled(false);
      autoFillForm();
    }
  };

  // ✅ Manejar cambios en el formulario
  const handleFormChange = (field: keyof PolizaFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    onFormDataChange(updatedData);
    
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    
    validation.validateField(field, value);
    validation.markFieldTouched(field);
  };

  // ✅ Manejar envío del formulario
  const handleSubmit = () => {
    const isValid = validation.validateAll(formData);
    if (isValid) {
      onSubmit();
    } else {
      const firstErrorField = validation.validation.errors[0]?.field;
      if (firstErrorField) {
        const fieldToTab: { [key: string]: string } = {
          'numeroPoliza': 'poliza',
          'asegurado': 'basicos',
          'documento': 'basicos',
          'vigenciaDesde': 'poliza',
          'vigenciaHasta': 'poliza',
          'prima': 'condiciones',
          'marca': 'vehiculo',
          'modelo': 'vehiculo',
          'matricula': 'vehiculo'
        };
        
        const targetTab = fieldToTab[firstErrorField] || 'basicos';
        setActiveTab(targetTab);
      }
    }
  };

  // ✅ Renderizar campos de solo lectura
  const renderReadOnlyField = (label: string, value: string, subtitle?: string) => (
    <div>
      <label className={`block text-sm font-bold ${
        isDarkMode ? 'text-purple-300' : 'text-purple-800'
      } mb-2`}>
        {label}
        {subtitle && <span className="text-xs ml-2 opacity-75">{subtitle}</span>}
      </label>
      <div className={`w-full px-4 py-3 border-2 rounded-xl ${
        isDarkMode 
          ? 'bg-gray-700/50 border-purple-700/30 text-gray-300' 
          : 'bg-gray-100 border-purple-200 text-gray-700'
      } cursor-not-allowed`}>
        {value}
      </div>
    </div>
  );

  // ✅ Renderizar inputs
  const renderInput = (
    field: keyof PolizaFormData,
    label: string,
    placeholder: string,
    type: string = 'text',
    required: boolean = false,
    tabColor: string = 'blue'
  ) => {
    const error = validation.getFieldError(field);
    const hasError = validation.hasFieldError(field);
    const isAutoFilled = autoFilledFields.has(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? `text-${tabColor}-300` : `text-${tabColor}-800`
        } mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {isAutoFilled && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Auto
            </span>
          )}
        </label>
        <input
          type={type}
          value={formData[field] as string || ''}
          onChange={(e) => handleFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-${tabColor}-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? `bg-gray-700/50 border-${tabColor}-700/30 text-gray-100 focus:ring-${tabColor}-500/30` 
                : `bg-white border-${tabColor}-200 focus:ring-${tabColor}-100`
          } ${isAutoFilled ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          placeholder={placeholder}
          required={required}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error.message}
          </p>
        )}
      </div>
    );
  };

  // ✅ Renderizar selects
  const renderSelect = (
    field: keyof PolizaFormData,
    label: string,
    options: { value: string; label: string }[],
    required: boolean = false,
    tabColor: string = 'blue'
  ) => {
    const error = validation.getFieldError(field);
    const hasError = validation.hasFieldError(field);
    const isAutoFilled = autoFilledFields.has(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? `text-${tabColor}-300` : `text-${tabColor}-800`
        } mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {isAutoFilled && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Auto
            </span>
          )}
        </label>
        <select
          value={formData[field] as string || ''}
          onChange={(e) => handleFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-${tabColor}-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? `bg-gray-700/50 border-${tabColor}-700/30 text-gray-100 focus:ring-${tabColor}-500/30` 
                : `bg-white border-${tabColor}-200 focus:ring-${tabColor}-100`
          } ${isAutoFilled ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          required={required}
        >
          <option value="" disabled>Seleccionar {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error.message}
          </p>
        )}
      </div>
    );
  };

  // ✅ Renderizar contenido de cada tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basicos':
        return (
          <div className="space-y-8">
            <div className={`rounded-2xl p-6 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
                : 'bg-gradient-to-r from-blue-50 to-cyan-100'
            }`}>
              <h3 className={`text-xl font-bold flex items-center ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-6`}>
                <User className="w-6 h-6 mr-2" />
                Datos Básicos del Asegurado
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('asegurado', 'Asegurado', 'Nombre completo del asegurado', 'text', true, 'blue')}
                  {renderInput('documento', 'Documento', 'CI o RUC', 'text', true, 'blue')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect('tipo', 'Tipo', [
                    { value: 'PERSONA', label: 'Líneas personales' },
                    { value: 'EMPRESA', label: 'Líneas comerciales' }
                  ], false, 'blue')}
                </div>

                {renderInput('direccion', 'Dirección', 'Dirección completa', 'text', false, 'blue')}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('departamento', 'Departamento', 'Departamento', 'text', false, 'blue')}
                  {renderInput('localidad', 'Localidad', 'Localidad', 'text', false, 'blue')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('telefono', 'Teléfono', 'Número de teléfono', 'tel', false, 'blue')}
                  {renderInput('email', 'Email', 'Correo electrónico', 'email', false, 'blue')}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'poliza':
        return (
          <div className="space-y-8">
            <div className={`rounded-2xl p-6 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-purple-900/20 border border-purple-800/50' 
                : 'bg-gradient-to-r from-purple-50 to-pink-100'
            }`}>
              <h3 className={`text-xl font-bold flex items-center ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-6`}>
                <FileText className="w-6 h-6 mr-2" />
                Información de la Póliza
              </h3>

              <div className="space-y-6">
                {/* DATOS DEL WIZARD - SOLO LECTURA */}
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-purple-200' : 'text-purple-700'
                  } border-b pb-2`}>
                    Datos del Wizard
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderReadOnlyField('Cliente', getClienteDisplay(), '(Paso 1)')}
                    {renderReadOnlyField('Compañía', getCompaniaDisplay(), '(Paso 2)')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderReadOnlyField('Sección', getSeccionDisplay(), '(Paso 3)')}
                    {renderReadOnlyField('Tipo de Operación', getOperacionDisplay(), '(Paso 4)')}
                  </div>
                </div>

                {/* DATOS EDITABLES DE LA PÓLIZA */}
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-purple-200' : 'text-purple-700'
                  } border-b pb-2`}>
                    Datos de la Póliza
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('numeroPoliza', 'Número de Póliza', 'Número de póliza', 'text', true, 'purple')}
                    {renderInput('certificado', 'Certificado', 'Ej: Nº 1', 'text', false, 'purple')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('vigenciaDesde', 'Vigencia Desde', 'dd/mm/aaaa', 'text', true, 'purple')}
                    {renderInput('vigenciaHasta', 'Vigencia Hasta', 'dd/mm/aaaa', 'text', true, 'purple')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('cobertura', 'Cobertura', 'Tipo de cobertura', 'text', false, 'purple')}
                    {renderInput('zonaCirculacion', 'Zona de Circulación', 'Zona donde circula', 'text', false, 'purple')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelect('moneda', 'Moneda', [
                      { value: 'UYU', label: 'Pesos Uruguayos (UYU)' },
                      { value: 'USD', label: 'Dólares (USD)' },
                      { value: 'EUR', label: 'Euros (EUR)' }
                    ], false, 'purple')}
                    {renderInput('codigoMoneda', 'Código Moneda', 'Código numérico', 'text', false, 'purple')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'vehiculo':
        return (
          <div className="space-y-8">
            <div className={`rounded-2xl p-6 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-green-900/20 border border-green-800/50' 
                : 'bg-gradient-to-r from-green-50 to-emerald-100'
            }`}>
              <h3 className={`text-xl font-bold flex items-center ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              } mb-6`}>
                <Car className="w-6 h-6 mr-2" />
                Datos del Vehículo
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('marca', 'Marca', 'Marca del vehículo', 'text', false, 'green')}
                  {renderInput('modelo', 'Modelo', 'Modelo del vehículo', 'text', false, 'green')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('matricula', 'Matrícula', 'Matrícula', 'text', false, 'green')}
                  {renderInput('anio', 'Año', '2024', 'text', false, 'green')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('motor', 'Motor', 'Número de motor', 'text', false, 'green')}
                  {renderInput('chasis', 'Chasis', 'Número de chasis', 'text', false, 'green')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect('tipoVehiculo', 'Tipo de Vehículo', [
                    { value: 'SEDAN', label: 'Sedán' },
                    { value: 'HATCHBACK', label: 'Hatchback' },
                    { value: 'SUV', label: 'SUV' },
                    { value: 'PICKUP', label: 'Pickup' },
                    { value: 'COUPE', label: 'Coupé' },
                    { value: 'CONVERTIBLE', label: 'Convertible' },
                    { value: 'WAGON', label: 'Rural' },
                    { value: 'VAN', label: 'Van' },
                    { value: 'MOTOCICLETA', label: 'Motocicleta' }
                  ], false, 'green')}

                  {renderSelect('uso', 'Uso', [
                    { value: 'FAMILIAR', label: 'Familiar' },
                    { value: 'TRABAJO', label: 'Trabajo' },
                    { value: 'COMERCIAL', label: 'Comercial' },
                    { value: 'PROFESIONAL', label: 'Profesional' },
                    { value: 'DEPORTIVO', label: 'Deportivo' }
                  ], false, 'green')}
                </div>
              </div>
            </div>
          </div>
        );

      case 'condiciones':
        return (
          <div className="space-y-8">
            <div className={`rounded-2xl p-6 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-orange-900/20 border border-orange-800/50' 
                : 'bg-gradient-to-r from-orange-50 to-yellow-100'
            }`}>
              <h3 className={`text-xl font-bold flex items-center ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
              } mb-6`}>
                <CreditCard className="w-6 h-6 mr-2" />
                Condiciones de Pago
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('prima', 'Prima', '0.00', 'text', true, 'orange')}
                  {renderInput('premioTotal', 'Premio Total', '0.00', 'text', false, 'orange')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect('formaPago', 'Forma de Pago', [
                    { value: 'CONTADO', label: 'Contado' },
                    { value: 'TARJETA DE CRÉDITO', label: 'Tarjeta de Crédito' },
                    { value: 'DÉBITO AUTOMÁTICO', label: 'Débito Automático' },
                    { value: 'FINANCIADO', label: 'Financiado' },
                    { value: 'TRANSFERENCIA', label: 'Transferencia' }
                  ], false, 'orange')}

                  {renderInput('cantidadCuotas', 'Cantidad de Cuotas', 'Ej: 1, 3, 6, 12', 'text', false, 'orange')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('valorCuota', 'Valor por Cuota', '0.00', 'text', false, 'orange')}
                  {renderInput('primeraCuotaFecha', 'Fecha Primera Cuota', 'dd/mm/aaaa', 'text', false, 'orange')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('primeraCuotaMonto', 'Monto Primera Cuota', '0.00', 'text', false, 'orange')}
                </div>

                {formData.cantidadCuotas && formData.cantidadCuotas > 1 && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-blue-900/20 border-blue-800 text-blue-300' 
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Información de Cuotas</span>
                    </div>
                    <p className="text-sm">
                      Se detectaron {formData.cantidadCuotas} cuotas. El desglose completo con fechas se incluirá automáticamente en las observaciones.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'observaciones':
        return (
          <div className="space-y-8">
            <div className={`rounded-2xl p-6 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-indigo-900/20 border border-indigo-800/50' 
                : 'bg-gradient-to-r from-indigo-50 to-blue-100'
            }`}>
              <h3 className={`text-xl font-bold flex items-center ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-800'
              } mb-6`}>
                <FileCheck className="w-6 h-6 mr-2" />
                Observaciones y Notas
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold ${
                    isDarkMode ? 'text-indigo-300' : 'text-indigo-800'
                  } mb-2`}>
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones || ''}
                    onChange={(e) => handleFormChange('observaciones', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-indigo-500 transition-all duration-200 shadow-sm ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-indigo-700/30 text-gray-100 focus:ring-indigo-500/30' 
                        : 'bg-white border-indigo-200 focus:ring-indigo-100'
                    }`}
                    placeholder="Observaciones adicionales sobre la póliza..."
                    rows={8}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Selecciona una pestaña para ver el contenido</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-emerald-500 to-blue-600">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Formulario de Póliza
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Revisa y completa los datos extraídos automáticamente
          </p>
        </div>

        {/* Header con indicadores de auto-completado */}
        {(isAutoFilling || autoFilledFields.size > 0) && (
          <div className={`mb-6 p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isAutoFilling ? (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-600" />
                )}
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                    {isAutoFilling ? 'Auto-completando formulario...' : 'Formulario auto-completado'}
                  </h3>
                  {!isAutoFilling && (
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      {getAutoFillStats()}
                    </p>
                  )}
                </div>
              </div>
              
              {!isAutoFilling && extractedData && (
                <button
                  onClick={reApplyAutoFill}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4 mr-1 inline" />
                  Re-aplicar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Card principal */}
        <div className={`rounded-3xl shadow-xl border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          
          {/* Navegación de tabs */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-8 px-8 pt-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const hasErrors = validation.validation.errors.some(error => {
                  const fieldToTab: { [key: string]: string } = {
                    'numeroPoliza': 'poliza',
                    'asegurado': 'basicos',
                    'documento': 'basicos',
                    'vigenciaDesde': 'poliza',
                    'vigenciaHasta': 'poliza',
                    'prima': 'condiciones',
                    'marca': 'vehiculo',
                    'modelo': 'vehiculo',
                    'matricula': 'vehiculo'
                  };
                  return fieldToTab[error.field] === tab.id;
                });

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {hasErrors && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen de validación */}
          {validation.validation.errors.length > 0 && (
            <div className="p-4 mx-8 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    {validation.validation.errors.length} error{validation.validation.errors.length !== 1 ? 'es' : ''} encontrado{validation.validation.errors.length !== 1 ? 's' : ''}
                  </p>
                  <ul className="text-red-700 dark:text-red-300 text-sm mt-1 space-y-1">
                    {validation.validation.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error.message}</li>
                    ))}
                    {validation.validation.errors.length > 3 && (
                      <li>• Y {validation.validation.errors.length - 3} error{validation.validation.errors.length - 3 !== 1 ? 'es' : ''} más...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contenido del tab actual */}
          <div className="p-8">
            {renderTabContent()}
          </div>

          {/* Botones de navegación */}
          <div className={`flex justify-between items-center p-8 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onBack}
              className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Volver a procesamiento
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
                saving
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 hover:shadow-xl'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ENVIANDO...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  CREAR PÓLIZA
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep;