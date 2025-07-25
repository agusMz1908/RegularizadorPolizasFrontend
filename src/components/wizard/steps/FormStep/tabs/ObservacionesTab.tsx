import React from 'react';
import { FileText, Info, Clock } from 'lucide-react';
import { PolizaFormData } from '../../../../../types/core/poliza';
import { UseFormValidationReturn } from '../../../../../hooks/wizard/useFormValidation';
import { DocumentProcessResult } from '../../../../../types/ui/wizard';

interface ObservacionesTabProps {
  formData: PolizaFormData;
  onFormChange: (field: keyof PolizaFormData, value: any) => void;
  validation: UseFormValidationReturn;
  extractedData: DocumentProcessResult | null;
  isDarkMode: boolean;
}

export const ObservacionesTab: React.FC<ObservacionesTabProps> = ({
  formData,
  onFormChange,
  validation,
  extractedData,
  isDarkMode
}) => {
  // ✅ Usar los métodos correctos del hook
  const getFieldError = (field: keyof PolizaFormData) => {
    return validation.getFieldError(field);
  };

  const hasFieldError = (field: keyof PolizaFormData) => {
    return validation.hasFieldError(field);
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-indigo-900/20 border border-indigo-800/50' 
          : 'bg-gradient-to-r from-indigo-50 to-purple-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
        } mb-6`}>
          <FileText className="w-6 h-6 mr-3" />
          Observaciones y Notas
        </h3>

        <div className="space-y-6">
          {/* Campo principal de observaciones */}
          <div>
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-indigo-300' : 'text-indigo-800'
            } mb-2`}>
              Observaciones Generales
              <span className="text-xs font-normal ml-2 opacity-75">
                (Generadas automáticamente - Puedes editarlas)
              </span>
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => onFormChange('observaciones', e.target.value)}
              rows={12}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-indigo-500 transition-all duration-200 shadow-sm resize-y ${
                hasFieldError('observaciones')
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : isDarkMode 
                    ? 'bg-gray-700/50 border-indigo-700/30 text-gray-100 focus:ring-indigo-500/30' 
                    : 'bg-white border-indigo-200 focus:ring-indigo-100'
              }`}
              placeholder="Aquí aparecerán las observaciones generadas automáticamente del procesamiento del PDF. Puedes agregar notas adicionales o modificar el contenido según sea necesario..."
            />
            {getFieldError('observaciones') && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {getFieldError('observaciones')?.message}
              </p>
            )}
          </div>

          {/* Información sobre el procesamiento */}
          {extractedData && (
            <div className={`rounded-xl p-4 ${
              isDarkMode 
                ? 'bg-blue-900/20 border border-blue-800/30' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className={`font-semibold mb-3 flex items-center ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                <Info className="w-5 h-5 mr-2" />
                Información del Procesamiento
              </h4>
              <div className={`text-sm space-y-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Archivo:</strong> {extractedData.nombreArchivo || 'N/A'}</p>
                    <p><strong>Estado:</strong> {extractedData.estadoProcesamiento || 'Completado'}</p>
                  </div>
                  <div>
                    <p><strong>Procesado:</strong> {
                      extractedData.timestamp 
                        ? new Date(extractedData.timestamp).toLocaleString('es-UY')
                        : new Date().toLocaleString('es-UY')
                    }</p>
                    {extractedData.nivelConfianza && (
                      <p><strong>Confianza:</strong> {(extractedData.nivelConfianza * 100).toFixed(1)}%</p>
                    )}
                    {extractedData.tiempoProcesamiento && (
                      <p><strong>Tiempo:</strong> {(extractedData.tiempoProcesamiento / 1000).toFixed(1)}s</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-populate con datos extraídos */}
          {extractedData && !formData.observaciones && (
            <div className={`rounded-xl p-4 ${
              isDarkMode 
                ? 'bg-yellow-900/20 border border-yellow-800/30' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h4 className={`font-semibold mb-2 flex items-center ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                <Clock className="w-5 h-5 mr-2" />
                Generar Observaciones Automáticas
              </h4>
              <p className={`text-sm mb-3 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
              }`}>
                ¿Deseas generar observaciones automáticas basadas en los datos extraídos?
              </p>
              <button
                onClick={() => {
                  const autoObservaciones = generateAutoObservaciones(extractedData);
                  onFormChange('observaciones', autoObservaciones);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-yellow-700 text-yellow-100 hover:bg-yellow-600'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                Generar Observaciones
              </button>
            </div>
          )}

          {/* Sugerencias de observaciones */}
          <div className={`rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-gray-700/30 border border-gray-600' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              💡 Sugerencias para Observaciones
            </h4>
            <div className={`text-sm space-y-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>• Detalles específicos sobre la cobertura</p>
              <p>• Condiciones especiales o excepciones</p>
              <p>• Información relevante del vehículo o asegurado</p>
              <p>• Notas sobre el procesamiento o validación</p>
              <p>• Comentarios para el seguimiento posterior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Función helper para generar observaciones automáticas
const generateAutoObservaciones = (extractedData: DocumentProcessResult): string => {
  const observations = [];
  
  observations.push(`🤖 PROCESADO AUTOMÁTICAMENTE: ${new Date().toLocaleString('es-UY')}`);
  observations.push(`📄 Archivo original: ${extractedData.nombreArchivo || 'N/A'}`);
  
  if (extractedData.nivelConfianza) {
    observations.push(`🎯 Nivel de confianza: ${(extractedData.nivelConfianza * 100).toFixed(1)}%`);
  }
  
  if (extractedData.requiereVerificacion) {
    observations.push(`⚠️ REQUIERE VERIFICACIÓN MANUAL`);
  }
  
  if (extractedData.numeroPoliza) {
    observations.push(`📋 Póliza extraída: ${extractedData.numeroPoliza}`);
  }
  
  if (extractedData.asegurado) {
    observations.push(`👤 Asegurado: ${extractedData.asegurado}`);
  }
  
  if (extractedData.vehiculo) {
    observations.push(`🚗 Vehículo: ${extractedData.vehiculo}`);
  }
  
  if (extractedData.vigenciaDesde && extractedData.vigenciaHasta) {
    observations.push(`📅 Vigencia: ${extractedData.vigenciaDesde} a ${extractedData.vigenciaHasta}`);
  }
  
  observations.push(`\n📝 NOTAS ADICIONALES:`);
  observations.push(`- Revisar datos extraídos antes de procesar`);
  observations.push(`- Verificar correspondencia con póliza física`);
  observations.push(`- Confirmar datos del asegurado`);
  
  return observations.join('\n');
};

export default ObservacionesTab;