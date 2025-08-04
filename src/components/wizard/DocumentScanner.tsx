// src/components/wizard/DocumentScanner.tsx - CON MICRO-INTERACCIONES
import React, { useState, useCallback } from 'react';
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
  Send
} from 'lucide-react';
import { 
  EnhancedCard, 
  EnhancedButton, 
  NotificationToast,
  AnimatedProgress,
  ProgressiveLoading
} from '@/components/enhanced';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentScannerProps {
  onFileProcess?: (file: File) => Promise<any>; // ✅ Opcional
  onBack: () => void;
  onNext?: (data: any) => void; // ✅ Opcional  
  onDocumentProcessed: (data: any) => void; // ✅ Agregado para compatibilidad con App.tsx
  isProcessing?: boolean;
  error?: string;
}

type ProcessingStage = 'upload' | 'analyze' | 'extract' | 'validate' | 'complete';

const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onFileProcess,
  onBack,
  onNext,
  onDocumentProcessed, // ✅ Handler de App.tsx
  isProcessing = false,
  error
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('upload');
  const [processedData, setProcessedData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Simulación de progreso (en un caso real vendría del backend)
  const simulateProgress = useCallback(() => {
    const stages = ['upload', 'analyze', 'extract', 'validate', 'complete'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < stages.length) {
        setCurrentStage(stages[currentIndex] as ProcessingStage);
        setProgress(((currentIndex + 1) / stages.length) * 100);
        currentIndex++;
      } else {
        clearInterval(interval);
        setShowSuccess(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    setCurrentStage('upload');
    setProgress(0);
    
    try {
      // Simular procesamiento por ahora
      const cleanup = simulateProgress();
      
      // En un caso real, aquí llamarías a onFileProcess
      // const result = await onFileProcess(file);
      // setProcessedData(result);
      
      setTimeout(() => {
        setProcessedData({ 
          fileName: file.name,
          size: file.size,
          // ... más datos procesados
        });
        cleanup();
      }, 8000);
      
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }, [onFileProcess, simulateProgress]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleContinue = () => {
    if (processedData) {
      // ✅ Llamar a ambos handlers si existen
      if (onNext) onNext(processedData);
      if (onDocumentProcessed) onDocumentProcessed(processedData);
    }
  };

  // Si está procesando, mostrar el progressive loading
  if (isProcessing || currentStage !== 'upload' || selectedFile) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Procesando Documento
          </h2>
          <p className="text-muted-foreground">
            Azure Document Intelligence está analizando tu póliza
          </p>
        </div>

        {/* Progressive Loading Component */}
        <ProgressiveLoading
          stages={processingStages}
          currentStage={currentStage}
          onComplete={() => setShowSuccess(true)}
          showProgress={true}
        />

        {/* File Info */}
        {selectedFile && (
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
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </EnhancedCard>
        )}

        {/* Progress Bar */}
        <AnimatedProgress
          value={progress}
          showLabel={true}
          animated={true}
          color="primary"
          className="mt-6"
        />

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <EnhancedButton
            variant="secondary"
            onClick={onBack}
            disabled={isProcessing}
            className="min-w-[120px]"
          >
            Volver
          </EnhancedButton>
          
          <EnhancedButton
            variant="gradient"
            size="lg"
            disabled={!showSuccess || !processedData}
            onClick={handleContinue}
            className="min-w-[200px]"
            icon={<Send className="h-4 w-4" />}
          >
            Continuar con Formulario
          </EnhancedButton>
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <NotificationToast
            type="success"
            message="¡Documento procesado exitosamente!"
            icon={<CheckCircle className="h-5 w-5" />}
            duration={3000}
          />
        )}
      </div>
    );
  }

  // UI de upload inicial
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header con animación */}
      <div className="text-center space-y-3 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h2 className="text-2xl font-bold text-foreground">
          Escanear Documento
        </h2>
        <p className="text-muted-foreground">
          Sube el PDF de la póliza para procesamiento automático
        </p>
      </div>

      {/* Enhanced Dropzone */}
      <EnhancedCard
        variant="interactive"
        hoverEffect="lift"
        clickEffect="scale"
        className={cn(
          "border-2 border-dashed transition-all duration-300 cursor-pointer",
          isDragActive && "border-primary bg-primary/5 scale-105",
          isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/20",
          !isDragActive && !isDragReject && "border-border hover:border-primary hover:bg-accent/50"
        )}
      >
        <div {...getRootProps()} className="p-12 text-center space-y-6">
          <input {...getInputProps()} />
          
          {/* Icon with animation */}
          <div className={cn(
            "mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
            isDragActive 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110"
          )}>
            <Upload className="h-10 w-10" />
          </div>
          
          {/* Text content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isDragActive ? "¡Suelta el archivo aquí!" : "Arrastra tu póliza en PDF"}
            </h3>
            <p className="text-muted-foreground">
              O <span className="text-primary font-medium">haz clic para seleccionar</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Solo archivos PDF • Máximo 10MB
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Brain className="h-4 w-4 text-blue-500" />
              <span>Azure AI</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Procesamiento rápido</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Alta precisión</span>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Error handling */}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-bottom-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
        <EnhancedCard variant="minimal" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="p-4 text-center space-y-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Pólizas BSE</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">Solo pólizas de AUTOMÓVILES</p>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="minimal" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="p-4 text-center space-y-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-medium text-green-900 dark:text-green-100">IA Avanzada</h4>
            <p className="text-sm text-green-700 dark:text-green-300">Extracción automática</p>
          </div>
        </EnhancedCard>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <EnhancedButton
          variant="secondary"
          onClick={onBack}
          className="min-w-[120px]"
        >
          Volver
        </EnhancedButton>
      </div>
    </div>
  );
};

export default DocumentScanner;