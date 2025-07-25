import React from 'react';
import { 
  Sparkles, 
  X, 
  Users, 
  Building2, 
  Upload, 
  Cpu, 
  CheckCircle2, 
  Trophy,
  Zap,
  Target,      
  Settings    
} from 'lucide-react';

interface FloatingWizardHeaderProps {
  currentStep: string;
  isDarkMode?: boolean;
  onCancel?: () => void;
}

const FloatingWizardHeader: React.FC<FloatingWizardHeaderProps> = ({ 
  currentStep, 
  isDarkMode = false, 
  onCancel
}) => {
  const stepOrder = ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'];

  const stepIcons = {
    cliente: Users,
    company: Building2,
    seccion: Target,    
    operacion: Settings,  
    upload: Upload,
    extract: Cpu,
    form: CheckCircle2,
    success: Trophy
  };

  const stepLabels = {
    cliente: 'Cliente',
    company: 'Compañía',
    seccion: 'Sección',  
    operacion: 'Operación', 
    upload: 'Archivo',
    extract: 'Procesando',
    form: 'Validación',
    success: 'Éxito'
  };

  const getCurrentStepIndex = () => stepOrder.indexOf(currentStep);

  return (
    <div className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header flotante */}
        <div className={`rounded-2xl shadow-2xl backdrop-blur-lg border ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <div className="p-6">
            {/* Título principal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Scanner Pólizas IA
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                  </div>
                </div>
              </div>
              
              {/* Botón cancelar */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-red-900/30 text-gray-400 hover:text-red-400' 
                      : 'bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Timeline horizontal de pasos */}
            <div className="flex items-center justify-between">
              {stepOrder.map((step, index) => {
                const isActive = currentStep === step;
                const isCompleted = getCurrentStepIndex() > index;
                const Icon = stepIcons[step as keyof typeof stepIcons];
                
                return (
                  <div key={step} className="flex flex-col items-center relative">
                    {/* Círculo del paso */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110'
                        : isCompleted
                        ? isDarkMode 
                          ? 'bg-green-700 text-green-100' 
                          : 'bg-green-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    
                    {/* Etiqueta del paso */}
                    <span className={`mt-3 text-sm font-medium ${
                      isActive 
                        ? isDarkMode 
                          ? 'text-purple-400' 
                          : 'text-purple-600'
                        : isCompleted 
                          ? isDarkMode 
                            ? 'text-green-400' 
                            : 'text-green-600'
                          : isDarkMode 
                            ? 'text-gray-500' 
                            : 'text-gray-500'
                    }`}>
                      {stepLabels[step as keyof typeof stepLabels]}
                    </span>

                    {/* Línea conectora */}
                    {index < stepOrder.length - 1 && (
                      <div className={`absolute top-8 left-full w-12 h-0.5 ${
                        isCompleted 
                          ? isDarkMode 
                            ? 'bg-green-600' 
                            : 'bg-green-400'
                          : isDarkMode 
                            ? 'bg-gray-600' 
                            : 'bg-gray-300'
                      }`} style={{ 
                        marginLeft: '2rem',
                        width: 'calc(100% - 1rem)'
                      }} />
                    )}

                    {/* Indicador de pulso para paso activo */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Información adicional */}
            <div className={`mt-6 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'} font-bold`}>
                    Paso {getCurrentStepIndex() + 1} de {stepOrder.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingWizardHeader;