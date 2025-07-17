import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck, Building, Hash,
  Settings, Shield, CreditCard, Navigation, Clock
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { PolizaFormDataComplete, PolizaFormMapper } from '../../types/poliza-unified';

// Props para el componente
interface PolizaWizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  
  // Estados para el formulario - USANDO TIPOS UNIFICADOS
  const [formData, setFormData] = useState<PolizaFormDataComplete>({
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: 0,
    moneda: 'UYU',
    asegurado: '',
    estadoTramite: '1', 
    estadoPoliza: '1',  
    observaciones: 'Procesado automáticamente con Azure AI.',
    ramo: 'AUTOMOVILES',
    compania: ''
  });

  const [activeTab, setActiveTab] = useState<string>('basicos');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // =================== STEPS DEL WIZARD ===================

  // 1. PASO: Selección de Cliente
  const renderClienteStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busca y selecciona el cliente para crear la póliza</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Cliente
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={wizard.clienteSearch}
              onChange={(e) => {
                wizard.setClienteSearch(e.target.value);
                if (e.target.value.length >= 2) {
                  wizard.searchClientes(e.target.value);
                }
              }}
              placeholder="Nombre del cliente..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {wizard.loadingClientes && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
            <p className="text-sm text-gray-600 mt-2">Buscando clientes...</p>
          </div>
        )}

        {wizard.clienteResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Resultados:</h3>
            {wizard.clienteResults.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{cliente.clinom}</h4>
                    <p className="text-sm text-gray-600">ID: {cliente.id}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 2. PASO: Selección de Compañía
  const renderCompanyStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Compañía</h2>
        <p className="text-gray-600">Elige la compañía aseguradora</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {wizard.loadingCompanies ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
            <p className="text-sm text-gray-600 mt-2">Cargando compañías...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wizard.companies.map((company) => (
              <div
                key={company.id}
                onClick={() => wizard.selectCompany(company)}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="text-center">
                  <Building2 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">{company.comnom}</h4>
                  <p className="text-sm text-gray-600">{company.comalias}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => wizard.goBack()}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a selección de cliente
          </button>
        </div>
      </div>
    </div>
  );

  // 3. PASO: Upload de Archivo
  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subir Documento PDF</h2>
        <p className="text-gray-600">Sube la póliza en formato PDF para procesamiento automático</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-600">
              Solo archivos PDF, máximo 10MB
            </p>
          </div>
          
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                wizard.setUploadedFile(file);
              }
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer"
          >
            Seleccionar Archivo
          </label>
        </div>

        {wizard.uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">{wizard.uploadedFile.name}</span>
              <span className="ml-2 text-sm text-green-600">
                ({(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => wizard.goBack()}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a compañías
          </button>

          {wizard.uploadedFile && (
            <button
              onClick={() => wizard.processDocument()}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Procesar Documento
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 4. PASO: Procesamiento y Extracción
  const renderExtractStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando Documento</h2>
        <p className="text-gray-600">Azure Document Intelligence está extrayendo los datos...</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Procesando...</h3>
          <p className="text-gray-600 mb-6">
            Esto puede tomar unos segundos mientras extraemos los datos de la póliza
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. PASO: Formulario con Tabs (solo se muestra cuando hay datos extraídos)
  const renderFormStep = () => {
    // Opciones para selects
    const estadosTramite = [
      { value: '1', label: 'Nuevo' },
      { value: '2', label: 'Pendiente' },
      { value: '3', label: 'Aprobado' },
      { value: '4', label: 'Rechazado' }
    ];

    const estadosPoliza = [
      { value: '1', label: 'VIGENTE' },
      { value: '0', label: 'NO VIGENTE' },
      { value: '2', label: 'CANCELADO' },
      { value: '3', label: 'VENCIDA' },
      { value: '4', label: 'ANTECEDENTE' }
    ];

    const formasPago = [
      { value: 'CONTADO', label: 'Contado' },
      { value: 'FINANCIADO', label: 'Financiado' },
      { value: 'MENSUAL', label: 'Mensual' },
      { value: 'TRIMESTRAL', label: 'Trimestral' },
      { value: 'SEMESTRAL', label: 'Semestral' },
      { value: 'ANUAL', label: 'Anual' }
    ];

    const monedas = [
      { value: 'UYU', label: 'Pesos Uruguayos (UYU)' },
      { value: 'USD', label: 'Dólares (USD)' },
      { value: 'EUR', label: 'Euros (EUR)' }
    ];

    // Tabs de navegación
    const tabs = [
      { id: 'basicos', label: 'Datos Básicos', icon: FileText },
      { id: 'cliente', label: 'Cliente', icon: User },
      { id: 'vehiculo', label: 'Vehículo', icon: Car },
      { id: 'financiero', label: 'Financiero', icon: DollarSign },
      { id: 'cobertura', label: 'Cobertura', icon: Shield },
      { id: 'gestion', label: 'Gestión', icon: Settings }
    ];

    // Función para actualizar campos - USANDO TIPOS UNIFICADOS
    const updateFormData = (field: keyof PolizaFormDataComplete, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    // Componente reutilizable para campos - USANDO TIPOS UNIFICADOS
    const InputField: React.FC<{
      label: string;
      field: keyof PolizaFormDataComplete;
      value: any;
      type?: string;
      placeholder?: string;
      icon?: any;
      required?: boolean;
      options?: { value: string; label: string }[];
      disabled?: boolean;
    }> = ({ label, field, value, type = "text", placeholder, icon: Icon, required, options, disabled }) => {
      
      if (options) {
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => updateFormData(field, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Seleccionar...</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            {Icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <input
              type={type}
              value={value || ''}
              onChange={(e) => updateFormData(field, type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 ${
                Icon ? 'pl-10' : ''
              }`}
            />
          </div>
        </div>
      );
    };

    const renderTabContent = () => {
      switch (activeTab) {
        case 'basicos':
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Información Básica de la Póliza
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Número de Póliza"
                      field="numeroPoliza"
                      value={formData.numeroPoliza}
                      icon={Hash}
                      required
                      placeholder="Ej: 9603235"
                    />
                    <InputField
                      label="Endoso"
                      field="endoso"
                      value={formData.endoso}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Vigencia Desde"
                      field="vigenciaDesde"
                      value={formData.vigenciaDesde}
                      type="date"
                      icon={Calendar}
                      required
                    />
                    <InputField
                      label="Vigencia Hasta"
                      field="vigenciaHasta"
                      value={formData.vigenciaHasta}
                      type="date"
                      icon={Calendar}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Estado del Trámite"
                      field="estadoTramite"
                      value={formData.estadoTramite}
                      options={estadosTramite}
                      required
                    />
                    <InputField
                      label="Estado de la Póliza"
                      field="estadoPoliza"
                      value={formData.estadoPoliza}
                      options={estadosPoliza}
                      required
                    />
                  </div>

                  <InputField
                    label="Ramo"
                    field="ramo"
                    value={formData.ramo}
                    disabled
                  />
                </div>
              </div>
            </div>
          );

        case 'cliente':
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Datos del Cliente
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <InputField
                    label="Nombre del Asegurado"
                    field="asegurado"
                    value={formData.asegurado}
                    icon={User}
                    required
                    disabled
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Documento"
                      field="documento"
                      value={formData.documento}
                      icon={Hash}
                      placeholder="Cédula de identidad"
                      disabled
                    />
                    <InputField
                      label="Email"
                      field="email"
                      value={formData.email}
                      type="email"
                      icon={Mail}
                      placeholder="correo@ejemplo.com"
                      disabled
                    />
                  </div>

                  <InputField
                    label="Dirección (Domicilio)"
                    field="direccion"
                    value={formData.direccion}
                    icon={MapPin}
                    placeholder="Dirección completa"
                    disabled
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Localidad"
                      field="localidad"
                      value={formData.localidad}
                      icon={MapPin}
                      disabled
                    />
                    <InputField
                      label="Departamento"
                      field="departamento"
                      value={formData.departamento}
                      icon={MapPin}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          );

        case 'vehiculo':
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-purple-600" />
                    Datos del Vehículo
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <InputField
                    label="Descripción del Vehículo"
                    field="vehiculo"
                    value={formData.vehiculo}
                    icon={Car}
                    placeholder="Descripción completa"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="Marca"
                      field="marca"
                      value={formData.marca}
                      placeholder="Ej: CHEVROLET"
                    />
                    <InputField
                      label="Modelo"
                      field="modelo"
                      value={formData.modelo}
                      placeholder="Ej: ONIX"
                    />
                    <InputField
                      label="Año"
                      field="anioVehiculo"
                      value={formData.anioVehiculo}
                      type="number"
                      placeholder="2025"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Motor"
                      field="motor"
                      value={formData.motor}
                      placeholder="Número de motor"
                    />
                    <InputField
                      label="Chasis"
                      field="chasis"
                      value={formData.chasis}
                      placeholder="Número de chasis"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Matrícula"
                      field="matricula"
                      value={formData.matricula}
                      placeholder="Placa del vehículo"
                    />
                    <InputField
                      label="Categoría"
                      field="categoria"
                      value={formData.categoria}
                      type="number"
                      placeholder="Código de categoría"
                    />
                  </div>
                </div>
              </div>
            </div>
          );

        case 'financiero':
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                    Información Financiera
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="Prima"
                      field="prima"
                      value={formData.prima}
                      type="number"
                      icon={DollarSign}
                      required
                      placeholder="0.00"
                    />
                    <InputField
                      label="Premio Total"
                      field="premioTotal"
                      value={formData.premioTotal}
                      type="number"
                      icon={DollarSign}
                      placeholder="0.00"
                    />
                    <InputField
                      label="Moneda"
                      field="moneda"
                      value={formData.moneda}
                      options={monedas}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="Forma de Pago"
                      field="formaPago"
                      value={formData.formaPago}
                      options={formasPago}
                    />
                    <InputField
                      label="Cantidad de Cuotas"
                      field="cuotas"
                      value={formData.cuotas}
                      type="number"
                      placeholder="1"
                    />
                    <InputField
                      label="Valor por Cuota"
                      field="valorCuota"
                      value={formData.valorCuota}
                      type="number"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Bonif. Siniestros (%)"
                      field="bonificacionSiniestros"
                      value={formData.bonificacionSiniestros}
                      type="number"
                      placeholder="0"
                    />
                    <InputField
                      label="Bonif. Antigüedad (%)"
                      field="bonificacionAntiguedad"
                      value={formData.bonificacionAntiguedad}
                      type="number"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          );

        case 'cobertura':
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                    Cobertura y Riesgo
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Cobertura"
                      field="cobertura"
                      value={formData.cobertura}
                      placeholder="Tipo de cobertura"
                    />
                    <InputField
                      label="Deducible"
                      field="deducible"
                      value={formData.deducible}
                      type="number"
                      placeholder="0"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Responsabilidad Civil"
                      field="responsabilidadCivil"
                      value={formData.responsabilidadCivil}
                      type="number"
                      placeholder="Monto RC"
                    />
                    <InputField
                      label="Capital Asegurado"
                      field="capitalAsegurado"
                      value={formData.capitalAsegurado}
                      type="number"
                      placeholder="Capital total"
                    />
                  </div>
                </div>
              </div>
            </div>
          );

        case 'gestion':
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-gray-600" />
                    Gestión y Observaciones
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Gestor"
                      field="gestor"
                      value={formData.gestor}
                      icon={User}
                      placeholder="Nombre del gestor"
                    />
                    <InputField
                      label="Fecha de Ingreso"
                      field="fechaIngreso"
                      value={formData.fechaIngreso}
                      type="date"
                      icon={Calendar}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => updateFormData('observaciones', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Observaciones y comentarios adicionales..."
                    />
                  </div>

                  <InputField
                    label="Motivo No Renovación"
                    field="motivoNoRenovacion"
                    value={formData.motivoNoRenovacion}
                    placeholder="Solo si aplica"
                  />
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className="text-center py-8">
              <p className="text-gray-600">Contenido del tab en construcción...</p>
            </div>
          );
      }
    };

    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="w-full min-h-full">
          
          {/* Header con información del proceso */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="w-full px-6 py-6">
              
              {/* Información del proceso */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">Cliente:</span>
                    <span className="text-sm text-purple-800 ml-1">{wizard.selectedCliente?.clinom}</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">Compañía:</span>
                    <span className="text-sm text-purple-800 ml-1">{wizard.selectedCompany?.comnom}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">Archivo:</span>
                    <span className="text-sm text-purple-800 ml-1">{wizard.uploadedFile?.name}</span>
                  </div>
                </div>
              </div>

              {/* Tabs de navegación */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                          isActive
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Contenido del tab activo */}
          <div className="w-full flex-1 p-6">
            {renderTabContent()}
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-6 border-t border-gray-200 bg-white sticky bottom-0 rounded-lg shadow-lg mx-6 mb-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => wizard.goBack()}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </button>
                  
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Campos completados: <span className="font-semibold text-purple-600">
                      {Object.values(formData).filter(v => v && v !== '' && v !== 0).length} / {Object.keys(formData).length}
                    </span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={saving || !formData.numeroPoliza || !formData.asegurado}
                    className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Crear Póliza en Velneo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // 6. PASO: Éxito
  const renderSuccessStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Póliza Creada Exitosamente!</h2>
          <p className="text-gray-600 mb-6">
            La póliza ha sido procesada y enviada a Velneo correctamente.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="text-sm text-green-800">
              <p><strong>Cliente:</strong> {wizard.selectedCliente?.clinom}</p>
              <p><strong>Compañía:</strong> {wizard.selectedCompany?.comnom}</p>
              <p><strong>Número de Póliza:</strong> {formData.numeroPoliza}</p>
            </div>
          </div>

          <div className="space-x-4">
            <button
              type="button"
              onClick={() => wizard.reset()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Crear Nueva Póliza
            </button>
            
            <button
              type="button"
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // =================== useEffect CORREGIDO CON MAPPER UNIFICADO ===================
  useEffect(() => {
    if (wizard.extractedData && !initialDataLoaded && !isEditing && wizard.currentStep === 'form') {
      console.log('🔍 Loading extracted data for first time:', wizard.extractedData);
      
      try {
        // USAR EL MAPPER UNIFICADO para convertir datos de Azure
        const mappedData = PolizaFormMapper.fromAzureResponse(wizard.extractedData.polizaData || wizard.extractedData);
        
        console.log('🔄 Mapped data from Azure:', mappedData);
        
        // Actualizar estado del formulario
        setFormData(prev => ({
          ...prev,
          ...mappedData,
          // Mantener algunos valores por defecto
          estadoTramite: prev.estadoTramite,
          estadoPoliza: prev.estadoPoliza,
          moneda: prev.moneda,
          observaciones: prev.observaciones
        }));
        
        setInitialDataLoaded(true);
        console.log('✅ Form data loaded from Azure extraction using unified mapper');
        
      } catch (error) {
        console.error('❌ Error mapping Azure data:', error);
        setInitialDataLoaded(true); // Marcar como cargado para evitar loops
      }
    }
  }, [wizard.extractedData, initialDataLoaded, isEditing, wizard.currentStep]);

  // =================== Función CORREGIDA para manejar envío del formulario ===================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numeroPoliza || !formData.asegurado) {
      alert('Los campos Número de Póliza y Asegurado son requeridos');
      return;
    }

    setSaving(true);
    
    try {
      console.log('📋 Submitting form with unified types...');
      console.log('📊 Form data:', formData);
      
      // Agregar metadatos del procesamiento
      const completeFormData: PolizaFormDataComplete = {
        ...formData,
        documentoId: wizard.extractedData?.documentId,
        archivoOriginal: wizard.uploadedFile?.name,
        procesadoConIA: true
      };
      
      console.log('🚀 Complete form data to submit:', completeFormData);
      
      const result = await wizard.createPoliza(completeFormData);
      
      if (onComplete) {
        onComplete(result);
      }
      
    } catch (error) {
      console.error('❌ Error al crear póliza:', error);
      alert('Error al crear la póliza: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // =================== RENDERIZADO PRINCIPAL ===================

  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 'cliente':
        return renderClienteStep();
      case 'company':
        return renderCompanyStep();
      case 'upload':
        return renderUploadStep();
      case 'extract':
        return renderExtractStep();
      case 'form':
        return renderFormStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderClienteStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con progreso */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Asistente de Pólizas IA</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                ✨ Powered by Azure AI
              </span>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex items-center space-x-2">
              {['cliente', 'company', 'upload', 'extract', 'form', 'success'].map((step, index) => {
                const isActive = wizard.currentStep === step;
                const isCompleted = ['cliente', 'company', 'upload', 'extract', 'form', 'success'].indexOf(wizard.currentStep) > index;
                
                return (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="py-8">
        {renderCurrentStep()}
      </div>

      {/* Mostrar errores si los hay */}
      {wizard.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{wizard.error}</span>
            <button
              onClick={() => wizard.setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolizaWizard;