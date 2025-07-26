// src/components/wizard/steps/UploadStep.tsx
// ✅ VERSIÓN MEJORADA - Integración con procesamiento asíncrono

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Zap,
  Clock,
  Info,
  Download,
  Eye
} from 'lucide-react';
import { azureService } from '../../../services/azureService';
import type { DocumentProcessResult } from '../../../types/ui/wizard';

interface UploadStepProps {
  uploadedFile: File | null;
  processing: boolean;
  onFileSelect: (file: File | null) => void;
  onProcess: (file: File) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  uploadedFile,
  processing: externalProcessing,
  onFileSelect,
  onProcess,
  onNext,
  onBack,
  isDarkMode
}) => {
  
  // Estados locales para el procesamiento mejorado
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingMode, setProcessingMode] = useState<'sync' | 'async'>('sync');
  const [error, setError] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<DocumentProcessResult | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Determinar estado de procesamiento
  const processing = isProcessing || externalProcessing;

  // ✅ Validación de archivo mejorada
  const validateFile = (file: File): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validaciones básicas
    if (!file) {
      errors.push('No se seleccionó ningún archivo');
      return { isValid: false, errors, warnings };
    }
    
    if (file.type !== 'application/pdf') {
      errors.push(`Tipo de archivo inválido: ${file.type}. Solo se permiten archivos PDF.`);
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push(`Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 50MB.`);
    }
    
    if (file.size === 0) {
      errors.push('El archivo está vacío');
    }
    
    // Advertencias basadas en tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      warnings.push('Archivo muy grande. El procesamiento puede tomar varios minutos.');
    } else if (fileSizeMB > 5) {
      warnings.push('Archivo grande. Se usará modo asíncrono para mayor eficiencia.');
    }
    
    if (fileSizeMB < 0.1) {
      warnings.push('Archivo muy pequeño. Verifique que contenga información de póliza.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // ✅ Manejar selección de archivo
  const handleFileSelect = useCallback((file: File) => {
    console.log('📄 Archivo seleccionado:', file.name);
    
    setError(null);
    setProcessedResult(null);
    setProcessingProgress(0);
    
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      return;
    }
    
    // Estimar tiempo de procesamiento
    const fileSizeMB = file.size / (1024 * 1024);
    const estimatedSeconds = Math.max(30, Math.min(fileSizeMB * 60, 600)); // Entre 30s y 10min
    setEstimatedTime(estimatedSeconds);
    
    onFileSelect(file);
    
    // Mostrar advertencias si las hay
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Advertencias del archivo:', validation.warnings);
    }
  }, [onFileSelect]);

const handleProcessDocument = useCallback(async () => {
  if (!uploadedFile) {
    setError('No hay archivo para procesar');
    return;
  }

  console.log('🚀 Iniciando procesamiento mejorado...');
  
  setIsProcessing(true);
  setError(null);
  setProcessingProgress(0);
  setProcessingStatus('Iniciando...');
  
  // Crear AbortController para cancelación
  abortControllerRef.current = new AbortController();

  try {
    // ✅ Obtener token si es necesario
    const token = localStorage.getItem('authToken') || '';
    
    const result = await azureService.processDocument(
      uploadedFile,
      token, // ✅ Agregar token como segundo parámetro
      (progress: number, status: string, mode?: 'sync' | 'async') => { // ✅ Tipos explícitos
        setProcessingProgress(progress);
        setProcessingStatus(status);
        if (mode) setProcessingMode(mode);
        
        console.log(`📊 Progreso: ${progress}% - ${status} (${mode || 'unknown'})`);
      }
    );

    console.log('✅ Procesamiento completado:', result);
    
    setProcessedResult(result);
    setProcessingProgress(100);
    setProcessingStatus('Procesamiento completado exitosamente');
    
    // Llamar al callback original para mantener compatibilidad
    await onProcess(uploadedFile);

  } catch (error: any) {
    console.error('❌ Error en procesamiento:', error);
    
    setError(error.message || 'Error procesando el documento');
    setProcessingProgress(0);
    setProcessingStatus('Error en procesamiento');
    
  } finally {
    setIsProcessing(false);
    abortControllerRef.current = null;
  }
}, [uploadedFile, onProcess, setProcessingMode]);

  // ✅ Cancelar procesamiento
  const handleCancelProcessing = useCallback(() => {
    console.log('🛑 Cancelando procesamiento...');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingStatus('Procesamiento cancelado');
    setError('Procesamiento cancelado por el usuario');
  }, []);

  // ✅ Drag & Drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // ✅ File input handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // ✅ Render zona de upload
  const renderUploadZone = () => (
    <div
      className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
        dragActive
          ? isDarkMode
            ? 'border-blue-400 bg-blue-900/20'
            : 'border-blue-400 bg-blue-50'
          : uploadedFile
            ? isDarkMode
              ? 'border-green-500 bg-green-900/20'
              : 'border-green-400 bg-green-50'
            : isDarkMode
              ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      }`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {uploadedFile ? (
        // ✅ Archivo seleccionado
        <div className="space-y-4">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${
            isDarkMode ? 'bg-green-800' : 'bg-green-100'
          }`}>
            <FileText className={`w-10 h-10 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          
          <div>
            <h3 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {uploadedFile.name}
            </h3>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
            </p>
            
            {estimatedTime && (
              <p className={`text-sm mt-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <Clock className="w-4 h-4 inline mr-1" />
                Tiempo estimado: ~{Math.ceil(estimatedTime / 60)} minutos
              </p>
            )}
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                setProcessedResult(null);
                setError(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-red-900 text-red-300 hover:bg-red-800'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <X className="w-4 h-4 mr-1 inline" />
              Quitar
            </button>

            {!processing && !processedResult && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProcessDocument();
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Zap className="w-4 h-4 mr-1 inline" />
                PROCESAR CON IA
              </button>
            )}
          </div>
        </div>
      ) : (
        // ✅ Zona de upload vacía
        <div className="space-y-4">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${
            dragActive
              ? isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
              : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Upload className={`w-10 h-10 ${
              dragActive
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Arrastra tu póliza aquí
            </h3>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              o <span className="text-blue-600 font-medium">haz clic para seleccionar</span>
            </p>
            <p className={`text-sm mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Solo archivos PDF • Máximo 50MB
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ✅ Render estado de procesamiento
  const renderProcessingState = () => {
    if (!processing && !processedResult) return null;

    return (
      <div className={`mt-8 p-6 rounded-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        
        {processing ? (
          // ✅ Procesando
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  processingMode === 'async'
                    ? 'bg-gradient-to-br from-purple-500 to-blue-600'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                }`}>
                  <RefreshCw className="w-5 h-5 text-white animate-spin" />
                </div>
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Procesando con Azure AI
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {processingStatus}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  processingMode === 'async'
                    ? isDarkMode 
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-purple-100 text-purple-800'
                    : isDarkMode
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {processingMode === 'async' ? 'Modo Asíncrono' : 'Modo Directo'}
                </span>

                <button
                  onClick={handleCancelProcessing}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    isDarkMode
                      ? 'bg-red-900 text-red-300 hover:bg-red-800'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Progreso
                </span>
                <span className={`font-medium ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {processingProgress.toFixed(1)}%
                </span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    processingMode === 'async'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                  }`}
                  style={{ width: `${Math.min(processingProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Información adicional para modo asíncrono */}
            {processingMode === 'async' && (
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Info className={`w-4 h-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    El archivo se está procesando en segundo plano. 
                    Esto puede tomar varios minutos para documentos complejos.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : processedResult ? (
          // ✅ Procesamiento completado
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Procesamiento Completado
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Datos extraídos exitosamente. Listo para el formulario.
                </p>
              </div>
            </div>

            {/* Resumen de datos extraídos */}
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h5 className={`font-medium mb-3 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Datos Extraídos:
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {processedResult.numeroPoliza && (
                  <div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Póliza:
                    </span>
                    <span className={`ml-2 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {processedResult.numeroPoliza}
                    </span>
                  </div>
                )}
                {processedResult.asegurado && (
                  <div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Asegurado:
                    </span>
                    <span className={`ml-2 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {processedResult.asegurado}
                    </span>
                  </div>
                )}
                {processedResult.prima && (
                  <div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Prima:
                    </span>
                    <span className={`ml-2 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${processedResult.prima.toLocaleString()}
                    </span>
                  </div>
                )}
                {processedResult.porcentajeCompletitud && (
                  <div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Completitud:
                    </span>
                    <span className={`ml-2 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {processedResult.porcentajeCompletitud}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // ✅ Render principal
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-emerald-500 to-blue-600">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Subir Póliza
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Arrastra tu archivo PDF o selecciónalo para procesarlo con IA
          </p>
        </div>

        {/* Zona de upload */}
        {renderUploadZone()}

        {/* Estado de procesamiento */}
        {renderProcessingState()}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  Error en el procesamiento
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Volver a operación
          </button>

          <button
            onClick={onNext}
            disabled={!processedResult}
            className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
              processedResult
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 hover:shadow-xl'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {processedResult ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                CONTINUAR AL FORMULARIO
              </>
            ) : processing ? (
              'Procesando...'
            ) : uploadedFile ? (
              'Procesar primero'
            ) : (
              'Subir archivo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadStep;