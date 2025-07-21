import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck, Building, Hash,
  Settings, Shield, CreditCard, Navigation, Clock
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { PolizaFormDataComplete, PolizaFormMapper } from '../../types/poliza-unified';
import { Cliente, Company, PolizaFormDataExtended } from '../../types/wizard';

// Props para el componente
interface PolizaWizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  
  // Estados para el formulario
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
    compania: '',
    
    // Campos extendidos
    anio: '', plan: '', documento: '', email: '', direccion: '',
    localidad: '', departamento: '', telefono: '', vehiculo: '',
    marca: '', modelo: '', motor: '', chasis: '', matricula: '',
    combustible: '', primaComercial: 0, premioTotal: 0, corredor: ''
  });

  const [activeTab, setActiveTab] = useState<string>('basicos');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Estados para búsqueda de cliente
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        wizard.searchClientes(searchQuery);
      }, 500);
      setDebounceTimer(timer);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchQuery]);

  // Efecto para mapear datos cuando se extraen
  useEffect(() => {
    if (wizard.extractedData && wizard.currentStep === 'form' && !initialDataLoaded) {
      console.log('🔄 Mapeando datos extraídos al formulario...');
      const mappedData = PolizaFormMapper.fromClienteAndAzure(
        wizard.selectedCliente, 
        wizard.extractedData
      );
      setFormData(mappedData);
      setInitialDataLoaded(true);
    }
  }, [wizard.extractedData, wizard.currentStep, wizard.selectedCliente, initialDataLoaded]);

  // Función para actualizar campos del formulario
  const updateFormField = (field: keyof PolizaFormDataComplete, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      setSaving(true);
      await wizard.createPoliza(formData as PolizaFormDataExtended);
      
      if (onComplete) {
        onComplete({
          cliente: wizard.selectedCliente,
          company: wizard.selectedCompany,
          file: wizard.uploadedFile,
          extractedData: wizard.extractedData,
          formData: formData
        });
      }
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
    } finally {
      setSaving(false);
    }
  };

  // Manejar drag and drop para archivos
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        wizard.setUploadedFile(file);
      } else {
        wizard.setError('Solo se permiten archivos PDF');
      }
    }
  }, []);

  // =================== STEPS DEL WIZARD ===================

  // 1. PASO: Selección de Cliente
  const renderClienteStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busca y selecciona el cliente asegurado</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, CI o RUC..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Resultados de búsqueda */}
        <div className="space-y-3">
          {wizard.loadingClientes ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600 mt-2">Buscando clientes...</p>
            </div>
          ) : wizard.clienteResults.length > 0 ? (
            wizard.clienteResults.map((cliente: Cliente) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{cliente.clinom}</h4>
                    <p className="text-sm text-gray-600">
                      {cliente.cliced || cliente.cliruc} 
                      {cliente.cliemail && ` • ${cliente.cliemail}`}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          ) : searchQuery.length >= 2 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No se encontraron clientes con "{searchQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Escribe al menos 2 caracteres para buscar clientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 2. PASO: Selección de Compañía
  const renderCompanyStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Compañía</h2>
        <p className="text-gray-600">Elige la compañía aseguradora</p>
      </div>

      {/* Información del cliente seleccionado */}
      {wizard.selectedCliente && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Cliente seleccionado:</span>
            <span className="text-blue-800 ml-2">{wizard.selectedCliente.clinom}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {wizard.loadingCompanies ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
            <p className="text-sm text-gray-600 mt-2">Cargando compañías...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wizard.companies.map((company: Company) => (
              <div
                key={company.id}
                onClick={() => wizard.selectCompany(company)}
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <div className="text-center">
                  <Building2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">{company.comnom}</h4>
                  <p className="text-sm text-gray-600">{company.comalias}</p>
                  {company.broker && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      Broker
                    </span>
                  )}
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
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subir Documento PDF</h2>
        <p className="text-gray-600">Sube la póliza en formato PDF para procesamiento automático</p>
      </div>

      {/* Información seleccionada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Cliente:</span>
            <span className="text-blue-800 ml-2">{wizard.selectedCliente?.clinom}</span>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Compañía:</span>
            <span className="text-green-800 ml-2">{wizard.selectedCompany?.comnom}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">{wizard.uploadedFile.name}</span>
                <span className="ml-2 text-sm text-green-600">
                  ({(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={() => wizard.setUploadedFile(null as any)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
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
              disabled={wizard.processing}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {wizard.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Procesar Documento
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
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
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Procesando Documento</h2>
        <p className="text-gray-600">Azure Document Intelligence está extrayendo los datos...</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Procesando con Azure AI</h3>
          <p className="text-gray-600 mb-6">
            Analizando el documento PDF y extrayendo información de la póliza...
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>

          <p className="text-sm text-gray-500">
            Archivo: {wizard.uploadedFile?.name}
          </p>
        </div>

        {wizard.error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{wizard.error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 5. PASO: Formulario (implementación completa anterior)
  const renderFormStep = () => {
    // Componente para campos de entrada
    const InputField = ({ 
      label, 
      field, 
      value, 
      icon: Icon, 
      placeholder, 
      type = "text",
      required = false
    }: {
      label: string;
      field: keyof PolizaFormDataComplete;
      value: string | number | undefined;
      icon?: any;
      placeholder?: string;
      type?: string;
      required?: boolean;
    }) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
            onChange={(e) => updateFormField(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            disabled={!isEditing}
            className={`${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            } ${value ? 'border-green-300 bg-green-50' : ''}`}
            placeholder={placeholder}
            required={required}
          />
          {value && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Información Extraída de Póliza</h2>
            
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Revisar y Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">
            Archivo: {wizard.uploadedFile?.name} • Procesado con Azure AI
            {isEditing && <span className="text-blue-600 font-medium ml-2">• Modo edición activo</span>}
          </p>
        </div>

        {/* Tabs de navegación */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'basicos', label: 'Datos Básicos', icon: FileText },
            { id: 'cliente', label: 'Cliente', icon: User },
            { id: 'vehiculo', label: 'Vehículo', icon: Car },
            { id: 'financiero', label: 'Financiero', icon: DollarSign },
            { id: 'otros', label: 'Otros', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido del formulario según el tab activo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TAB: Datos Básicos */}
          {activeTab === 'basicos' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Información de la Póliza
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <InputField
                  label="Número de Póliza"
                  field="numeroPoliza"
                  value={formData.numeroPoliza}
                  icon={Hash}
                  placeholder="Número de póliza"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Vigencia Desde"
                    field="vigenciaDesde"
                    value={formData.vigenciaDesde}
                    icon={Calendar}
                    type="date"
                    placeholder="Fecha de inicio"
                    required
                  />
                  <InputField
                    label="Vigencia Hasta"
                    field="vigenciaHasta"
                    value={formData.vigenciaHasta}
                    icon={Calendar}
                    type="date"
                    placeholder="Fecha de fin"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Ramo"
                    field="ramo"
                    value={formData.ramo}
                    placeholder="Tipo de seguro"
                  />
                  <InputField
                    label="Plan"
                    field="plan"
                    value={formData.plan}
                    placeholder="Plan de cobertura"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Cliente */}
          {activeTab === 'cliente' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Datos del Asegurado
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <InputField
                  label="Nombre del Asegurado"
                  field="asegurado"
                  value={formData.asegurado}
                  icon={User}
                  placeholder="Nombre completo"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Documento"
                    field="documento"
                    value={formData.documento}
                    placeholder="CI o RUC"
                  />
                  <InputField
                    label="Email"
                    field="email"
                    value={formData.email}
                    icon={Mail}
                    type="email"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Teléfono"
                    field="telefono"
                    value={formData.telefono}
                    icon={Phone}
                    placeholder="099123456"
                  />
                  <InputField
                    label="Dirección"
                    field="direccion"
                    value={formData.direccion}
                    icon={MapPin}
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Vehículo */}
          {activeTab === 'vehiculo' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-purple-600" />
                  Datos del Vehículo
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Marca"
                    field="marca"
                    value={formData.marca}
                    placeholder="Toyota, Ford, etc."
                  />
                  <InputField
                    label="Modelo"
                    field="modelo"
                    value={formData.modelo}
                    placeholder="Corolla, Focus, etc."
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
                
                <InputField
                  label="Matrícula"
                  field="matricula"
                  value={formData.matricula}
                  placeholder="ABC1234"
                />
              </div>
            </div>
          )}

          {/* TAB: Financiero */}
          {activeTab === 'financiero' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                  Información Financiera
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Prima"
                    field="prima"
                    value={formData.prima}
                    icon={DollarSign}
                    type="number"
                    placeholder="0"
                    required
                  />
                  <InputField
                    label="Prima Comercial"
                    field="primaComercial"
                    value={formData.primaComercial}
                    icon={DollarSign}
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Otros */}
          {activeTab === 'otros' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-orange-600" />
                  Información Adicional
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <InputField
                  label="Corredor"
                  field="corredor"
                  value={formData.corredor}
                  icon={Building}
                  placeholder="Nombre del corredor"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => updateFormField('observaciones', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    }`}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={wizard.goBack}
            disabled={wizard.processing || saving}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving || wizard.processing || !formData.numeroPoliza || !formData.asegurado}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Crear Póliza en Velneo
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // 6. PASO: Éxito
  const renderSuccessStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Póliza Creada Exitosamente!</h2>
        <p className="text-gray-600 mb-8">
          La póliza ha sido procesada y enviada a Velneo correctamente.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left">
          <h3 className="font-semibold mb-4">Resumen:</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Cliente:</span> {wizard.selectedCliente?.clinom}</p>
            <p><span className="font-medium">Compañía:</span> {wizard.selectedCompany?.comnom}</p>
            <p><span className="font-medium">Póliza:</span> {formData.numeroPoliza}</p>
            <p><span className="font-medium">Archivo:</span> {wizard.uploadedFile?.name}</p>
          </div>
        </div>

        <button
          onClick={() => wizard.reset()}
          className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Procesar Otra Póliza
        </button>
      </div>
    </div>
  );

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
              <span className="ml-2 text-sm text-gray-500">
                Creación automatizada paso a paso con Azure Document Intelligence
              </span>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex items-center space-x-2">
              {['cliente', 'company', 'upload', 'extract', 'form', 'success'].map((step, index) => {
                const stepNames = ['Cliente', 'Compañía', 'Archivo', 'Extraer', 'Formulario', 'Éxito'];
                const isActive = wizard.currentStep === step;
                const isCompleted = ['cliente', 'company', 'upload', 'extract', 'form', 'success'].indexOf(wizard.currentStep) > index;
                
                return (
                  <div key={step} className="text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stepNames[index]}</p>
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
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm">{wizard.error}</span>
            </div>
            <button
              onClick={() => wizard.setError(null)}
              className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export default explícito
export default PolizaWizard;