// src/components/wizard/DocumentScanner.tsx
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import type { AzureProcessResponse } from '@/types/azureDocumentResult';

export interface DocumentScannerProps {
  onDocumentProcessed: (scannedData: AzureProcessResponse) => void;
  onBack: () => void;
}

type ScanState = 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';

const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onDocumentProcessed,
  onBack
}) => {
  const [scanState, setScanState] = useState<ScanState>('waiting');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [scannedData, setScannedData] = useState<AzureProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setScanState('uploading');

    try {
      // Simular progreso de upload
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      setScanState('processing');
      setUploadProgress(100);

      // Simular progreso de Azure processing
      const processingInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(processingInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);

      // Llamar al API real
      console.log('📄 Enviando archivo a Azure:', file.name);
      const response = await apiService.processDocument(file);
      
      clearInterval(processingInterval);
      setProcessingProgress(100);
      
      console.log('✅ Respuesta de Azure:', response);
      
      setScannedData(response);
      setScanState('completed');
      
    } catch (err: any) {
      setScanState('error');
      setError(err.message || 'Error procesando el documento');
      console.error('❌ Error en procesamiento:', err);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      processFile(pdfFile);
    } else {
      setError('Por favor selecciona un archivo PDF válido');
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      processFile(file);
    } else {
      setError('Por favor selecciona un archivo PDF válido');
    }
  }, [processFile]);

  const handleClick = () => {
    if (scanState === 'waiting') {
      fileInputRef.current?.click();
    }
  };

  const handleContinue = () => {
    if (scannedData) {
      onDocumentProcessed(scannedData);
    }
  };

  const handleRetry = () => {
    setScanState('waiting');
    setUploadProgress(0);
    setProcessingProgress(0);
    setScannedData(null);
    setError(null);
    setFileName('');
  };

  const renderScanningProgress = () => {
    if (scanState === 'waiting') return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Procesando: {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Progress */}
          {(scanState === 'uploading' || scanState === 'processing' || scanState === 'completed') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo archivo</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Processing Progress */}
          {(scanState === 'processing' || scanState === 'completed') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analizando con Azure Document Intelligence</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}

          {/* Completed State */}
          {scanState === 'completed' && scannedData && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Procesamiento Completado</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tiempo:</span>
                  <div className="font-medium">{(scannedData.tiempoProcesamiento / 1000).toFixed(1)}s</div>
                </div>
                <div>
                  <span className="text-gray-600">Completitud:</span>
                  <div className="font-medium">{scannedData.porcentajeCompletitud}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Campos:</span>
                  <div className="font-medium">{scannedData.datosVelneo.metricas.camposExtraidos}</div>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <div className="font-medium text-green-600">
                    {scannedData.listoParaVelneo ? 'Listo' : 'Requiere revisión'}
                  </div>
                </div>
              </div>

              {/* Datos extraídos preview */}
              {scannedData.datosVelneo.datosPoliza.numeroPoliza && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="text-sm text-green-700">
                    <strong>Póliza:</strong> {scannedData.datosVelneo.datosPoliza.numeroPoliza} | 
                    <strong> Vehículo:</strong> {scannedData.datosVelneo.datosVehiculo.marcaModelo} |
                    <strong> Premio:</strong> ${scannedData.datosVelneo.condicionesPago.premio?.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {scanState === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Error en el Procesamiento</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mt-3"
              >
                Intentar Nuevamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Escanear Documento
        </h2>
        <p className="text-lg text-gray-600">
          Sube la póliza en PDF para extraer los datos automáticamente
        </p>
      </div>

      {/* Dropzone */}
      {scanState === 'waiting' && (
        <Card 
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer min-h-[300px] flex items-center justify-center",
            isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input 
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <CardContent className="text-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isDragActive 
                  ? "Suelta el archivo aquí..." 
                  : "Arrastra un PDF aquí, o haz clic para seleccionar"
                }
              </p>
              <p className="text-sm text-gray-500">
                Solo archivos PDF • Máximo 10MB
              </p>
            </div>
            
            {/* Alcance inicial info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Alcance inicial:</strong> Optimizado para pólizas de 
                  <strong> BSE - AUTOMÓVILES</strong>. 
                  Próximamente se agregará soporte para más compañías.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {renderScanningProgress()}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={scanState === 'uploading' || scanState === 'processing'}
          className="min-w-[120px]"
        >
          Volver
        </Button>
        
        <Button
          size="lg"
          disabled={scanState !== 'completed' || !scannedData}
          onClick={handleContinue}
          className="min-w-[200px]"
        >
          Continuar al Formulario
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentScanner;