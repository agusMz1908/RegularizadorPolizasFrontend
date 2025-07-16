import React, { useCallback, useState, useRef } from 'react';
import { useAzureDocumentProcessing } from '../../hooks/useAzureDocumentProcessing';
import { Upload, FileText, AlertCircle, XCircle, RotateCcw, CheckCircle } from 'lucide-react';
import type { AzureProcessResponse, AzureBatchResponse } from '../../types/azure-document';

interface AzureDocumentProcessorProps {
  onDocumentProcessed?: (result: AzureProcessResponse) => void;
  onBatchProcessed?: (result: AzureBatchResponse) => void;
  maxFiles?: number;
  allowBatch?: boolean;
}

export const AzureDocumentProcessor: React.FC<AzureDocumentProcessorProps> = ({
  onDocumentProcessed,
  onBatchProcessed,
  maxFiles = 10,
  allowBatch = true
}) => {
  const {
    isProcessing,
    progress,
    result,
    batchResult,
    error,
    stage,
    processDocument,
    processBatch,
    reset,
    getStageMessage
  } = useAzureDocumentProcessing();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efecto para llamar a onDocumentProcessed cuando termine el procesamiento
  React.useEffect(() => {
    if (result && onDocumentProcessed) {
      onDocumentProcessed(result);
    }
  }, [result, onDocumentProcessed]);

  React.useEffect(() => {
    if (batchResult && onBatchProcessed) {
      onBatchProcessed(batchResult);
    }
  }, [batchResult, onBatchProcessed]);

  // Manejo de drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'application/pdf'
      );
      handleFiles(files);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Validar archivos PDF
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      alert('Solo se permiten archivos PDF');
      return;
    }

    // Limitar número de archivos
    const filesToProcess = pdfFiles.slice(0, maxFiles);
    setSelectedFiles(filesToProcess);

    try {
      if (filesToProcess.length === 1) {
        // Procesamiento individual - el resultado se maneja en useEffect
        await processDocument(filesToProcess[0]);
      } else if (allowBatch && filesToProcess.length > 1) {
        // Procesamiento en lote - el resultado se maneja en useEffect
        await processBatch(filesToProcess);
      }
    } catch (error) {
      console.error('Error procesando archivos:', error);
    }
  }, [processDocument, processBatch, maxFiles, allowBatch]);

  const handleReset = useCallback(() => {
    reset();
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  // Si hay resultado, no mostrar nada (el workflow se encarga)
  if (result || batchResult) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Escanear Documentos
        </h1>
        <p className="text-gray-600">
          Procesamiento automático de pólizas de seguro con Azure Document Intelligence
        </p>
      </div>

      {/* Área de Upload o Estados de Procesamiento */}
      {!isProcessing && !error && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Subir {allowBatch ? 'documentos' : 'documento'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Arrastra y suelta {allowBatch ? `hasta ${maxFiles} archivos PDF` : 'un archivo PDF'} aquí, o{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500 font-medium underline"
            >
              selecciona {allowBatch ? 'archivos' : 'archivo'}
            </button>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple={allowBatch}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Solo archivos PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Máximo {maxFiles} {allowBatch ? 'archivos' : 'archivo'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Procesamiento automático</span>
            </div>
          </div>
        </div>
      )}

      {/* Estado de Procesamiento */}
      {isProcessing && (
        <div className="bg-white rounded-xl border shadow-lg p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <FileText className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getStageMessage(stage)}
            </h3>
            
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-lg font-medium text-blue-600 mb-6">
              {progress}% completado
            </p>

            {selectedFiles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Procesando {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}:
                </p>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <p key={index} className="text-sm text-gray-600 truncate">
                      📄 {file.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Indicadores de progreso por etapa */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className={`flex items-center space-x-2 ${
                ['uploading', 'extracting', 'searching', 'completed'].includes(stage) 
                  ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  ['uploading', 'extracting', 'searching', 'completed'].includes(stage)
                    ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs font-medium">Subiendo</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${
                ['extracting', 'searching', 'completed'].includes(stage) 
                  ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  ['extracting', 'searching', 'completed'].includes(stage)
                    ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs font-medium">Extrayendo</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${
                ['searching', 'completed'].includes(stage) 
                  ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  ['searching', 'completed'].includes(stage)
                    ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs font-medium">Buscando Cliente</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${
                stage === 'completed' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  stage === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs font-medium">Completado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error en el Procesamiento
            </h3>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-6 py-3 border border-red-300 rounded-lg text-red-700 bg-white hover:bg-red-50 font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Procesamiento automático con IA</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Búsqueda automática de clientes</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Extracción de datos inteligente</span>
          </div>
        </div>
      </div>
    </div>
  );
};