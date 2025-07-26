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
  DollarSign,
  Hash,
  Building,
  Shield,
  Clock,
  Percent,
  Check,
  Send,
  Info,
  ChevronDown,
  ChevronUp,
  Eye
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
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  // ✅ Tipar correctamente las secciones expandibles
  type ExpandedSectionKey = 'cuotas' | 'observaciones' | 'metricas';
  
  const [expandedSections, setExpandedSections] = useState<Record<ExpandedSectionKey, boolean>>({
    cuotas: false,
    observaciones: false,
    metricas: true
  });

  const tabs = [
    { id: 'basicos', label: 'Datos Básicos', icon: User, color: 'blue' },
    { id: 'poliza', label: 'Póliza', icon: FileText, color: 'purple' },
    { id: 'vehiculo', label: 'Vehículo', icon: Car, color: 'green' },
    { id: 'condiciones', label: 'Condiciones Pago', icon: CreditCard, color: 'orange' },
    { id: 'resumen', label: 'Resumen y Envío', icon: CheckCircle, color: 'emerald' }
  ];

  // Auto-completado desde datos extraídos
  useEffect(() => {
    if (extractedData && 
        extractedData.datosVelneo && 
        !hasAutoFilled) {   
      
      console.log('🤖 FormStep: Auto-completando formulario con datos extraídos...', extractedData.datosVelneo);
      autoFillFromExtractedData();
    }
  }, [extractedData]);

  const autoFillFromExtractedData = () => {
    if (!extractedData?.datosVelneo) {
      console.log('❌ No hay datos extraídos para auto-completar');
      return;
    }

    console.log('📊 Datos extraídos disponibles:', extractedData.datosVelneo);
    console.log('📊 FormData actual antes del mapeo:', formData);
    
    setIsAutoFilling(true);
    const datos = extractedData.datosVelneo;
    
    // Crear el objeto completo con valores por defecto
    const newFormData: PolizaFormData = {
      // Mantener datos existentes como base
      ...formData,
      
      // Datos básicos del asegurado
      asegurado: datos.datosBasicos?.asegurado || formData.asegurado || '',
      documento: datos.datosBasicos?.documento || formData.documento || '',
      tipo: datos.datosBasicos?.tipo || formData.tipo || '',
      email: datos.datosBasicos?.email || formData.email || '',
      telefono: datos.datosBasicos?.telefono || formData.telefono || '',
      direccion: datos.datosBasicos?.domicilio || formData.direccion || '',
      localidad: datos.datosBasicos?.localidad || formData.localidad || '',
      departamento: datos.datosBasicos?.departamento || formData.departamento || '',
      codigoPostal: datos.datosBasicos?.codigoPostal || formData.codigoPostal || '',
      corredor: datos.datosBasicos?.corredor || formData.corredor || '',
      tramite: datos.datosBasicos?.tramite || formData.tramite || '',
      
      // Datos de la póliza
      numeroPoliza: datos.datosPoliza?.numeroPoliza || formData.numeroPoliza || '',
      certificado: datos.datosPoliza?.certificado || formData.certificado || '',
      ramo: datos.datosPoliza?.ramo || formData.ramo || '',
      vigenciaDesde: datos.datosPoliza?.desde ? datos.datosPoliza.desde.split('T')[0] : formData.vigenciaDesde || '',
      vigenciaHasta: datos.datosPoliza?.hasta ? datos.datosPoliza.hasta.split('T')[0] : formData.vigenciaHasta || '',
      
      // Datos de cobertura
      cobertura: datos.datosCobertura?.cobertura || formData.cobertura || '',
      moneda: datos.datosCobertura?.moneda || formData.moneda || '',
      
      // Datos del vehículo
      marca: datos.datosVehiculo?.marca || formData.marca || '',
      modelo: datos.datosVehiculo?.modelo || formData.modelo || '',
      anio: datos.datosVehiculo?.anio || formData.anio || '',
      chasis: datos.datosVehiculo?.chasis || formData.chasis || '',
      categoria: datos.datosVehiculo?.categoria || formData.categoria || '',
      combustible: datos.datosVehiculo?.combustible || formData.combustible || '',
      destino: datos.datosVehiculo?.destino || formData.destino || '',
      uso: datos.datosVehiculo?.uso || formData.uso || '',
      matricula: datos.datosVehiculo?.matricula || formData.matricula || '',
      vehiculo: datos.datosVehiculo?.marcaModelo || formData.vehiculo || '',
      
      // Condiciones de pago
      formaPago: datos.condicionesPago?.formaPago || formData.formaPago || '',
      prima: datos.condicionesPago?.premio?.toString() || formData.prima || '',
      premioTotal: datos.condicionesPago?.total?.toString() || formData.premioTotal || '',
      cantidadCuotas: datos.condicionesPago?.cuotas || formData.cantidadCuotas || 0,
      valorCuota: datos.condicionesPago?.valorCuota?.toString() || formData.valorCuota || '',
      
      // Campos requeridos por PolizaFormData pero no en los datos extraídos
      compania: formData.compania || 0,
      nombreCompania: formData.nombreCompania || '',
      seccionId: formData.seccionId || 0,
      clienteId: formData.clienteId || 0,
      observaciones: formData.observaciones || '',
      motor: formData.motor || '',
      primaComercial: formData.primaComercial || '',
      primeraCuotaFecha: formData.primeraCuotaFecha || '',
      primeraCuotaMonto: formData.primeraCuotaMonto || '',
      plan: formData.plan || '',
      estadoPoliza: formData.estadoPoliza || '',
      calidad: formData.calidad || '',
      tipoVehiculo: formData.tipoVehiculo || '',
      combustibleId: formData.combustibleId || null,
      categoriaId: formData.categoriaId || null,
      destinoId: formData.destinoId || null,
      calidadId: formData.calidadId || null,
      operacion: formData.operacion || null,
      seccion: formData.seccion || '',
      nombreAsegurado: formData.nombreAsegurado || '',
      chapa: formData.chapa || '',
      color: formData.color || '',
      impuestoMSP: formData.impuestoMSP || '',
      descuentos: formData.descuentos || '',
      recargos: formData.recargos || '',
      tramiteVelneo: formData.tramiteVelneo || undefined,
      estadoPolizaVelneo: formData.estadoPolizaVelneo || undefined,
      formaPagoVelneo: formData.formaPagoVelneo || undefined,
      monedaVelneo: formData.monedaVelneo || undefined
    };

    console.log('✅ FormData después del mapeo:', newFormData);
    
    // Identificar campos que fueron auto-completados
    const fieldsSet = new Set<string>();
    if (datos.datosBasicos?.asegurado) fieldsSet.add('asegurado');
    if (datos.datosBasicos?.documento) fieldsSet.add('documento');
    if (datos.datosBasicos?.tipo) fieldsSet.add('tipo');
    if (datos.datosBasicos?.email) fieldsSet.add('email');
    if (datos.datosBasicos?.telefono) fieldsSet.add('telefono');
    if (datos.datosBasicos?.domicilio) fieldsSet.add('direccion');
    if (datos.datosBasicos?.localidad) fieldsSet.add('localidad');
    if (datos.datosBasicos?.departamento) fieldsSet.add('departamento');
    if (datos.datosBasicos?.codigoPostal) fieldsSet.add('codigoPostal');
    if (datos.datosBasicos?.corredor) fieldsSet.add('corredor');
    if (datos.datosBasicos?.tramite) fieldsSet.add('tramite');
    
    if (datos.datosPoliza?.numeroPoliza) fieldsSet.add('numeroPoliza');
    if (datos.datosPoliza?.certificado) fieldsSet.add('certificado');
    if (datos.datosPoliza?.ramo) fieldsSet.add('ramo');
    if (datos.datosPoliza?.desde) fieldsSet.add('vigenciaDesde');
    if (datos.datosPoliza?.hasta) fieldsSet.add('vigenciaHasta');
    
    if (datos.datosCobertura?.cobertura) fieldsSet.add('cobertura');
    if (datos.datosCobertura?.moneda) fieldsSet.add('moneda');
    
    if (datos.datosVehiculo?.marca) fieldsSet.add('marca');
    if (datos.datosVehiculo?.modelo) fieldsSet.add('modelo');
    if (datos.datosVehiculo?.anio) fieldsSet.add('anio');
    if (datos.datosVehiculo?.chasis) fieldsSet.add('chasis');
    if (datos.datosVehiculo?.categoria) fieldsSet.add('categoria');
    if (datos.datosVehiculo?.combustible) fieldsSet.add('combustible');
    if (datos.datosVehiculo?.destino) fieldsSet.add('destino');
    if (datos.datosVehiculo?.uso) fieldsSet.add('uso');
    if (datos.datosVehiculo?.matricula) fieldsSet.add('matricula');
    if (datos.datosVehiculo?.marcaModelo) fieldsSet.add('vehiculo');
    
    if (datos.condicionesPago?.formaPago) fieldsSet.add('formaPago');
    if (datos.condicionesPago?.premio) fieldsSet.add('prima');
    if (datos.condicionesPago?.total) fieldsSet.add('premioTotal');
    if (datos.condicionesPago?.cuotas) fieldsSet.add('cantidadCuotas');
    if (datos.condicionesPago?.valorCuota) fieldsSet.add('valorCuota');

    console.log('🎯 Campos auto-completados:', Array.from(fieldsSet));

    setAutoFilledFields(fieldsSet);
    onFormDataChange(newFormData);
    setHasAutoFilled(true);
    setIsAutoFilling(false);

    console.log('✅ Auto-completado exitoso:', fieldsSet.size, 'campos completados');
  };

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    onFormDataChange(newFormData);
    
    // Remover de campos auto-completados si el usuario edita
    if (autoFilledFields.has(field)) {
      const newAutoFilled = new Set(autoFilledFields);
      newAutoFilled.delete(field);
      setAutoFilledFields(newAutoFilled);
    }
  };

  const toggleSection = (section: ExpandedSectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = () => {
    console.log('📝 Enviando póliza:', formData);
    onSubmit();
  };

  // Componentes helper
  const InputField = ({ 
    label, 
    field, 
    type = 'text', 
    icon: Icon, 
    readOnly = false, 
    required = false,
    className = ''
  }: {
    label: string;
    field: string;
    type?: string;
    icon?: React.ElementType;
    readOnly?: boolean;
    required?: boolean;
    className?: string;
  }) => {
    const isAutoFilled = autoFilledFields.has(field);
    const value = formData[field as keyof PolizaFormData] || '';

    return (
      <div className={`space-y-2 ${className}`}>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
          {isAutoFilled && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Auto
            </span>
          )}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            readOnly={readOnly}
            className={`w-full px-3 py-2 ${Icon ? 'pl-10' : ''} border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
              ${isDarkMode 
                ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }
              ${readOnly ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}
              ${isAutoFilled ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
            `}
            placeholder={`Ingrese ${label.toLowerCase()}`}
          />
        </div>
      </div>
    );
  };

  const SelectField = ({ 
    label, 
    field, 
    options, 
    icon: Icon, 
    required = false 
  }: {
    label: string;
    field: string;
    options: Array<{ value: string; label: string }>;
    icon?: React.ElementType;
    required?: boolean;
  }) => {
    const isAutoFilled = autoFilledFields.has(field);
    const value = formData[field as keyof PolizaFormData] || '';

    return (
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
          {isAutoFilled && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Auto
            </span>
          )}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 ${Icon ? 'pl-10' : ''} border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isDarkMode 
                ? 'border-gray-600 bg-gray-800 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
              }
              ${isAutoFilled ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
            `}
          >
            <option value="">Seleccione {label.toLowerCase()}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
  }) => (
    <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-800/20 
      border border-${color}-200 dark:border-${color}-700 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium text-${color}-600 dark:text-${color}-400`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}-900 dark:text-${color}-100`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  // Helpers para mostrar datos del wizard
  const getClienteDisplay = () => {
    if (wizardState.selectedCliente) {
      return getClienteDisplayName(wizardState.selectedCliente);
    }
    return 'No seleccionado';
  };

  const getCompaniaDisplay = () => {
    if (wizardState.selectedCompany) {
      return getCompanyDisplayName(wizardState.selectedCompany);
    }
    return 'No seleccionado';
  };

  const getSeccionDisplay = () => {
    if (wizardState.selectedSeccion) {
      return getSeccionDisplayName(wizardState.selectedSeccion);
    }
    return 'No seleccionado';
  };

  const getOperacionDisplay = () => {
    if (wizardState.selectedOperacion) {
      return getOperacionDisplayName(wizardState.selectedOperacion);
    }
    return 'No seleccionado';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basicos':
        return (
          <div className="space-y-6">
            {/* Datos del Wizard - Solo Lectura */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 
              border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6 flex items-center`}>
                <Eye className="w-6 h-6 mr-3" />
                Datos del Wizard (Solo Lectura)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente:</span>
                  <p className="text-base font-semibold">{getClienteDisplay()}</p>
                </div>
                <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Compañía:</span>
                  <p className="text-base font-semibold">{getCompaniaDisplay()}</p>
                </div>
                <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sección:</span>
                  <p className="text-base font-semibold">{getSeccionDisplay()}</p>
                </div>
                <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Operación:</span>
                  <p className="text-base font-semibold">{getOperacionDisplay()}</p>
                </div>
              </div>
            </div>

            {/* Información del Asegurado */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 
              border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'} mb-6 flex items-center`}>
                <User className="w-6 h-6 mr-3" />
                Información del Asegurado
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField label="Asegurado" field="asegurado" icon={User} required />
                <InputField label="Documento" field="documento" icon={Hash} required />
                <SelectField
                  label="Tipo"
                  field="tipo"
                  options={[
                    { value: 'EMPRESA', label: 'Empresa' },
                    { value: 'PERSONA', label: 'Persona Física' }
                  ]}
                  icon={Building}
                  required
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 
              border border-green-200 dark:border-green-700 rounded-lg p-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-green-100' : 'text-green-900'} mb-6 flex items-center`}>
                <MapPin className="w-6 h-6 mr-3" />
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField label="Email" field="email" type="email" icon={Mail} />
                <InputField label="Teléfono" field="telefono" icon={Phone} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <InputField label="Domicilio" field="direccion" icon={MapPin} />
                </div>
                <InputField label="Código Postal" field="codigoPostal" icon={Hash} />
                <InputField label="Localidad" field="localidad" icon={MapPin} />
                <InputField label="Departamento" field="departamento" icon={MapPin} />
                <InputField label="Corredor" field="corredor" icon={User} />
              </div>
            </div>
          </div>
        );

      case 'poliza':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 
              border border-purple-200 dark:border-purple-700 rounded-lg p-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-purple-100' : 'text-purple-900'} mb-6 flex items-center`}>
                <FileText className="w-6 h-6 mr-3" />
                Datos de la Póliza
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField label="Número de Póliza" field="numeroPoliza" icon={Hash} required />
                <InputField label="Certificado" field="certificado" icon={FileText} />
                <SelectField
                  label="Ramo"
                  field="ramo"
                  options={[
                    { value: 'AUTOMOVILES', label: 'Automóviles' },
                    { value: 'VIDA', label: 'Vida' },
                    { value: 'HOGAR', label: 'Hogar' }
                  ]}
                  icon={Shield}
                  required
                />
                <InputField label="Cobertura" field="cobertura" icon={Shield} required />
                <SelectField
                  label="Trámite"
                  field="tramite"
                  options={[
                    { value: 'Nuevo', label: 'Nuevo' },
                    { value: 'Renovación', label: 'Renovación' },
                    { value: 'Endoso', label: 'Endoso' }
                  ]}
                  icon={FileText}
                  required
                />
                <InputField label="Zona de Circulación" field="zonaCirculacion" icon={MapPin} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputField label="Vigencia Desde" field="vigenciaDesde" type="date" icon={Calendar} required />
                <InputField label="Vigencia Hasta" field="vigenciaHasta" type="date" icon={Calendar} required />
              </div>
            </div>
          </div>
        );

      case 'vehiculo':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 
              border border-orange-200 dark:border-orange-700 rounded-lg p-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-orange-100' : 'text-orange-900'} mb-6 flex items-center`}>
                <Car className="w-6 h-6 mr-3" />
                Información del Vehículo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField label="Marca" field="marca" icon={Car} required />
                <InputField label="Modelo" field="modelo" icon={Car} required />
                <InputField label="Año" field="anio" type="number" icon={Calendar} required />
                <InputField label="Chasis" field="chasis" icon={Hash} />
                <InputField label="Matrícula" field="matricula" icon={Hash} />
                <SelectField
                  label="Categoría"
                  field="categoria"
                  options={[
                    { value: 'AUTOMOVIL', label: 'Automóvil' },
                    { value: 'CAMIONETA', label: 'Camioneta' },
                    { value: 'MOTOCICLETA', label: 'Motocicleta' }
                  ]}
                  icon={Car}
                />
                <SelectField
                  label="Combustible"
                  field="combustible"
                  options={[
                    { value: 'DIESEL (GAS-OIL)', label: 'Diesel (Gas-Oil)' },
                    { value: 'NAFTA', label: 'Nafta' },
                    { value: 'ELECTRICO', label: 'Eléctrico' }
                  ]}
                  icon={Car}
                />
                <SelectField
                  label="Destino"
                  field="destino"
                  options={[
                    { value: 'COMERCIAL', label: 'Comercial' },
                    { value: 'PARTICULAR', label: 'Particular' },
                    { value: 'TAXI', label: 'Taxi' }
                  ]}
                  icon={Car}
                />
                <SelectField
                  label="Uso"
                  field="uso"
                  options={[
                    { value: 'COMERCIAL', label: 'Comercial' },
                    { value: 'PARTICULAR', label: 'Particular' },
                    { value: 'MIXTO', label: 'Mixto' }
                  ]}
                  icon={Car}
                />
              </div>
            </div>
          </div>
        );

      case 'condiciones':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 
              border border-emerald-200 dark:border-emerald-700 rounded-lg p-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-emerald-100' : 'text-emerald-900'} mb-6 flex items-center`}>
                <CreditCard className="w-6 h-6 mr-3" />
                Condiciones de Pago
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SelectField
                  label="Forma de Pago"
                  field="formaPago"
                  options={[
                    { value: 'TARJETA DE CRÉDITO', label: 'Tarjeta de Crédito' },
                    { value: 'DÉBITO AUTOMÁTICO', label: 'Débito Automático' },
                    { value: 'EFECTIVO', label: 'Efectivo' }
                  ]}
                  icon={CreditCard}
                  required
                />
                <SelectField
                  label="Moneda"
                  field="moneda"
                  options={[
                    { value: 'UYU', label: 'Pesos Uruguayos (UYU)' },
                    { value: 'USD', label: 'Dólares (USD)' }
                  ]}
                  icon={DollarSign}
                  required
                />
                <InputField label="Cantidad de Cuotas" field="cantidadCuotas" type="number" icon={Hash} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <InputField label="Prima" field="prima" type="number" icon={DollarSign} />
                <InputField label="Premio Total" field="premioTotal" type="number" icon={DollarSign} />
                <InputField label="Valor por Cuota" field="valorCuota" type="number" icon={DollarSign} />
              </div>
            </div>

            {/* Cronograma de Cuotas */}
            {extractedData?.datosVelneo?.condicionesPago?.detalleCuotas && (
              <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => toggleSection('cuotas')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}>
                    <Calendar className="w-5 h-5 mr-2" />
                    Cronograma de Cuotas ({extractedData.datosVelneo.condicionesPago.detalleCuotas.cuotas?.length || 0} cuotas)
                  </h3>
                  {expandedSections.cuotas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.cuotas && extractedData.datosVelneo.condicionesPago.detalleCuotas.cuotas && (
                  <div className="mt-4 overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Cuota
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Fecha
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                        {extractedData.datosVelneo.condicionesPago.detalleCuotas.cuotas.map((cuota: any, index: number) => (
                          <tr key={index}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              #{cuota.numero || (index + 1)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {cuota.fecha}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              ${cuota.monto?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'resumen':
        return (
          <div className="space-y-6">
            {/* Métricas del Procesamiento */}
            {extractedData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Completitud"
                  value={`${extractedData.porcentajeCompletitud || 0}%`}
                  icon={Percent}
                  color="green"
                />
                <MetricCard
                  title="Campos Extraídos"
                  value={extractedData.datosVelneo?.metricas?.camposExtraidos || 0}
                  icon={Hash}
                  color="blue"
                />
                <MetricCard
                  title="Tiempo Procesamiento"
                  value={`${((extractedData.tiempoProcesamiento || 0) / 1000).toFixed(1)}s`}
                  icon={Clock}
                  color="purple"
                />
                <MetricCard
                  title="Estado"
                  value={extractedData.listoParaVelneo ? 'Listo' : 'Pendiente'}
                  icon={extractedData.listoParaVelneo ? Check : AlertTriangle}
                  color={extractedData.listoParaVelneo ? 'green' : 'yellow'}
                />
              </div>
            )}

            {/* Estado del Procesamiento */}
            {extractedData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 
                border border-green-200 dark:border-green-700 rounded-lg p-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-green-100' : 'text-green-900'} mb-4 flex items-center`}>
                  <Check className="w-6 h-6 mr-3" />
                  Estado del Procesamiento
                </h3>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {extractedData.estado?.replace(/_/g, ' ') || 'Procesado'}
                    </span>
                  </div>
                  {extractedData.timestamp && (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Procesado el {new Date(extractedData.timestamp).toLocaleString('es-UY')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observaciones */}
            {extractedData?.datosVelneo?.observaciones?.notasEscaneado && (
              <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => toggleSection('observaciones')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}>
                    <Info className="w-5 h-5 mr-2" />
                    Observaciones del Procesamiento
                  </h3>
                  {expandedSections.observaciones ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.observaciones && (
                  <div className="mt-4 space-y-2">
                    {extractedData.datosVelneo.observaciones.notasEscaneado.map((nota: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{nota}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Formulario de Póliza
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {extractedData?.archivo && `Archivo: ${extractedData.archivo} • `}
                Revisa y completa los datos extraídos automáticamente
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Botón para forzar auto-completado - SIEMPRE VISIBLE PARA DEBUG */}
              {extractedData && (
                <button
                  onClick={() => {
                    console.log('🔄 Forzando auto-completado...');
                    setHasAutoFilled(false);
                    autoFillFromExtractedData();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-completar</span>
                </button>
              )}
              
              {extractedData?.procesamientoExitoso && (
                <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Procesamiento Exitoso</span>
                  </div>
                </div>
              )}
              {extractedData?.porcentajeCompletitud && (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                  {extractedData.porcentajeCompletitud}% Completo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Validation Errors */}
        {validation.validation.errors.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-red-800 dark:text-red-300 font-medium">
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
          </div>
        )}

        {/* Tab Content */}
        <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {renderTabContent()}
        </div>

        {/* Navigation Buttons */}
        <div className={`flex justify-between items-center mt-8 p-6 rounded-lg ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
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
                <Send className="w-5 h-5 mr-2" />
                CREAR PÓLIZA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormStep;