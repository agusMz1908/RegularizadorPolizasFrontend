import React from 'react';
import { AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';

interface OperacionValidationAlertsProps {
  advertencias: string[];
  operacionActual: string;
  tramiteActual: string;
  estadoActual: string;
  isDarkMode?: boolean;
}

const OperacionValidationAlerts: React.FC<OperacionValidationAlertsProps> = ({
  advertencias,
  operacionActual,
  tramiteActual,
  estadoActual,
  isDarkMode = false
}) => {
  
  // Determinar el tipo de alerta principal
  const tieneAdvertencias = advertencias.length > 0;
  const configuracionCorrecta = !tieneAdvertencias;
  
  return (
    <div className="space-y-3">
      {/* Alerta de configuración correcta */}
      {configuracionCorrecta && operacionActual && (
        <div className={`rounded-lg p-4 border ${
          isDarkMode 
            ? 'bg-green-900/20 border-green-800/50 text-green-300' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Configuración Automática Aplicada</h4>
              <p className="text-sm opacity-90">
                Operación: <strong>{operacionActual}</strong> → 
                Trámite: <strong>{tramiteActual}</strong> → 
                Estado: <strong>{estadoActual}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Advertencias de validación */}
      {advertencias.map((advertencia, index) => (
        <div key={index} className={`rounded-lg p-4 border ${
          isDarkMode 
            ? 'bg-amber-900/20 border-amber-800/50 text-amber-300' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Revisión Requerida</h4>
              <p className="text-sm opacity-90">{advertencia}</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Información adicional sobre la lógica */}
      {operacionActual && (
        <div className={`rounded-lg p-4 border ${
          isDarkMode 
            ? 'bg-blue-900/20 border-blue-800/50 text-blue-300' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-start">
            <Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-2">Lógica de Negocio Aplicada</h4>
              <div className="text-sm space-y-1 opacity-90">
                <div>• <strong>EMISIÓN:</strong> Nuevas pólizas → Trámite "Nuevo" → Estado "VIG" (vigente)</div>
                <div>• <strong>RENOVACIÓN:</strong> Renovar existente → Trámite "Renovación" → Estado "VIG"</div>
                <div>• <strong>ENDOSO:</strong> Modificaciones → Trámite "Endoso" → Estado "END"</div>
                <div>• <strong>CAMBIO:</strong> Cambios simples → Trámite "Cambio" → Estado "VIG"</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tip sobre override manual */}
      <div className={`rounded-lg p-3 border-dashed border-2 ${
        isDarkMode 
          ? 'border-gray-600 text-gray-400' 
          : 'border-gray-300 text-gray-600'
      }`}>
        <div className="flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0" />
          <p className="text-sm">
            <strong>Tip:</strong> Puedes modificar manualmente cualquier campo si la detección automática no es correcta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperacionValidationAlerts;