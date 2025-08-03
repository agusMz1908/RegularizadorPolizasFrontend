// src/components/wizard/DocumentScanner.tsx - REDISEÑADO SEGÚN INFORME UX/UI
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  AlertCircle,
  Brain,
  Zap,
  Eye,
  Send,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import type { AzureProcessResponse } from '@/types/azureDocumentResult';

export interface DocumentScannerProps {
  onDocumentProcessed: (scannedData: AzureProcessResponse) => void;
  onBack: () => void;
}

type ScanState = 'waiting' | 'uploading' | 'analyzing' | 'extracting' | 'validating' | 'completed' | 'error';

interface ProcessingStage {
  id: ScanState;
  label: string;
  description: string;
  icon: React.ElementType;
  duration: number; // in seconds
}

const PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 'uploading',
    label: 'Subiendo archivo',
    description: 'Enviando documento al servidor...',
    icon: Upload,
    duration: 2
  },
  {
    id: 'analyzing',
    label: 'Analizando con Azure',
    description: 'Azure Document Intelligence está procesando...',
    icon: Brain,
    duration: 4
  },
  {
    id: 'extracting',
    label: 'Extrayendo datos',
    description: 'Identificando campos de la póliza...',
    icon: Eye,
    duration: 3
  },
  {
    id: 'validating',
    label: 'Validando información',
    description: 'Verificando completitud y precisión...',
    icon: CheckCircle,
    duration: 2
  }
];

const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onDocumentProcessed,
  onBack
}) => {
  const [scanState, setScanState] = useState<ScanState>('waiting');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [scannedData, setScannedData] = useState<AzureProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError(null);
    setStartTime(Date.now());
    setCurrentStageIndex(0);
    setStageProgress(0);

    try {
      // Simular progreso realista a través de las etapas
      for (let stageIndex = 0; stageIndex < PROCESSING_STAGES.length; stageIndex++) {
        const stage = PROCESSING_STAGES[stageIndex];
        setScanState(stage.id);
        setCurrentStageIndex(stageIndex);
        
        // Progreso gradual dentro de cada etapa
        const stageStartTime = Date.now();
        const stageDuration = stage.duration * 1000; // convertir a ms
        
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - stageStartTime;
          const progress = Math.min((elapsed / stageDuration) * 100, 100);
          setStageProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 50);

        // Esperar la duración de la etapa
        await new Promise(resolve => setTimeout(resolve, stageDuration));
        clearInterval(progressInterval);
        setStageProgress(100);
      }

      // Llamar al API real
      console.log('📄 Enviando archivo a Azure:', file.name);
      const response = await apiService.processDocument(file);
      
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
    setCurrentStageIndex(0);
    setStageProgress(0);
    setScannedData(null);
    setError(null);
    setFileName('');
    setFileSize('');
  };

  const getCurrentStage = () => PROCESSING_STAGES[currentStageIndex];
  const isProcessing = scanState !== 'waiting' && scanState !== 'completed' && scanState !== 'error';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Escanear Documento
        </h2>
        <p className="text-lg text-muted-foreground">
          Sube la póliza en PDF para extraer los datos automáticamente
        </p>
      </div>

      {/* Dropzone */}
      {scanState === 'waiting' && (
        <Card 
          className={cn(
            "border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[350px] flex items-center justify-center relative overflow-hidden",
            isDragActive 
              ? "border-primary bg-primary/10 scale-[1.02]" 
              : "border-border hover:border-muted-foreground hover:bg-muted/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          
          <input 
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <CardContent className="text-center py-12 relative z-10">
            <div className={cn(
              "transition-all duration-300",
              isDragActive && "scale-110"
            )}>
              <Upload className={cn(
                "h-16 w-16 mx-auto mb-6 transition-colors duration-300",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
              
              <div className="space-y-3 mb-6">
                <p className={cn(
                  "text-xl font-semibold transition-colors duration-300",
                  isDragActive ? "text-primary" : "text-foreground"
                )}>
                  {isDragActive 
                    ? "¡Suelta el archivo aquí!" 
                    : "Arrastra un PDF aquí, o haz clic para seleccionar"
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Solo archivos PDF • Máximo 10MB
                </p>
              </div>

              {/* Features showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Azure AI</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-secondary" />
                  <span>Procesamiento rápido</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 text-accent" />
                  <span>Alta precisión</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Alcance inicial info */}
            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl p-4 max-w-lg mx-auto">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm text-primary">
                  <strong>Alcance inicial:</strong> Optimizado para pólizas de 
                  <strong> BSE - AUTOMÓVILES</strong>. 
                  Próximamente se agregará soporte para más compañías.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced DocumentProcessor Component */}
      {isProcessing && (
        <EnhancedDocumentProcessor
          fileName={fileName}
          fileSize={fileSize}
          currentStage={getCurrentStage()}
          stageIndex={currentStageIndex}
          totalStages={PROCESSING_STAGES.length}
          stageProgress={stageProgress}
          startTime={startTime}
        />
      )}

      {/* Enhanced Completed State */}
      {scanState === 'completed' && scannedData && (
        <Card className="border-success/50 bg-success/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-success">
              <CheckCircle className="h-6 w-6 mr-3" />
              ¡Procesamiento Completado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File info */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{fileSize}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-success text-success-foreground">
                Completado
              </Badge>
            </div>

            {/* Processing metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={<Zap className="h-4 w-4" />}
                label="Tiempo"
                value={`${(scannedData.tiempoProcesamiento / 1000).toFixed(1)}s`}
                color="text-blue-600"
              />
              <MetricCard
                icon={<Eye className="h-4 w-4" />}
                label="Completitud"
                value={`${scannedData.porcentajeCompletitud}%`}
                color="text-green-600"
              />
              <MetricCard
                icon={<FileText className="h-4 w-4" />}
                label="Campos"
                value={scannedData.datosVelneo.metricas.camposExtraidos.toString()}
                color="text-purple-600"
              />
              <MetricCard
                icon={<CheckCircle className="h-4 w-4" />}
                label="Estado"
                value={scannedData.listoParaVelneo ? 'Listo' : 'Revisión'}
                color={scannedData.listoParaVelneo ? "text-green-600" : "text-yellow-600"}
              />
            </div>

            {/* Extracted data preview */}
            {scannedData.datosVelneo.datosPoliza.numeroPoliza && (
              <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-primary" />
                  Vista Previa de Datos Extraídos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Póliza:</span>
                    <div className="font-medium text-foreground">
                      {scannedData.datosVelneo.datosPoliza.numeroPoliza}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehículo:</span>
                    <div className="font-medium text-foreground">
                      {scannedData.datosVelneo.datosVehiculo.marcaModelo}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Premio:</span>
                    <div className="font-medium text-foreground">
                      ${scannedData.datosVelneo.condicionesPago.premio?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Error State */}
      {scanState === 'error' && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="text-center py-12">
            <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-destructive mb-2">
              Error en el Procesamiento
            </h3>
            <p className="text-destructive mb-6 max-w-md mx-auto">
              {error}
            </p>
            <div className="space-x-4">
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="min-w-[120px]"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setError(null)}
              >
                Limpiar Error
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
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

// Enhanced DocumentProcessor Component
interface EnhancedDocumentProcessorProps {
  fileName: string;
  fileSize: string;
  currentStage: ProcessingStage;
  stageIndex: number;
  totalStages: number;
  stageProgress: number;
  startTime: number;
}

const EnhancedDocumentProcessor: React.FC<EnhancedDocumentProcessorProps> = ({
  fileName,
  fileSize,
  currentStage,
  stageIndex,
  totalStages,
  stageProgress,
  startTime
}) => {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const overallProgress = ((stageIndex * 100 + stageProgress) / totalStages);
  
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-8">
        {/* Central Processing Animation */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            {/* Animated progress ring */}
            <div 
              className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
              style={{ animationDuration: '2s' }}
            ></div>
            {/* Inner content */}
            <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
              <currentStage.icon className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {currentStage.label}
          </h3>
          <p className="text-muted-foreground mb-4">
            {currentStage.description}
          </p>
          
          {/* File info */}
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-muted/50 rounded-lg">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{fileName}</span>
            <Badge variant="secondary" className="text-xs">{fileSize}</Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-foreground">
              Progreso general: {Math.round(overallProgress)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {elapsedTime}s transcurridos
            </span>
          </div>
          
          {/* Overall progress bar */}
          <div className="w-full bg-muted/50 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {/* Stage indicators */}
          <div className="flex justify-between">
            {PROCESSING_STAGES.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                  index < stageIndex ? "bg-primary text-primary-foreground" :
                  index === stageIndex ? "bg-primary/20 border-2 border-primary text-primary" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index < stageIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <stage.icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-xs text-center max-w-20 transition-colors duration-300",
                  index === stageIndex ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current stage progress */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              {currentStage.label}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(stageProgress)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, color }) => (
  <div className="text-center p-3 bg-muted/30 rounded-lg">
    <div className={cn("inline-flex items-center justify-center mb-2", color)}>
      {icon}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-semibold text-foreground">{value}</div>
  </div>
);

export default DocumentScanner;