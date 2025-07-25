// src/components/wizard/steps/ProcessingStep.tsx

import React, { useEffect, useState } from 'react';
import { Sparkles, FileText, User, Building, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProcessingStepProps {
  uploadedFile: File | null;
  progress: number;
  selectedCliente: any;
  selectedCompany: any;
  onNext?: () => void;
  onBack?: () => void;
  isDarkMode: boolean;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  uploadedFile,
  progress,
  selectedCliente,
  selectedCompany,
  isDarkMode
}) => {
  const [currentPhase, setCurrentPhase] = useState<string>('Subiendo archivo...');
  const [phases] = useState([
    '📤 Subiendo archivo...',
    '🧠 Extrayendo datos con IA...',
    '✅ Validando información...',
    '🎯 Finalizando...'
  ]);

  // Simular fases del procesamiento basado en progress
  useEffect(() => {
    if (progress < 25) {
      setCurrentPhase(phases[0]);
    } else if (progress < 60) {
      setCurrentPhase(phases[1]);
    } else if (progress < 90) {
      setCurrentPhase(phases[2]);
    } else {
      setCurrentPhase(phases[3]);
    }
  }, [progress, phases]);

  const getBgClass = () => isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50';

  return (
    <div className={`min-h-screen ${getBgClass()}`}>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''} py-8`}>
        {/* Header mejorado */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDarkMode 
                ? 'bg-gradient-to-br from-indigo-700 to-purple-800' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Procesando con IA
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Extrayendo datos de forma inteligente
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-3xl shadow-xl border p-12 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="text-center space-y-8">
            {/* Animación de spinner mejorada */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Spinner principal */}
                <div className={`w-32 h-32 rounded-full border-8 ${
                  isDarkMode 
                    ? 'border-gray-700' 
                    : 'border-gray-200'
                }`}></div>
                
                {/* Spinner animado principal */}
                <div className={`absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-t-transparent ${
                  isDarkMode 
                    ? 'border-purple-500' 
                    : 'border-purple-600'
                } animate-spin`}></div>
                
                {/* Spinner secundario */}
                <div className={`absolute top-4 left-4 w-24 h-24 rounded-full border-8 border-t-transparent ${
                  isDarkMode 
                    ? 'border-indigo-400' 
                    : 'border-indigo-500'
                } animate-spin-reverse`}></div>
                
                {/* Spinner interior */}
                <div className={`absolute top-8 left-8 w-16 h-16 rounded-full border-8 border-t-transparent ${
                  isDarkMode 
                    ? 'border-pink-400' 
                    : 'border-pink-500'
                } animate-spin`}></div>
                
                {/* Icono central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-full ${
                    isDarkMode 
                      ? 'bg-purple-600' 
                      : 'bg-purple-500'
                  } flex items-center justify-center`}>
                    <Sparkles className={`w-5 h-5 ${
                      isDarkMode ? 'text-purple-300' : 'text-white'
                    } animate-pulse`} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Estado actual mejorado */}
            <div className="space-y-4">
              <h3 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {currentPhase}
              </h3>
              
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Analizando la póliza con Azure Document Intelligence...
              </p>

              {/* Barra de progreso */}
              <div className="max-w-md mx-auto">
                <div className={`w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className={`text-sm mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {progress}% completado
                </p>
              </div>
            </div>

            {/* Lista de fases */}
            <div className="max-w-md mx-auto space-y-3">
              {phases.map((phase, index) => {
                const isCompleted = progress > (index + 1) * 25;
                const isCurrent = Math.floor(progress / 25) === index;
                
                return (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isCurrent 
                      ? isDarkMode 
                        ? 'bg-purple-900/30 border border-purple-700' 
                        : 'bg-purple-50 border border-purple-200'
                      : isCompleted
                        ? isDarkMode 
                          ? 'bg-green-900/20' 
                          : 'bg-green-50'
                        : isDarkMode 
                          ? 'bg-gray-700/30' 
                          : 'bg-gray-50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500' 
                        : isCurrent 
                          ? isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      isCompleted 
                        ? isDarkMode ? 'text-green-300' : 'text-green-700'
                        : isCurrent 
                          ? isDarkMode ? 'text-purple-300' : 'text-purple-700'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {phase}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Info del archivo mejorada */}
            {uploadedFile && (
              <div className={`rounded-2xl p-6 max-w-md mx-auto ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-900 to-blue-900' 
                  : 'bg-gradient-to-r from-gray-50 to-blue-50'
              }`}>
                <div className={`space-y-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className={`w-5 h-5 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <span className="font-medium truncate">{uploadedFile.name}</span>
                  </div>
                  {selectedCliente && (
                    <div className="flex items-center justify-center space-x-2">
                      <User className={`w-5 h-5 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                      <span className="truncate">{selectedCliente.clinom}</span>
                    </div>
                  )}
                  {selectedCompany && (
                    <div className="flex items-center justify-center space-x-2">
                      <Building className={`w-5 h-5 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                      <span className="truncate">{selectedCompany.comnom}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje de tiempo estimado */}
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Tiempo estimado: 15-30 segundos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;