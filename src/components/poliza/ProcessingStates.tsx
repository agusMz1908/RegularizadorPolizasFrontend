import React from 'react';
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Send,
  RefreshCw 
} from 'lucide-react';
import { ProcessingState } from '../../types/processing';
import { ProgressBar } from '../common/ProgressBar';

interface ProcessingStatesProps {
  state: ProcessingState;
  progress?: number;
  message?: string;
  error?: string;
  onRetry?: () => void;
  onReset?: () => void;
  onContinue?: () => void;
  className?: string;
}

export const ProcessingStates: React.FC<ProcessingStatesProps> = ({
  state,
  progress = 0,
  message,
  error,
  onRetry,
  onReset,
  onContinue,
  className = '',
}) => {
  const renderState = () => {
    switch (state) {
      case 'uploading':
        return (
          <div className="text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Subiendo archivo...
            </h3>
            <ProgressBar
              progress={progress}
              label="Progreso de subida"
              variant="blue"
              className="max-w-md mx-auto"
            />
            {message && <p className="text-gray-500 mt-2">{message}</p>}
          </div>
        );

      case 'processing':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Procesando con Azure AI...
            </h3>
            <p className="text-gray-500">
              {message || 'Extrayendo información de la póliza'}
            </p>
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        );

      case 'sending-velneo':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-green-500 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Enviando a Velneo...
            </h3>
            <p className="text-gray-500">
              {message || 'Creando póliza en el sistema'}
            </p>
          </div>
        );

      case 'sent-success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Póliza creada exitosamente!
            </h3>
            <p className="text-gray-500 mb-6">
              {message || 'La póliza ha sido procesada y enviada a Velneo'}
            </p>
            <div className="flex justify-center space-x-3">
              {onReset && (
                <button
                  onClick={onReset}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Procesar Otra Póliza
                </button>
              )}
              {onContinue && (
                <button
                  onClick={onContinue}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Verificación requerida
            </h3>
            <p className="text-gray-500 mb-6">
              {message || 'Algunos campos requieren verificación manual'}
            </p>
            {onContinue && (
              <button
                onClick={onContinue}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Continuar con Verificación
              </button>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Error en el procesamiento
            </h3>
            <p className="text-gray-500 mb-6">{error || message || 'Ha ocurrido un error inesperado'}</p>
            <div className="flex justify-center space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar</span>
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Nuevo Archivo
                </button>
              )}
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Proceso completado
            </h3>
            <p className="text-gray-500 mb-6">
              {message || 'El procesamiento ha sido completado exitosamente'}
            </p>
            {onReset && (
              <button
                onClick={onReset}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Procesar Nueva Póliza
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center justify-center p-12 ${className}`}>
      {renderState()}
    </div>
  );
};