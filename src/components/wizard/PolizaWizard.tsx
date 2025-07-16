// src/components/wizard/PolizaWizard.tsx - WIZARD COMPLETO RESTAURADO
import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { PolizaFormData, WizardResult, Cliente, Company } from '../../types/wizard';

// Props para el componente PolizaWizard usando los tipos existentes
interface PolizaWizardProps {
  onComplete?: (result: WizardResult) => void;
  onCancel?: () => void;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  
  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState<PolizaFormData>({
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: 0,
    moneda: 'UYU',
    asegurado: '',
    observaciones: ''
  });
  const [saving, setSaving] = useState(false);

  // Llenar formulario con datos extraídos
  useEffect(() => {
    if (wizard.extractedData) {
      console.log('🔍 Datos extraídos recibidos:', wizard.extractedData);
      
      // Ahora el servicio ya devuelve la estructura correcta
      setFormData({
        numeroPoliza: wizard.extractedData.numeroPoliza || '',
        asegurado: wizard.extractedData.asegurado || '',
        vigenciaDesde: wizard.extractedData.vigenciaDesde || '',
        vigenciaHasta: wizard.extractedData.vigenciaHasta || '',
        prima: wizard.extractedData.prima || 0,
        moneda: 'UYU', // Valor por defecto para Uruguay
        observaciones: 'Procesado automáticamente con Azure AI.'
      });
      
      console.log('✅ Formulario actualizado con datos:', {
        numeroPoliza: wizard.extractedData.numeroPoliza,
        asegurado: wizard.extractedData.asegurado,
        prima: wizard.extractedData.prima
      });
    }
  }, [wizard.extractedData]);

  // Función para manejar cambios en los inputs
  const handleInputChange = (field: keyof PolizaFormData, value: string | number) => {
    setFormData((prev: PolizaFormData) => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Crear la póliza usando el wizard
      const polizaCreated = await wizard.createPoliza(formData);
      
      // Crear el resultado según la interfaz WizardResult existente
      if (onComplete && wizard.selectedCliente && wizard.selectedCompany && wizard.uploadedFile && wizard.extractedData) {
        const result: WizardResult = {
          cliente: wizard.selectedCliente,
          company: wizard.selectedCompany,
          file: wizard.uploadedFile,
          extractedData: wizard.extractedData,
          formData: formData,
          polizaCreated: polizaCreated
        };
        
        onComplete(result);
      }
    } catch (error) {
      console.error('Error creando póliza:', error);
      wizard.setError('Error al crear la póliza. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar la cancelación
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // =================== FUNCIONES DE RENDERIZADO POR PASO ===================

  // Paso 1: Selección de Cliente
  const renderClienteStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busque y seleccione el cliente para la nueva póliza</p>
      </div>

      {/* Buscador de clientes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={wizard.clienteSearch}
            onChange={(e) => wizard.setClienteSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && wizard.clienteSearch.trim()) {
                wizard.searchClientes(wizard.clienteSearch);
              }
            }}
            placeholder="Buscar por nombre, cédula o RUT..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => wizard.searchClientes(wizard.clienteSearch)}
            disabled={wizard.loadingClientes || !wizard.clienteSearch.trim()}
            className="ml-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {wizard.loadingClientes ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {wizard.clienteResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {wizard.clienteResults.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-900">{cliente.clinom}</div>
                <div className="text-sm text-gray-600">
                  {cliente.cliced && `CI: ${cliente.cliced} • `}
                  {cliente.cliruc && `RUT: ${cliente.cliruc} • `}
                  {cliente.cliemail && cliente.cliemail}
                </div>
              </div>
            ))}
          </div>
        )}

        {wizard.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {wizard.error}
          </div>
        )}
      </div>
    </div>
  );

  // Paso 2: Selección de Compañía
  const renderCompanyStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Compañía</h2>
        <p className="text-gray-600">Elija la compañía aseguradora</p>
      </div>

      {/* Cliente seleccionado */}
      {wizard.selectedCliente && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <User className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Cliente seleccionado:</span>
            <span className="text-sm text-purple-800 ml-2">{wizard.selectedCliente.clinom}</span>
          </div>
        </div>
      )}

      {/* Lista de compañías */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {wizard.loadingCompanies ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Cargando compañías...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wizard.companies.map((company) => (
              <div
                key={company.id}
                onClick={() => wizard.selectCompany(company)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-900">{company.comnom}</div>
                <div className="text-sm text-gray-600">{company.comalias}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de retroceso */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a selección de cliente
        </button>
      </div>
    </div>
  );

  // Paso 3: Subir Archivo
  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subir Documento</h2>
        <p className="text-gray-600">Arrastre y suelte el PDF de la póliza</p>
      </div>

      {/* Contexto seleccionado */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
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
          </div>
        </div>
      </div>

      {/* Zona de drag & drop */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (files[0] && files[0].type === 'application/pdf') {
              wizard.setUploadedFile(files[0]);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arrastre su archivo PDF aquí
          </p>
          <p className="text-gray-600 mb-4">o haga clic para seleccionar</p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) wizard.setUploadedFile(file);
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Seleccionar Archivo
          </label>
        </div>
      </div>

      {/* Botón de retroceso */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a selección de compañía
        </button>
      </div>
    </div>
  );

  // Paso 4: Extraer Datos
  const renderExtractStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {wizard.processing ? (
            <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
          ) : (
            <FileCheck className="w-8 h-8 text-yellow-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {wizard.processing ? 'Procesando Documento' : 'Procesar Documento'}
        </h2>
        <p className="text-gray-600">
          {wizard.processing 
            ? 'Azure AI está extrayendo los datos de la póliza...'
            : 'Haga clic para iniciar el procesamiento con Azure AI'
          }
        </p>
      </div>

      {/* Archivo seleccionado */}
      {wizard.uploadedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Archivo:</span>
            <span className="text-sm text-blue-800 ml-2">{wizard.uploadedFile.name}</span>
          </div>
        </div>
      )}

      {/* Botón de procesamiento */}
      {!wizard.processing && !wizard.extractedData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <button
            type="button"
            onClick={wizard.processDocument}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg"
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Procesar con Azure AI
          </button>
        </div>
      )}

      {/* Indicador de procesamiento */}
      {wizard.processing && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-yellow-600 mb-4" />
          <p className="text-gray-600">Extrayendo datos del documento...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
        </div>
      )}

      {/* Error de procesamiento */}
      {wizard.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{wizard.error}</span>
          </div>
        </div>
      )}

      {/* Botón de retroceso */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          disabled={wizard.processing}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a subir archivo
        </button>
      </div>
    </div>
  );

  // Paso 5: Formulario Final (el que viste en la captura)
  const renderFormStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Nueva Póliza</h2>
        <p className="text-gray-600">Complete los datos de la póliza</p>
      </div>

      {/* Resumen del contexto */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-8 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
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
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos básicos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos Básicos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Número de Póliza
              </label>
              <input
                type="text"
                value={formData.numeroPoliza || ''}
                onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ingrese el número de póliza"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Asegurado
              </label>
              <input
                type="text"
                value={formData.asegurado || ''}
                onChange={(e) => handleInputChange('asegurado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nombre del asegurado"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Vigencia Desde
              </label>
              <input
                type="date"
                value={formData.vigenciaDesde || ''}
                onChange={(e) => handleInputChange('vigenciaDesde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Vigencia Hasta
              </label>
              <input
                type="date"
                value={formData.vigenciaHasta || ''}
                onChange={(e) => handleInputChange('vigenciaHasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Prima
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.prima || ''}
                onChange={(e) => handleInputChange('prima', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Moneda
              </label>
              <select
                value={formData.moneda || 'UYU'}
                onChange={(e) => handleInputChange('moneda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="UYU">UYU - Peso Uruguayo</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Observaciones adicionales
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Información adicional sobre la póliza..."
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={wizard.goBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a procesamiento
          </button>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando Póliza...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Póliza
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  // Paso 6: Éxito
  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Póliza Creada Exitosamente!</h2>
      <p className="text-gray-600 mb-8">
        La póliza ha sido procesada y enviada a Velneo correctamente.
      </p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="text-sm text-green-800">
          <p><strong>Cliente:</strong> {wizard.selectedCliente?.clinom}</p>
          <p><strong>Compañía:</strong> {wizard.selectedCompany?.comnom}</p>
          <p><strong>Número de Póliza:</strong> {formData.numeroPoliza}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = '/dashboard'}
        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Volver al Dashboard
      </button>
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
    </div>
  );
};

export default PolizaWizard;