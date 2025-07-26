// src/components/wizard/steps/ProcessingStep.tsx
// ✅ VERSIÓN MEJORADA - UI para procesamiento asíncrono

import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  Timer,
  Server,
  Brain,
  Eye,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Company } from '../../../services/companyService';
import { Cliente } from '../../../types/ui/wizard';

interface ProcessingStepProps {
  uploadedFile: File | null;
  progress: number;
  selectedCliente?: Cliente | null;
  selectedCompany?: Company | null;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  
  // ✅ Nuevas props para procesamiento asíncrono
  mode?: 'sync' | 'async';
  status?: string;
  stage?: string;
  estimatedTimeRemaining?: number;
  queuePosition?: number;
  processingStartTime?: Date;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  uploadedFile,
  progress,
  selectedCliente,
  selectedCompany,
  onNext,
  onBack,
  isDarkMode,
  mode = 'sync',
  status = 'Procesando documento...',
  stage = 'processing',
  estimatedTimeRemaining,
  queuePosition,
  processingStartTime,
  onCancel,
  onRetry
}) => {
  
  // Estados locales para animaciones y UI
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const intervalRef = useRef<number>(null);

  // ✅ Calcular tiempo transcurrido
  useEffect(() => {
    if (processingStartTime) {
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - processingStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [processingStartTime]);

  // ✅ Determinar estado visual basado en progreso
  const getProcessingState = () => {
    if (progress >= 100) return 'completed';
    if (progress >= 95) return 'finalizing';
    if (progress >= 70) return 'analyzing';
    if (progress >= 30) return 'extracting';
    if (progress >= 10) return 'preparing';
    return 'starting';
  };

  const processingState = getProcessingState();

  // ✅ Configuración de etapas visuales
  const processingStages = [
    {
      id: 'preparing',
      name: 'Preparación',
      description: 'Optimizando documento para IA',
      icon: FileText,
      progress: Math.min(progress, 15),
      color: 'blue'
    },
    {
      id: 'extracting',
      name: 'Extracción',
      description: 'Azure AI analizando contenido',
      icon: Brain,
      progress: Math.min(Math.max(progress - 15, 0), 55),
      color: 'purple'
    },
    {
      id: 'analyzing',
      name: 'Análisis',
      description: 'Validando datos extraídos',
      icon: Eye,
      progress: Math.min(Math.max(progress - 70, 0), 25),
      color: 'green'
    },
    {
      id: 'finalizing',
      name: 'Finalización',
      description: 'Preparando para Velneo',
      icon: Sparkles,
      progress: Math.min(Math.max(progress - 95, 0), 5),
      color: 'orange'
    }
  ];

  const currentStageIndex = processingStages.findIndex(stage => 
    stage.id === processingState || 
    (processingState === 'starting' && stage.id === 'preparing')
  );

  // ✅ Formateo de tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatEstimatedTime = (seconds: number): string => {
    if (seconds < 60) return `~${seconds}s`;
    const mins = Math.ceil(seconds / 60);
    return `~${mins}min`;
  };

  // ✅ Render del header con información del documento
  const renderDocumentInfo = () => (
    <div className={`rounded-2xl p-6 mb-8 border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
        }`}>
          <FileText className={`w-8 h-8 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {uploadedFile?.name || 'Documento subido'}
          </h3>
          
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Tamaño desconocido'}
            </span>
            
            {selectedCliente && (
              <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                Cliente: {selectedCliente.clinom}
              </span>
            )}
            
            {selectedCompany && (
              <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                {selectedCompany.comnom}
              </span>
            )}
          </div>
        </div>

        {/* Indicador de modo */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          mode === 'async'
            ? isDarkMode 
              ? 'bg-purple-900 text-purple-200 border border-purple-700'
              : 'bg-purple-100 text-purple-800 border border-purple-300'
            : isDarkMode
              ? 'bg-blue-900 text-blue-200 border border-blue-700'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          {mode === 'async' ? 'Modo Asíncrono' : 'Modo Directo'}
        </div>
      </div>
    </div>
  );

  // ✅ Render del progreso principal
  const renderMainProgress = () => (
    <div className={`rounded-2xl p-8 border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      
      {/* Header del progreso */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 ${
          progress >= 100 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        } ${isAnimating ? 'animate-pulse' : ''}`}>
          {progress >= 100 ? (
            <CheckCircle className="w-10 h-10 text-white" />
          ) : (
            <Cpu className={`w-10 h-10 text-white ${isAnimating ? 'animate-spin' : ''}`} />
          )}
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {progress >= 100 ? 'Procesamiento Completado' : 'Procesando con Azure AI'}
        </h2>
        
        <p className={`text-lg ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {status}
        </p>
      </div>

      {/* Barra de progreso principal */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Progreso General
          </span>
          <span className={`text-sm font-bold ${
            progress >= 100 
              ? 'text-green-600' 
              : isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {progress.toFixed(1)}%
          </span>
        </div>
        
        <div className={`w-full h-4 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              progress >= 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Información adicional para modo asíncrono */}
      {mode === 'async' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Tiempo transcurrido */}
          <div className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Timer className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tiempo transcurrido
              </span>
            </div>
            <span className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Tiempo estimado restante */}
          {estimatedTimeRemaining && (
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tiempo restante
                </span>
              </div>
              <span className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatEstimatedTime(estimatedTimeRemaining)}
              </span>
            </div>
          )}

          {/* Posición en cola */}
          {queuePosition && queuePosition > 0 && (
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Server className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Posición en cola
                </span>
              </div>
              <span className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                #{queuePosition}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Etapas detalladas */}
      {showDetails && (
        <div className="space-y-4 mb-6">
          <button
            onClick={() => setShowDetails(false)}
            className={`text-sm ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Ocultar detalles ↑
          </button>
          
          {processingStages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex || progress >= 100;
            const stageProgress = stage.progress;
            
            return (
              <div key={stage.id} className={`flex items-center space-x-4 p-4 rounded-xl ${
                isActive 
                  ? isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white'
                    : isActive 
                      ? `bg-${stage.color}-500 text-white`
                      : isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive && isAnimating ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stage.name}
                    </span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stageProgress.toFixed(0)}%
                    </span>
                  </div>
                  
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stage.description}
                  </p>
                  
                  {isActive && (
                    <div className={`w-full h-2 rounded-full mt-2 ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}>
                      <div 
                        className={`h-full bg-${stage.color}-500 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(stageProgress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón para mostrar detalles */}
      {!showDetails && (
        <div className="text-center mb-6">
          <button
            onClick={() => setShowDetails(true)}
            className={`text-sm ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Ver detalles del procesamiento ↓
          </button>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`px-6 py-3 rounded-xl transition-colors font-medium ${
            isDarkMode 
              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Volver a archivo
        </button>

        <div className="flex items-center space-x-3">
          {/* Botón de cancelar (solo para modo async) */}
          {mode === 'async' && progress < 100 && onCancel && (
            <button
              onClick={onCancel}
              className={`px-4 py-3 rounded-xl transition-colors font-medium ${
                isDarkMode 
                  ? 'bg-red-900 border border-red-700 text-red-300 hover:bg-red-800' 
                  : 'bg-red-50 border border-red-300 text-red-700 hover:bg-red-100'
              }`}
            >
              <Square className="w-4 h-4 mr-2 inline" />
              Cancelar
            </button>
          )}

          {/* Botón de reintentar */}
          {progress === 0 && onRetry && (
            <button
              onClick={onRetry}
              className={`px-4 py-3 rounded-xl transition-colors font-medium ${
                isDarkMode 
                  ? 'bg-blue-900 border border-blue-700 text-blue-300 hover:bg-blue-800' 
                  : 'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Reintentar
            </button>
          )}

          {/* Botón de continuar */}
          <button
            onClick={onNext}
            disabled={progress < 100}
            className={`px-8 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg ${
              progress >= 100
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {progress >= 100 ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2 inline" />
                CONTINUAR AL FORMULARIO
              </>
            ) : (
              'Esperando procesamiento...'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header con información del documento */}
        {renderDocumentInfo()}
        
        {/* Progreso principal */}
        {renderMainProgress()}
        
      </div>
    </div>
  );
};

export default ProcessingStep;