import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Loader2, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle,
  Clock, Shield, Zap, Database, Activity, Settings,
  Search, X, Copy, ExternalLink, BarChart3, TrendingUp
} from 'lucide-react';
import { usePolizaWizardVelneo } from '../../hooks/usePolizaWizardVelneo';
import PolizaFormCompleteStep from './PolizaFormCompleteStep';
import { 
  DocumentProcessResultVelneo, 
  PolizaFormDataComplete,
  Cliente,
  Company,
  WizardStep,
  WizardStateVelneo,
} from '../../types/azure-document-velneo';

interface PolizaWizardVelneoProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
  enableDebugMode?: boolean;
  autoAdvanceSteps?: boolean;
}

const PolizaWizardVelneo: React.FC<PolizaWizardVelneoProps> = ({ 
  onComplete, 
  onCancel,
  enableDebugMode = false,
  autoAdvanceSteps = false
}) => {
  const wizard = usePolizaWizardVelneo({
    enableDebugMode,
    autoAdvanceSteps,
    validateOnStepChange: true
  });

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Auto-scroll en debug logs
  useEffect(() => {
    if (showDebugPanel && wizard.debugLogs.length > 0) {
      const debugPanel = document.getElementById('debug-panel');
      if (debugPanel) {
        debugPanel.scrollTop = debugPanel.scrollHeight;
      }
    }
  }, [wizard.debugLogs, showDebugPanel]);

  // ================================
  // 🎨 COMPONENTES DE PASOS
  // ================================

  // 1️⃣ PASO: Selección de cliente
  const renderClienteStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busca y selecciona el cliente para la nueva póliza</p>
      </div>

      {/* Buscador de clientes mejorado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Buscar cliente por nombre, documento o email
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={wizard.clienteSearch}
              onChange={(e) => wizard.setClienteSearch(e.target.value)}
              placeholder="Ej: Juan Pérez, 12345678, juan@email.com..."
              className="w-full pl-10 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            {wizard.clienteSearch && (
              <button
                onClick={() => wizard.setClienteSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Estadísticas de búsqueda */}
          {wizard.clienteResults.total > 0 && (
            <div className="mt-2 text-sm text-gray-500 flex items-center justify-between">
              <span>{wizard.clienteResults.total} cliente(s) encontrado(s)</span>
              {wizard.clienteResults.hasMore && (
                <span className="text-blue-600">+ más resultados disponibles</span>
              )}
            </div>
          )}
        </div>

        {/* Estados de carga */}
        {wizard.clienteResults.loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600 text-lg">Buscando clientes...</span>
          </div>
        )}

        {/* Resultados de búsqueda */}
        {wizard.clienteResults.clientes.length > 0 && !wizard.clienteResults.loading && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wizard.clienteResults.clientes.map((cliente: Cliente) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="group p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-lg">
                      {cliente.clinom}
                    </h3>
                    <div className="mt-1 space-y-1">
                      {(cliente.cliced || cliente.cliruc) && (
                        <p className="text-sm text-gray-600">
                          {cliente.cliced && `CI: ${cliente.cliced}`}
                          {cliente.cliced && cliente.cliruc && ' | '}
                          {cliente.cliruc && `RUT: ${cliente.cliruc}`}
                        </p>
                      )}
                      {cliente.cliemail && (
                        <p className="text-sm text-blue-600">{cliente.cliemail}</p>
                      )}
                      {cliente.telefono && (
                        <p className="text-sm text-gray-500">📞 {cliente.telefono}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-2">ID: {cliente.id}</div>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      cliente.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {wizard.clienteSearch && 
         wizard.clienteResults.clientes.length === 0 && 
         !wizard.clienteResults.loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
            <p className="text-gray-500">
              Intenta con un término de búsqueda diferente o verifica la ortografía
            </p>
          </div>
        )}

        {/* Instrucciones iniciales */}
        {!wizard.clienteSearch && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Buscar Cliente</h3>
            <p className="text-gray-500">
              Escribe el nombre, documento o email del cliente para comenzar la búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Cliente seleccionado */}
      {wizard.selectedCliente && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <span className="font-semibold text-green-800 text-lg">Cliente seleccionado:</span>
                <p className="text-green-700 font-medium">{wizard.selectedCliente.clinom}</p>
                {wizard.selectedCliente.cliced && (
                  <p className="text-sm text-green-600">CI: {wizard.selectedCliente.cliced}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(wizard.selectedCliente!.clinom)}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Copiar nombre"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 2️⃣ PASO: Selección de compañía
  const renderCompanyStep = () => (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Compañía Aseguradora</h2>
        <p className="text-gray-600">Elige la compañía que emitirá esta póliza</p>
      </div>

      {/* Resumen del cliente seleccionado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <User className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-medium text-blue-800">Cliente seleccionado:</span>
          <span className="ml-2 text-blue-700">{wizard.selectedCliente?.clinom}</span>
        </div>
      </div>

      {/* Lista de compañías */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {wizard.loadingCompanies ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mr-3" />
            <span className="text-gray-600 text-lg">Cargando compañías...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compañías Disponibles ({wizard.companies.length})
              </h3>
              <p className="text-sm text-gray-600">
                Selecciona la compañía aseguradora para esta póliza
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wizard.companies.map((company: Company) => (
                <div
                  key={company.id}
                  onClick={() => wizard.selectCompany(company)}
                  className={`group p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    wizard.selectedCompany?.id === company.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                      wizard.selectedCompany?.id === company.id
                        ? 'bg-green-100'
                        : 'bg-gray-100 group-hover:bg-green-100'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        wizard.selectedCompany?.id === company.id
                          ? 'text-green-600'
                          : 'text-gray-600 group-hover:text-green-600'
                      }`} />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-900">
                      {company.comnom}
                    </h3>
                    
                    {company.comalias && (
                      <p className="text-sm text-gray-600 mb-3">{company.comalias}</p>
                    )}

                    <div className="text-xs text-gray-400 mb-3">ID: {company.id}</div>

                    {wizard.selectedCompany?.id === company.id && (
                      <div className="flex items-center justify-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Seleccionada</span>
                      </div>
                    )}

                    {company.activo !== undefined && (
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        company.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.activo ? 'Activa' : 'Inactiva'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // 3️⃣ PASO: Upload de archivo
  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subir Póliza</h2>
        <p className="text-gray-600">Sube el PDF de la póliza para procesamiento automático con IA</p>
      </div>

      {/* Contexto seleccionado */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-4">Información de la Operación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <span className="text-sm font-medium text-purple-700">Cliente:</span>
              <p className="text-purple-900 font-medium">{wizard.selectedCliente?.clinom}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <span className="text-sm font-medium text-purple-700">Compañía:</span>
              <p className="text-purple-900 font-medium">{wizard.selectedCompany?.comnom}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área de upload */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors duration-200 cursor-pointer group"
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (files[0] && files[0].type === 'application/pdf') {
              wizard.uploadFile(files[0]);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="w-16 h-16 text-gray-400 group-hover:text-purple-500 mx-auto mb-6 transition-colors" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Arrastra el archivo PDF aquí
          </h3>
          <p className="text-gray-600 mb-6">
            o haz clic para seleccionar desde tu computadora
          </p>
          
          <div className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Seleccionar Archivo PDF
          </div>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                wizard.uploadFile(file);
              }
            }}
            className="hidden"
            id="file-upload"
          />
        </div>

        {/* Información de restricciones */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos del archivo:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-purple-500" />
              <span>Solo archivos PDF</span>
            </div>
            <div className="flex items-center">
              <Database className="w-4 h-4 mr-2 text-purple-500" />
              <span>Máximo 10MB</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-purple-500" />
              <span>Procesamiento automático</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 4️⃣ PASO: Procesamiento con Azure
  const renderExtractStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Activity className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Procesando con Azure AI</h2>
        <p className="text-gray-600 text-lg">
          Azure Document Intelligence está extrayendo automáticamente los datos de la póliza
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {/* Barra de progreso mejorada */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Progreso del Procesamiento</span>
            <span className="text-sm font-bold text-blue-600">{wizard.processingProgress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${wizard.processingProgress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Estado actual detallado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              {wizard.processingProgress < 20 ? '📤 Subiendo archivo al servidor...' :
               wizard.processingProgress < 40 ? '🤖 Azure AI analizando estructura...' :
               wizard.processingProgress < 60 ? '🔍 Extrayendo campos de datos...' :
               wizard.processingProgress < 80 ? '🧠 Procesando información inteligente...' :
               wizard.processingProgress < 95 ? '✅ Validando datos extraídos...' :
               '🎯 Finalizando procesamiento...'}
            </span>
          </div>

          <p className="text-gray-600">
            Este proceso utiliza la última tecnología de Azure Document Intelligence para extraer 
            automáticamente todos los datos relevantes de la póliza.
          </p>
        </div>

        {/* Información del archivo y contexto */}
        {wizard.uploadedFile && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Información del Procesamiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium">Archivo:</span>
                  <span className="ml-2 text-gray-700">{wizard.uploadedFile.name}</span>
                </div>
                <div className="flex items-center">
                  <Database className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium">Tamaño:</span>
                  <span className="ml-2 text-gray-700">
                    {(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium">Cliente:</span>
                  <span className="ml-2 text-gray-700">{wizard.selectedCliente?.clinom}</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium">Compañía:</span>
                  <span className="ml-2 text-gray-700">{wizard.selectedCompany?.comnom}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Características del procesamiento */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Extracción Inteligente</h4>
            <p className="text-xs text-gray-600">IA avanzada para detectar campos automáticamente</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Validación Automática</h4>
            <p className="text-xs text-gray-600">Verificación de consistencia y completitud</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Mapeo a Velneo</h4>
            <p className="text-xs text-gray-600">Estructura adaptada para integración directa</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 5️⃣ PASO: Formulario completo
  const renderFormStep = () => {
    if (!wizard.extractedData) return null;

    return (
      <PolizaFormCompleteStep
        extractedData={wizard.extractedData}
        onSubmit={wizard.submitForm}
        onCancel={() => wizard.goToStep('upload')}
        selectedCliente={wizard.selectedCliente}
        selectedCompany={wizard.selectedCompany}
      />
    );
  };

  // 6️⃣ PASO: Éxito
  const renderSuccessStep = () => (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      
      <h2 className="text-4xl font-bold text-gray-900 mb-4">¡Póliza Creada Exitosamente!</h2>
      <p className="text-gray-600 text-lg mb-8">
        La póliza ha sido procesada con IA y enviada a Velneo correctamente.
      </p>
      
      {/* Resumen básico */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-left max-w-2xl mx-auto mb-8">
        <h3 className="font-semibold text-gray-900 mb-6 text-center">Resumen de la Operación</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Cliente:</span>
            <span className="font-medium">{wizard.selectedCliente?.clinom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Compañía:</span>
            <span className="font-medium">{wizard.selectedCompany?.comnom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Póliza:</span>
            <span className="font-medium">{wizard.extractedData?.datosVelneo.datosPoliza.numeroPoliza}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completitud:</span>
            <span className="font-medium">{wizard.extractedData?.porcentajeCompletitud}%</span>
          </div>
        </div>
      </div>

      {/* Solo botón principal */}
      <div className="flex justify-center">
        <button
          onClick={() => onComplete?.(wizard.extractedData)}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Finalizar
        </button>
      </div>
    </div>
  );

  // Indicador de progreso en la parte superior
  const renderProgressBar = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Crear Nueva Póliza con IA
            </h1>
            
            {/* Indicadores de paso simplificados */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              {(['cliente', 'company', 'upload', 'extract', 'form', 'success'] as const).map((step, index) => {
                const status = wizard.getStepStatus(step);
                return (
                  <div key={step} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      status === 'completed' ? 'bg-green-100 text-green-800' :
                      status === 'current' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {status === 'completed' ? '✓' : index + 1}
                    </div>
                    {index < 5 && (
                      <div className={`w-8 h-0.5 mx-1 ${
                        status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Indicador de progreso */}
          <div className="flex items-center space-x-4">
            {wizard.processing && (
              <div className="flex items-center text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Procesando... {wizard.processingProgress}%</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(wizard.stepProgress())}%` }}
                ></div>
              </div>
              <span className="text-gray-600 min-w-[3rem]">
                {Math.round(wizard.stepProgress())}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ================================
  // 🎨 COMPONENTE PRINCIPAL
  // ================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar superior */}
      {renderProgressBar()}

      {/* Contenido principal */}
      <div className="py-8">
        {/* Error global */}
        {wizard.error && (
          <div className="max-w-4xl mx-auto mb-6 px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{wizard.error}</p>
                </div>
                <button
                  onClick={wizard.clearError}
                  className="ml-3 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Renderizar paso actual */}
        <div className="transition-all duration-300 ease-in-out">
          {wizard.currentStep === 'cliente' && renderClienteStep()}
          {wizard.currentStep === 'company' && renderCompanyStep()}
          {wizard.currentStep === 'upload' && renderUploadStep()}
          {wizard.currentStep === 'extract' && renderExtractStep()}
          {wizard.currentStep === 'form' && renderFormStep()}
          {wizard.currentStep === 'success' && renderSuccessStep()}
        </div>
      </div>

      {/* Footer con navegación */}
      {wizard.currentStep !== 'success' && wizard.currentStep !== 'extract' && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button
              onClick={wizard.goBack}
              disabled={wizard.currentStep === 'cliente'}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </button>

            <div className="flex items-center space-x-4">
              {/* Información de estado simple */}
              <div className="text-sm text-gray-500">
                {wizard.hasSelectedCliente && '✓ Cliente'} 
                {wizard.hasSelectedCompany && ' • ✓ Compañía'}
                {wizard.hasUploadedFile && ' • ✓ Archivo'}
                {wizard.hasExtractedData && ` • ✓ Datos`}
              </div>

              {/* Botón siguiente */}
              <button
                onClick={wizard.goNext}
                disabled={!wizard.canProceed}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de cancelar (flotante) */}
      {onCancel && wizard.currentStep !== 'success' && (
        <button
          onClick={onCancel}
          className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Cancelar y salir"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default PolizaWizardVelneo;