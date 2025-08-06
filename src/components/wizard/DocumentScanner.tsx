// src/components/wizard/DocumentScanner.tsx - CORREGIDO PARA App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Brain,
  Zap,
  Eye,
  Send,
  RefreshCw,
  Sparkles,
  Cloud,
  X
} from 'lucide-react';
import { 
  EnhancedCard, 
  EnhancedButton, 
  NotificationToast,
  AnimatedProgress,
  ProgressiveLoading
} from '@/components/enhanced';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// ✅ CORREGIDO: Agregada prop scannedDocument
interface DocumentScannerProps {
  scannedDocument?: any;  // ✅ AGREGADO: prop requerida por App.tsx
  onFileProcess?: (file: File) => Promise<any>;
  onBack: () => void;
  onNext?: (data: any) => void;
  onDocumentProcessed: (data: any) => void;
  isProcessing?: boolean;
  error?: string;
}

type ProcessingStage = 'upload' | 'analyze' | 'extract' | 'validate' | 'complete';

const DocumentScanner: React.FC<DocumentScannerProps> = ({
  scannedDocument,  // ✅ AGREGADO: recibir scannedDocument
  onFileProcess,
  onBack,
  onNext,
  onDocumentProcessed,
  isProcessing = false,
  error
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('upload');
  const [processedData, setProcessedData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isInternalProcessing, setIsInternalProcessing] = useState(false);

  // ✅ AGREGADO: Si ya hay un documento escaneado, usarlo
  useEffect(() => {
    if (scannedDocument) {
      setProcessedData(scannedDocument);
      setCurrentStage('complete');
      setProgress(100);
      setShowSuccess(true);
    }
  }, [scannedDocument]);

  // Etapas del procesamiento con información detallada
  const processingStages = [
    {
      id: 'upload' as ProcessingStage,
      label: 'Subiendo archivo',
      description: 'Preparando documento para análisis',
      icon: <Upload className="h-5 w-5" />,
      duration: 1000
    },
    {
      id: 'analyze' as ProcessingStage,
      label: 'Analizando con Azure AI',
      description: 'Escaneando documento con inteligencia artificial',
      icon: <Brain className="h-5 w-5" />,
      duration: 3000
    },
    {
      id: 'extract' as ProcessingStage,
      label: 'Extrayendo datos',
      description: 'Identificando campos de la póliza',
      icon: <Zap className="h-5 w-5" />,
      duration: 2000
    },
    {
      id: 'validate' as ProcessingStage,
      label: 'Validando información',
      description: 'Verificando datos extraídos',
      icon: <Eye className="h-5 w-5" />,
      duration: 1500
    },
    {
      id: 'complete' as ProcessingStage,
      label: 'Procesamiento completo',
      description: 'Listo para continuar',
      icon: <CheckCircle className="h-5 w-5" />,
      duration: 500
    }
  ];

  // ✅ FUNCIÓN DE PROGRESO QUE SE SINCRONIZA CON LA LLAMADA REAL AL API
  const updateProgressWithStages = useCallback(() => {
    const stages = ['upload', 'analyze', 'extract', 'validate'];
    let currentIndex = 0;
    
    // Progreso más rápido al principio, más lento después
    const intervals = [500, 2000, 1500, 1000]; 
    
    const runStage = () => {
      if (currentIndex < stages.length) {
        setCurrentStage(stages[currentIndex] as ProcessingStage);
        setProgress(((currentIndex + 1) / (stages.length + 1)) * 100);
        
        const nextInterval = intervals[currentIndex] || 1000;
        currentIndex++;
        
        return setTimeout(runStage, nextInterval);
      }
      return null;
    };

    const timeoutId = runStage();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // ✅ FUNCIÓN PARA RESETEAR EL ESTADO
  const resetToInitialState = useCallback(() => {
    setSelectedFile(null);
    setCurrentStage('upload');
    setProgress(0);
    setProcessedData(null);
    setShowSuccess(false);
    setProcessingError(null);
    setIsInternalProcessing(false);
  }, []);

  // ✅ FUNCIÓN PARA LIMPIAR DOCUMENTO ESCANEADO
  const handleClearScannedDocument = () => {
    resetToInitialState();
    // Si necesitas notificar al componente padre
    if (onDocumentProcessed) {
      onDocumentProcessed(null);
    }
  };

  // ✅ FUNCIÓN onDrop CORREGIDA PARA USAR API REAL
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    setCurrentStage('upload');
    setProgress(0);
    setProcessingError(null);
    setIsInternalProcessing(true);
    setShowSuccess(false);
    
    try {
      console.log('🚀 Iniciando procesamiento real con Azure:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      if (onFileProcess) {
        // Iniciar animación de progreso visual
        const cleanupProgress = updateProgressWithStages();
        
        try {
          // ✅ LLAMADA REAL AL API DE AZURE
          const result = await onFileProcess(file);
          
          console.log('✅ Resultado del procesamiento:', result);
          
          // Limpiar la animación y completar
          cleanupProgress();
          setCurrentStage('complete');
          setProgress(100);
          setProcessedData(result);
          setShowSuccess(true);
          
        } catch (apiError) {
          console.error('❌ Error en API:', apiError);
          cleanupProgress();
          throw apiError;
        }
        
      } else {
        console.warn('⚠️ No se proporcionó onFileProcess, usando simulación');
        
        // Fallback a simulación (solo para desarrollo)
        const cleanupProgress = updateProgressWithStages();
        
        setTimeout(() => {
          setProcessedData({ 
            archivo: file.name,
            timestamp: new Date().toISOString(),
            tiempoProcesamiento: 5000,
            estado: 'PROCESADO_SIMULADO',
            procesamientoExitoso: true,
            listoParaVelneo: false,
            porcentajeCompletitud: 75,
            datosVelneo: {
              datosBasicos: {
                asegurado: 'Cliente de Prueba',
                documento: '12345678'
              }
            }
          });
          cleanupProgress();
          setCurrentStage('complete');
          setProgress(100);
          setShowSuccess(true);
        }, 6000);
      }
      
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setProcessingError(errorMessage);
      setCurrentStage('upload');
      setProgress(0);
      setSelectedFile(null);
      
    } finally {
      setIsInternalProcessing(false);
    }
  }, [onFileProcess, updateProgressWithStages]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing || isInternalProcessing || !!processedData // ✅ Deshabilitado si ya hay documento
  });

  const handleContinue = () => {
    if (processedData) {
      console.log('📋 Pasando datos procesados al siguiente step:', processedData);
      
      // ✅ Llamar a ambos handlers si existen
      if (onNext) onNext(processedData);
      if (onDocumentProcessed) onDocumentProcessed(processedData);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Saltando escaneo de documento');
    // Continuar sin documento escaneado
    if (onDocumentProcessed) onDocumentProcessed(null);
  };

  const handleRetry = () => {
    resetToInitialState();
  };

  // ✅ PANTALLA DE ERROR CON ANIMACIONES SUAVES
  if (processingError) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            Error de Procesamiento
          </h2>
          <p className="text-muted-foreground">
            No se pudo procesar el documento
          </p>
        </div>
        
        <div className="animate-in slide-in-from-bottom-4 duration-400 delay-200">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Error:</strong> {processingError}
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-between animate-in fade-in-0 duration-400 delay-400">
          <EnhancedButton
            variant="secondary"
            onClick={onBack}
            className="min-w-[120px] transition-all duration-300 hover:scale-105"
          >
            Volver
          </EnhancedButton>
          
          <EnhancedButton
            variant="default"
            onClick={handleRetry}
            icon={<RefreshCw className="h-4 w-4" />}
            className="min-w-[140px] transition-all duration-300 hover:scale-105"
          >
            Intentar de nuevo
          </EnhancedButton>
        </div>
      </div>
    );
  }

  // ✅ PANTALLA DE PROCESAMIENTO CON ANIMACIONES MEJORADAS
  if (isProcessing || isInternalProcessing || (currentStage !== 'upload' && !processedData) || selectedFile) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* ✅ HEADER CON ANIMACIÓN SUAVE */}
        <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
          <div className="relative inline-block">
            <Cloud className="h-12 w-12 text-primary mx-auto mb-2" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Procesando Documento
          </h2>
          <p className="text-muted-foreground">
            Azure Document Intelligence está analizando tu póliza
          </p>
        </div>

        {/* ✅ PROGRESSIVE LOADING CON ANIMACIÓN */}
        <div className="animate-in slide-in-from-top-4 duration-500 delay-200">
          <ProgressiveLoading
            stages={processingStages}
            currentStage={currentStage}
            onComplete={() => setShowSuccess(true)}
            showProgress={true}
          />
        </div>

        {/* ✅ FILE INFO CON ANIMACIÓN */}
        {selectedFile && (
          <div className="animate-in slide-in-from-bottom-4 duration-400 delay-300">
            <EnhancedCard 
              variant="minimal" 
              className="bg-muted/30 border-dashed"
            >
              <div className="p-4 flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {showSuccess ? (
                    <CheckCircle className="h-5 w-5 text-green-500 animate-in scale-in duration-300" />
                  ) : (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </EnhancedCard>
          </div>
        )}

        {/* ✅ PROGRESS BAR CON ANIMACIÓN */}
        <div className="animate-in fade-in-0 duration-400 delay-400">
          <AnimatedProgress
            value={progress}
            showLabel={true}
            animated={true}
            color="primary"
            className="mt-6"
          />
        </div>

        {/* ✅ ESTADO DEL PROCESAMIENTO CON ANIMACIÓN */}
        {processedData && showSuccess && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Documento procesado exitosamente</strong>
                <br />
                Estado: {processedData.estado || 'Procesado'}
                {processedData.procesamientoExitoso && (
                  <span className="text-green-600"> • Listo para continuar</span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ✅ ACTION BUTTONS CON ANIMACIÓN */}
        <div className="flex justify-between pt-6 animate-in fade-in-0 duration-400 delay-600">
          <EnhancedButton
            variant="secondary"
            onClick={onBack}
            disabled={isProcessing || isInternalProcessing}
            className="min-w-[120px] transition-all duration-300 hover:scale-105"
          >
            Volver
          </EnhancedButton>
          
          <EnhancedButton
            variant="gradient"
            size="lg"
            disabled={!showSuccess || !processedData}
            onClick={handleContinue}
            className={cn(
              "min-w-[200px] transition-all duration-300",
              showSuccess && "hover:scale-105"
            )}
            icon={<Send className="h-4 w-4" />}
          >
            Continuar con Formulario
          </EnhancedButton>
        </div>

        {/* ✅ SUCCESS NOTIFICATION CON ANIMACIÓN */}
        {showSuccess && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-700">
            <NotificationToast
              type="success"
              message="¡Documento procesado exitosamente!"
              icon={<CheckCircle className="h-5 w-5" />}
              duration={3000}
            />
          </div>
        )}
      </div>
    );
  }

  // ✅ SI YA HAY UN DOCUMENTO ESCANEADO
  if (processedData && !isInternalProcessing) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
          <div className="relative inline-block">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Documento Ya Procesado
          </h2>
          <p className="text-muted-foreground">
            Ya tienes un documento escaneado y listo
          </p>
        </div>

        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <EnhancedCard variant="minimal" className="bg-green-50 dark:bg-green-950/20 border-green-200">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Documento Procesado
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Estado: {processedData.estado || 'Listo'}
                    </p>
                    {processedData.archivo && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Archivo: {processedData.archivo}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearScannedDocument}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </EnhancedCard>
        </div>

        <div className="flex justify-between pt-6 animate-in fade-in-0 duration-400 delay-400">
          <Button
            variant="outline"
            onClick={onBack}
            className="min-w-[120px] transition-all duration-300 hover:scale-105"
          >
            Volver
          </Button>
          
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handleClearScannedDocument}
              className="min-w-[140px] transition-all duration-300 hover:scale-105"
            >
              Escanear Otro
            </Button>
            
            <Button
              size="lg"
              onClick={handleContinue}
              className="min-w-[200px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 hover:scale-105"
            >
              Continuar con Formulario
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ PANTALLA DE UPLOAD INICIAL CON ANIMACIONES SUAVES
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* ✅ HEADER CON ANIMACIÓN SUAVE */}
      <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
        <div className="relative inline-block">
          <Cloud className="h-12 w-12 text-primary mx-auto mb-2" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Escanear Documento
        </h2>
        <p className="text-muted-foreground">
          Sube el PDF de la póliza para procesamiento automático con Azure AI
        </p>
      </div>

      {/* ✅ ENHANCED DROPZONE CON ANIMACIONES MEJORADAS */}
      <div className="animate-in slide-in-from-top-4 duration-500 delay-200">
        <EnhancedCard
          variant="interactive"
          hoverEffect="lift"
          clickEffect="scale"
          className={cn(
            "border-2 border-dashed transition-all duration-300 cursor-pointer",
            isDragActive && "border-primary bg-primary/5 scale-[1.02]",
            isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/20",
            !isDragActive && !isDragReject && "border-border hover:border-primary hover:bg-accent/50"
          )}
        >
          <div {...getRootProps()} className="p-12 text-center space-y-6">
            <input {...getInputProps()} />
            
            {/* ✅ ICON CON ANIMACIÓN SUAVE */}
            <div className={cn(
              "mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              isDragActive 
                ? "bg-primary text-white scale-110" 
                : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
            )}>
              <Upload className="h-10 w-10" />
            </div>

            {/* ✅ TEXT CONTENT CON MEJOR JERARQUÍA */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">
                {isDragActive ? '¡Suelta el archivo aquí!' : 'Arrastra tu póliza PDF aquí'}
              </h3>
              <p className="text-muted-foreground">
                o <span className="text-primary font-medium">haz clic para seleccionar</span>
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Solo PDFs</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Máximo 10MB</span>
                </span>
              </div>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* ✅ ERROR MESSAGE CON ANIMACIÓN */}
      {error && (
        <div className="animate-in slide-in-from-bottom-4 duration-400 delay-300">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* ✅ FEATURE CARDS CON ANIMACIÓN ESCALONADA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="animate-in slide-in-from-left-4 duration-500 delay-400">
          <EnhancedCard 
            variant="minimal" 
            className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="p-4 text-center space-y-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Solo PDFs</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Solo pólizas de AUTOMÓVILES</p>
            </div>
          </EnhancedCard>
        </div>

        <div className="animate-in slide-in-from-right-4 duration-500 delay-500">
          <EnhancedCard 
            variant="minimal" 
            className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="p-4 text-center space-y-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-medium text-green-900 dark:text-green-100">IA Avanzada</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Extracción automática con Azure</p>
            </div>
          </EnhancedCard>
        </div>
      </div>

      {/* ✅ NAVIGATION CON OPCIÓN DE SALTAR */}
      <div className="flex justify-between pt-6 animate-in fade-in-0 duration-400 delay-600">
        <EnhancedButton
          variant="secondary"
          onClick={onBack}
          className="min-w-[120px] transition-all duration-300 hover:scale-105"
        >
          Volver
        </EnhancedButton>
        
        <EnhancedButton
          variant="outline"
          onClick={handleSkip}
          className="min-w-[180px] transition-all duration-300 hover:scale-105"
        >
          Continuar sin escanear
        </EnhancedButton>
      </div>
    </div>
  );
};

export default DocumentScanner;