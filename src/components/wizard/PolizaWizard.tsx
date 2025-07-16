// src/components/wizard/PolizaWizard.tsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Building2, 
  FileText, 
  Send, 
  Check, 
  AlertCircle, 
  User, 
  Upload, 
  Loader2, 
  X,
  Wand2,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';

interface PolizaWizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  const [formData, setFormData] = useState<any>({
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: '',
    moneda: 'UYU',
    asegurado: '',
    observaciones: ''
  });

  // Efecto para llenar el formulario con datos extraídos
  useEffect(() => {
    if (wizard.extractedData) {
      setFormData((prev: any) => ({
        ...prev,
        numeroPoliza: wizard.extractedData?.numeroPoliza || '',
        vigenciaDesde: wizard.extractedData?.vigenciaDesde || '',
        vigenciaHasta: wizard.extractedData?.vigenciaHasta || '',
        prima: wizard.extractedData?.prima || '',
        asegurado: wizard.extractedData?.asegurado || wizard.selectedCliente?.clinom || '',
      }));
    }
  }, [wizard.extractedData, wizard.selectedCliente]);

  const steps = [
    { key: 'cliente', label: 'Cliente', icon: User },
    { key: 'company', label: 'Compañía', icon: Building2 },
    { key: 'upload', label: 'Documento', icon: Upload },
    { key: 'extract', label: 'Procesar', icon: FileText },
    { key: 'form', label: 'Revisar', icon: Eye },
    { key: 'success', label: 'Completado', icon: Check },
  ];

  const renderStepIndicator = () => {
    const currentStepIndex = steps.findIndex(step => step.key === wizard.currentStep);

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === wizard.currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isActive 
                    ? 'border-purple-500 bg-purple-500 text-white shadow-lg scale-110' 
                    : isCompleted 
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block transition-colors ${
                  isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderClienteStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busca por nombre, cédula o RUC del cliente</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, CI o RUC..."
          value={wizard.clienteSearch}
          onChange={(e) => {
            wizard.setClienteSearch(e.target.value);
            wizard.searchClientes(e.target.value);
          }}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          autoFocus
        />
        {wizard.clienteSearch && (
          <button
            onClick={() => {
              wizard.setClienteSearch('');
              wizard.searchClientes('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {wizard.loadingClientes && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-gray-500 mt-2">Buscando clientes...</p>
        </div>
      )}

      {wizard.clienteResults.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {wizard.clienteResults.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => wizard.selectCliente(cliente)}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cliente.clinom}</h3>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4 mt-1">
                    {cliente.cliced && <span>CI: {cliente.cliced}</span>}
                    {cliente.cliruc && <span>RUC: {cliente.cliruc}</span>}
                    {cliente.telefono && <span>Tel: {cliente.telefono}</span>}
                  </div>
                </div>
                <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {wizard.clienteSearch && !wizard.loadingClientes && wizard.clienteResults.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron clientes</p>
          <p className="text-sm text-gray-400 mt-2">
            Intenta buscar por nombre completo, cédula o RUC
          </p>
        </div>
      )}
    </div>
  );

  const renderCompanyStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Compañía</h2>
        <div className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-lg">
          <User className="w-4 h-4 text-purple-600 mr-2" />
          <span className="text-purple-800 font-medium">{wizard.selectedCliente?.clinom}</span>
        </div>
      </div>

      {wizard.loadingCompanies ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-500 mt-2">Cargando compañías...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wizard.companies.map((company) => (
            <button
              key={company.id}
              onClick={() => wizard.selectCompany(company)}
              className="p-6 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
            >
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{company.comnom}</h3>
                  <p className="text-sm text-gray-500 mt-1">{company.comalias}</p>
                  <div className="flex items-center mt-2">
                    {company.broker && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mr-2">
                        Broker
                      </span>
                    )}
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Aseguradora
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Subir Documento</h2>
        <div className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 bg-purple-50 rounded-full text-sm">
            <User className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-purple-800">{wizard.selectedCliente?.clinom}</span>
          </div>
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full text-sm ml-2">
            <Building2 className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-800">{wizard.selectedCompany?.comalias}</span>
          </div>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all duration-200"
        onClick={() => document.getElementById('file-input')?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-green-500', 'bg-green-50');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
          const file = e.dataTransfer.files[0];
          if (file && file.type === 'application/pdf') {
            wizard.setUploadedFile(file);
          }
        }}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Arrastra tu póliza aquí
        </h3>
        <p className="text-gray-500 mb-4">
          o haz clic para seleccionar un archivo PDF
        </p>
        <div className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <FileText className="w-4 h-4 mr-2" />
          Seleccionar Archivo
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Máximo 10MB • Solo archivos PDF
        </p>
      </div>

      <input
        id="file-input"
        type="file"
        accept=".pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) wizard.setUploadedFile(file);
        }}
        className="hidden"
      />

      {wizard.uploadedFile && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">{wizard.uploadedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => wizard.processDocument()}
              disabled={wizard.processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {wizard.processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderExtractStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Wand2 className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando con Azure AI</h2>
      <p className="text-gray-600 mb-8">
        Archivo: <span className="font-semibold">{wizard.uploadedFile?.name}</span>
      </p>

      {wizard.processing ? (
        <div className="space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 mx-auto text-purple-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-purple-200 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Extrayendo información...
            </h3>
            <p className="text-gray-500">
              Azure Document Intelligence está analizando el documento
            </p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      ) : (
        <button
          onClick={wizard.processDocument}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          Procesar con Azure AI
        </button>
      )}
    </div>
  );

  const renderFormStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisar y Completar</h2>
        <p className="text-gray-600">Verifica los datos extraídos y completa la información</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen lateral */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Cliente:</span>
                <p className="font-medium text-gray-900">{wizard.selectedCliente?.clinom}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Compañía:</span>
                <p className="font-medium text-gray-900">{wizard.selectedCompany?.comnom}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Archivo:</span>
                <p className="font-medium text-gray-900 text-sm truncate">{wizard.uploadedFile?.name}</p>
              </div>
              {wizard.extractedData?.nivelConfianza && (
                <div>
                  <span className="text-sm text-gray-500">Confianza AI:</span>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${((wizard.extractedData?.nivelConfianza || 0) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {Math.round((wizard.extractedData?.nivelConfianza || 0) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              wizard.createPoliza(formData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Póliza *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroPoliza}
                    onChange={(e) => setFormData({...formData, numeroPoliza: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingresa el número de póliza"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prima *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.prima}
                      onChange={(e) => setFormData({...formData, prima: parseFloat(e.target.value)})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Desde *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      required
                      value={formData.vigenciaDesde}
                      onChange={(e) => setFormData({...formData, vigenciaDesde: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Hasta *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      required
                      value={formData.vigenciaHasta}
                      onChange={(e) => setFormData({...formData, vigenciaHasta: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asegurado
                  </label>
                  <input
                    type="text"
                    value={formData.asegurado}
                    onChange={(e) => setFormData({...formData, asegurado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nombre del asegurado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.moneda}
                    onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="UYU">Pesos Uruguayos (UYU)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={wizard.goBack}
                  disabled={wizard.processing}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={wizard.processing || !formData.numeroPoliza || !formData.prima || !formData.vigenciaDesde || !formData.vigenciaHasta}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {wizard.processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando a Velneo...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Crear Póliza en Velneo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        ¡Póliza Creada Exitosamente!
      </h2>
      
      <p className="text-gray-600 mb-8 text-lg">
        La póliza ha sido procesada y enviada a Velneo correctamente.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <span className="text-sm font-medium text-gray-500">Cliente:</span>
            <p className="text-gray-900 mt-1">{wizard.selectedCliente?.clinom}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Compañía:</span>
            <p className="text-gray-900 mt-1">{wizard.selectedCompany?.comnom}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Archivo:</span>
            <p className="text-gray-900 mt-1 text-sm truncate">{wizard.uploadedFile?.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Número de Póliza:</span>
            <p className="text-gray-900 mt-1">{formData.numeroPoliza}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {
            onComplete?.({
              cliente: wizard.selectedCliente,
              company: wizard.selectedCompany,
              file: wizard.uploadedFile,
              extractedData: wizard.extractedData,
              formData: formData
            });
          }}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Ver en Sistema
        </button>
        
        <button
          onClick={() => {
            wizard.reset();
            setFormData({
              numeroPoliza: '',
              vigenciaDesde: '',
              vigenciaHasta: '',
              prima: '',
              moneda: 'UYU',
              asegurado: '',
              observaciones: ''
            });
          }}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Crear Otra Póliza
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (wizard.currentStep === 'cliente') {
                    onCancel?.();
                  } else {
                    wizard.goBack();
                  }
                }}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Asistente de Pólizas</h1>
                <p className="text-gray-600 mt-1">Creación automatizada paso a paso con Azure AI</p>
              </div>
            </div>
            
            {wizard.currentStep !== 'success' && (
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres cancelar? Se perderá todo el progreso.')) {
                    onCancel?.();
                  }
                }}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Display */}
        {wizard.error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{wizard.error}</p>
              </div>
              <button
                onClick={() => wizard.setError && wizard.setError(null)}
                className="ml-4 text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 min-h-[500px]">
          {wizard.currentStep === 'cliente' && renderClienteStep()}
          {wizard.currentStep === 'company' && renderCompanyStep()}
          {wizard.currentStep === 'upload' && renderUploadStep()}
          {wizard.currentStep === 'extract' && renderExtractStep()}
          {wizard.currentStep === 'form' && renderFormStep()}
          {wizard.currentStep === 'success' && renderSuccessStep()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>RegularizadorPólizas v2.0 • Asistente IA powered by Azure Document Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default PolizaWizard;