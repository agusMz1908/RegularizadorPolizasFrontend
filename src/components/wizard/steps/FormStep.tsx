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
  AlertTriangle
} from 'lucide-react';
import { PolizaFormData } from '../../../types/core/poliza';
import { DocumentProcessResult } from '../../../types/ui/wizard';
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
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState('basicos');
  
  // ✅ Estados para auto-completado
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'basicos', label: 'Datos Básicos', icon: User, color: 'blue' },
    { id: 'poliza', label: 'Póliza', icon: FileText, color: 'purple' },
    { id: 'vehiculo', label: 'Vehículo', icon: Car, color: 'green' },
    { id: 'pago', label: 'Condiciones Pago', icon: CreditCard, color: 'orange' },
    { id: 'observaciones', label: 'Observaciones', icon: FileCheck, color: 'indigo' }
  ];

  // ✅ Auto-completado automático al recibir extractedData
  useEffect(() => {
    if (extractedData && Object.keys(formData).length === 0) {
      console.log('🤖 FormStep: Auto-completando formulario con datos extraídos...');
      autoFillForm();
    }
  }, [extractedData, formData]);

  /**
   * ✅ Función de auto-completado
   */
  const autoFillForm = async () => {
    if (!extractedData) return;

    setIsAutoFilling(true);
    const filledFields = new Set<string>();

    try {
      const autoFilledData: Partial<PolizaFormData> = {};

      // ✅ Mapear desde extractedFields (array)
      if (extractedData.extractedFields && Array.isArray(extractedData.extractedFields)) {
        extractedData.extractedFields.forEach((field: any) => {
          const fieldName = field.field || field.name;
          const fieldValue = field.value;
          
          switch (fieldName?.toLowerCase()) {
            case 'asegurado':
            case 'nombre':
            case 'client_name':
              autoFilledData.asegurado = fieldValue;
              autoFilledData.nombreAsegurado = fieldValue;
              filledFields.add('asegurado');
              filledFields.add('nombreAsegurado');
              break;
              
            case 'documento':
            case 'ci':
            case 'cedula':
            case 'document_number':
              autoFilledData.documento = fieldValue;
              filledFields.add('documento');
              break;
              
            case 'email':
            case 'correo':
            case 'mail':
              autoFilledData.email = fieldValue;
              filledFields.add('email');
              break;
              
            case 'telefono':
            case 'phone':
            case 'celular':
              autoFilledData.telefono = fieldValue;
              filledFields.add('telefono');
              break;
              
            case 'direccion':
            case 'domicilio':
            case 'address':
              autoFilledData.direccion = fieldValue;
              filledFields.add('direccion');
              break;
              
            case 'numero_poliza':
            case 'numeroPoliza':
            case 'policy_number':
            case 'poliza':
              autoFilledData.numeroPoliza = fieldValue;
              filledFields.add('numeroPoliza');
              break;
              
            case 'vigencia_desde':
            case 'desde':
            case 'fecha_desde':
            case 'start_date':
              autoFilledData.vigenciaDesde = fieldValue;
              filledFields.add('vigenciaDesde');
              break;
              
            case 'vigencia_hasta':
            case 'hasta':
            case 'fecha_hasta':
            case 'end_date':
              autoFilledData.vigenciaHasta = fieldValue;
              filledFields.add('vigenciaHasta');
              break;
              
            case 'prima':
            case 'premio':
            case 'amount':
            case 'total':
              const primaValue = typeof fieldValue === 'string' ? parseFloat(fieldValue) : fieldValue;
              if (!isNaN(primaValue)) {
                autoFilledData.prima = primaValue;
                autoFilledData.premioTotal = primaValue;
                filledFields.add('prima');
                filledFields.add('premioTotal');
              }
              break;
              
            case 'marca':
            case 'brand':
              autoFilledData.marca = fieldValue;
              filledFields.add('marca');
              break;
              
            case 'modelo':
            case 'model':
              autoFilledData.modelo = fieldValue;
              filledFields.add('modelo');
              break;
              
            case 'anio':
            case 'año':
            case 'year':
              const anioValue = typeof fieldValue === 'string' ? parseInt(fieldValue) : fieldValue;
              if (!isNaN(anioValue)) {
                autoFilledData.anio = anioValue;
                filledFields.add('anio');
              }
              break;
              
            case 'matricula':
            case 'license_plate':
            case 'placa':
              autoFilledData.matricula = fieldValue;
              filledFields.add('matricula');
              break;
              
            case 'motor':
            case 'engine':
              autoFilledData.motor = fieldValue;
              filledFields.add('motor');
              break;
              
            case 'chasis':
            case 'chassis':
              autoFilledData.chasis = fieldValue;
              filledFields.add('chasis');
              break;
              
            case 'moneda':
            case 'currency':
              autoFilledData.moneda = fieldValue;
              filledFields.add('moneda');
              break;
          }
        });
      }

      // ✅ Mapear desde campos directos en extractedData
      const directMappings = [
        { from: 'asegurado', to: ['asegurado', 'nombreAsegurado'] },
        { from: 'numeroPoliza', to: ['numeroPoliza'] },
        { from: 'vigenciaDesde', to: ['vigenciaDesde'] },
        { from: 'vigenciaHasta', to: ['vigenciaHasta'] },
        { from: 'prima', to: ['prima', 'premioTotal'] },
        { from: 'documento', to: ['documento'] },
        { from: 'email', to: ['email'] },
        { from: 'telefono', to: ['telefono'] },
        { from: 'direccion', to: ['direccion'] },
        { from: 'marca', to: ['marca'] },
        { from: 'modelo', to: ['modelo'] },
        { from: 'matricula', to: ['matricula'] },
        { from: 'motor', to: ['motor'] },
        { from: 'chasis', to: ['chasis'] },
        { from: 'moneda', to: ['moneda'] }
      ];

      directMappings.forEach(({ from, to }) => {
        if (extractedData[from as keyof DocumentProcessResult]) {
          const value = extractedData[from as keyof DocumentProcessResult];
          to.forEach(field => {
            autoFilledData[field as keyof PolizaFormData] = value;
            filledFields.add(field);
          });
        }
      });

      // Crear descripción del vehículo si tenemos marca y modelo
      if (extractedData.marca && extractedData.modelo) {
        autoFilledData.vehiculo = `${extractedData.marca} ${extractedData.modelo}`.trim();
        filledFields.add('vehiculo');
        filledFields.add('marcaModelo');
      }

      // ✅ Aplicar los datos auto-completados
      const mergedData = { ...formData, ...autoFilledData } as PolizaFormData;
      
      console.log('🤖 FormStep: Datos auto-completados:', autoFilledData);
      console.log('🤖 FormStep: Campos rellenados:', Array.from(filledFields));
      
      setAutoFilledFields(filledFields);
      onFormDataChange(mergedData);

    } catch (error) {
      console.error('❌ FormStep: Error en auto-completado:', error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  /**
   * ✅ Re-aplica el auto-completado
   */
  const reApplyAutoFill = () => {
    if (extractedData) {
      setAutoFilledFields(new Set());
      autoFillForm();
    }
  };

  const handleFormChange = (field: keyof PolizaFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    onFormDataChange(updatedData);
    
    // ✅ Marcar como modificado manualmente (quitar de auto-rellenados)
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    
    // ✅ Validar campo en tiempo real
    validation.validateField(field, value);
    validation.markFieldTouched(field);
  };

  const handleSubmit = () => {
    // ✅ Validar todo el formulario antes de enviar
    const isValid = validation.validateAll(formData);
    if (isValid) {
      onSubmit();
    } else {
      // Ir al primer tab con errores
      const firstErrorField = validation.validation.errors[0]?.field;
      if (firstErrorField) {
        // Mapear campo a tab
        const fieldToTab: { [key: string]: string } = {
          'numeroPoliza': 'poliza',
          'asegurado': 'basicos',
          'documento': 'basicos',
          'vigenciaDesde': 'poliza',
          'vigenciaHasta': 'poliza',
          'prima': 'pago',
          'marca': 'vehiculo',
          'modelo': 'vehiculo',
          'matricula': 'vehiculo'
        };
        
        const targetTab = fieldToTab[firstErrorField] || 'basicos';
        setActiveTab(targetTab);
      }
    }
  };

  // ✅ Función helper para renderizar inputs
  const renderInput = (
    field: keyof PolizaFormData,
    label: string,
    placeholder: string,
    type: string = 'text',
    icon?: React.ReactNode,
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
          {icon && <span className="mr-2">{icon}</span>}
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

  // ✅ Función helper para renderizar selects
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
                {/* Primera fila: Asegurado y Documento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'asegurado',
                    'Asegurado',
                    'Nombre completo del asegurado',
                    'text',
                    <User className="w-4 h-4 inline" />,
                    true,
                    'blue'
                  )}
                  {renderInput(
                    'documento',
                    'Documento',
                    'CI o RUC',
                    'text',
                    undefined,
                    true,
                    'blue'
                  )}
                </div>

                {/* Segunda fila: Tipo y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect(
                    'tipo',
                    'Tipo',
                    [
                      { value: 'PERSONA', label: 'Líneas personales' },
                      { value: 'EMPRESA', label: 'Líneas comerciales' }
                    ],
                    false,
                    'blue'
                  )}
                </div>

                {/* Tercera fila: Dirección completa */}
                {renderInput(
                  'direccion',
                  'Dirección',
                  'Dirección completa',
                  'text',
                  <MapPin className="w-4 h-4 inline" />,
                  false,
                  'blue'
                )}

                {/* Cuarta fila: Departamento y Localidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'departamento',
                    'Departamento',
                    'Departamento',
                    'text',
                    undefined,
                    false,
                    'blue'
                  )}
                  {renderInput(
                    'localidad',
                    'Localidad',
                    'Localidad',
                    'text',
                    undefined,
                    false,
                    'blue'
                  )}
                </div>

                {/* Quinta fila: Teléfono y Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'telefono',
                    'Teléfono',
                    'Número de teléfono',
                    'tel',
                    <Phone className="w-4 h-4 inline" />,
                    false,
                    'blue'
                  )}
                  {renderInput(
                    'email',
                    'Email',
                    'Correo electrónico',
                    'email',
                    <Mail className="w-4 h-4 inline" />,
                    false,
                    'blue'
                  )}
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

              <div className="space-y-4">
                {/* Primera fila: Número de Póliza y Prima */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'numeroPoliza',
                    'Número de Póliza',
                    'Número de póliza',
                    'text',
                    undefined,
                    true,
                    'purple'
                  )}
                  {renderInput(
                    'prima',
                    'Prima',
                    '0.00',
                    'number',
                    undefined,
                    true,
                    'purple'
                  )}
                </div>

                {/* Segunda fila: Vigencias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'vigenciaDesde',
                    'Vigencia Desde',
                    '',
                    'date',
                    undefined,
                    true,
                    'purple'
                  )}
                  {renderInput(
                    'vigenciaHasta',
                    'Vigencia Hasta',
                    '',
                    'date',
                    undefined,
                    true,
                    'purple'
                  )}
                </div>

                {/* Tercera fila: Moneda y Premio Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect(
                    'moneda',
                    'Moneda',
                    [
                      { value: 'UYU', label: 'Pesos Uruguayos (UYU)' },
                      { value: 'USD', label: 'Dólares (USD)' },
                      { value: 'EUR', label: 'Euros (EUR)' }
                    ],
                    false,
                    'purple'
                  )}
                  {renderInput(
                    'premioTotal',
                    'Premio Total',
                    '0.00',
                    'number',
                    undefined,
                    false,
                    'purple'
                  )}
                </div>
              </div>

              {/* Nota de auto-completado */}
              <div className={`mt-4 p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-green-900/30 border border-green-800/50' 
                  : 'bg-green-100 border border-green-300'
              }`}>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Campos mapeados automáticamente desde Azure Document Intelligence. 
                    Puedes modificarlos si es necesario antes de enviar a Velneo.
                  </span>
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
                {/* Primera fila: Marca y Modelo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'marca',
                    'Marca',
                    'Marca del vehículo',
                    'text',
                    undefined,
                    false,
                    'green'
                  )}
                  {renderInput(
                    'modelo',
                    'Modelo',
                    'Modelo del vehículo',
                    'text',
                    undefined,
                    false,
                    'green'
                  )}
                </div>

                {/* Segunda fila: Matrícula y Año */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'matricula',
                    'Matrícula',
                    'Matrícula',
                    'text',
                    undefined,
                    false,
                    'green'
                  )}
                  {renderInput(
                    'anio',
                    'Año',
                    '2024',
                    'number',
                    undefined,
                    false,
                    'green'
                  )}
                </div>

                {/* Tercera fila: Motor y Chasis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    'motor',
                    'Motor',
                    'Número de motor',
                    'text',
                    undefined,
                    false,
                    'green'
                  )}
                  {renderInput(
                    'chasis',
                    'Chasis',
                    'Número de chasis',
                    'text',
                    undefined,
                    false,
                    'green'
                  )}
                </div>

                {/* Cuarta fila: Tipo y Uso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect(
                    'tipoVehiculo',
                    'Tipo de Vehículo',
                    [
                      { value: 'SEDAN', label: 'Sedán' },
                      { value: 'HATCHBACK', label: 'Hatchback' },
                      { value: 'SUV', label: 'SUV' },
                      { value: 'PICKUP', label: 'Pickup' },
                      { value: 'COUPE', label: 'Coupé' },
                      { value: 'CONVERTIBLE', label: 'Convertible' },
                      { value: 'WAGON', label: 'Rural' },
                      { value: 'VAN', label: 'Van' },
                      { value: 'MOTOCICLETA', label: 'Motocicleta' }
                    ],
                    false,
                    'green'
                  )}

                  {renderSelect(
                    'uso',
                    'Uso',
                    [
                      { value: 'FAMILIAR', label: 'Familiar' },
                      { value: 'TRABAJO', label: 'Trabajo' },
                      { value: 'COMERCIAL', label: 'Comercial' },
                      { value: 'PROFESIONAL', label: 'Profesional' },
                      { value: 'DEPORTIVO', label: 'Deportivo' }
                    ],
                    false,
                    'green'
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'pago':
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
                  {renderSelect(
                    'formaPago',
                    'Forma de Pago',
                    [
                      { value: 'CONTADO', label: 'Contado' },
                      { value: 'FINANCIADO', label: 'Financiado' },
                      { value: 'DEBITO_AUTOMATICO', label: 'Débito Automático' }
                    ],
                    false,
                    'orange'
                  )}

                  {renderSelect(
                    'cantidadCuotas',
                    'Cuotas',
                    [
                      { value: '1', label: '1 cuota' },
                      { value: '3', label: '3 cuotas' },
                      { value: '6', label: '6 cuotas' },
                      { value: '12', label: '12 cuotas' }
                    ],
                    false,
                    'orange'
                  )}
                </div>
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
                    rows={4}
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
                      {autoFilledFields.size} campos completados automáticamente desde el PDF
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
                    'prima': 'pago',
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