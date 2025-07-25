import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { UseFormValidationReturn } from '../../../../../hooks/wizard/useFormValidation';

interface ValidationSummaryProps {
  validation: UseFormValidationReturn;
  isDarkMode: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validation,
  isDarkMode
}) => {
  const { errors, warnings } = validation.validation;

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className={`rounded-xl p-4 border ${
        isDarkMode 
          ? 'bg-green-900/20 border-green-800 text-green-300' 
          : 'bg-green-50 border-green-200 text-green-700'
      }`}>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Formulario válido - Listo para enviar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Errores */}
      {errors.length > 0 && (
        <div className={`rounded-xl p-4 border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-800 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold mb-2">
                {errors.length} error{errors.length !== 1 ? 'es' : ''} encontrado{errors.length !== 1 ? 's' : ''}
              </h4>
              <ul className="space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-xs mt-1.5">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <div className={`rounded-xl p-4 border ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold mb-2">
                {warnings.length} advertencia{warnings.length !== 1 ? 's' : ''}
              </h4>
              <ul className="space-y-1 text-sm">
                {warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-xs mt-1.5">•</span>
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationSummary;