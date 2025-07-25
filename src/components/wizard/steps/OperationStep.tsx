import React from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { TipoOperacion, OPERACIONES_CONFIG } from '../../../utils/operationLogic';

interface OperacionStepProps {
  selectedOperacion: TipoOperacion | null;
  onOperacionSelect: (operacion: TipoOperacion) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const OperacionStep: React.FC<OperacionStepProps> = ({
  selectedOperacion,
  onOperacionSelect,
  onNext,
  onBack,
  isDarkMode
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header mejorado */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tipo de Operación
        </h2>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Selecciona el tipo de operación a realizar
        </p>
      </div>

      {/* Grid de operaciones mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.entries(OPERACIONES_CONFIG).map(([key, config]) => (
          <div
            key={key}
            onClick={() => onOperacionSelect(key as TipoOperacion)}
            className={`
              relative rounded-2xl border-2 cursor-pointer transition-all duration-500 p-6 group
              transform hover:-translate-y-2 hover:shadow-2xl
              ${selectedOperacion === key
                ? 'border-blue-500 shadow-2xl shadow-blue-500/25 scale-105 ring-2 ring-blue-200' +
                  (isDarkMode ? ' bg-gradient-to-br from-blue-900/50 to-purple-900/30' : ' bg-gradient-to-br from-blue-50 to-purple-50')
                : `border-gray-200 hover:border-blue-300 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600' 
                      : 'bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-blue-50'
                  }`
              }
            `}
          >
            {/* Glow effect para la seleccionada */}
            {selectedOperacion === key && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl -z-10"></div>
            )}

            {/* Indicador de selección mejorado */}
            {selectedOperacion === key && (
              <div className="absolute -top-3 -right-3 z-10">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            {/* Contenido de la tarjeta */}
            <div className="text-center relative z-10">
              {/* Icono con animación */}
              <div className={`text-6xl mb-4 transition-all duration-300 ${
                selectedOperacion === key 
                  ? 'scale-110 animate-bounce' 
                  : 'group-hover:scale-110 group-hover:rotate-6'
              }`}>
                {config.icon}
              </div>
              
              <h3 className={`text-xl font-bold mb-3 transition-colors duration-200 ${
                selectedOperacion === key 
                  ? 'text-blue-600' 
                  : isDarkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'
              }`}>
                {config.operacion}
              </h3>
              
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {config.descripcion}
              </p>         
            </div>

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navegación mejorada */}
      <div className="text-center">
        <div className={`inline-flex items-center space-x-4 p-1 rounded-2xl ${
          isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100/50 border border-gray-200'
        }`}>
          {/* Botón secundario - más discreto */}
          <button
            onClick={onBack}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Atrás
          </button>

          {/* Botón principal - solo si hay selección */}
          {selectedOperacion && (
            <button
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Continuar
            </button>
          )}
        </div>

        {/* Indicador de progreso sutil */}
        {selectedOperacion && (
          <div className={`mt-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Operación seleccionada: <strong>{OPERACIONES_CONFIG[selectedOperacion].operacion}</strong></span>
              <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperacionStep;