import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Send,
  DollarSign,
  Clock,
  Shield,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Types para el procesamiento
interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  message?: string;
}

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

interface ProcessingResult {
  documentId: string;
  fileName: string;
  extractedFields: ExtractedField[];
  polizaData: any;
  readyForVelneo: boolean;
}

const DocumentScanner: React.FC = () => {
  // Estados principales
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('upload');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingToVelneo, setSendingToVelneo] = useState(false);
  const [velneoResult, setVelneoResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps del procesamiento
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'upload', label: 'Subir Documento', status: 'pending' },
    { id: 'extract', label: 'Extracción con IA', status: 'pending' },
    { id: 'validate', label: 'Validar Datos', status: 'pending' },
    { id: 'send', label: 'Enviar a Velneo', status: 'pending' }
  ]);

  // Drag and Drop handlers
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
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setError(null);
    setUploadedFile(file);
    updateStep('upload', 'completed');
    setCurrentStep('extract');
  };

  const updateStep = (stepId: string, status: ProcessingStep['status'], message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, duration: status === 'completed' ? Math.random() * 3 + 1 : undefined }
        : step
    ));
  };

  const processDocument = async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    setCurrentStep('extract');
    updateStep('extract', 'processing');

    try {
      // Simular llamada a Azure Document Intelligence
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // TODO: Reemplazar con tu endpoint real
      // const response = await fetch('/api/azure-document/process', {
      //   method: 'POST',
      //   body: formData
      // });

      // Mock de procesamiento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock de resultado - reemplazar con respuesta real de tu API
      const mockResult: ProcessingResult = {
        documentId: `doc_${Date.now()}`,
        fileName: uploadedFile.name,
        extractedFields: [
          { field: 'Número de Póliza', value: '123456789', confidence: 0.98, needsReview: false },
          { field: 'Asegurado', value: 'Juan Pérez González', confidence: 0.95, needsReview: false },
          { field: 'Vigencia Desde', value: '25/06/2025', confidence: 0.85, needsReview: true },
          { field: 'Vigencia Hasta', value: '25/06/2026', confidence: 0.92, needsReview: false },
          { field: 'Prima Total', value: '$15,500', confidence: 0.90, needsReview: false },
          { field: 'Compañía', value: 'BSE', confidence: 0.99, needsReview: false }
        ],
        polizaData: {
          numeroPoliza: '123456789',
          asegurado: 'Juan Pérez González',
          vigenciaDesde: '2025-06-25',
          vigenciaHasta: '2026-06-25',
          prima: 15500,
          compania: 'BSE'
        },
        readyForVelneo: true
      };

      setProcessingResult(mockResult);
      updateStep('extract', 'completed', 'Datos extraídos con éxito');
      updateStep('validate', 'completed', 'Validación completada');
      setCurrentStep('send');

    } catch (error: any) {
      updateStep('extract', 'error', error.message);
      setError('Error al procesar el documento');
    } finally {
      setProcessing(false);
    }
  };

  const sendToVelneo = async () => {
    if (!processingResult) return;

    setSendingToVelneo(true);
    updateStep('send', 'processing');

    try {
      // TODO: Reemplazar con tu endpoint real
      // const response = await fetch('/api/velneo/send-poliza', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(processingResult.polizaData)
      // });

      // Mock de envío a Velneo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock de resultado exitoso
      const velneoResponse = {
        success: true,
        polizaId: 'VLN_123456789',
        message: 'Póliza creada exitosamente en Velneo',
        timestamp: new Date().toISOString()
      };

      setVelneoResult(velneoResponse);
      updateStep('send', 'completed', 'Enviado a Velneo exitosamente');

    } catch (error: any) {
      updateStep('send', 'error', error.message);
      setError('Error al enviar a Velneo');
    } finally {
      setSendingToVelneo(false);
    }
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setProcessing(false);
    setCurrentStep('upload');
    setProcessingResult(null);
    setError(null);
    setSendingToVelneo(false);
    setVelneoResult(null);
    setSteps([
      { id: 'upload', label: 'Subir Documento', status: 'pending' },
      { id: 'extract', label: 'Extracción con IA', status: 'pending' },
      { id: 'validate', label: 'Validar Datos', status: 'pending' },
      { id: 'send', label: 'Enviar a Velneo', status: 'pending' }
    ]);
  };

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesamiento Automático
            </h2>
            <p className="text-gray-600">
              Sube un PDF de póliza para procesamiento con Azure Document Intelligence
            </p>
          </div>
          {(uploadedFile || processingResult) && (
            <button
              onClick={resetProcess}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Nuevo Documento</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Principal - Upload/Resultado */}
        <div className="lg:col-span-2">
          {!uploadedFile ? (
            /* Upload Area */
            <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <div
                className={`transition-colors duration-200 ${
                  dragActive ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Arrastra tu PDF aquí
                </h3>
                <p className="text-gray-600 mb-6">
                  o haz clic para seleccionar un archivo
                </p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Seleccionar Archivo</span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                  className="hidden"
                />
                
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>$2 USD por documento</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>~30 segundos</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Resultado del Procesamiento */
            <div className="space-y-6">
              {/* Información del archivo */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{uploadedFile.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Botón de procesamiento */}
              {!processingResult && !processing && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                  <button
                    onClick={processDocument}
                    disabled={processing}
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Procesar con Azure IA</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    El documento será analizado y los datos extraídos automáticamente
                  </p>
                </div>
              )}

              {/* Campos extraídos */}
              {processingResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Extraídos</h3>
                  <div className="space-y-3">
                    {processingResult.extractedFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700">{field.field}</label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={() => {}} // Implementar edición
                            className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                              field.needsReview 
                                ? 'border-orange-300 bg-orange-50' 
                                : 'border-gray-300 bg-white'
                            }`}
                          />
                        </div>
                        <div className="ml-4 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            field.confidence > 0.9 
                              ? 'bg-green-100 text-green-800' 
                              : field.confidence > 0.8 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(field.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón enviar a Velneo */}
                  {processingResult.readyForVelneo && !velneoResult && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={sendToVelneo}
                        disabled={sendingToVelneo}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {sendingToVelneo ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Enviando a Velneo...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Enviar a Velneo</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Resultado de Velneo */}
                  {velneoResult && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800">¡Éxito!</p>
                            <p className="text-sm text-green-700">{velneoResult.message}</p>
                            <p className="text-xs text-green-600 mt-1">ID: {velneoResult.polizaId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Lateral - Estado del Proceso */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado del Proceso</h3>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3 relative">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-700' :
                      step.status === 'processing' ? 'text-blue-700' :
                      step.status === 'error' ? 'text-red-700' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    {step.message && (
                      <p className="text-xs text-gray-500 mt-1">{step.message}</p>
                    )}
                    {step.duration && (
                      <p className="text-xs text-gray-400 mt-1">
                        {step.duration.toFixed(1)}s
                      </p>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-[10px] top-8 w-px h-8 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Rápido</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Procesamiento automático con IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;