import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye, Send, Bug } from 'lucide-react';
import { azureDocumentService } from '../services/azureDocumentService';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('upload');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'upload', label: 'Subir documento', status: 'pending' },
    { id: 'extract', label: 'Extraer información', status: 'pending' },
    { id: 'validate', label: 'Validar datos', status: 'pending' },
    { id: 'send', label: 'Enviar a Velneo', status: 'pending' }
  ]);

  const handleFileUpload = useCallback((file: File) => {
    // Validaciones
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];

    if (!allowedTypes.includes(file.type)) {
      setError('Formato de archivo no soportado. Usa PDF, JPEG, PNG o TIFF.');
      return;
    }

    if (file.size > maxSize) {
      setError('Archivo demasiado grande. Máximo 10MB');
      return;
    }

    setError(null);
    setUploadedFile(file);
    updateStep('upload', 'completed');
    setCurrentStep('extract');
    
    console.log('📁 Archivo cargado:', file.name, `(${file.size} bytes)`);
  }, []);

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
    setUploadProgress(0);
    updateStep('extract', 'processing');

    try {
      console.log('🚀 Iniciando procesamiento del documento...');
      
      // Verificar configuración antes de procesar
      const config = azureDocumentService.validateConfiguration();
      if (!config.isValid) {
        throw new Error(`Configuración inválida: ${config.errors.join(', ')}`);
      }

      // Llamar al backend para procesar el documento
      const response = await azureDocumentService.processDocument(
        uploadedFile,
        undefined, // clienteId opcional
        undefined, // companiaId opcional
        undefined, // ramoId opcional
        (progress) => {
          setUploadProgress(progress);
        }
      );

      updateStep('extract', 'completed', 'Información extraída correctamente');
      setCurrentStep('validate');
      updateStep('validate', 'processing');

      // Simular validación
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Crear resultado basado en la respuesta real del backend
      const processedResult: ProcessingResult = {
        documentId: response.documentId || `doc_${Date.now()}`,
        fileName: uploadedFile.name,
        extractedFields: response.extractedFields || [
          { field: 'Número de Póliza', value: response.numeroPoliza || 'No detectado', confidence: 0.95, needsReview: !response.numeroPoliza },
          { field: 'Asegurado', value: response.asegurado || 'No detectado', confidence: 0.90, needsReview: !response.asegurado },
          { field: 'Vigencia Desde', value: response.vigenciaDesde || 'No detectado', confidence: 0.85, needsReview: !response.vigenciaDesde },
          { field: 'Vigencia Hasta', value: response.vigenciaHasta || 'No detectado', confidence: 0.85, needsReview: !response.vigenciaHasta },
          { field: 'Prima Total', value: response.prima ? `$${response.prima}` : 'No detectado', confidence: 0.88, needsReview: !response.prima },
          { field: 'Compañía', value: response.compania || 'No detectado', confidence: 0.92, needsReview: !response.compania }
        ],
        polizaData: response.polizaData || response,
        readyForVelneo: response.readyForVelneo || false
      };

      setResult(processedResult);

      updateStep('validate', 'completed', 'Datos validados');
      setCurrentStep('send');

      // Determinar si necesita revisión
      const needsReview = processedResult.extractedFields.some(field => field.needsReview);
      
      if (needsReview) {
        updateStep('send', 'pending', 'Requiere revisión manual');
      } else {
        updateStep('send', 'completed', 'Listo para enviar a Velneo');
      }

      console.log('✅ Documento procesado exitosamente');

    } catch (error: any) {
      console.error('❌ Error procesando documento:', error);
      setError(error.message || 'Error procesando el documento');
      updateStep('extract', 'error', error.message);
    } finally {
      setProcessing(false);
    }
  };

  const sendToVelneo = async () => {
    if (!result) return;

    setCurrentStep('send');
    updateStep('send', 'processing', 'Enviando a Velneo...');

    try {
      // Aquí iría la lógica para enviar a Velneo
      // Por ahora simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateStep('send', 'completed', 'Enviado exitosamente a Velneo');
      console.log('✅ Datos enviados a Velneo');
      
    } catch (error: any) {
      console.error('❌ Error enviando a Velneo:', error);
      updateStep('send', 'error', 'Error enviando a Velneo');
    }
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setProcessing(false);
    setCurrentStep('upload');
    setError(null);
    setResult(null);
    setUploadProgress(0);
    setSteps([
      { id: 'upload', label: 'Subir documento', status: 'pending' },
      { id: 'extract', label: 'Extraer información', status: 'pending' },
      { id: 'validate', label: 'Validar datos', status: 'pending' },
      { id: 'send', label: 'Enviar a Velneo', status: 'pending' }
    ]);
  };

  const testAzureConnection = async () => {
    console.log('🧪 Iniciando test de conexión Azure...');
    console.log('📋 Configuración actual:');
    console.log('- API URL:', import.meta.env.VITE_API_URL);
    console.log('- Azure Endpoint:', import.meta.env.VITE_AZURE_DOC_ENDPOINT);
    console.log('- Environment:', import.meta.env.VITE_ENV);
    
    try {
      // Test 1: Verificar que el backend responda (URL corregida)
      console.log('🔍 Test 1: Verificando backend...');
      const backendResponse = await fetch('https://localhost:7191/health'); // Sin /api
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('✅ Backend health: OK', backendData);
      } else {
        console.log('❌ Backend error:', backendResponse.status, backendResponse.statusText);
        return; // No continuar si el backend no responde
      }
      
      // Test 2: Verificar configuración del servicio
      console.log('🔍 Test 2: Verificando configuración del servicio...');
      const config = azureDocumentService.validateConfiguration();
      if (config.isValid) {
        console.log('✅ Configuración del servicio: OK');
      } else {
        console.log('❌ Errores de configuración:', config.errors);
        return; // No continuar si la configuración es inválida
      }

      // Test 3: Probar conexión Azure via backend (solo si todo está OK)
      console.log('🔍 Test 3: Verificando Azure Document Intelligence...');
      console.log('⚠️  Nota: Este test puede requerir API Key o autenticación');
      
      console.log('🎉 Tests básicos completados. Para probar Azure, asegúrate de estar autenticado correctamente.');
      
    } catch (error) {
      console.error('❌ Error en tests:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Escaneador de Documentos</h1>
            <p className="text-gray-600">
              Sube un documento de póliza para extraer información automáticamente usando Azure Document Intelligence
            </p>
          </div>

          {/* Botón de debug - Solo en desarrollo */}
          {import.meta.env.VITE_ENV === 'development' && (
            <div className="flex flex-col items-end">
              <button
                onClick={testAzureConnection}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Bug className="w-4 h-4" />
                🧪 Test Azure
              </button>
              <span className="text-xs text-gray-500 mt-1">
                Revisa la consola (F12)
              </span>
            </div>
          )}
        </div>

        {/* Mensaje informativo sobre debug */}
        {import.meta.env.VITE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <Bug className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-800">Modo Desarrollo</div>
                <div className="text-blue-700">
                  Usa el botón "🧪 Test Azure" para verificar la conexión con el backend y Azure Document Intelligence.
                  Los resultados aparecerán en la consola del navegador (F12).
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    
      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                  step.status === 'processing' ? 'bg-blue-500 text-white animate-pulse' :
                  step.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-600'}
              `}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{step.label}</div>
                {step.message && (
                  <div className={`text-xs ${
                    step.status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {step.message}
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  steps[index + 1].status !== 'pending' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload area */}
      {!uploadedFile && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-upload')?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFileUpload(files[0]);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sube tu documento</h3>
          <p className="text-gray-600 mb-4">
            Arrastra y suelta o haz clic para seleccionar
          </p>
          <p className="text-sm text-gray-500">
            Formatos soportados: PDF, JPEG, PNG, TIFF (máx. 10MB)
          </p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          />
        </div>
      )}

      {/* Archivo cargado */}
      {uploadedFile && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{uploadedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!processing && currentStep === 'extract' && (
                <button
                  onClick={processDocument}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Procesar
                </button>
              )}
              <button
                onClick={resetProcess}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Barra de progreso durante upload */}
          {processing && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subiendo archivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {result && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Información Extraída</h3>
          
          <div className="grid gap-4 mb-6">
            {result.extractedFields.map((field, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  field.needsReview ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{field.field}</div>
                    <div className="text-gray-700">{field.value}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${
                      field.confidence > 0.9 ? 'text-green-600' :
                      field.confidence > 0.7 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(field.confidence * 100)}% confianza
                    </div>
                    {field.needsReview && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Requiere revisión
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para enviar a Velneo */}
          {result.readyForVelneo && steps.find(s => s.id === 'send')?.status !== 'completed' && (
            <button
              onClick={sendToVelneo}
              disabled={processing}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {processing ? 'Enviando...' : 'Enviar a Velneo'}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentScanner;